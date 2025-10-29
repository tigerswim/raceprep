import { supabase } from './supabase';
import {
  TrainingPlanTemplate,
  TrainingPlanTemplateFilters,
  UserTrainingPlan,
  UserTrainingPlanInsert,
  UserTrainingPlanUpdate,
  TrainingPlanWorkout,
  WorkoutCompletion,
  WorkoutCompletionInsert,
  WorkoutCompletionUpdate,
  WorkoutWithCompletion,
  WeekSchedule,
  TrainingPlanProgress,
  WorkoutFilters,
  CompletionFilters,
} from '../types/trainingPlans';

/**
 * Training Plan Service
 * Comprehensive service for managing training plans, workouts, and completions
 */
export const trainingPlanService = {
  
  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Get all training plan templates with optional filtering
   */
  getTrainingPlanTemplates: async (filters?: TrainingPlanTemplateFilters) => {
    try {
      let query = supabase
        .from('training_plan_templates')
        .select('*')
        .eq('is_active', true)
        .order('distance_type', { ascending: true })
        .order('experience_level', { ascending: true });

      if (filters?.distance_type) {
        query = query.eq('distance_type', filters.distance_type);
      }
      if (filters?.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }
      if (filters?.min_weeks) {
        query = query.gte('duration_weeks', filters.min_weeks);
      }
      if (filters?.max_weeks) {
        query = query.lte('duration_weeks', filters.max_weeks);
      }
      if (filters?.min_hours) {
        query = query.gte('weekly_hours_min', filters.min_hours);
      }
      if (filters?.max_hours) {
        query = query.lte('weekly_hours_max', filters.max_hours);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[TRAINING_PLAN_SERVICE] Error fetching templates:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanTemplate[], error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching templates:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get single training plan template by ID
   */
  getTrainingPlanTemplate: async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('training_plan_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('[TRAINING_PLAN_SERVICE] Error fetching template:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanTemplate, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching template:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get workouts for a template (optionally filtered by week)
   */
  getTemplateWorkouts: async (templateId: string, weekNumber?: number) => {
    try {
      let query = supabase
        .from('training_plan_workouts')
        .select('*')
        .eq('template_id', templateId)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true });

      if (weekNumber) {
        query = query.eq('week_number', weekNumber);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[TRAINING_PLAN_SERVICE] Error fetching workouts:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanWorkout[], error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching workouts:', error);
      return { data: null, error: error.message };
    }
  },

  // ============================================================================
  // USER TRAINING PLAN OPERATIONS
  // ============================================================================

  /**
   * Get user's training plans (optionally filtered by status)
   */
  getUserTrainingPlans: async (userId: string, status?: string) => {
    if (!userId) {
      console.warn('[TRAINING_PLAN_SERVICE] getUserTrainingPlans called with undefined userId');
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
        console.error('[TRAINING_PLAN_SERVICE] Error fetching user plans:', error);
        return { data: null, error: error.message };
      }

      return { data: data as UserTrainingPlan[], error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching user plans:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error fetching user plan:', error);
        return { data: null, error: error.message };
      }

      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching user plan:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error creating user plan:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Created training plan:', data.id);
      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception creating user plan:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error updating user plan:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Updated training plan:', planId);
      return { data: data as UserTrainingPlan, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception updating user plan:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error deleting user plan:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Deleted training plan:', planId);
      return { data: true, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception deleting user plan:', error);
      return { data: null, error: error.message };
    }
  },

  // ============================================================================
  // WORKOUT SCHEDULING
  // ============================================================================

  /**
   * Get scheduled workouts for a plan (optionally filtered by week)
   */
  getScheduledWorkouts: async (planId: string, weekNumber?: number) => {
    try {
      // First get the plan to know template and dates
      const planResult = await trainingPlanService.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      
      // Get template workouts
      const workoutsResult = await trainingPlanService.getTemplateWorkouts(
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
        const weekDates = trainingPlanService.calculateWeekDates(plan.start_date, workout.week_number);
        const scheduledDate = new Date(weekDates.start);
        scheduledDate.setDate(scheduledDate.getDate() + (workout.day_of_week - 1));

        return {
          ...workout,
          completion,
          isScheduledForToday: trainingPlanService.isToday(scheduledDate.toISOString()),
          isOverdue: trainingPlanService.isWorkoutOverdue(scheduledDate.toISOString()) && !completion?.completed_date
        };
      });

      return { data: workoutsWithCompletions, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception getting scheduled workouts:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get upcoming workouts for next N days
   */
  getUpcomingWorkouts: async (planId: string, days: number = 7) => {
    try {
      const planResult = await trainingPlanService.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      // Get all workouts
      const workoutsResult = await trainingPlanService.getScheduledWorkouts(planId);
      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      // Filter for upcoming
      const upcoming = workoutsResult.data.filter(workout => {
        const weekDates = trainingPlanService.calculateWeekDates(plan.start_date, workout.week_number);
        const scheduledDate = new Date(weekDates.start);
        scheduledDate.setDate(scheduledDate.getDate() + (workout.day_of_week - 1));
        
        return scheduledDate >= today && scheduledDate <= futureDate;
      });

      return { data: upcoming, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception getting upcoming workouts:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get today's workouts
   */
  getTodaysWorkouts: async (planId: string) => {
    try {
      const upcomingResult = await trainingPlanService.getUpcomingWorkouts(planId, 0);
      if (upcomingResult.error) {
        return { data: null, error: upcomingResult.error };
      }

      const today = upcomingResult.data?.filter(w => w.isScheduledForToday) || [];
      return { data: today, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception getting todays workouts:', error);
      return { data: null, error: error.message };
    }
  },

  // ============================================================================
  // WORKOUT COMPLETION
  // ============================================================================

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
        console.error('[TRAINING_PLAN_SERVICE] Error completing workout:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Workout completed:', data.id);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception completing workout:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error skipping workout:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Workout skipped:', data.id);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception skipping workout:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error updating completion:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Completion updated:', completionId);
      return { data: data as WorkoutCompletion, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception updating completion:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error deleting completion:', error);
        return { data: null, error: error.message };
      }

      console.log('[TRAINING_PLAN_SERVICE] Completion deleted:', completionId);
      return { data: true, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception deleting completion:', error);
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
        console.error('[TRAINING_PLAN_SERVICE] Error fetching completions:', error);
        return { data: null, error: error.message };
      }

      return { data: data as WorkoutCompletion[], error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching completions:', error);
      return { data: null, error: error.message };
    }
  },

  // ============================================================================
  // PROGRESS & ANALYTICS
  // ============================================================================

  /**
   * Get overall training plan progress
   */
  getTrainingPlanProgress: async (planId: string): Promise<{ data: TrainingPlanProgress | null; error: string | null }> => {
    try {
      const planResult = await trainingPlanService.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const workoutsResult = await trainingPlanService.getTemplateWorkouts(plan.template_id);
      const completionsResult = await trainingPlanService.getWorkoutCompletions(planId);
      const upcomingResult = await trainingPlanService.getUpcomingWorkouts(planId, 7);

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
      console.error('[TRAINING_PLAN_SERVICE] Exception getting progress:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get weekly schedule with completions
   */
  getWeeklySchedule: async (planId: string, weekNumber: number): Promise<{ data: WeekSchedule | null; error: string | null }> => {
    try {
      const planResult = await trainingPlanService.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;
      const workoutsResult = await trainingPlanService.getScheduledWorkouts(planId, weekNumber);
      
      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      const weekDates = trainingPlanService.calculateWeekDates(plan.start_date, weekNumber);
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
      console.error('[TRAINING_PLAN_SERVICE] Exception getting weekly schedule:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Calculate adherence rate for specified weeks
   */
  calculateAdherenceRate: async (planId: string, weeksBack?: number) => {
    try {
      const completionsResult = await trainingPlanService.getWorkoutCompletions(planId);
      if (completionsResult.error || !completionsResult.data) {
        return { data: null, error: completionsResult.error };
      }

      let completions = completionsResult.data;

      // Filter by date range if specified
      if (weeksBack) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (weeksBack * 7));
        completions = completions.filter(c => new Date(c.scheduled_date) >= cutoffDate);
      }

      const totalScheduled = completions.length;
      const completedOnTime = completions.filter(c => {
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
          completedLate: completions.filter(c => !c.skipped && c.completed_date).length - completedOnTime,
          skipped: completions.filter(c => c.skipped).length,
          pending: completions.filter(c => !c.completed_date && !c.skipped).length
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception calculating adherence:', error);
      return { data: null, error: error.message };
    }
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Calculate start and end dates for a specific week in a plan
   */
  calculateWeekDates: (startDate: string, weekNumber: number) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + ((weekNumber - 1) * 7));
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  },

  /**
   * Check if a workout is overdue
   */
  isWorkoutOverdue: (scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduled < today;
  },

  /**
   * Check if a date is today
   */
  isToday: (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Auto-match Strava activity to planned workout
   */
  matchStravaToWorkout: async (planId: string, stravaActivity: any) => {
    try {
      // Get the plan
      const planResult = await trainingPlanService.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error };
      }

      const plan = planResult.data;
      const activityDate = new Date(stravaActivity.start_date).toISOString().split('T')[0];
      
      // Map Strava type to our discipline
      const disciplineMap: Record<string, string> = {
        'Swim': 'swim',
        'Ride': 'bike',
        'Run': 'run',
        'VirtualRide': 'bike',
        'VirtualRun': 'run'
      };
      
      const discipline = disciplineMap[stravaActivity.type];
      if (!discipline) {
        return { data: null, error: 'Unsupported activity type' };
      }

      // Find matching workout on that day with same discipline
      const workoutsResult = await trainingPlanService.getScheduledWorkouts(planId);
      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      const matchingWorkout = workoutsResult.data.find(w => {
        const weekDates = trainingPlanService.calculateWeekDates(plan.start_date, w.week_number);
        const workoutDate = new Date(weekDates.start);
        workoutDate.setDate(workoutDate.getDate() + (w.day_of_week - 1));
        const workoutDateStr = workoutDate.toISOString().split('T')[0];
        
        return workoutDateStr === activityDate && w.discipline === discipline && !w.completion;
      });

      if (!matchingWorkout) {
        return { data: null, error: 'No matching workout found' };
      }

      // Create completion record
      const completionData: WorkoutCompletionInsert = {
        user_training_plan_id: planId,
        planned_workout_id: matchingWorkout.id,
        scheduled_date: activityDate,
        completed_date: activityDate,
        strava_activity_id: stravaActivity.id,
        actual_duration_minutes: Math.round(stravaActivity.moving_time / 60),
        actual_distance_miles: stravaActivity.distance / 1609.34, // meters to miles
        notes: `Auto-matched from Strava: ${stravaActivity.name}`
      };

      const result = await trainingPlanService.completeWorkout(completionData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }

      console.log('[TRAINING_PLAN_SERVICE] Auto-matched Strava activity to workout');
      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('[TRAINING_PLAN_SERVICE] Exception matching Strava activity:'    , error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get active training plan for user
   */
  getActivePlan: async (userId: string) => {
    if (!userId) {
      console.warn('[TRAINING_PLAN_SERVICE] getActivePlan called with undefined userId');
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
        console.error('[TRAINING_PLAN_SERVICE] Error fetching active plan:', error);
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
      console.error('[TRAINING_PLAN_SERVICE] Exception fetching active plan:', error);
      return null;
    }
  }
};
