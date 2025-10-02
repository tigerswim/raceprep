/**
 * Training Plan Type Definitions
 * Comprehensive types for the training plan engine system
 */

/**
 * Workout intensity levels
 */
export type WorkoutIntensity = 'recovery' | 'easy' | 'moderate' | 'tempo' | 'threshold' | 'interval' | 'race_pace';

/**
 * Training plan status
 */
export type TrainingPlanStatus = 'active' | 'completed' | 'paused' | 'cancelled';

/**
 * Workout completion status
 */
export type WorkoutCompletionStatus = 'completed' | 'skipped' | 'partial';

/**
 * Training discipline types
 */
export type TrainingDiscipline = 'swim' | 'bike' | 'run' | 'brick' | 'strength' | 'rest';

/**
 * Distance types for training plans
 */
export type TrainingDistanceType = 'sprint' | 'olympic' | '70.3' | 'ironman';

/**
 * Template workout structure
 */
export interface TemplateWorkout {
  id: string;
  template_id: string;
  week_number: number;
  day_of_week: number; // 0-6, where 0 is Monday
  discipline: TrainingDiscipline;
  workout_type: string; // e.g., 'endurance', 'intervals', 'tempo', 'brick'
  duration_minutes?: number;
  distance?: number;
  distance_unit: 'miles' | 'km' | 'meters' | 'yards';
  intensity: WorkoutIntensity;
  description: string;
  instructions?: string;
  intervals?: {
    warm_up?: string;
    main_set?: string;
    cool_down?: string;
    intervals?: Array<{
      distance?: number;
      duration?: number;
      intensity: WorkoutIntensity;
      rest?: number;
      repeats?: number;
    }>;
  };
  target_pace?: string;
  target_heartrate_zone?: number; // 1-5
  target_power_zone?: number; // 1-7 for cycling
  notes?: string;
  created_at: Date;
}

/**
 * Training plan template
 */
export interface TrainingPlanTemplate {
  id: string;
  name: string;
  distance_type: TrainingDistanceType;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  description: string;
  weekly_volume_hours?: number;
  swim_sessions_per_week?: number;
  bike_sessions_per_week?: number;
  run_sessions_per_week?: number;
  brick_sessions_per_week?: number;
  strength_sessions_per_week?: number;
  focus_areas?: string[]; // e.g., ['endurance', 'speed', 'transition']
  requirements?: string[]; // e.g., ['pool access', 'bike trainer']
  author?: string;
  is_public: boolean;
  rating?: number;
  total_users?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * User training plan (instance of a template)
 */
export interface UserTrainingPlan {
  id: string;
  user_id: string;
  template_id: string;
  race_id?: string; // Link to user_planned_races
  plan_name: string;
  status: TrainingPlanStatus;
  start_date: Date;
  end_date: Date;
  current_week: number;
  completion_percentage?: number;
  target_race_date?: Date;
  notes?: string;
  customizations?: {
    skip_weeks?: number[];
    modified_workouts?: string[]; // workout IDs
    personal_notes?: Record<string, string>; // week_number -> notes
  };
  created_at: Date;
  updated_at: Date;
}

/**
 * Scheduled workout (links template workout to user plan with specific date)
 */
export interface ScheduledWorkout {
  id: string;
  user_plan_id: string;
  template_workout_id: string;
  scheduled_date: Date;
  week_number: number;
  day_of_week: number;
  discipline: TrainingDiscipline;
  workout_type: string;
  duration_minutes?: number;
  distance?: number;
  distance_unit: 'miles' | 'km' | 'meters' | 'yards';
  intensity: WorkoutIntensity;
  description: string;
  instructions?: string;
  intervals?: TemplateWorkout['intervals'];
  target_pace?: string;
  target_heartrate_zone?: number;
  target_power_zone?: number;
  notes?: string;
  is_completed: boolean;
  is_skipped: boolean;
  completed_at?: Date;
  created_at: Date;
}

/**
 * Workout completion record
 */
export interface WorkoutCompletion {
  id: string;
  user_plan_id: string;
  scheduled_workout_id?: string;
  training_session_id?: string; // Link to training_sessions (Strava data)
  user_id: string;
  completion_date: Date;
  status: WorkoutCompletionStatus;
  actual_duration_minutes?: number;
  actual_distance?: number;
  actual_distance_unit?: 'miles' | 'km' | 'meters' | 'yards';
  average_heartrate?: number;
  average_pace?: string;
  average_power?: number;
  feeling_rating?: number; // 1-10
  perceived_effort?: number; // 1-10 (RPE)
  notes?: string;
  weather_conditions?: string;
  location?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Training plan progress metrics
 */
export interface TrainingPlanProgress {
  plan_id: string;
  total_workouts: number;
  completed_workouts: number;
  skipped_workouts: number;
  pending_workouts: number;
  completion_percentage: number;
  current_week: number;
  total_weeks: number;
  weeks_completed: number;
  adherence_rate: number; // percentage
  total_distance: {
    swim: number;
    bike: number;
    run: number;
  };
  total_time: {
    swim: number;
    bike: number;
    run: number;
    total: number;
  };
  weekly_averages: {
    workouts_per_week: number;
    hours_per_week: number;
    adherence_rate: number;
  };
}

/**
 * Training plan statistics
 */
export interface TrainingPlanStats {
  plan_id: string;
  user_id: string;
  discipline_breakdown: {
    swim: {
      sessions: number;
      total_distance: number;
      total_time: number;
      average_pace?: string;
    };
    bike: {
      sessions: number;
      total_distance: number;
      total_time: number;
      average_speed?: number;
      average_power?: number;
    };
    run: {
      sessions: number;
      total_distance: number;
      total_time: number;
      average_pace?: string;
    };
  };
  intensity_distribution: {
    recovery: number;
    easy: number;
    moderate: number;
    tempo: number;
    threshold: number;
    interval: number;
    race_pace: number;
  };
  weekly_volume: Array<{
    week_number: number;
    total_hours: number;
    total_distance: number;
    workouts_completed: number;
    adherence_rate: number;
  }>;
  best_performances?: {
    longest_run?: number;
    longest_bike?: number;
    longest_swim?: number;
    fastest_pace?: string;
  };
  consistency_score: number; // 0-100
  fitness_trend: 'improving' | 'maintaining' | 'declining';
}

/**
 * Weekly schedule with completions
 */
export interface WeeklySchedule {
  week_number: number;
  start_date: Date;
  end_date: Date;
  workouts: Array<ScheduledWorkout & {
    completion?: WorkoutCompletion;
    is_overdue: boolean;
  }>;
  weekly_totals: {
    planned_workouts: number;
    completed_workouts: number;
    skipped_workouts: number;
    total_planned_hours: number;
    total_completed_hours: number;
    total_planned_distance: number;
    total_completed_distance: number;
    adherence_rate: number;
  };
}

/**
 * Template filters for searching
 */
export interface TemplateFilters {
  distance_type?: TrainingDistanceType;
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  min_weeks?: number;
  max_weeks?: number;
  disciplines?: TrainingDiscipline[];
  min_rating?: number;
  search_query?: string;
}

/**
 * Strava activity to workout matching
 */
export interface StravaWorkoutMatch {
  strava_activity_id: string;
  scheduled_workout_id?: string;
  match_confidence: number; // 0-100
  match_reasons: string[];
  discipline_match: boolean;
  date_match: boolean;
  distance_match: boolean;
  duration_match: boolean;
}

/**
 * API Response wrapper
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: any;
  } | null;
}
