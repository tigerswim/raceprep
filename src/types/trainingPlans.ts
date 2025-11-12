/**
 * Training Plans Type Definitions
 * 
 * Comprehensive TypeScript types for the RacePrep training plan engine.
 * These types map to the database schema defined in migration 013_training_plan_engine.sql
 * 
 * @module types/trainingPlans
 */

// =====================================================
// Base Type Aliases
// =====================================================

/**
 * Triathlon race distance types
 */
export type DistanceType = 'sprint' | 'olympic' | '70.3' | 'ironman';

/**
 * Athlete experience levels for training plan targeting
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Status of a user's training plan
 */
export type TrainingPlanStatus = 'active' | 'paused' | 'completed' | 'abandoned';

/**
 * Workout discipline categories
 */
export type DisciplineType = 'swim' | 'bike' | 'run' | 'brick' | 'strength' | 'rest';

/**
 * Workout type classifications for training focus
 */
export type WorkoutType = 
  | 'base' 
  | 'tempo' 
  | 'intervals' 
  | 'long' 
  | 'recovery' 
  | 'race_pace' 
  | 'technique' 
  | 'speed';

/**
 * Day of week (1 = Monday, 7 = Sunday)
 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// =====================================================
// Workout Structure Types
// =====================================================

/**
 * Detailed structure for a workout segment (warmup, main set, cooldown)
 */
export interface WorkoutSegment {
  /** Duration in minutes */
  duration_minutes?: number;
  /** Distance in miles */
  distance_miles?: number;
  /** Intensity description (e.g., "Zone 2", "Easy", "Threshold") */
  intensity?: string;
  /** Specific instructions for this segment */
  description?: string;
  /** Array of interval specifications */
  intervals?: WorkoutInterval[];
}

/**
 * Interval specification within a workout segment
 */
export interface WorkoutInterval {
  /** Number of repetitions */
  reps: number;
  /** Work duration or distance */
  work: {
    duration_minutes?: number;
    distance_miles?: number;
    intensity: string;
    description?: string;
  };
  /** Rest/recovery between intervals */
  rest?: {
    duration_minutes?: number;
    distance_miles?: number;
    intensity?: string;
    description?: string;
  };
}

/**
 * Complete workout structure stored in JSONB
 * Provides flexible schema for different workout types
 */
export interface WorkoutStructure {
  /** Optional warmup segment */
  warmup?: WorkoutSegment;
  /** Main workout segment (required) */
  main_set: WorkoutSegment;
  /** Optional cooldown segment */
  cooldown?: WorkoutSegment;
  /** Additional notes or instructions */
  notes?: string[];
}

// =====================================================
// Training Plan Template Types
// =====================================================

/**
 * Training Plan Template (Database Table: training_plan_templates)
 * 
 * Represents a reusable training plan template that can be assigned to users.
 * Templates define the structure and duration of a training program.
 */
