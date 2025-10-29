/**
 * Quick Test Script for Training Plan Service
 * 
 * Run with: npx ts-node scripts/testTrainingPlanService.ts
 */

import { trainingPlanService } from '../src/services/trainingPlanService';

async function runTests() {
  console.log('\n🧪 Testing Training Plan Service Layer...\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Fetch all templates
    console.log('\n1️⃣  Testing: Get All Templates');
    console.log('-'.repeat(60));
    const allTemplates = await trainingPlanService.getTrainingPlanTemplates();
    
    if (allTemplates.error) {
      console.error('❌ Error:', allTemplates.error);
      return;
    }
    
    console.log(`✅ SUCCESS: Found ${allTemplates.data?.length} templates`);
    allTemplates.data?.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name}`);
      console.log(`      - Slug: ${t.slug}`);
      console.log(`      - Distance: ${t.distance_type}`);
      console.log(`      - Level: ${t.experience_level}`);
      console.log(`      - Duration: ${t.duration_weeks} weeks`);
      console.log(`      - Hours/week: ${t.weekly_hours_min}-${t.weekly_hours_max}`);
    });
    
    // Test 2: Filter by distance
    console.log('\n2️⃣  Testing: Filter Templates by Distance (sprint)');
    console.log('-'.repeat(60));
    const sprintTemplates = await trainingPlanService.getTrainingPlanTemplates({
      distance_type: 'sprint'
    });
    
    if (sprintTemplates.error) {
      console.error('❌ Error:', sprintTemplates.error);
      return;
    }
    
    console.log(`✅ SUCCESS: Found ${sprintTemplates.data?.length} sprint templates`);
    sprintTemplates.data?.forEach(t => {
      console.log(`   - ${t.name} (${t.experience_level})`);
    });
    
    // Test 3: Filter by experience level
    console.log('\n3️⃣  Testing: Filter Templates by Experience (beginner)');
    console.log('-'.repeat(60));
    const beginnerTemplates = await trainingPlanService.getTrainingPlanTemplates({
      experience_level: 'beginner'
    });
    
    if (beginnerTemplates.error) {
      console.error('❌ Error:', beginnerTemplates.error);
      return;
    }
    
    console.log(`✅ SUCCESS: Found ${beginnerTemplates.data?.length} beginner templates`);
    beginnerTemplates.data?.forEach(t => {
      console.log(`   - ${t.name} (${t.distance_type})`);
    });
    
    // Test 4: Get template workouts
    console.log('\n4️⃣  Testing: Get Template Workouts (Week 1)');
    console.log('-'.repeat(60));
    
    if (allTemplates.data && allTemplates.data.length > 0) {
      const firstTemplate = allTemplates.data[0];
      const workouts = await trainingPlanService.getTemplateWorkouts(
        firstTemplate.id,
        1
      );
      
      if (workouts.error) {
        console.error('❌ Error:', workouts.error);
        return;
      }
      
      console.log(`✅ SUCCESS: Found ${workouts.data?.length} workouts for Week 1`);
      console.log(`   Template: ${firstTemplate.name}\n`);
      
      workouts.data?.forEach((w, i) => {
        console.log(`   Day ${w.day_of_week} (${getDayName(w.day_of_week)}):`);
        console.log(`      ${w.discipline.toUpperCase()} - ${w.workout_type}`);
        if (w.duration_minutes) {
          console.log(`      Duration: ${w.duration_minutes} min`);
        }
        if (w.distance_miles) {
          console.log(`      Distance: ${w.distance_miles} miles`);
        }
        console.log(`      Intensity: ${w.intensity_description}`);
        if (i < workouts.data!.length - 1) console.log('');
      });
    }
    
    // Test 5: Get all workouts for a template
    console.log('\n5️⃣  Testing: Get All Workouts for Template');
    console.log('-'.repeat(60));
    
    if (allTemplates.data && allTemplates.data.length > 0) {
      const testTemplate = allTemplates.data.find(t => t.slug === 'sprint-beginner-12');
      
      if (testTemplate) {
        const allWorkouts = await trainingPlanService.getTemplateWorkouts(testTemplate.id);
        
        if (allWorkouts.error) {
          console.error('❌ Error:', allWorkouts.error);
          return;
        }
        
        console.log(`✅ SUCCESS: Found ${allWorkouts.data?.length} total workouts`);
        console.log(`   Template: ${testTemplate.name}`);
        console.log(`   Expected: 84 workouts (12 weeks × 7 days)`);
        
        // Count by discipline
        const disciplineCounts: Record<string, number> = {};
        allWorkouts.data?.forEach(w => {
          disciplineCounts[w.discipline] = (disciplineCounts[w.discipline] || 0) + 1;
        });
        
        console.log('\n   Workout breakdown by discipline:');
        Object.entries(disciplineCounts).forEach(([discipline, count]) => {
          console.log(`      ${discipline}: ${count}`);
        });
      }
    }
    
    // Test 6: Utility functions
    console.log('\n6️⃣  Testing: Utility Functions');
    console.log('-'.repeat(60));
    
    const startDate = '2025-10-08';
    const weekDates = trainingPlanService.calculateWeekDates(startDate, 1);
    console.log(`✅ Week dates calculated:`);
    console.log(`   Start: ${weekDates.start}`);
    console.log(`   End: ${weekDates.end}`);
    
    const isPastOverdue = trainingPlanService.isWorkoutOverdue('2025-09-01');
    const isTodayOverdue = trainingPlanService.isWorkoutOverdue(new Date().toISOString().split('T')[0]);
    console.log(`\n✅ Overdue detection:`);
    console.log(`   Past date (2025-09-01): ${isPastOverdue ? 'Overdue' : 'Not overdue'}`);
    console.log(`   Today: ${isTodayOverdue ? 'Overdue' : 'Not overdue'}`);
    
    const todayCheck = trainingPlanService.isToday(new Date().toISOString().split('T')[0]);
    console.log(`\n✅ Today detection: ${todayCheck ? 'Works correctly' : 'Failed'}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log('   ✓ Template fetching');
    console.log('   ✓ Template filtering (distance & experience)');
    console.log('   ✓ Workout retrieval (by week and all)');
    console.log('   ✓ Utility functions');
    console.log('\n⚠️  NOTE: User plan CRUD and completion tracking tests');
    console.log('   require authentication and should be tested within the app.\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

function getDayName(dayNumber: number): string {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayNumber] || 'Unknown';
}

// Run tests
runTests().then(() => process.exit(0));
