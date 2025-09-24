// Enhanced TypeScript types for dashboard features
// This file contains types for the enhanced backend functionality

// Training Analytics Types
export interface TrainingWeekStats {
  weekStart: string;
  total: {
    sessions: number;
    distance: number;
    time: number;
    elevation: number;
    tss: number;
    indoorSessions: number;
  };
  swim: {
    sessions: number;
    distance: number;
    time: number;
    avgHR: number;
  };
  bike: {
    sessions: number;
    distance: number;
    time: number;
    elevation: number;
    avgWatts: number;
    avgHR: number;
    indoorSessions: number;
  };
  run: {
    sessions: number;
    distance: number;
    time: number;
    elevation: number;
    avgPace: number;
    avgHR: number;
  };
}

export interface HRZone {
  min: number;
  max: number;
  sessions: number;
  time: number;
}

export interface HRZoneAnalysis {
  zones: {
    zone1: HRZone;
    zone2: HRZone;
    zone3: HRZone;
    zone4: HRZone;
    zone5: HRZone;
  };
  totalSessions: number;
  avgHR: number;
  maxHR: number;
}

export interface TrainingConsistencyMetrics {
  weeklyActivity: Array<{
    swim: number;
    bike: number;
    run: number;
    total: number;
  }>;
  consistencyScores: {
    overall: number;
    swim: number;
    bike: number;
    run: number;
  };
  recommendations: string[];
}

export interface TrainingLoadWeek {
  week: string;
  tss: number;
  duration: number;
  distance: number;
  sessions: number;
}

// Enhanced Training Session with Trends
export interface TrainingSessionWithTrends {
  id: string;
  user_id: string;
  strava_activity_id?: string;
  type: 'swim' | 'bike' | 'run';
  date: string;
  distance?: number;
  moving_time?: number;
  name?: string;
  average_speed?: number;
  total_elevation_gain?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  trainer?: boolean;
  sport_type?: string;
  suffer_score?: number;
  elapsed_time?: number;
  average_cadence?: number;
  start_latlng?: [number, number];
  kudos_count?: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  previous_avg_speed?: number;
  speedImprovement?: number | null;
  paceImprovement?: number | null;
  type_count?: number;
}

// Enhanced Race Types
export type RacePreparationStatus = 'planning' | 'excellent' | 'good' | 'moderate' | 'critical';

export interface RaceWithCountdown {
  id: string;
  external_id: string;
  api_source: string;
  name: string;
  date: string;
  location: string;
  city?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman' | 'other';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  registration_url?: string;
  price_min?: number;
  price_max?: number;
  currency: string;
  spots_available?: number;
  spots_total?: number;
  is_sold_out: boolean;
  description?: string;
  features?: string[];
  user_planned_races?: {
    id: string;
    status: 'interested' | 'registered' | 'training' | 'completed' | 'withdrawn';
    goal_time?: string;
    priority: number;
    notes?: string;
    training_weeks_remaining?: number;
    user_id: string;
    preparation_status?: RacePreparationStatus;
    weeks_until_race?: number;
    days_until_race?: number;
  };
  // Calculated fields
  daysUntil: number;
  weeksUntil: number;
  isPriority: boolean;
  preparationStatus: RacePreparationStatus;
}

// Enhanced Goal Types
export type GoalType = 'race_count' | 'time_target' | 'transition_time';
export type GoalStatus = 'no_data' | 'in_progress' | 'achieved' | 'error' | 'unknown_type';
export type GoalUrgency = 'low' | 'medium' | 'high';

export interface GoalProgress {
  progressPercentage: number;
  currentValue: number | string | null;
  status: GoalStatus;
}

export interface EnhancedGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  distance_type?: 'sprint' | 'olympic' | '70.3' | 'ironman' | 'all';
  target_value: string;
  current_value?: string;
  target_date?: string;
  achieved: boolean;
  created_at: string;
  // Enhanced fields from migration
  progress_percentage?: number;
  last_progress_update?: string;
  urgency_level?: GoalUrgency;
  // Calculated fields
  progressPercentage?: number;
  currentValue?: number | string | null;
  status?: GoalStatus;
  daysUntilTarget?: number | null;
  urgency?: GoalUrgency;
}

