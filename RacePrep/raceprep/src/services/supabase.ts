import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Debug environment variables in production
console.log('[SUPABASE] Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'unknown'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Missing environment variables!', {
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '[PRESENT]' : '[MISSING]'
  });
}

// Create a simple client with proper auth configuration and timeout
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'raceprep-web@1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for common operations
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user metadata
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },
};

// Database helper functions
export const dbHelpers = {
  // User operations
  users: {
    // Get user profile by ID
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    // Update user profile by ID
    updateProfile: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    // Create user profile (usually called after signup)
    createProfile: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },

    // Get current user profile
    getCurrent: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return { data, error };
    },

    // Update current user profile
    update: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Create current user profile (for first time setup)
    create: async (profileData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('users')
        .insert({ ...profileData, id: user.id, email: user.email })
        .select()
        .single();
      return { data, error };
    },
  },

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

    // Get upcoming races with countdown calculations
    getUpcoming: async (limit: number = 5) => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('external_races')
        .select(`
          *,
          user_planned_races!inner(
            id,
            status,
            goal_time,
            priority,
            notes,
            training_weeks_remaining,
            user_id
          )
        `)
        .gte('date', today)
        .in('user_planned_races.status', ['registered', 'training'])
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
            isPriority: race.user_planned_races?.priority <= 2,
            preparationStatus: dbHelpers.races.calculatePreparationStatus(daysUntil, race.distance_type)
          };
        });

        return { data: racesWithCountdown, error: null };
      }

      return { data, error };
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
          races (
            *,
            courses (*)
          )
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
          races (
            *,
            courses (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Add new race result
    add: async (raceResult: any) => {
      const { data, error } = await supabase
        .from('race_results')
        .insert(raceResult)
        .select(`
          *,
          races (
            *,
            courses (*)
          )
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
          races (
            *,
            courses (*)
          )
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

  // Course operations
  courses: {
    // Get all courses
    getAll: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      return { data, error };
    },

    // Search courses by location or distance type
    search: async (filters: { location?: string; distanceType?: string }) => {
      let query = supabase.from('courses').select('*');
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.distanceType) {
        query = query.eq('distance_type', filters.distanceType);
      }
      
      const { data, error } = await query.order('name');
      return { data, error };
    },

    // Get course by ID with reviews
    getById: async (courseId: string) => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_reviews (
            *,
            users (name)
          )
        `)
        .eq('id', courseId)
        .single();
      return { data, error };
    },

    // Create new course
    create: async (courseData: any) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
      return { data, error };
    },

    // Update course
    update: async (courseId: string, updates: any) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();
      return { data, error };
    },

    // Delete course
    delete: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      return { error };
    },
  },

  // Nutrition plans
  nutritionPlans: {
    // Get user's nutrition plans
    getUserPlans: async (userId: string) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          races (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create nutrition plan
    create: async (nutritionPlan: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert(nutritionPlan)
        .select()
        .single();
      return { data, error };
    },

    // Update nutrition plan
    update: async (planId: string, updates: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Packing lists
  packingLists: {
    // Get user's packing lists
    getUserLists: async (userId: string) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .select(`
          *,
          races (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    // Create packing list
    create: async (packingList: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .insert(packingList)
        .select()
        .single();
      return { data, error };
    },
    // Update packing list
    update: async (listId: string, updates: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Discover tab helpers
  externalRaces: {
    // Get all external races
    getAll: async () => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get races by location
    getByLocation: async (city: string, state: string, radiusMiles: number = 50) => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .or(`city.ilike.%${city}%,state.ilike.%${state}%`)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get races by distance type
    getByDistanceType: async (distanceType: string) => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .eq('distance_type', distanceType)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get featured races
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20);
      return { data, error };
    },

    // Create new external race
    create: async (race: any) => {
      const { data, error } = await supabase
        .from('external_races')
        .insert([race])
        .select()
        .single();
      return { data, error };
    },

    // Update external race
    update: async (id: string, race: any) => {
      const { data, error } = await supabase
        .from('external_races')
        .update(race)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Training events
  trainingEvents: {
    // Get all training events
    getAll: async () => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get events by location
    getByLocation: async (city: string, state: string) => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .or(`city.ilike.%${city}%,state.ilike.%${state}%`)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get events by type
    getByEventType: async (eventType: string) => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .eq('event_type', eventType)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get upcoming events
    getUpcoming: async () => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(10);
      return { data, error };
    },

    // Create new training event
    create: async (eventData: any) => {
      const { data, error } = await supabase
        .from('training_events')
        .insert(eventData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Gear products
  gearProducts: {
    // Get all gear products
    getAll: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get products by category
    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .eq('category', category)
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get featured products
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get top rated products
    getTopRated: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .limit(12);
      return { data, error };
    },

    // Create new gear product
    create: async (productData: any) => {
      const { data, error } = await supabase
        .from('gear_products')
        .insert(productData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Training articles
  trainingArticles: {
    // Get all articles
    getAll: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get articles by category
    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .eq('category', category)
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get featured articles
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get recent articles
    getRecent: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);
      return { data, error };
    },

    // Increment view count
    incrementViewCount: async (id: string) => {
      const { error } = await supabase.rpc('increment_article_views', { article_id: id });
      return { error };
    },

    // Create new training article
    create: async (articleData: any) => {
      const { data, error } = await supabase
        .from('training_articles')
        .insert(articleData)
        .select()
        .single();
      return { data, error };
    },
  },

  // User locations
  userLocations: {
    // Get user's locations
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId);
      return { data, error };
    },

    // Get primary location
    getPrimary: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();
      return { data, error };
    },

    // Create location
    create: async (location: any) => {
      const { data, error } = await supabase
        .from('user_locations')
        .insert([location])
        .select()
        .single();
      return { data, error };
    },

    // Update location
    update: async (id: string, location: any) => {
      const { data, error } = await supabase
        .from('user_locations')
        .update(location)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Enhanced User goals with progress calculation
  userGoals: {
    // Get user's goals with progress calculation
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Calculate progress for each goal
        const goalsWithProgress = await Promise.all(
          data.map(async (goal) => {
            const progress = await dbHelpers.userGoals.calculateGoalProgress(goal);
            return { ...goal, ...progress };
          })
        );

        return { data: goalsWithProgress, error: null };
      }

      return { data, error };
    },

    // Get active goals with upcoming deadlines
    getActiveWithDeadlines: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('achieved', false)
        .gte('target_date', today)
        .order('target_date', { ascending: true });

      if (data) {
        const goalsWithProgress = await Promise.all(
          data.map(async (goal) => {
            const progress = await dbHelpers.userGoals.calculateGoalProgress(goal);
            const daysUntilTarget = goal.target_date
              ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
              : null;

            return {
              ...goal,
              ...progress,
              daysUntilTarget,
              urgency: dbHelpers.userGoals.calculateGoalUrgency(progress.progressPercentage || 0, daysUntilTarget)
            };
          })
        );

        return { data: goalsWithProgress, error: null };
      }

      return { data, error };
    },

    // Calculate goal progress based on type
    calculateGoalProgress: async (goal: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { progressPercentage: 0, currentValue: null, status: 'no_data' };

      try {
        switch (goal.goal_type) {
          case 'race_count':
            return await dbHelpers.userGoals.calculateRaceCountProgress(goal, user.id);
          case 'time_target':
            return await dbHelpers.userGoals.calculateTimeTargetProgress(goal, user.id);
          case 'transition_time':
            return await dbHelpers.userGoals.calculateTransitionTimeProgress(goal, user.id);
          default:
            return { progressPercentage: 0, currentValue: null, status: 'unknown_type' };
        }
      } catch (error) {
        console.error('Error calculating goal progress:', error);
        return { progressPercentage: 0, currentValue: null, status: 'error' };
      }
    },

    // Calculate race count progress
    calculateRaceCountProgress: async (goal: any, userId: string) => {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);

      // Get completed races this year
      const { data: raceResults, error } = await supabase
        .from('race_results')
        .select('id, race_id, races(*)')
        .eq('user_id', userId)
        .gte('created_at', startOfYear.toISOString());

      if (error) {
        console.error('Error fetching race results:', error);
        return { progressPercentage: 0, currentValue: 0, status: 'error' };
      }

      // Filter by distance type if specified
      let validRaces = raceResults || [];
      if (goal.distance_type && goal.distance_type !== 'all') {
        validRaces = validRaces.filter(result =>
          result.races?.distance_type === goal.distance_type
        );
      }

      const currentCount = validRaces.length;
      const targetCount = parseInt(goal.target_value);
      const progressPercentage = Math.min((currentCount / targetCount) * 100, 100);

      return {
        progressPercentage: Math.round(progressPercentage),
        currentValue: currentCount,
        status: currentCount >= targetCount ? 'achieved' : 'in_progress'
      };
    },

    // Calculate time target progress
    calculateTimeTargetProgress: async (goal: any, userId: string) => {
      // Get best time for the specified distance type
      const { data: raceResults, error } = await supabase
        .from('race_results')
        .select(`
          overall_time,
          races (distance_type)
        `)
        .eq('user_id', userId);

      if (error || !raceResults) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      // Filter by distance type
      const relevantResults = raceResults.filter(result =>
        result.races?.distance_type === goal.distance_type
      );

      if (relevantResults.length === 0) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      // Find best time (assuming overall_time is stored as interval)
      const bestResult = relevantResults.reduce((best, current) => {
        // Convert interval to milliseconds for comparison
        const currentMs = dbHelpers.userGoals.intervalToMilliseconds(current.overall_time);
        const bestMs = dbHelpers.userGoals.intervalToMilliseconds(best.overall_time);
        return currentMs < bestMs ? current : best;
      });

      const bestTimeMs = dbHelpers.userGoals.intervalToMilliseconds(bestResult.overall_time);
      const targetTimeMs = dbHelpers.userGoals.parseTimeTarget(goal.target_value);

      if (bestTimeMs <= targetTimeMs) {
        return {
          progressPercentage: 100,
          currentValue: dbHelpers.userGoals.millisecondsToTimeString(bestTimeMs),
          status: 'achieved'
        };
      }

      // Calculate progress based on improvement needed
      const improvementNeeded = bestTimeMs - targetTimeMs;
      const maxReasonableTime = targetTimeMs * 2; // Assume 2x target is starting point
      const totalImprovementPossible = maxReasonableTime - targetTimeMs;
      const improvementMade = maxReasonableTime - bestTimeMs;

      const progressPercentage = Math.max(0, Math.min(100, (improvementMade / totalImprovementPossible) * 100));

      return {
        progressPercentage: Math.round(progressPercentage),
        currentValue: dbHelpers.userGoals.millisecondsToTimeString(bestTimeMs),
        status: 'in_progress'
      };
    },

    // Calculate transition time progress
    calculateTransitionTimeProgress: async (goal: any, userId: string) => {
      // Get average transition times from recent races
      const { data: raceResults, error } = await supabase
        .from('race_results')
        .select('t1_time, t2_time, races(distance_type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5); // Last 5 races

      if (error || !raceResults || raceResults.length === 0) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      // Calculate average transition time
      const transitionField = goal.target_value.includes('T1') ? 't1_time' : 't2_time';
      const validResults = raceResults.filter(result => result[transitionField]);

      if (validResults.length === 0) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      const avgTransitionMs = validResults.reduce((sum, result) =>
        sum + dbHelpers.userGoals.intervalToMilliseconds(result[transitionField])
      , 0) / validResults.length;

      const targetTimeMs = dbHelpers.userGoals.parseTimeTarget(goal.target_value.split(' ')[0]); // Extract time from "2:30 T1"

      if (avgTransitionMs <= targetTimeMs) {
        return {
          progressPercentage: 100,
          currentValue: dbHelpers.userGoals.millisecondsToTimeString(avgTransitionMs),
          status: 'achieved'
        };
      }

      // Calculate progress (assuming starting point is 2x target time)
      const maxReasonableTime = targetTimeMs * 3;
      const improvementNeeded = avgTransitionMs - targetTimeMs;
      const totalImprovementPossible = maxReasonableTime - targetTimeMs;
      const improvementMade = maxReasonableTime - avgTransitionMs;

      const progressPercentage = Math.max(0, Math.min(100, (improvementMade / totalImprovementPossible) * 100));

      return {
        progressPercentage: Math.round(progressPercentage),
        currentValue: dbHelpers.userGoals.millisecondsToTimeString(avgTransitionMs),
        status: 'in_progress'
      };
    },

    // Calculate goal urgency level
    calculateGoalUrgency: (progressPercentage: number, daysUntilTarget: number | null) => {
      if (!daysUntilTarget) return 'low';

      const expectedProgress = Math.max(0, 100 - (daysUntilTarget / 365 * 100));
      const progressGap = expectedProgress - progressPercentage;

      if (daysUntilTarget <= 30 && progressPercentage < 80) return 'high';
      if (daysUntilTarget <= 60 && progressPercentage < 60) return 'high';
      if (progressGap > 30) return 'medium';
      return 'low';
    },

    // Utility functions for time conversion
    intervalToMilliseconds: (interval: string) => {
      if (!interval) return 0;

      // Parse PostgreSQL interval format (e.g., "01:30:00" or "1 hour 30 minutes")
      const timeMatch = interval.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
      }

      return 0;
    },

    parseTimeTarget: (timeString: string) => {
      // Parse time target like "4:30:00" or "2:30"
      const parts = timeString.split(':');
      if (parts.length === 3) {
        return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])) * 1000;
      } else if (parts.length === 2) {
        return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
      }
      return 0;
    },

    millisecondsToTimeString: (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    },

    // Create new goal with validation
    create: async (goalData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Validate goal data
      const validation = dbHelpers.userGoals.validateGoalData(goalData);
      if (!validation.isValid) {
        return { data: null, error: validation.error };
      }

      const { data, error } = await supabase
        .from('user_goals')
        .insert({ ...goalData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Validate goal data
    validateGoalData: (goalData: any) => {
      if (!goalData.goal_type) {
        return { isValid: false, error: 'Goal type is required' };
      }

      if (!goalData.target_value) {
        return { isValid: false, error: 'Target value is required' };
      }

      if (goalData.goal_type === 'race_count') {
        const count = parseInt(goalData.target_value);
        if (isNaN(count) || count <= 0) {
          return { isValid: false, error: 'Race count must be a positive number' };
        }
      }

      if (goalData.goal_type === 'time_target') {
        if (!goalData.distance_type) {
          return { isValid: false, error: 'Distance type is required for time targets' };
        }
        // Validate time format
        const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
        if (!timePattern.test(goalData.target_value)) {
          return { isValid: false, error: 'Time format should be HH:MM or HH:MM:SS' };
        }
      }

      return { isValid: true };
    },

    // Update goal
    update: async (goalId: string, updates: any) => {
      // Validate updates if they include goal data
      if (updates.target_value || updates.goal_type) {
        const validation = dbHelpers.userGoals.validateGoalData(updates);
        if (!validation.isValid) {
          return { data: null, error: validation.error };
        }
      }

      const { data, error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      return { data, error };
    },

    // Mark goal as achieved
    markAchieved: async (goalId: string) => {
      const { data, error } = await supabase
        .from('user_goals')
        .update({ achieved: true, current_value: null })
        .eq('id', goalId)
        .select()
        .single();
      return { data, error };
    },

    // Get goal statistics for dashboard
    getGoalStatistics: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data: goals, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      if (error || !goals) {
        return { data: null, error };
      }

      const stats = {
        total: goals.length,
        achieved: goals.filter(g => g.achieved).length,
        inProgress: goals.filter(g => !g.achieved).length,
        overdue: 0,
        onTrack: 0,
        needsAttention: 0
      };

      // Calculate detailed statistics for active goals
      for (const goal of goals.filter(g => !g.achieved)) {
        const progress = await dbHelpers.userGoals.calculateGoalProgress(goal);
        const daysUntilTarget = goal.target_date
          ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
          : null;

        if (daysUntilTarget !== null && daysUntilTarget < 0) {
          stats.overdue++;
        } else {
          const urgency = dbHelpers.userGoals.calculateGoalUrgency(progress.progressPercentage || 0, daysUntilTarget);
          if (urgency === 'high') {
            stats.needsAttention++;
          } else {
            stats.onTrack++;
          }
        }
      }

      return { data: stats, error: null };
    },

    // Delete goal
    delete: async (goalId: string) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);
      return { error };
    },
  },

  // User settings
  userSettings: {
    // Get user's settings
    get: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return { data, error };
    },

    // Create user settings (for first time)
    create: async (settingsData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .insert({ ...settingsData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Update user settings
    update: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Upsert settings (insert or update)
    upsert: async (settingsData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ ...settingsData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },
  },

  // User planned races
  userPlannedRaces: {
    // Get user's planned races
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        console.log('[SUPABASE] Querying user_planned_races for user:', user.id);

        // Query with external_races JOIN to get full race data
        const { data, error } = await supabase
          .from('user_planned_races')
          .select(`
            *,
            external_races (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('[SUPABASE] user_planned_races query result:', { data: data?.length || 0, error });
        
        // Handle 404 or table not found errors gracefully
        if (error) {
          console.warn('[SUPABASE] Error in user_planned_races query:', error);
          // Check for table not found errors (404, PGRST106, etc.)
          if (error.code === 'PGRST106' || error.code === 'PGRST205' ||
              error.message?.includes('404') || error.details?.includes('404') ||
              error.message?.includes('does not exist')) {
            return { data: null, error: { code: 'TABLE_NOT_FOUND', message: 'Tables not initialized' } };
          }
        }
        
        return { data, error };
      } catch (fetchError: any) {
        // Handle network/fetch errors that might result in 404
        if (fetchError.status === 404 || fetchError.message?.includes('404')) {
          return { data: null, error: { code: 'TABLE_NOT_FOUND', message: 'Tables not initialized' } };
        }
        return { data: null, error: fetchError };
      }
    },

    // Get races by status
    getByStatus: async (status: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .select(`
          *,
          external_races (*)
        `)
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create planned race
    create: async (raceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .insert({ ...raceData, user_id: user.id })
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Update planned race
    update: async (plannedRaceId: string, updates: any) => {
      const { data, error } = await supabase
        .from('user_planned_races')
        .update(updates)
        .eq('id', plannedRaceId)
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Delete planned race
    delete: async (plannedRaceId: string) => {
      const { error } = await supabase
        .from('user_planned_races')
        .delete()
        .eq('id', plannedRaceId);
      return { error };
    },

    // Upsert planned race (for save/unsave functionality)
    upsert: async (raceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .upsert({ ...raceData, user_id: user.id })
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Update race status
    updateStatus: async (plannedRaceId: string, status: 'interested' | 'registered' | 'completed') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .update({ status })
        .eq('id', plannedRaceId)
        .eq('user_id', user.id) // Ensure user can only update their own races
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },
  },

  // RSS feeds
  rssFeeds: {
    // Get active RSS sources
    getActive: async () => {
      const { data, error } = await supabase
        .from('rss_sources')
        .select('*')
        .eq('is_active', true);
      return { data, error };
    },

    // Get all RSS sources
    getAll: async () => {
      const { data, error } = await supabase
        .from('rss_sources')
        .select('*');
      return { data, error };
    },
  },

  // Enhanced Training sessions with performance analytics
  trainingSessions: {
    // Get user's training sessions
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get sessions with performance trends
    getWithTrends: async (limit: number = 50) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            *,
            (select avg(average_speed) from training_sessions ts2
             where ts2.user_id = training_sessions.user_id
             and ts2.type = training_sessions.type
             and ts2.date < training_sessions.date) as previous_avg_speed
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(limit);

        if (data) {
          // Calculate performance trends
          const sessionsWithTrends = data.map(session => ({
            ...session,
            speedImprovement: session.average_speed && session.previous_avg_speed
              ? ((session.average_speed - session.previous_avg_speed) / session.previous_avg_speed) * 100
              : null,
            paceImprovement: session.average_speed && session.previous_avg_speed && session.type === 'run'
              ? dbHelpers.trainingSessions.calculatePaceImprovement(session.average_speed, session.previous_avg_speed)
              : null
          }));

          return { data: sessionsWithTrends, error: null };
        }

        return { data, error };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Enhanced sessions query error:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Get sessions by date range with analytics
    getByDateRange: async (startDate: string, endDate: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get advanced weekly stats with HR zones and power analysis
    getAdvancedWeeklyStats: async (weeksBack: number = 4) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const weeklyStats = [];

      for (let i = 0; i < weeksBack; i++) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (7 * (i + 1)));
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            type, distance, moving_time, total_elevation_gain,
            average_heartrate, max_heartrate, average_watts,
            suffer_score, trainer
          `)
          .eq('user_id', user.id)
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lte('date', endOfWeek.toISOString().split('T')[0]);

        if (!error && data) {
          const weekStats = dbHelpers.trainingSessions.calculateWeekStatistics(data, startOfWeek);
          weeklyStats.push(weekStats);
        }
      }

      return { data: weeklyStats.reverse(), error: null };
    },

    // Get HR zone analysis for recent activities
    getHRZoneAnalysis: async (days: number = 30) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('training_sessions')
        .select('type, average_heartrate, max_heartrate, moving_time, distance, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .not('average_heartrate', 'is', null)
        .order('date', { ascending: false });

      if (data) {
        const hrAnalysis = dbHelpers.stravaData.analyzeHRZones(data);
        return { data: hrAnalysis, error: null };
      }

      return { data, error };
    },

    // Calculate pace improvement percentage
    calculatePaceImprovement: (currentSpeed: number, previousSpeed: number) => {
      if (!currentSpeed || !previousSpeed) return null;

      // Convert m/s to min/km for pace
      const currentPace = 16.6667 / currentSpeed; // min/km
      const previousPace = 16.6667 / previousSpeed; // min/km

      // Improvement is when pace gets faster (lower number)
      return ((previousPace - currentPace) / previousPace) * 100;
    },

    // Calculate comprehensive week statistics
    calculateWeekStatistics: (sessions: any[], weekStart: Date) => {
      const stats = {
        weekStart: weekStart.toISOString().split('T')[0],
        total: {
          sessions: sessions.length,
          distance: 0,
          time: 0,
          elevation: 0,
          tss: 0,
          indoorSessions: 0
        },
        swim: { sessions: 0, distance: 0, time: 0, avgHR: 0 },
        bike: {
          sessions: 0,
          distance: 0,
          time: 0,
          elevation: 0,
          avgWatts: 0,
          avgHR: 0,
          indoorSessions: 0
        },
        run: {
          sessions: 0,
          distance: 0,
          time: 0,
          elevation: 0,
          avgPace: 0,
          avgHR: 0
        }
      };

      let totalHRReadings = { swim: 0, bike: 0, run: 0 };
      let totalWattReadings = 0;
      let totalRunDistance = 0;
      let totalRunTime = 0;

      sessions.forEach(session => {
        const { type, distance = 0, moving_time = 0, total_elevation_gain = 0,
                average_heartrate, average_watts, suffer_score = 0, trainer } = session;

        // Update totals
        stats.total.distance += distance;
        stats.total.time += moving_time;
        stats.total.elevation += total_elevation_gain;
        stats.total.tss += suffer_score;
        if (trainer) stats.total.indoorSessions++;

        // Update by discipline
        if (stats[type as keyof typeof stats] && typeof stats[type as keyof typeof stats] === 'object') {
          const disciplineStats = stats[type as keyof typeof stats] as any;
          disciplineStats.sessions++;
          disciplineStats.distance += distance;
          disciplineStats.time += moving_time;

          if (type !== 'swim') {
            disciplineStats.elevation += total_elevation_gain;
          }

          if (type === 'bike' && trainer) {
            disciplineStats.indoorSessions++;
          }

          if (average_heartrate) {
            disciplineStats.avgHR += average_heartrate;
            totalHRReadings[type as keyof typeof totalHRReadings]++;
          }

          if (type === 'bike' && average_watts) {
            disciplineStats.avgWatts += average_watts;
            totalWattReadings++;
          }

          if (type === 'run' && distance > 0 && moving_time > 0) {
            totalRunDistance += distance;
            totalRunTime += moving_time;
          }
        }
      });

      // Calculate averages
      Object.keys(totalHRReadings).forEach(type => {
        const count = totalHRReadings[type as keyof typeof totalHRReadings];
        if (count > 0) {
          (stats[type as keyof typeof stats] as any).avgHR =
            Math.round((stats[type as keyof typeof stats] as any).avgHR / count);
        }
      });

      if (totalWattReadings > 0) {
        stats.bike.avgWatts = Math.round(stats.bike.avgWatts / totalWattReadings);
      }

      if (totalRunDistance > 0 && totalRunTime > 0) {
        const avgSpeedMs = totalRunDistance / totalRunTime;
        stats.run.avgPace = Math.round((16.6667 / avgSpeedMs) * 100) / 100; // min/km
      }

      return stats;
    },

    // Analyze HR zones distribution
    analyzeHRZones: (sessions: any[]) => {
      // Assume max HR of 190 for zone calculations (should be user-configurable)
      const maxHR = 190;
      const zones = {
        zone1: { min: 0, max: maxHR * 0.68, sessions: 0, time: 0 },
        zone2: { min: maxHR * 0.68, max: maxHR * 0.83, sessions: 0, time: 0 },
        zone3: { min: maxHR * 0.83, max: maxHR * 0.94, sessions: 0, time: 0 },
        zone4: { min: maxHR * 0.94, max: maxHR * 1.05, sessions: 0, time: 0 },
        zone5: { min: maxHR * 1.05, max: maxHR * 1.15, sessions: 0, time: 0 }
      };

      sessions.forEach(session => {
        if (session.average_heartrate) {
          const hr = session.average_heartrate;
          let zone: keyof typeof zones = 'zone1';

          if (hr >= zones.zone5.min) zone = 'zone5';
          else if (hr >= zones.zone4.min) zone = 'zone4';
          else if (hr >= zones.zone3.min) zone = 'zone3';
          else if (hr >= zones.zone2.min) zone = 'zone2';

          zones[zone].sessions++;
          zones[zone].time += session.moving_time || 0;
        }
      });

      return {
        zones,
        totalSessions: sessions.length,
        avgHR: Math.round(sessions.reduce((sum, s) => sum + (s.average_heartrate || 0), 0) / sessions.length),
        maxHR: Math.max(...sessions.map(s => s.max_heartrate || 0))
      };
    },

    // Get training load trends
    getTrainingLoad: async (weeks: number = 8) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (weeks * 7));

      const { data, error } = await supabase
        .from('training_sessions')
        .select('date, moving_time, distance, suffer_score, type')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (data) {
        const weeklyLoad = dbHelpers.stravaData.calculateWeeklyTrainingLoad(data, weeks);
        return { data: weeklyLoad, error: null };
      }

      return { data, error };
    },

    // Calculate weekly training load
    calculateWeeklyTrainingLoad: (sessions: any[], weeks: number) => {
      const weeklyData = Array(weeks).fill(0).map((_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - ((weeks - i) * 7));
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

        return {
          week: weekStart.toISOString().split('T')[0],
          tss: 0,
          duration: 0,
          distance: 0,
          sessions: 0
        };
      });

      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const weekIndex = Math.floor((sessionDate.getTime() - new Date(weeklyData[0].week).getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (weekIndex >= 0 && weekIndex < weeklyData.length) {
          weeklyData[weekIndex].tss += session.suffer_score || 0;
          weeklyData[weekIndex].duration += session.moving_time || 0;
          weeklyData[weekIndex].distance += session.distance || 0;
          weeklyData[weekIndex].sessions++;
        }
      });

      return weeklyData;
    },

    // Get training consistency metrics
    getConsistencyMetrics: async (weeks: number = 12) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (weeks * 7));

      const { data, error } = await supabase
        .from('training_sessions')
        .select('date, type, moving_time, distance')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (data) {
        const consistency = dbHelpers.stravaData.calculateConsistencyMetrics(data, weeks);
        return { data: consistency, error: null };
      }

      return { data, error };
    },

    // Calculate consistency metrics
    calculateConsistencyMetrics: (sessions: any[], weeks: number) => {
      const weeklyActivity = Array(weeks).fill(0).map(() => ({
        swim: 0, bike: 0, run: 0, total: 0
      }));

      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const today = new Date();
        const weekIndex = Math.floor((today.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (weekIndex >= 0 && weekIndex < weeks) {
          const reverseIndex = weeks - 1 - weekIndex;
          if (reverseIndex >= 0) {
            weeklyActivity[reverseIndex][session.type as keyof typeof weeklyActivity[0]]++;
            weeklyActivity[reverseIndex].total++;
          }
        }
      });

      // Calculate consistency scores
      const consistentWeeks = {
        total: weeklyActivity.filter(week => week.total >= 3).length,
        swim: weeklyActivity.filter(week => week.swim >= 1).length,
        bike: weeklyActivity.filter(week => week.bike >= 1).length,
        run: weeklyActivity.filter(week => week.run >= 2).length
      };

      return {
        weeklyActivity,
        consistencyScores: {
          overall: Math.round((consistentWeeks.total / weeks) * 100),
          swim: Math.round((consistentWeeks.swim / weeks) * 100),
          bike: Math.round((consistentWeeks.bike / weeks) * 100),
          run: Math.round((consistentWeeks.run / weeks) * 100)
        },
        recommendations: dbHelpers.stravaData.generateConsistencyRecommendations(consistencyScores)
      };
    },

    // Generate consistency recommendations
    generateConsistencyRecommendations: (scores: any) => {
      const recommendations = [];

      if (scores.swim < 60) {
        recommendations.push('Increase swim frequency to 1-2 sessions per week for balanced training');
      }
      if (scores.bike < 70) {
        recommendations.push('Add more bike sessions to build cycling endurance');
      }
      if (scores.run < 80) {
        recommendations.push('Maintain consistent running with 2-3 sessions per week');
      }
      if (scores.overall < 70) {
        recommendations.push('Focus on consistency - aim for 3+ sessions per week');
      }

      return recommendations;
    },

    // Get weekly stats for current week (enhanced)
    getWeeklyStats: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            type, distance, moving_time, total_elevation_gain,
            average_heartrate, average_watts, suffer_score
          `)
          .eq('user_id', user.id)
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lte('date', endOfWeek.toISOString().split('T')[0]);

        if (error) {
          console.error('[SUPABASE] Weekly stats query error:', error);
          return { data: null, error };
        }

        const stats = dbHelpers.trainingSessions.calculateWeekStatistics(data || [], startOfWeek);
        return { data: stats, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Weekly stats exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Get recent sessions for dashboard widgets
    getRecent: async (limit: number = 10) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Validate and sanitize limit parameter to prevent abuse
      const validatedLimit = Math.max(1, Math.min(limit || 10, 100));

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(validatedLimit);

        if (error) {
          console.error('[SUPABASE] Recent sessions query error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Recent sessions exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Create or update training session
    upsert: async (sessionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .upsert({ ...sessionData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Bulk upsert training sessions (for Strava sync)
    bulkUpsert: async (sessions: any[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      if (!sessions || sessions.length === 0) {
        return { data: [], error: null };
      }

      // Ensure all sessions have the required fields and proper user_id
      const sessionsWithUserId = sessions.map(session => ({
        ...session,
        user_id: user.id,
        // Ensure strava_activity_id is a string if it exists
        strava_activity_id: session.strava_activity_id ? String(session.strava_activity_id) : null,
        // Ensure date is properly formatted
        date: session.date instanceof Date ? session.date.toISOString().split('T')[0] : session.date,
        // Set defaults for optional fields
        trainer: session.trainer ?? false,
        kudos_count: session.kudos_count ?? 0
      }));

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .upsert(sessionsWithUserId, {
            onConflict: 'strava_activity_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          console.error('[SUPABASE] Bulk upsert error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Bulk upsert exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Delete training session
    delete: async (sessionId: string) => {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);
      return { error };
    },

    // Delete sessions by Strava activity ID
    deleteByStravaId: async (stravaActivityId: string) => {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('strava_activity_id', stravaActivityId);
      return { error };
    },
    // Delete all user's training sessions
    deleteAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('user_id', user.id);
      return { error };
    },
  },
  // Enhanced Caching Service for Dashboard Data
  cache: {
    // In-memory cache for dashboard data
    dashboardCache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

    // Cache TTL in milliseconds
    TTL: {
      dashboard_stats: 5 * 60 * 1000,      // 5 minutes
      training_stats: 2 * 60 * 1000,       // 2 minutes
      goal_progress: 10 * 60 * 1000,       // 10 minutes
      race_countdown: 30 * 60 * 1000,      // 30 minutes
      user_settings: 60 * 60 * 1000,       // 1 hour
      weather_data: 15 * 60 * 1000,        // 15 minutes
      strava_analytics: 5 * 60 * 1000      // 5 minutes
    },

    // Get cached data if valid
    get: (key: string) => {
      const cached = dbHelpers.cache.dashboardCache.get(key);
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        dbHelpers.cache.dashboardCache.delete(key);
        return null;
      }

      return cached.data;
    },

    // Set cached data with TTL
    set: (key: string, data: any, ttlType: keyof typeof dbHelpers.cache.TTL = 'dashboard_stats') => {
      const ttl = dbHelpers.cache.TTL[ttlType];
      dbHelpers.cache.dashboardCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    },

    // Cached dashboard overview data
    getDashboardOverview: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `dashboard_overview_${user.id}`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        // Fetch all dashboard data in parallel
        const [
          upcomingRaces,
          weeklyStats,
          goalStats,
          trainingLoad
        ] = await Promise.all([
          dbHelpers.races.getUpcoming(3),
          dbHelpers.trainingSessions.getWeeklyStats(),
          dbHelpers.userGoals.getGoalStatistics(),
          dbHelpers.trainingSessions.getTrainingLoad(4)
        ]);

        const overview = {
          upcomingRaces: upcomingRaces.data,
          weeklyStats: weeklyStats.data,
          goalStats: goalStats.data,
          trainingLoad: trainingLoad.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, overview, 'dashboard_stats');
        return { data: overview, error: null };
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        return { data: null, error: error.message };
      }
    },

    // Cached training analytics
    getTrainingAnalytics: async (weeks: number = 8) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `training_analytics_${user.id}_${weeks}w`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        const [
          advancedWeeklyStats,
          hrZoneAnalysis,
          consistencyMetrics,
          trainingTrends
        ] = await Promise.all([
          dbHelpers.trainingSessions.getAdvancedWeeklyStats(weeks),
          dbHelpers.trainingSessions.getHRZoneAnalysis(30),
          dbHelpers.trainingSessions.getConsistencyMetrics(12),
          dbHelpers.trainingSessions.getWithTrends(30)
        ]);

        const analytics = {
          weeklyStats: advancedWeeklyStats.data,
          hrZoneAnalysis: hrZoneAnalysis.data,
          consistency: consistencyMetrics.data,
          trends: trainingTrends.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, analytics, 'training_stats');
        return { data: analytics, error: null };
      } catch (error) {
        console.error('Error fetching training analytics:', error);
        return { data: null, error: error.message };
      }
    },

    // Cached goal progress with smart invalidation
    getGoalProgress: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `goal_progress_${user.id}`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        const [goalsWithProgress, goalStatistics] = await Promise.all([
          dbHelpers.userGoals.getActiveWithDeadlines(),
          dbHelpers.userGoals.getGoalStatistics()
        ]);

        const goalData = {
          goals: goalsWithProgress.data,
          statistics: goalStatistics.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, goalData, 'goal_progress');
        return { data: goalData, error: null };
      } catch (error) {
        console.error('Error fetching goal progress:', error);
        return { data: null, error: error.message };
      }
    },

    // Cache invalidation for specific data types
    invalidate: (pattern: string) => {
      const keysToDelete = Array.from(dbHelpers.cache.dashboardCache.keys())
        .filter(key => key.includes(pattern));

      keysToDelete.forEach(key => {
        dbHelpers.cache.dashboardCache.delete(key);
      });

      console.log(`Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
    },

    // Clear all cache
    clear: () => {
      dbHelpers.cache.dashboardCache.clear();
      console.log('All cache entries cleared');
    },

    // Cache statistics
    getStats: () => {
      const now = Date.now();
      const entries = Array.from(dbHelpers.cache.dashboardCache.entries());

      const stats = {
        totalEntries: entries.length,
        validEntries: 0,
        expiredEntries: 0,
        totalSize: 0,
        oldestEntry: null as string | null,
        newestEntry: null as string | null
      };

      let oldestTime = Infinity;
      let newestTime = 0;

      entries.forEach(([key, value]) => {
        const age = now - value.timestamp;
        const isExpired = age > value.ttl;

        if (isExpired) {
          stats.expiredEntries++;
        } else {
          stats.validEntries++;
        }

        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          stats.oldestEntry = key;
        }

        if (value.timestamp > newestTime) {
          newestTime = value.timestamp;
          stats.newestEntry = key;
        }

        // Rough size estimation
        stats.totalSize += JSON.stringify(value.data).length;
      });

      return stats;
    },

    // Cleanup expired entries
    cleanup: () => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      dbHelpers.cache.dashboardCache.forEach((value, key) => {
        if (now - value.timestamp > value.ttl) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => {
        dbHelpers.cache.dashboardCache.delete(key);
      });

      if (keysToDelete.length > 0) {
        console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
      }

      return keysToDelete.length;
    },

    // Auto cleanup interval (5 minutes)
    startAutoCleanup: () => {
      setInterval(() => {
        dbHelpers.cache.cleanup();
      }, 5 * 60 * 1000);
    }
  }
};

// Start auto-cleanup when the service is loaded
if (typeof window !== 'undefined') {
  dbHelpers.cache.startAutoCleanup();
}

export default supabase;