export interface TrainingPlanTemplate {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Target race distance */
  distance_type: DistanceType;
  /** Plan duration in weeks (8-32) */
  duration_weeks: number;
  /** Target athlete experience level */
  experience_level: ExperienceLevel;
  /** Minimum weekly training hours */
  weekly_hours_min: number;
  /** Maximum weekly training hours */
  weekly_hours_max: number;
  /** Detailed plan description */
  description: string | null;
  /** Target audience description */
  target_audience: string | null;
  /** Array of key features/selling points */
  key_features: string[] | null;
  /** Creator identifier (defaults to 'system') */
  created_by: string;
  /** Whether template is active and available */
  is_active: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Type for inserting a new training plan template
 * Omits auto-generated fields
 */
export type TrainingPlanTemplateInsert = Omit<
  TrainingPlanTemplate,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Type for updating an existing training plan template
 * All fields optional except id
 */
export type TrainingPlanTemplateUpdate = Partial<
  Omit<TrainingPlanTemplate, 'id' | 'created_at' | 'updated_at'>
> & {
  updated_at?: string;
};

// =====================================================
// User Training Plan Types
// =====================================================

/**
 * User Training Plan (Database Table: user_training_plans)
 * 
 * Represents a user's active or historical training plan instance.
 * Links a user to a template and optionally to a planned race.
 */
export interface UserTrainingPlan {
  /** Unique identifier */
  id: string;
  /** Reference to user */
  user_id: string;
  /** Reference to template */
  template_id: string;
  /** Optional reference to planned race */
  planned_race_id: string | null;
  /** User-customizable plan name */
  plan_name: string;
  /** Plan start date */
  start_date: string;
  /** Plan end date */
  end_date: string;
  /** Current week number (1-based) */
  current_week: number;
  /** Plan status */
  status: TrainingPlanStatus;
  /** JSON object for user-specific modifications */
  customizations: Record<string, any>;
  /** User notes about the plan */
  notes: string | null;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Extended user training plan with joined data
 * Includes the template and planned race details
 */
export interface UserTrainingPlanWithDetails extends UserTrainingPlan {
  /** Joined template data */
  template?: TrainingPlanTemplate;
  /** Joined planned race data */
  planned_race?: {
    id: string;
    race_name: string;
    race_date: string;
    distance_type: DistanceType;
    location?: string;
  };
}

/**
 * Type for inserting a new user training plan
 * Omits auto-generated fields
 */
export type UserTrainingPlanInsert = Omit<
  UserTrainingPlan,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  current_week?: number;
  status?: TrainingPlanStatus;
  customizations?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

/**
 * Type for updating an existing user training plan
 * All fields optional except id
 */
export type UserTrainingPlanUpdate = Partial<
  Omit<UserTrainingPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>
> & {
  updated_at?: string;
};

// =====================================================
// Training Plan Workout Types
// =====================================================

/**
 * Training Plan Workout (Database Table: training_plan_workouts)
 * 
 * Represents an individual workout within a training plan template.
 * Defines what to do on a specific week/day of the plan.
 */
export interface TrainingPlanWorkout {
  /** Unique identifier */
  id: string;
  /** Reference to template */
  template_id: string;
  /** Week number in plan (1-based) */
  week_number: number;
  /** Day of week (1=Monday, 7=Sunday) */
  day_of_week: DayOfWeek;
  /** Workout discipline */
  discipline: DisciplineType;
  /** Workout type classification */
  workout_type: string | null;
  /** Planned duration in minutes */
  duration_minutes: number | null;
  /** Planned distance in miles */
  distance_miles: number | null;
  /** Brief intensity description */
  intensity_description: string | null;
  /** Detailed workout structure (JSONB) */
  structure: WorkoutStructure | null;
  /** Detailed workout description */
  detailed_description: string | null;
  /** Coaching tips and notes */
  coaching_notes: string | null;
  /** Array of workout goals */
  goals: string[] | null;
  /** Creation timestamp */
  created_at: string;
}

/**
 * Type for inserting a new training plan workout
 * Omits auto-generated fields
 */
export type TrainingPlanWorkoutInsert = Omit<
  TrainingPlanWorkout,
  'id' | 'created_at'
> & {
  id?: string;
  created_at?: string;
};

// =====================================================
// Workout Completion Types
// =====================================================

/**
 * Workout Completion (Database Table: workout_completions)
 * 
 * Tracks user's completion, skip, or scheduled status for workouts.
 * Links user training plans to actual workout execution.
 */
export interface WorkoutCompletion {
  /** Unique identifier */
  id: string;
  /** Reference to user's training plan */
  user_training_plan_id: string;
  /** Reference to planned workout */
  planned_workout_id: string;
  /** Originally scheduled date */
  scheduled_date: string;
  /** Actual completion date (null if not completed) */
  completed_date: string | null;
  /** Reference to Strava activity if synced */
  strava_activity_id: number | null;
  /** Actual duration completed (minutes) */
  actual_duration_minutes: number | null;
  /** Actual distance completed (miles) */
  actual_distance_miles: number | null;
  /** User's perceived effort (1-10 scale) */
  perceived_effort: number | null;
  /** User notes about the workout */
  notes: string | null;
  /** Whether workout was skipped */
  skipped: boolean;
  /** Reason for skipping */
  skip_reason: string | null;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Extended workout completion with joined workout data
 */
export interface WorkoutCompletionWithDetails extends WorkoutCompletion {
  /** Joined planned workout data */
  planned_workout?: TrainingPlanWorkout;
}

/**
 * Type for inserting a new workout completion
 * Omits auto-generated fields
 */
export type WorkoutCompletionInsert = Omit<
  WorkoutCompletion,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  skipped?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Type for updating an existing workout completion
 * All fields optional except id
 */
export type WorkoutCompletionUpdate = Partial<
  Omit<WorkoutCompletion, 'id' | 'user_training_plan_id' | 'planned_workout_id' | 'created_at' | 'updated_at'>
> & {
  updated_at?: string;
};

// =====================================================
// UI/Display Types
// =====================================================

/**
 * Workout with its completion status for UI display
 * Combines planned workout with actual completion data
 */
export interface WorkoutWithCompletion {
  /** The planned workout */
  workout: TrainingPlanWorkout;
  /** Completion data if exists */
  completion?: WorkoutCompletion | null;
  /** Scheduled date for this workout instance */
  scheduled_date: string;
  /** Calculated status for UI */
  status: 'upcoming' | 'completed' | 'skipped' | 'missed' | 'today';
}

/**
 * Week schedule for calendar/timeline view
 * Aggregates workouts and stats for a training week
 */
export interface WeekSchedule {
  /** Week number in plan (1-based) */
  week_number: number;
  /** Start date of the week (Monday) */
  week_start_date: string;
  /** End date of the week (Sunday) */
  week_end_date: string;
  /** Array of workouts for this week */
  workouts: WorkoutWithCompletion[];
  /** Week statistics */
  stats: {
    /** Total planned duration (minutes) */
    total_planned_duration: number;
    /** Total completed duration (minutes) */
    total_completed_duration: number;
    /** Total planned distance (miles) */
    total_planned_distance: number;
    /** Total completed distance (miles) */
    total_completed_distance: number;
    /** Number of workouts planned */
    workouts_planned: number;
    /** Number of workouts completed */
    workouts_completed: number;
    /** Number of workouts skipped */
    workouts_skipped: number;
    /** Completion percentage */
    completion_percentage: number;
    /** Breakdown by discipline */
    by_discipline: {
      discipline: DisciplineType;
      planned_duration: number;
      completed_duration: number;
      planned_distance: number;
      completed_distance: number;
    }[];
  };
}

/**
 * Overall training plan progress metrics
 * High-level progress tracking for the entire plan
 */
export interface TrainingPlanProgress {
  /** User training plan ID */
  plan_id: string;
  /** Current week number */
  current_week: number;
  /** Total weeks in plan */
  total_weeks: number;
  /** Overall completion percentage */
  overall_completion_percentage: number;
  /** Total workouts in plan */
  total_workouts: number;
  /** Workouts completed */
  workouts_completed: number;
  /** Workouts skipped */
  workouts_skipped: number;
  /** Workouts remaining */
  workouts_remaining: number;
  /** Total planned hours */
  total_planned_hours: number;
  /** Total completed hours */
  total_completed_hours: number;
  /** Days until race (if applicable) */
  days_until_race: number | null;
  /** Current streak of completed workouts */
  current_streak: number;
  /** Longest streak of completed workouts */
  longest_streak: number;
  /** Last workout completion date */
  last_workout_date: string | null;
  /** Next scheduled workout date */
  next_workout_date: string | null;
}

/**
 * Detailed analytics and statistics for a training plan
 * Provides insights for progress tracking and performance analysis
 */
export interface TrainingPlanStats {
  /** Plan identifier */
  plan_id: string;
  /** Date range */
  date_range: {
    start_date: string;
    end_date: string;
  };
  /** Overall metrics */
  overall: {
    total_duration_minutes: number;
    total_distance_miles: number;
    total_workouts: number;
    average_perceived_effort: number | null;
    completion_rate: number;
  };
  /** Breakdown by discipline */
  by_discipline: {
    discipline: DisciplineType;
    total_duration_minutes: number;
    total_distance_miles: number;
    total_workouts: number;
    average_perceived_effort: number | null;
    completion_rate: number;
  }[];
  /** Breakdown by workout type */
  by_workout_type: {
    workout_type: string;
    total_duration_minutes: number;
    total_distance_miles: number;
    total_workouts: number;
    average_perceived_effort: number | null;
  }[];
  /** Weekly trends */
  weekly_trends: {
    week_number: number;
    week_start_date: string;
    duration_minutes: number;
    distance_miles: number;
    workouts_completed: number;
    completion_rate: number;
  }[];
  /** Adherence metrics */
  adherence: {
    planned_vs_actual_duration_percentage: number;
    planned_vs_actual_distance_percentage: number;
    on_time_completion_rate: number;
    skip_rate: number;
  };
}

// =====================================================
// Filter Types
// =====================================================

/**
 * Filters for querying training plan templates
 */
export interface TrainingPlanTemplateFilters {
  /** Filter by distance type */
  distance_type?: DistanceType | DistanceType[];
  /** Filter by experience level */
  experience_level?: ExperienceLevel | ExperienceLevel[];
  /** Minimum weeks */
  min_weeks?: number;
  /** Maximum weeks */
  max_weeks?: number;
  /** Minimum weekly hours */
  min_hours?: number;
  /** Maximum weekly hours */
  max_hours?: number;
  /** Filter by active status */
  is_active?: boolean;
  /** Search by name or description */
  search?: string;
}

/**
 * Filters for querying workouts
 */
export interface WorkoutFilters {
  /** Filter by week number(s) */
  week_number?: number | number[];
  /** Filter by day of week */
  day_of_week?: DayOfWeek | DayOfWeek[];
  /** Filter by discipline */
  discipline?: DisciplineType | DisciplineType[];
  /** Filter by workout type */
  workout_type?: WorkoutType | WorkoutType[];
  /** Filter by date range */
  date_range?: {
    start_date: string;
    end_date: string;
  };
  /** Minimum duration */
  min_duration_minutes?: number;
  /** Maximum duration */
  max_duration_minutes?: number;
}

/**
 * Filters for querying workout completions
 */
export interface CompletionFilters {
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by skip status */
  skipped?: boolean;
  /** Filter by perceived effort range */
  perceived_effort_min?: number;
  /** Filter by perceived effort max */
  perceived_effort_max?: number;
  /** Filter by date range */
  date_range?: {
    start_date: string;
    end_date: string;
  };
  /** Filter by discipline */
  discipline?: DisciplineType | DisciplineType[];
  /** Filter workouts with Strava sync */
  has_strava_activity?: boolean;
}

// =====================================================
// Query Result Types
// =====================================================

/**
 * Paginated result set for queries
 */
export interface PaginatedResult<T> {
  /** Array of results */
  data: T[];
  /** Total count of matching records */
  total_count: number;
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  page_size: number;
  /** Total number of pages */
  total_pages: number;
  /** Whether there is a next page */
  has_next: boolean;
  /** Whether there is a previous page */
  has_previous: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based, default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  page_size?: number;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  /** Field to sort by */
  sort_by: string;
  /** Sort direction */
  sort_order: 'asc' | 'desc';
}

// =====================================================
// API Request/Response Types
// =====================================================

/**
 * Request to create a user training plan from a template
 */
export interface CreateUserTrainingPlanRequest {
  /** Template to base plan on */
  template_id: string;
  /** Optional planned race to link */
  planned_race_id?: string;
  /** Custom plan name (defaults to template name) */
  plan_name?: string;
  /** Plan start date (ISO format) */
  start_date: string;
  /** Optional initial customizations */
  customizations?: Record<string, any>;
  /** Optional notes */
  notes?: string;
}

/**
 * Request to mark a workout as completed
 */
export interface CompleteWorkoutRequest {
  /** Date completed (ISO format) */
  completed_date: string;
  /** Actual duration in minutes */
  actual_duration_minutes?: number;
  /** Actual distance in miles */
  actual_distance_miles?: number;
  /** Perceived effort (1-10) */
  perceived_effort?: number;
  /** Optional notes */
  notes?: string;
  /** Optional Strava activity ID */
  strava_activity_id?: number;
}

/**
 * Request to skip a workout
 */
export interface SkipWorkoutRequest {
  /** Reason for skipping */
  skip_reason: string;
  /** Optional notes */
  notes?: string;
}

/**
 * Response when fetching a training plan with full details
 */
export interface TrainingPlanDetailResponse {
  /** The user's training plan */
  plan: UserTrainingPlanWithDetails;
  /** Current week's schedule */
  current_week: WeekSchedule;
  /** Progress metrics */
  progress: TrainingPlanProgress;
  /** Recent completions (last 7 days) */
  recent_completions: WorkoutCompletionWithDetails[];
  /** Upcoming workouts (next 7 days) */
  upcoming_workouts: WorkoutWithCompletion[];
}

// =====================================================
// Strava Matching Types
// =====================================================

/**
 * Represents a Strava activity from the strava_activities table
 */
export interface StravaActivity {
  id: string;
  user_id: string;
  strava_activity_id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  distance_meters: number;
  moving_time_seconds: number;
  elapsed_time_seconds: number;
  total_elevation_gain_meters: number;
  average_speed_mps: number;
  max_speed_mps: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Potential match between a Strava activity and a training plan workout
 */
export interface WorkoutStravaMatch {
  /** The planned workout */
  workout: WorkoutWithCompletion;
  /** The Strava activity */
  activity: StravaActivity;
  /** Confidence score (0-100) */
  confidence: number;
  /** Reasons for the match */
  matchReasons: string[];
  /** Potential issues with the match */
  warnings?: string[];
}

/**
 * Result of the matching process
 */
export interface StravaMatchResult {
  /** Potential matches grouped by confidence */
  highConfidence: WorkoutStravaMatch[]; // 80-100%
  mediumConfidence: WorkoutStravaMatch[]; // 50-79%
  lowConfidence: WorkoutStravaMatch[]; // 0-49%
  /** Strava activities that couldn't be matched */
  unmatchedActivities: StravaActivity[];
  /** Workouts that couldn't be matched */
  unmatchedWorkouts: WorkoutWithCompletion[];
}