export interface GoalStatistics {
  total: number;
  achieved: number;
  inProgress: number;
  overdue: number;
  onTrack: number;
  needsAttention: number;
}

// User Settings with Training Zones
export interface TrainingZones {
  hr_zones: {
    zone1: { min: number; max: number };
    zone2: { min: number; max: number };
    zone3: { min: number; max: number };
    zone4: { min: number; max: number };
    zone5: { min: number; max: number };
  };
  power_zones: {
    zone1: { min: number; max: number };
    zone2: { min: number; max: number };
    zone3: { min: number; max: number };
    zone4: { min: number; max: number };
    zone5: { min: number; max: number };
  };
}

export interface EnhancedUserSettings {
  id: string;
  user_id: string;
  distance_units: 'imperial' | 'metric';
  temperature_units: 'fahrenheit' | 'celsius';
  notifications_race_reminders: boolean;
  notifications_training_updates: boolean;
  notifications_performance_insights: boolean;
  notifications_community_updates: boolean;
  years_racing: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  max_heart_rate?: number;
  lactate_threshold_hr?: number;
  functional_threshold_power?: number;
  training_zones?: TrainingZones;
}

// Dashboard Cache Types
export interface DashboardCacheEntry {
  id: string;
  user_id: string;
  cache_key: string;
  data: any;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalSize: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}

// Dashboard Overview Data Structure
export interface DashboardOverview {
  upcomingRaces?: RaceWithCountdown[];
  weeklyStats?: TrainingWeekStats;
  goalStats?: GoalStatistics;
  trainingLoad?: TrainingLoadWeek[];
  lastUpdated: string;
}

export interface TrainingAnalytics {
  weeklyStats?: TrainingWeekStats[];
  hrZoneAnalysis?: HRZoneAnalysis;
  consistency?: TrainingConsistencyMetrics;
  trends?: TrainingSessionWithTrends[];
  lastUpdated: string;
}

export interface GoalProgressData {
  goals?: EnhancedGoal[];
  statistics?: GoalStatistics;
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count?: number;
  hasMore?: boolean;
  nextCursor?: string;
}

// Strava Integration Types
export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: string | null;
  from_accepted_tag: boolean;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high: number;
  elev_low: number;
  upload_id: number;
  upload_id_str: string;
  external_id: string;
  pr_count: number;
  suffer_score?: number;
}

// Enhanced External Race with Search
export interface EnhancedExternalRace {
  id: string;
  external_id: string;
  api_source: string;
  name: string;
  date: string;
  location: string;
  city?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman' | 'other';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  registration_url?: string;
  price_min?: number;
  price_max?: number;
  currency: string;
  spots_available?: number;
  spots_total?: number;
  is_sold_out: boolean;
  description?: string;
  features?: string[];
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  search_vector?: string;
  is_popular?: boolean;
  popularity_score?: number;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  speedImprovement?: number;
  paceImprovement?: number;
  powerImprovement?: number;
  heartRateTrend?: number;
  consistencyScore?: number;
  trainingLoad?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
}

// Error Types
export interface DatabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

// Cache Configuration
export type CacheTTLType = 'dashboard_stats' | 'training_stats' | 'goal_progress' | 'race_countdown' | 'user_settings' | 'weather_data' | 'strava_analytics';

export interface CacheConfiguration {
  [key: string]: {
    ttl: number;
    refreshOnExpire?: boolean;
    dependencies?: string[];
  };
}

// Notification Types
export interface NotificationData {
  type: 'goal_deadline' | 'race_reminder' | 'training_milestone' | 'performance_insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Export all types for easy importing
export type {
  Json,
  Database
} from './supabase';