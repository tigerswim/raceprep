// Supabase Generated Types for RacePrep
// This file contains TypeScript types generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          age_group: string | null
          gender: string | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | null
          location: string | null
          usat_id: string | null
          premium_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          age_group?: string | null
          gender?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          location?: string | null
          usat_id?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          age_group?: string | null
          gender?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null
          location?: string | null
          usat_id?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          location: string
          distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          swim_type: 'lake' | 'ocean' | 'river' | 'pool' | null
          bike_elevation_gain: number | null
          run_elevation_gain: number | null
          overall_elevation: number | null
          difficulty_score: number | null
          wetsuit_legal: boolean | null
          description: string | null
          features: Json | null
          website_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          swim_type?: 'lake' | 'ocean' | 'river' | 'pool' | null
          bike_elevation_gain?: number | null
          run_elevation_gain?: number | null
          overall_elevation?: number | null
          difficulty_score?: number | null
          wetsuit_legal?: boolean | null
          description?: string | null
          features?: Json | null
          website_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          distance_type?: 'sprint' | 'olympic' | '70.3' | 'ironman'
          swim_type?: 'lake' | 'ocean' | 'river' | 'pool' | null
          bike_elevation_gain?: number | null
          run_elevation_gain?: number | null
          overall_elevation?: number | null
          difficulty_score?: number | null
          wetsuit_legal?: boolean | null
          description?: string | null
          features?: Json | null
          website_url?: string | null
          created_at?: string
        }
      }
      races: {
        Row: {
          id: string
          name: string
          date: string
          location: string
          distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          course_id: string | null
          timing_platform: string | null
          external_race_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          location: string
          distance_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          course_id?: string | null
          timing_platform?: string | null
          external_race_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          location?: string
          distance_type?: 'sprint' | 'olympic' | '70.3' | 'ironman'
          course_id?: string | null
          timing_platform?: string | null
          external_race_id?: string | null
          created_at?: string
        }
      }
      race_results: {
        Row: {
          id: string
          user_id: string
          race_id: string
          overall_time: string
          swim_time: string | null
          t1_time: string | null
          bike_time: string | null
          t2_time: string | null
          run_time: string | null
          overall_placement: number | null
          age_group_placement: number | null
          bib_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race_id: string
          overall_time: string
          swim_time?: string | null
          t1_time?: string | null
          bike_time?: string | null
          t2_time?: string | null
          run_time?: string | null
          overall_placement?: number | null
          age_group_placement?: number | null
          bib_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          race_id?: string
          overall_time?: string
          swim_time?: string | null
          t1_time?: string | null
          bike_time?: string | null
          t2_time?: string | null
          run_time?: string | null
          overall_placement?: number | null
          age_group_placement?: number | null
          bib_number?: string | null
          created_at?: string
        }
      }
      course_reviews: {
        Row: {
          id: string
          course_id: string
          user_id: string
          rating: number | null
          review_text: string | null
          difficulty_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          rating?: number | null
          review_text?: string | null
          difficulty_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          rating?: number | null
          review_text?: string | null
          difficulty_rating?: number | null
          created_at?: string
        }
      }
      race_weather: {
        Row: {
          id: string
          race_id: string
          date: string
          temperature_f: number | null
          humidity: number | null
          wind_speed: number | null
          conditions: string | null
          water_temperature_f: number | null
          created_at: string
        }
        Insert: {
          id?: string
          race_id: string
          date: string
          temperature_f?: number | null
          humidity?: number | null
          wind_speed?: number | null
          conditions?: string | null
          water_temperature_f?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          race_id?: string
          date?: string
          temperature_f?: number | null
          humidity?: number | null
          wind_speed?: number | null
          conditions?: string | null
          water_temperature_f?: number | null
          created_at?: string
        }
      }
      nutrition_plans: {
        Row: {
          id: string
          user_id: string
          race_id: string
          pre_race_items: Json | null
          bike_items: Json | null
          run_items: Json | null
          total_carbs: number | null
          total_sodium: number | null
          total_calories: number | null
          total_caffeine: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race_id: string
          pre_race_items?: Json | null
          bike_items?: Json | null
          run_items?: Json | null
          total_carbs?: number | null
          total_sodium?: number | null
          total_calories?: number | null
          total_caffeine?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          race_id?: string
          pre_race_items?: Json | null
          bike_items?: Json | null
          run_items?: Json | null
          total_carbs?: number | null
          total_sodium?: number | null
          total_calories?: number | null
          total_caffeine?: number | null
          created_at?: string
        }
      }
      user_equipment: {
        Row: {
          id: string
          user_id: string
          category: 'swim' | 'bike' | 'run'
          item_type: string
          brand: string | null
          model: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'swim' | 'bike' | 'run'
          item_type: string
          brand?: string | null
          model?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'swim' | 'bike' | 'run'
          item_type?: string
          brand?: string | null
          model?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'race_count' | 'time_target' | 'transition_time'
          target_value: string
          current_value: string | null
          target_date: string | null
          achieved: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'race_count' | 'time_target' | 'transition_time'
          target_value: string
          current_value?: string | null
          target_date?: string | null
          achieved?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'race_count' | 'time_target' | 'transition_time'
          target_value?: string
          current_value?: string | null
          target_date?: string | null
          achieved?: boolean | null
          created_at?: string
        }
      }
      packing_lists: {
        Row: {
          id: string
          user_id: string
          race_id: string
          transition: 't1' | 't2'
          items: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race_id: string
          transition: 't1' | 't2'
          items: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          race_id?: string
          transition?: 't1' | 't2'
          items?: Json
          created_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string
          strava_activity_id: string | null
          type: 'swim' | 'bike' | 'run'
          date: string
          distance: number | null
          moving_time: number | null
          name: string | null
          average_speed: number | null
          total_elevation_gain: number | null
          average_heartrate: number | null
          max_heartrate: number | null
          average_watts: number | null
          trainer: boolean | null
          sport_type: string | null
          suffer_score: number | null
          elapsed_time: number | null
          average_cadence: number | null
          start_latlng: Json | null
          kudos_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_activity_id?: string | null
          type: 'swim' | 'bike' | 'run'
          date: string
          distance?: number | null
          moving_time?: number | null
          name?: string | null
          average_speed?: number | null
          total_elevation_gain?: number | null
          average_heartrate?: number | null
          max_heartrate?: number | null
          average_watts?: number | null
          trainer?: boolean | null
          sport_type?: string | null
          suffer_score?: number | null
          elapsed_time?: number | null
          average_cadence?: number | null
          start_latlng?: Json | null
          kudos_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_activity_id?: string | null
          type?: 'swim' | 'bike' | 'run'
          date?: string
          distance?: number | null
          moving_time?: number | null
          name?: string | null
          average_speed?: number | null
          total_elevation_gain?: number | null
          average_heartrate?: number | null
          max_heartrate?: number | null
          average_watts?: number | null
          trainer?: boolean | null
          sport_type?: string | null
          suffer_score?: number | null
          elapsed_time?: number | null
          average_cadence?: number | null
          start_latlng?: Json | null
          kudos_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}