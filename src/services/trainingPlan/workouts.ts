import { supabase } from '../supabase';
import { WorkoutWithCompletion } from '../../types/trainingPlans';
import { logger } from '../../utils/logger';
import { userPlans } from './userPlans';
import { templates } from './templates';
import { dateUtils } from './dateUtils';

export const workouts = {
  /**
   * Get scheduled workouts for a plan (optionally filtered by week)
   */
  getScheduledWorkouts: async (planId: string, weekNumber?: number) => {
    try {
      // First get the plan to know template and dates
      const planResult = await userPlans.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;

      // Get template workouts
      const workoutsResult = await templates.getTemplateWorkouts(
        plan.template_id,
        weekNumber
      );

      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error || 'Workouts not found' };
      }

      // Get completions for these workouts
      const { data: completions } = await supabase
        .from('workout_completions')
        .select('*')
        .eq('user_training_plan_id', planId);

      // Map workouts with their completions
      const workoutsWithCompletions: WorkoutWithCompletion[] = workoutsResult.data.map(workout => {
        const completion = completions?.find(c => c.planned_workout_id === workout.id);
        const weekDates = dateUtils.calculateWeekDates(plan.start_date, workout.week_number);
        const scheduledDate = new Date(weekDates.start);
        scheduledDate.setDate(scheduledDate.getDate() + (workout.day_of_week - 1));
        const scheduledDateStr = scheduledDate.toISOString().split('T')[0];

        return {
          ...workout,
          scheduled_date: scheduledDateStr,
          completion,
          isScheduledForToday: dateUtils.isToday(scheduledDate.toISOString()),
          isOverdue: dateUtils.isWorkoutOverdue(scheduledDate.toISOString()) && !completion?.completed_date
        };
      });

      return { data: workoutsWithCompletions, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception getting scheduled workouts:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get upcoming workouts for next N days
   */
  getUpcomingWorkouts: async (planId: string, days: number = 7) => {
    try {
      const planResult = await userPlans.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      // Get all workouts
      const workoutsResult = await workouts.getScheduledWorkouts(planId);
      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      // Filter for upcoming
      const upcoming = workoutsResult.data.filter(workout => {
        const weekDates = dateUtils.calculateWeekDates(plan.start_date, workout.week_number);
        const scheduledDate = new Date(weekDates.start);
        scheduledDate.setDate(scheduledDate.getDate() + (workout.day_of_week - 1));

        return scheduledDate >= today && scheduledDate <= futureDate;
      });

      return { data: upcoming, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception getting upcoming workouts:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get today's workouts
   */
  getTodaysWorkouts: async (planId: string) => {
    try {
      const upcomingResult = await workouts.getUpcomingWorkouts(planId, 0);
      if (upcomingResult.error) {
        return { data: null, error: upcomingResult.error };
      }

      const today = upcomingResult.data?.filter(w => w.isScheduledForToday) || [];
      return { data: today, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception getting todays workouts:', error);
      return { data: null, error: error.message };
    }
  },
};
