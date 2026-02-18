import { supabase } from '../supabase';
import {
  TrainingPlanTemplate,
  TrainingPlanTemplateFilters,
  TrainingPlanWorkout,
} from '../../types/trainingPlans';
import { logger } from '../../utils/logger';

export const templates = {
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
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching templates:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanTemplate[], error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching templates:', error);
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
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching template:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanTemplate, error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching template:', error);
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
        logger.error('[TRAINING_PLAN_SERVICE] Error fetching workouts:', error);
        return { data: null, error: error.message };
      }

      return { data: data as TrainingPlanWorkout[], error: null };
    } catch (error: any) {
      logger.error('[TRAINING_PLAN_SERVICE] Exception fetching workouts:', error);
      return { data: null, error: error.message };
    }
  },
};
