import { supabase } from '../supabase';
import { WorkoutCompletionInsert } from '../../types/trainingPlans';
import { logger } from '../../utils/logger';
import { userPlans } from './userPlans';
import { workouts } from './workouts';
import { completions } from './completions';
import { dateUtils } from './dateUtils';

export const stravaMatch = {
  /**
   * Auto-match Strava activity to planned workout
   */
  matchStravaToWorkout: async (planId: string, stravaActivity: any) => {
    try {
      // Get the plan
      const planResult = await userPlans.getUserTrainingPlan(planId);
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
      const workoutsResult = await workouts.getScheduledWorkouts(planId);
      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error };
      }

      const matchingWorkout = workoutsResult.data.find(w => {
        const weekDates = dateUtils.calculateWeekDates(plan.start_date, w.week_number);
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

      const result = await completions.completeWorkout(completionData);

      if (result.error) {
        return { data: null, error: result.error };
      }

      logger.debug('[TRAINING_PLAN_SERVICE] Auto-matched Strava activity to workout');
      return { data: result.data, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception matching Strava activity:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Find potential matches between Strava activities and training plan workouts
   */
  findStravaMatches: async (planId: string, daysBack: number = 14): Promise<{ data: any; error: string | null }> => {
    try {
      // Get the training plan
      const planResult = await userPlans.getUserTrainingPlan(planId);
      if (planResult.error || !planResult.data) {
        return { data: null, error: planResult.error || 'Plan not found' };
      }

      const plan = planResult.data;

      // Get scheduled workouts from the past N days that aren't completed
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      const workoutsResult = await workouts.getScheduledWorkouts(planId);

      if (workoutsResult.error || !workoutsResult.data) {
        return { data: null, error: workoutsResult.error || 'Workouts not found' };
      }

      // Filter to workouts within date range and not already completed
      const recentWorkouts = workoutsResult.data.filter(w => {
        if (!w.scheduled_date) return false;
        const workoutDate = new Date(w.scheduled_date);
        return workoutDate >= cutoffDate && !w.completion?.completed_date;
      });

      // Get Strava activities from the past N days
      const { data: activities, error: activitiesError } = await supabase
        .from('strava_activities')
        .select('*')
        .eq('user_id', plan.user_id)
        .gte('start_date', cutoffDate.toISOString())
        .order('start_date', { ascending: false });

      if (activitiesError) {
        return { data: null, error: activitiesError.message };
      }

      if (!activities || activities.length === 0) {
        return {
          data: {
            highConfidence: [],
            mediumConfidence: [],
            lowConfidence: [],
            unmatchedActivities: [],
            unmatchedWorkouts: recentWorkouts
          },
          error: null
        };
      }

      // Find matches
      const matches: any[] = [];
      const matchedActivityIds = new Set<number>();
      const matchedWorkoutIds = new Set<string>();

      for (const workout of recentWorkouts) {
        for (const activity of activities) {
          if (matchedActivityIds.has(activity.strava_activity_id)) continue;

          const match = stravaMatch.calculateMatchScore(workout, activity);

          if (match.confidence >= 40) { // Minimum 40% confidence
            matches.push(match);
          }
        }
      }

      // Sort by confidence and group
      matches.sort((a, b) => b.confidence - a.confidence);

      // Mark best matches to avoid duplicates
      const bestMatches = matches.filter(match => {
        if (matchedActivityIds.has(match.activity.strava_activity_id) ||
            matchedWorkoutIds.has(match.workout.id)) {
          return false;
        }
        matchedActivityIds.add(match.activity.strava_activity_id);
        matchedWorkoutIds.add(match.workout.id);
        return true;
      });

      // Group by confidence
      const result = {
        highConfidence: bestMatches.filter(m => m.confidence >= 80),
        mediumConfidence: bestMatches.filter(m => m.confidence >= 50 && m.confidence < 80),
        lowConfidence: bestMatches.filter(m => m.confidence < 50),
        unmatchedActivities: activities.filter(a => !matchedActivityIds.has(a.strava_activity_id)),
        unmatchedWorkouts: recentWorkouts.filter(w => !matchedWorkoutIds.has(w.id))
      };

      return { data: result, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception finding Strava matches:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Calculate match score between a workout and Strava activity
   */
  calculateMatchScore: (workout: any, activity: any): any => {
    let confidence = 0;
    const matchReasons: string[] = [];
    const warnings: string[] = [];

    // Date proximity (max 40 points)
    const workoutDate = new Date(workout.scheduled_date);
    const activityDate = new Date(activity.start_date);
    const daysDiff = Math.abs((workoutDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      confidence += 40;
      matchReasons.push('Same day');
    } else if (daysDiff === 1) {
      confidence += 30;
      matchReasons.push('Within 1 day');
    } else if (daysDiff <= 2) {
      confidence += 20;
      matchReasons.push('Within 2 days');
    } else if (daysDiff <= 3) {
      confidence += 10;
      warnings.push(`${Math.round(daysDiff)} days apart`);
    }

    // Discipline match (max 30 points)
    const disciplineMap: Record<string, string[]> = {
      swim: ['Swim'],
      bike: ['Ride', 'VirtualRide', 'EBikeRide'],
      run: ['Run', 'VirtualRun'],
      strength: ['WeightTraining', 'Workout']
    };

    const workoutDiscipline = workout.discipline.toLowerCase();
    const matchingTypes = disciplineMap[workoutDiscipline] || [];

    if (matchingTypes.includes(activity.sport_type)) {
      confidence += 30;
      matchReasons.push(`Matching discipline: ${activity.sport_type}`);
    } else {
      warnings.push('Different discipline');
    }

    // Duration match (max 20 points)
    if (workout.duration_minutes && activity.moving_time_seconds) {
      const workoutMinutes = workout.duration_minutes;
      const activityMinutes = activity.moving_time_seconds / 60;
      const durationDiff = Math.abs(workoutMinutes - activityMinutes) / workoutMinutes;

      if (durationDiff <= 0.1) {
        confidence += 20;
        matchReasons.push('Duration matches closely');
      } else if (durationDiff <= 0.2) {
        confidence += 15;
        matchReasons.push('Duration similar');
      } else if (durationDiff <= 0.3) {
        confidence += 10;
        warnings.push(`Duration differs by ${Math.round(durationDiff * 100)}%`);
      } else {
        warnings.push(`Duration differs significantly`);
      }
    }

    // Distance match (max 10 points)
    if (workout.distance_miles && activity.distance_meters) {
      const workoutMiles = workout.distance_miles;
      const activityMiles = activity.distance_meters * 0.000621371;
      const distanceDiff = Math.abs(workoutMiles - activityMiles) / workoutMiles;

      if (distanceDiff <= 0.1) {
        confidence += 10;
        matchReasons.push('Distance matches');
      } else if (distanceDiff <= 0.2) {
        confidence += 5;
      } else {
        warnings.push('Distance differs');
      }
    }

    return {
      workout,
      activity,
      confidence: Math.round(confidence),
      matchReasons,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  },

  /**
   * Accept a Strava match and mark workout as complete
   */
  acceptStravaMatch: async (workoutId: string, planId: string, stravaActivityId: number): Promise<{ data: any; error: string | null }> => {
    try {
      // Get the activity details
      const { data: activity, error: activityError } = await supabase
        .from('strava_activities')
        .select('*')
        .eq('strava_activity_id', stravaActivityId)
        .single();

      if (activityError || !activity) {
        return { data: null, error: 'Strava activity not found' };
      }

      // Mark workout as complete with Strava data
      const completionData = {
        user_training_plan_id: planId,
        planned_workout_id: workoutId,
        completed_date: activity.start_date,
        strava_activity_id: stravaActivityId,
        actual_duration_minutes: Math.round(activity.moving_time_seconds / 60),
        actual_distance_miles: activity.distance_meters ? activity.distance_meters * 0.000621371 : null,
        notes: `Imported from Strava: ${activity.name}`
      };

      return await completions.completeWorkout(completionData);
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception accepting Strava match:', error);
      return { data: null, error: error.message };
    }
  },
};
