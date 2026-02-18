import { supabase } from './client';
import { logger } from '../../utils/logger';

// Late-binding reference to dbHelpers (set from index.ts after assembly)
// eslint-disable-next-line prefer-const
let dbHelpers: any = null;
export const setDbHelpersRef = (ref: any) => { dbHelpers = ref; };

export const racesHelpers = {
  // Enhanced Race operations for dashboard widgets
  races: {
    // Get all races
    getAll: async () => {
      const { data, error } = await supabase
        .from('races')
        .select(`
          *,
          courses (*)
        `)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get upcoming races with countdown calculations (includes user-created races)
    getUpcoming: async (limit: number = 5) => {
      // Use the combined function from userRaces for better integration
      return dbHelpers.userRaces.getCombinedUpcomingRaces(limit);
    },

    // Get race by ID with enhanced details
    getById: async (raceId: string) => {
      const { data, error } = await supabase
        .from('races')
        .select(`
          *,
          courses (*),
          race_weather (*),
          race_results (count)
        `)
        .eq('id', raceId)
        .single();
      return { data, error };
    },

    // Get races by distance type for goal tracking
    getByDistanceType: async (distanceType: string, limit: number = 10) => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .eq('distance_type', distanceType)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit);
      return { data, error };
    },

    // Calculate race preparation status
    calculatePreparationStatus: (daysUntil: number, distanceType: string) => {
      const idealPrepWeeks = {
        'sprint': 8,
        'olympic': 12,
        '70.3': 20,
        'ironman': 30
      };

      const weeksUntil = Math.ceil(daysUntil / 7);
      const idealWeeks = idealPrepWeeks[distanceType as keyof typeof idealPrepWeeks] || 12;

      if (weeksUntil >= idealWeeks) return 'excellent';
      if (weeksUntil >= idealWeeks * 0.75) return 'good';
      if (weeksUntil >= idealWeeks * 0.5) return 'moderate';
      return 'critical';
    },

    // Create new race
    create: async (raceData: any) => {
      const { data, error } = await supabase
        .from('races')
        .insert(raceData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Race results operations
  raceResults: {
    // Get all race results
    getAll: async () => {
      const { data, error } = await supabase
        .from('race_results')
        .select(`
          *,
          user_races (*)
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Get user's race results
    getUserResults: async (userId: string) => {
      const { data, error } = await supabase
        .from('race_results')
        .select(`
          *,
          user_races (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false});
      return { data, error };
    },

    // Add new race result
    add: async (raceResult: any) => {
      const { data, error } = await supabase
        .from('race_results')
        .insert(raceResult)
        .select(`
          *,
          user_races (*)
        `)
        .single();
      return { data, error };
    },

    // Update race result
    update: async (resultId: string, updates: any) => {
      const { data, error } = await supabase
        .from('race_results')
        .update(updates)
        .eq('id', resultId)
        .select(`
          *,
          user_races (*)
        `)
        .single();
      return { data, error };
    },

    // Delete race result
    delete: async (resultId: string) => {
      const { error } = await supabase
        .from('race_results')
        .delete()
        .eq('id', resultId);
      return { error };
    },
  },

  // User-created races management
  userRaces: {
    // Get all user races
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get user race by ID with ownership check
    getById: async (raceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('id', raceId)
        .eq('user_id', user.id)
        .single();
      return { data, error };
    },

    // Get upcoming user races
    getUpcoming: async (limit: number = 10) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(limit);

      // Add countdown calculations
      if (data) {
        const racesWithCountdown = data.map(race => {
          const raceDate = new Date(race.date);
          const todayDate = new Date();
          const timeDiff = raceDate.getTime() - todayDate.getTime();
          const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return {
            ...race,
            daysUntil,
            weeksUntil: Math.ceil(daysUntil / 7),
            preparationStatus: dbHelpers.userRaces.calculatePreparationStatus(daysUntil, race.distance_type)
          };
        });

        return { data: racesWithCountdown, error: null };
      }

      return { data, error };
    },

    // Get races by distance type
    getByDistanceType: async (distanceType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id)
        .eq('distance_type', distanceType)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Create new user race with validation
    create: async (raceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Validate race data
      const validation = dbHelpers.userRaces.validateRaceData(raceData);
      if (!validation.isValid) {
        return { data: null, error: validation.error };
      }

      // Set default distances based on distance_type if not provided
      const raceWithDefaults = dbHelpers.userRaces.setDefaultDistances(raceData);

      const { data, error } = await supabase
        .from('user_races')
        .insert({ ...raceWithDefaults, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Update user race with validation and ownership check
    update: async (raceId: string, updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Validate updates only for core race data changes (not status-only updates)
      if (Object.keys(updates).some(key => ['name', 'date', 'location', 'distance_type'].includes(key))) {
        const validation = dbHelpers.userRaces.validateRaceData(updates);
        if (!validation.isValid) {
          return { data: null, error: validation.error };
        }
      }

      // Apply default distances if distance_type is being changed
      const updatesWithDefaults = updates.distance_type
        ? dbHelpers.userRaces.setDefaultDistances(updates)
        : updates;

      const { data, error } = await supabase
        .from('user_races')
        .update(updatesWithDefaults)
        .eq('id', raceId)
        .eq('user_id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Delete user race with ownership check
    delete: async (raceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { error } = await supabase
        .from('user_races')
        .delete()
        .eq('id', raceId)
        .eq('user_id', user.id);
      return { error };
    },

    // Update race status
    updateStatus: async (raceId: string, status: 'interested' | 'registered' | 'completed') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      const { data, error } = await supabase
        .from('user_races')
        .update({ status })
        .eq('id', raceId)
        .eq('user_id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Get races with related data (race results, nutrition plans, packing lists)
    getWithRelatedData: async (raceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        // Get race data
        const { data: race, error: raceError } = await supabase
          .from('user_races')
          .select('*')
          .eq('id', raceId)
          .eq('user_id', user.id)
          .single();

        if (raceError || !race) {
          return { data: null, error: raceError || 'Race not found' };
        }

        // Get related data in parallel
        const [raceResults, nutritionPlans, packingLists] = await Promise.all([
          supabase
            .from('race_results')
            .select('*')
            .eq('user_race_id', raceId)
            .eq('user_id', user.id),
          supabase
            .from('nutrition_plans')
            .select('*')
            .eq('user_race_id', raceId)
            .eq('user_id', user.id),
          supabase
            .from('packing_lists')
            .select('*')
            .eq('user_race_id', raceId)
            .eq('user_id', user.id)
        ]);

        return {
          data: {
            race,
            raceResults: raceResults.data || [],
            nutritionPlans: nutritionPlans.data || [],
            packingLists: packingLists.data || []
          },
          error: null
        };
      } catch (error: any) {
        return { data: null, error: error.message };
      }
    },

    // Search user races by name or location
    search: async (query: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      if (!query || query.trim().length < 2) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .order('date', { ascending: false })
        .limit(20);
      return { data, error };
    },

    // Get race statistics for dashboard
    getStatistics: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data: races, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id);

      if (error || !races) {
        return { data: null, error };
      }

      const today = new Date();
      const stats = {
        total: races.length,
        upcoming: races.filter(r => new Date(r.date) >= today).length,
        past: races.filter(r => new Date(r.date) < today).length,
        byDistance: {
          sprint: races.filter(r => r.distance_type === 'sprint').length,
          olympic: races.filter(r => r.distance_type === 'olympic').length,
          half: races.filter(r => r.distance_type === 'half').length,
          ironman: races.filter(r => r.distance_type === 'ironman').length,
          custom: races.filter(r => r.distance_type === 'custom').length
        },
        avgDifficulty: races.length > 0
          ? Math.round(races.reduce((sum, r) => sum + (r.difficulty_score || 5), 0) / races.length * 10) / 10
          : 0,
        nextRace: races
          .filter(r => new Date(r.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null
      };

      return { data: stats, error: null };
    },

    // Validation functions
    validateRaceData: (raceData: any) => {
      const errors = [];

      // Required fields
      if (!raceData.name || raceData.name.trim().length === 0) {
        errors.push('Race name is required');
      } else if (raceData.name.trim().length > 200) {
        errors.push('Race name must be less than 200 characters');
      }

      if (!raceData.date) {
        errors.push('Race date is required');
      } else {
        const raceDate = new Date(raceData.date);
        const today = new Date();
        const fiveYearsAgo = new Date();
        const tenYearsFromNow = new Date();
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);
        tenYearsFromNow.setFullYear(today.getFullYear() + 10);

        if (isNaN(raceDate.getTime())) {
          errors.push('Invalid date format');
        } else if (raceDate < fiveYearsAgo) {
          errors.push('Race date cannot be more than 5 years in the past');
        } else if (raceDate > tenYearsFromNow) {
          errors.push('Race date cannot be more than 10 years in the future');
        }
      }

      if (!raceData.location || raceData.location.trim().length === 0) {
        errors.push('Race location is required');
      } else if (raceData.location.trim().length > 200) {
        errors.push('Location must be less than 200 characters');
      }

      if (!raceData.distance_type) {
        errors.push('Distance type is required');
      } else if (!['sprint', 'olympic', 'half', 'ironman', 'custom'].includes(raceData.distance_type)) {
        errors.push('Invalid distance type');
      }

      // Optional field validations
      if (raceData.swim_distance !== undefined && raceData.swim_distance !== null) {
        if (raceData.swim_distance < 0 || raceData.swim_distance > 10000) {
          errors.push('Swim distance must be between 0 and 10,000 meters');
        }
      }

      if (raceData.bike_distance !== undefined && raceData.bike_distance !== null) {
        if (raceData.bike_distance < 0 || raceData.bike_distance > 300) {
          errors.push('Bike distance must be between 0 and 300 kilometers');
        }
      }

      if (raceData.run_distance !== undefined && raceData.run_distance !== null) {
        if (raceData.run_distance < 0 || raceData.run_distance > 50) {
          errors.push('Run distance must be between 0 and 50 kilometers');
        }
      }

      if (raceData.difficulty_score !== undefined && raceData.difficulty_score !== null) {
        if (!Number.isInteger(raceData.difficulty_score) || raceData.difficulty_score < 1 || raceData.difficulty_score > 10) {
          errors.push('Difficulty score must be an integer between 1 and 10');
        }
      }

      if (raceData.description && raceData.description.length > 1000) {
        errors.push('Description must be less than 1,000 characters');
      }

      if (raceData.website_url) {
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(raceData.website_url)) {
          errors.push('Website URL must be a valid HTTP or HTTPS URL');
        }
      }

      return {
        isValid: errors.length === 0,
        error: errors.length > 0 ? errors.join('; ') : null,
        errors
      };
    },

    // Set default distances based on distance type
    setDefaultDistances: (raceData: any) => {
      const defaults = {
        sprint: { swim_distance: 750, bike_distance: 20, run_distance: 5 },
        olympic: { swim_distance: 1500, bike_distance: 40, run_distance: 10 },
        half: { swim_distance: 1900, bike_distance: 90, run_distance: 21.1 },
        ironman: { swim_distance: 3800, bike_distance: 180, run_distance: 42.2 },
        custom: {} // No defaults for custom
      };

      // CRITICAL FIX: Don't override explicitly provided custom distances
      // If user provided specific distance values, preserve them regardless of distance_type
      const hasCustomDistances = raceData.swim_distance !== undefined ||
                                 raceData.bike_distance !== undefined ||
                                 raceData.run_distance !== undefined;

      if (hasCustomDistances) {
        logger.debug('PRESERVING custom distances provided by user:', {
          swim: raceData.swim_distance,
          bike: raceData.bike_distance,
          run: raceData.run_distance
        });
        return raceData; // Don't apply defaults if custom distances are provided
      }

      // Only apply defaults if no custom distances are provided
      if (raceData.distance_type && raceData.distance_type !== 'custom') {
        const typeDefaults = defaults[raceData.distance_type as keyof typeof defaults];

        return {
          ...raceData,
          swim_distance: raceData.swim_distance ?? typeDefaults.swim_distance,
          bike_distance: raceData.bike_distance ?? typeDefaults.bike_distance,
          run_distance: raceData.run_distance ?? typeDefaults.run_distance
        };
      }

      return raceData;
    },

    // Calculate preparation status
    calculatePreparationStatus: (daysUntil: number, distanceType: string) => {
      const idealPrepWeeks = {
        'sprint': 8,
        'olympic': 12,
        'half': 20,
        'ironman': 30,
        'custom': 12
      };

      const weeksUntil = Math.ceil(daysUntil / 7);
      const idealWeeks = idealPrepWeeks[distanceType as keyof typeof idealPrepWeeks] || 12;

      if (weeksUntil >= idealWeeks) return 'excellent';
      if (weeksUntil >= idealWeeks * 0.75) return 'good';
      if (weeksUntil >= idealWeeks * 0.5) return 'moderate';
      return 'critical';
    },

    // Get combined race data (external + user races) for dashboard widgets
    getCombinedUpcomingRaces: async (limit: number = 5) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const today = new Date().toISOString().split('T')[0];

      try {
        // Get user-created races and planned external races in parallel
        const [userRaces, plannedRaces] = await Promise.all([
          supabase
            .from('user_races')
            .select('*, "type": \'user_created\'')
            .eq('user_id', user.id)
            .gte('date', today)
            .order('date', { ascending: true }),
          supabase
            .from('external_races')
            .select(`
              *,
              user_planned_races!inner(
                id, status, goal_time, priority,
                notes, training_weeks_remaining, user_id
              ),
              "type": 'external'
            `)
            .gte('date', today)
            .in('user_planned_races.status', ['registered', 'training'])
            .eq('user_planned_races.user_id', user.id)
            .order('date', { ascending: true })
        ]);

        // Combine and sort races by date
        const allRaces = [
          ...(userRaces.data || []).map(race => ({
            ...race,
            source: 'user_created',
            isPriority: race.difficulty_score >= 8
          })),
          ...(plannedRaces.data || []).map(race => ({
            ...race,
            source: 'external',
            isPriority: race.user_planned_races?.priority <= 2
          }))
        ];

        // Sort by date and limit results
        const sortedRaces = allRaces
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, limit);

        // Add countdown calculations
        const racesWithCountdown = sortedRaces.map(race => {
          const raceDate = new Date(race.date);
          const todayDate = new Date();
          const timeDiff = raceDate.getTime() - todayDate.getTime();
          const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return {
            ...race,
            daysUntil,
            weeksUntil: Math.ceil(daysUntil / 7),
            preparationStatus: dbHelpers.userRaces.calculatePreparationStatus(daysUntil, race.distance_type)
          };
        });

        return { data: racesWithCountdown, error: null };
      } catch (error: any) {
        logger.error('Error fetching combined races:', error);
        return { data: null, error: error.message };
      }
    },

    // Export user races data
    exportData: async (format: 'json' | 'csv' = 'json') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data: races, error } = await supabase
        .from('user_races')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error || !races) {
        return { data: null, error: error || 'No races found' };
      }

      if (format === 'csv') {
        const csvHeaders = [
          'Name', 'Date', 'Location', 'Distance Type',
          'Swim Distance (m)', 'Bike Distance (km)', 'Run Distance (km)',
          'Difficulty Score', 'Description', 'Website URL', 'Created At'
        ];

        const csvRows = races.map(race => [
          race.name,
          race.date,
          race.location,
          race.distance_type,
          race.swim_distance || '',
          race.bike_distance || '',
          race.run_distance || '',
          race.difficulty_score || '',
          race.description || '',
          race.website_url || '',
          race.created_at
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        return { data: csvContent, error: null };
      }

      return { data: races, error: null };
    }
  },
};
