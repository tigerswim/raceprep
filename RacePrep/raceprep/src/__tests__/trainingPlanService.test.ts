/**
 * Training Plan Service Tests
 * 
 * These tests verify the Service Layer functionality for the Training Plan Engine
 * Run with: npm test -- trainingPlanService.test.ts
 */

import { trainingPlanService } from '../services/trainingPlanService';
import type { TrainingPlanTemplate } from '../types/trainingPlans';

describe('Training Plan Service Layer Tests', () => {
  let testPlanId: string;
  let testWorkoutId: string;
  let testTemplate: TrainingPlanTemplate | null = null;

  // ============================================
  // 1. Template Fetching Tests
  // ============================================
  
  describe('Template Fetching', () => {
    test('should fetch all templates', async () => {
      const result = await trainingPlanService.getTrainingPlanTemplates();
      
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(3);
      expect(result.error).toBeNull();
      
      console.log('✅ Fetched all templates:', result.data?.length);
    });

    test('should filter templates by distance type', async () => {
      const result = await trainingPlanService.getTrainingPlanTemplates({
        distance_type: 'sprint'
      });
      
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
      expect(result.data?.every(t => t.distance_type === 'sprint')).toBe(true);
      
      console.log('✅ Filtered by sprint distance:', result.data?.length);
    });

    test('should filter templates by experience level', async () => {
      const result = await trainingPlanService.getTrainingPlanTemplates({
        experience_level: 'beginner'
      });
      
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
      expect(result.data?.every(t => t.experience_level === 'beginner')).toBe(true);
      
      console.log('✅ Filtered by beginner level:', result.data?.length);
    });
  });

  // ============================================
  // 2. Template Workouts Tests
  // ============================================
  
  describe('Template Workouts', () => {
    test('should fetch workouts for specific week', async () => {
      const templates = await trainingPlanService.getTrainingPlanTemplates();
      testTemplate = templates.data?.[0] || null;
      
      const result = await trainingPlanService.getTemplateWorkouts(testTemplate!.id, 1);
      
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(7);
      expect(result.data?.every(w => w.week_number === 1)).toBe(true);
      
      console.log('✅ Fetched Week 1 workouts:', result.data?.length);
    });
  });
});
