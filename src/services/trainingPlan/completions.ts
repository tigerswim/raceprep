import { supabase } from '../supabase';
import {
  WorkoutCompletion,
  WorkoutCompletionInsert,
  WorkoutCompletionUpdate,
  CompletionFilters,
} from '../../types/trainingPlans';
import { logger } from '../../utils/logger';

export const completions = {
  /**
   * Mark workout as completed
   */
  completeWorkout: async (completionData: WorkoutCompletionInsert) => {
    try {
      const { data, error } = await supabase
        .from('workout_completions')
        .upsert({
          ...completionData,
          completed_date: completionData.completed_date || new Date().toISOString(),
          skipped: false
        })
        .select(`
          *,
          planned_workout:training_plan_workouts(*)
        `)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error completing workout:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Workout completed:', data.id);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception completing workout:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Mark workout as skipped
   */
  skipWorkout: async (completionData: WorkoutCompletionInsert & { skip_reason?: string }) => {
    try {
      const { data, error } = await supabase
        .from('workout_completions')
        .upsert({
          ...completionData,
          skipped: true,
          skip_reason: completionData.skip_reason
        })
        .select(`
          *,
          planned_workout:training_plan_workouts(*)
        `)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error skipping workout:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Workout skipped:', data.id);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception skipping workout:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update existing workout completion
   */
  updateWorkoutCompletion: async (completionId: string, updates: WorkoutCompletionUpdate) => {
    try {
      const { data, error } = await supabase
        .from('workout_completions')
        .update(updates)
        .eq('id', completionId)
        .select(`
          *,
          planned_workout:training_plan_workouts(*)
        `)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error updating completion:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Completion updated:', completionId);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception updating completion:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete workout completion
   */
  deleteWorkoutCompletion: async (completionId: string) => {
    try {
      const { error } = await supabase
        .from('workout_completions')
        .delete()
        .eq('id', completionId);

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error deleting completion:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Completion deleted:', completionId);
      return { data: true, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception deleting completion:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get workout completions for a plan
   */
  getWorkoutCompletions: async (planId: string, filters?: CompletionFilters) => {
    try {
      let query = supabase
        .from('workout_completions')
        .select(`
          *,
          planned_workout:training_plan_workouts(*)
        `)
        .eq('user_training_plan_id', planId)
        .order('scheduled_date', { ascending: false });

      if (filters?.completed !== undefined) {
        query = query.eq('skipped', !filters.completed);
      }
      if (filters?.skipped !== undefined) {
        query = query.eq('skipped', filters.skipped);
      }
      if (filters?.has_strava) {
        query = query.not('strava_activity_id', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching completions:', error);
        return { data: null, error: error.message };
      }

      return { data: data as WorkoutCompletion[], error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching completions:', error);
      return { data: null, error: error.message };
    }
  },
};
