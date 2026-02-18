import { TrainingPlanProgress, WeekSchedule } from '../../types/trainingPlans';
import { logger } from '../../utils/logger';
import { userPlans } from './userPlans';
import { templates } from './templates';
import { workouts } from './workouts';
import { completions } from './completions';
import { dateUtils } from './dateUtils';

export const analytics = {
  /**
   * Get overall training plan progress
   */
  getTrainingPlanProgress: async (planId: string): Promise<{ data: TrainingPlanProgress | null; error: string | null }> => {
    try {
      const planResult = await userPlans.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const workoutsResult = await templates.getTemplateWorkouts(plan.template_id);
      const completionsResult = await completions.getWorkoutCompletions(planId);
      const upcomingResult = await workouts.getUpcomingWorkouts(planId, 7);

      if (workoutsResult.error || completionsResult.error) {
        return { data: null, error: workoutsResult.error || completionsResult.error };
      }

      const totalWorkouts = workoutsResult.data?.length || 0;
      const completedWorkouts = completionsResult.data?.filter(c => !c.skipped).length || 0;
      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

      // Calculate adherence (completed on time)
      const onTimeCompletions = completionsResult.data?.filter(c => {
        if (c.skipped || !c.completed_date) return false;
        const scheduled = new Date(c.scheduled_date);
        const completed = new Date(c.completed_date);
        const daysDiff = Math.floor((completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1; // Allow 1 day grace period
      }).length || 0;

      const adherenceRate = completedWorkouts > 0 ? (onTimeCompletions / completedWorkouts) * 100 : 0;

      const progress: TrainingPlanProgress = {
        plan,
        currentWeek: plan.current_week,
        totalWeeks: plan.template?.duration_weeks || 0,
        completedWorkouts,
        totalWorkouts,
        completionRate,
        adherenceRate,
        upcomingWorkouts: upcomingResult.data || [],
        weeklySchedule: []
      };

      return { data: progress, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception getting progress:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get weekly schedule with completions
   */
  getWeeklySchedule: async (planId: string, weekNumber: number): Promise<{ data: WeekSchedule | null; error: string | null }> => {
    try {
      const planResult = await userPlans.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const workoutsResult = await workouts.getScheduledWorkouts(planId, weekNumber);

      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      const weekDates = dateUtils.calculateWeekDates(plan.start_date, weekNumber);
      const completedCount = workoutsResult.data.filter(w => w.completion && !w.completion.skipped).length;
      const totalDuration = workoutsResult.data.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
      const totalDistance = workoutsResult.data.reduce((sum, w) => sum + (w.distance_miles || 0), 0);

      const schedule: WeekSchedule = {
        weekNumber,
        startDate: weekDates.start,
        endDate: weekDates.end,
        workouts: workoutsResult.data,
        totalDuration,
        totalDistance,
        completionRate: (completedCount / workoutsResult.data.length) * 100
      };

      return { data: schedule, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception getting weekly schedule:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Calculate adherence rate for specified weeks
   */
  calculateAdherenceRate: async (planId: string, weeksBack?: number) => {
    try {
      const completionsResult = await completions.getWorkoutCompletions(planId);
      if (completionsResult.error || !completionsResult.data) {
        return { data: null, error: completionsResult.error };
      }

      let completionsList = completionsResult.data;

      // Filter by date range if specified
      if (weeksBack) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (weeksBack * 7));
        completionsList = completionsList.filter(c => new Date(c.scheduled_date) >= cutoffDate);
      }

      const totalScheduled = completionsList.length;
      const completedOnTime = completionsList.filter(c => {
        if (c.skipped || !c.completed_date) return false;
        const scheduled = new Date(c.scheduled_date);
        const completed = new Date(c.completed_date);
        const daysDiff = Math.floor((completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1;
      }).length;

      const adherenceRate = totalScheduled > 0 ? (completedOnTime / totalScheduled) * 100 : 0;

      return {
        data: {
          adherenceRate,
          totalScheduled,
          completedOnTime,
          completedLate: completionsList.filter(c => !c.skipped && c.completed_date).length - completedOnTime,
          skipped: completionsList.filter(c => c.skipped).length,
          pending: completionsList.filter(c => !c.completed_date && !c.skipped).length
        },
        error: null
      };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception calculating adherence:', error);
      return { data: null, error: error.message };
    }
  },
};
