import { supabase } from '../supabase';
import {
  UserTrainingPlan,
  UserTrainingPlanInsert,
  UserTrainingPlanUpdate,
} from '../../types/trainingPlans';
import { logger } from '../../utils/logger';

export const userPlans = {
  /**
   * Get user's training plans (optionally filtered by status)
   */
  getUserTrainingPlans: async (userId: string, status?: string) => {
    if (!userId) {
      logger.warn('[TRAINING_PLAN_SERVICE] getUserTrainingPlans called with undefined userId');
      return { data: [], error: null };
    }
    try {
      let query = supabase
        .from('user_training_plans')
        .select(`
          *,
          template:training_plan_templates(*),
          planned_race:user_planned_races(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching user plans:', error);
        return { data: null, error: error.message };
      }

      return { data: data as UserTrainingPlan[], error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching user plans:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get single user training plan with full details
   */
  getUserTrainingPlan: async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_training_plans')
        .select(`
          *,
          template:training_plan_templates(*),
          planned_race:user_planned_races(*)
        `)
        .eq('id', planId)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching user plan:', error);
        return { data: null, error: error.message };
      }

      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching user plan:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create new training plan for user
   */
  createUserTrainingPlan: async (planData: UserTrainingPlanInsert) => {
    try {
      const { data, error } = await supabase
        .from('user_training_plans')
        .insert(planData)
        .select(`
          *,
          template:training_plan_templates(*),
          planned_race:user_planned_races(*)
        `)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error creating user plan:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Created training plan:', data.id);
      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception creating user plan:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update user training plan
   */
  updateUserTrainingPlan: async (planId: string, updates: UserTrainingPlanUpdate) => {
    try {
      const { data, error } = await supabase
        .from('user_training_plans')
        .update(updates)
        .eq('id', planId)
        .select(`
          *,
          template:training_plan_templates(*),
          planned_race:user_planned_races(*)
        `)
        .single();

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error updating user plan:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Updated training plan:', planId);
      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception updating user plan:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete user training plan
   */
  deleteUserTrainingPlan: async (planId: string) => {
    try {
      const { error } = await supabase
        .from('user_training_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        logger.error('[TRAINING_PLAN_SERVICE] Error deleting user plan:', error);
        return { data: null, error: error.message };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Deleted training plan:', planId);
      return { data: true, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception deleting user plan:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get active training plan for user
   */
  getActivePlan: async (userId: string) => {
    if (!userId) {
      logger.warn('[TRAINING_PLAN_SERVICE] getActivePlan called with undefined userId');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_training_plans')
        .select(`
          *,
          template:training_plan_templates(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active plan found
          return null;
        }
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching active plan:', error);
        return null;
      }

      // Get upcoming workouts for current week
      const currentWeek = data.current_week || 1;
      const { data: workouts } = await supabase
        .from('training_plan_workouts')
        .select('*')
        .eq('template_id', data.template_id)
        .eq('week_number', currentWeek)
        .order('day_of_week', { ascending: true })
        .limit(7);

      // Calculate progress
      const totalWeeks = (data as any).template?.duration_weeks || 12;
      const completion_percentage = (data.current_week / totalWeeks) * 100;

      // Get completed workouts count for adherence
      const { count: completedCount } = await supabase
        .from('workout_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_training_plan_id', data.id)
        .eq('status', 'completed');

      const { count: totalWorkouts } = await supabase
        .from('training_plan_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', data.template_id)
        .lte('week_number', currentWeek);

      const adherence_rate = totalWorkouts && completedCount
        ? (completedCount / totalWorkouts) * 100
        : 0;

      return {
        ...data,
        total_weeks: totalWeeks,
        completion_percentage,
        adherence_rate,
        upcoming_workouts: workouts || []
      };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching active plan:', error);
      return null;
    }
  },
};
