import { supabase } from './client';
import { logger } from '../../utils/logger';

export const goalsHelpers = {
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
            const progress = await goalsHelpers.userGoals.calculateGoalProgress(goal);
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
            const progress = await goalsHelpers.userGoals.calculateGoalProgress(goal);
            const daysUntilTarget = goal.target_date
              ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
              : null;

            return {
              ...goal,
              ...progress,
              daysUntilTarget,
              urgency: goalsHelpers.userGoals.calculateGoalUrgency(progress.progressPercentage || 0, daysUntilTarget)
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
            return await goalsHelpers.userGoals.calculateRaceCountProgress(goal, user.id);
          case 'time_target':
            return await goalsHelpers.userGoals.calculateTimeTargetProgress(goal, user.id);
          case 'transition_time':
            return await goalsHelpers.userGoals.calculateTransitionTimeProgress(goal, user.id);
          default:
            return { progressPercentage: 0, currentValue: null, status: 'unknown_type' };
        }
      } catch (error) {
        logger.error('Error calculating goal progress:', error);
        return { progressPercentage: 0, currentValue: null, status: 'error' };
      }
    },

    // Calculate race count progress
    calculateRaceCountProgress: async (goal: any, userId: string) => {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);

      // Get completed races this year
      const { data: raceResults, error } = await supabase
        .from('race_results')
        .select('id, user_race_id, user_races(*)')
        .eq('user_id', userId)
        .gte('created_at', startOfYear.toISOString());

      if (error) {
        logger.error('Error fetching race results:', error);
        return { progressPercentage: 0, currentValue: 0, status: 'error' };
      }

      // Filter by distance type if specified
      let validRaces = raceResults || [];
      if (goal.distance_type && goal.distance_type !== 'all') {
        validRaces = validRaces.filter(result =>
          result.user_races?.distance_type === goal.distance_type
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
          user_races (*)
        `)
        .eq('user_id', userId);

      if (error || !raceResults) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      // Filter by distance type
      const relevantResults = raceResults.filter(result =>
        result.user_races?.distance_type === goal.distance_type
      );

      if (relevantResults.length === 0) {
        return { progressPercentage: 0, currentValue: null, status: 'no_data' };
      }

      // Find best time (assuming overall_time is stored as interval)
      const bestResult = relevantResults.reduce((best, current) => {
        // Convert interval to milliseconds for comparison
        const currentMs = goalsHelpers.userGoals.intervalToMilliseconds(current.overall_time);
        const bestMs = goalsHelpers.userGoals.intervalToMilliseconds(best.overall_time);
        return currentMs < bestMs ? current : best;
      });

      const bestTimeMs = goalsHelpers.userGoals.intervalToMilliseconds(bestResult.overall_time);
      const targetTimeMs = goalsHelpers.userGoals.parseTimeTarget(goal.target_value);

      if (bestTimeMs <= targetTimeMs) {
        return {
          progressPercentage: 100,
          currentValue: goalsHelpers.userGoals.millisecondsToTimeString(bestTimeMs),
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
        currentValue: goalsHelpers.userGoals.millisecondsToTimeString(bestTimeMs),
        status: 'in_progress'
      };
    },

    // Calculate transition time progress
    calculateTransitionTimeProgress: async (goal: any, userId: string) => {
      // Get average transition times from recent races
      const { data: raceResults, error } = await supabase
        .from('race_results')
        .select('t1_time, t2_time, user_races(*)')
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
        sum + goalsHelpers.userGoals.intervalToMilliseconds(result[transitionField])
      , 0) / validResults.length;

      const targetTimeMs = goalsHelpers.userGoals.parseTimeTarget(goal.target_value.split(' ')[0]); // Extract time from "2:30 T1"

      if (avgTransitionMs <= targetTimeMs) {
        return {
          progressPercentage: 100,
          currentValue: goalsHelpers.userGoals.millisecondsToTimeString(avgTransitionMs),
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
        currentValue: goalsHelpers.userGoals.millisecondsToTimeString(avgTransitionMs),
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
      const validation = goalsHelpers.userGoals.validateGoalData(goalData);
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
        const validation = goalsHelpers.userGoals.validateGoalData(updates);
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
        const progress = await goalsHelpers.userGoals.calculateGoalProgress(goal);
        const daysUntilTarget = goal.target_date
          ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
          : null;

        if (daysUntilTarget !== null && daysUntilTarget < 0) {
          stats.overdue++;
        } else {
          const urgency = goalsHelpers.userGoals.calculateGoalUrgency(progress.progressPercentage || 0, daysUntilTarget);
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
        logger.debug('[SUPABASE] Querying user_planned_races for user:', user.id);

        // Query with external_races JOIN to get full race data
        const { data, error } = await supabase
          .from('user_planned_races')
          .select(`
            *,
            external_races (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        logger.debug('[SUPABASE] user_planned_races query result:', { data: data?.length || 0, error });

        // Handle 404 or table not found errors gracefully
        if (error) {
          logger.warn('[SUPABASE] Error in user_planned_races query:', error);
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
      try {
        logger.debug('[SUPABASE] Updating planned race:', plannedRaceId, 'with updates:', updates);

        const { data, error } = await supabase
          .from('user_planned_races')
          .update(updates)
          .eq('id', plannedRaceId)
          .select(`
            *,
            external_races (*)
          `)
          .single();

        logger.debug('[SUPABASE] Update result:', { data, error });

        if (error) {
          logger.error('[SUPABASE] Update error:', error);
        }

        return { data, error };
      } catch (updateError: any) {
        logger.error('[SUPABASE] Update exception:', updateError);
        return { data: null, error: updateError.message || 'Update failed' };
      }
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
};
