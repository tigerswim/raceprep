# Training Plan Engine - Technical Documentation

**Status**: Foundation Complete (Database, Types, Service Layer)  
**Date**: October 1, 2025  
**Phase**: 3 (In Progress)

---

## 📋 Overview

The Training Plan Engine is a comprehensive system for structured triathlon training. It provides pre-built training plans, workout scheduling, completion tracking, and progress analytics.

### What's Complete

✅ **Database Schema** (4 tables)  
✅ **3 Training Plan Templates** (280+ workouts)  
✅ **TypeScript Types** (36 exports, 716 lines)  
✅ **API Service Layer** (23 functions, 790 lines)

### What's Next

🔲 UI Components (plan selection, calendar, tracking)  
🔲 Dashboard Integration  
🔲 Testing & Validation

---

## 🗄️ Database Schema

### Tables

#### 1. `training_plan_templates`
Stores reusable training plan templates.

**Key Fields**:
- `slug` - URL-friendly identifier (e.g., 'sprint-beginner-12')
- `distance_type` - sprint | olympic | 70.3 | ironman
- `experience_level` - beginner | intermediate | advanced
- `duration_weeks` - Plan length (8-32 weeks)
- `weekly_hours_min/max` - Expected time commitment
- `key_features` - Array of plan highlights

**Seeded Templates**:
1. Sprint Beginner (12 weeks, 6-8 hrs/week)
2. Sprint Intermediate (12 weeks, 8-10 hrs/week)
3. Olympic Beginner (16 weeks, 8-10 hrs/week)

#### 2. `user_training_plans`
User's active/completed training plans.

**Key Fields**:
- `template_id` - Links to template
- `planned_race_id` - Optional race goal
- `start_date/end_date` - Plan timeline
- `current_week` - Progress tracker
- `status` - active | paused | completed | abandoned
- `customizations` - JSONB for user modifications

**Constraints**: One plan per race per user

#### 3. `training_plan_workouts`
Individual workouts within templates.

**Key Fields**:
- `week_number` - Plan week (1-32)
- `day_of_week` - 1=Monday, 7=Sunday
- `discipline` - swim | bike | run | brick | strength | rest
- `workout_type` - base | tempo | intervals | long | recovery | race_pace
- `duration_minutes` - Target duration
- `distance_miles` - Target distance
- `structure` - JSONB with warmup/main_set/cooldown
- `detailed_description` - Full workout instructions
- `coaching_notes` - Execution tips
- `goals` - Array of workout objectives

**Total Workouts**: 280 (84 per Sprint plan, 112 for Olympic)

#### 4. `workout_completions`
Tracks completed/skipped workouts.

**Key Fields**:
- `user_training_plan_id` - Links to user's plan
- `planned_workout_id` - Links to template workout
- `scheduled_date` - When it was scheduled
- `completed_date` - When actually completed
- `strava_activity_id` - Auto-linked Strava activity
- `actual_duration_minutes/distance_miles` - Actual performance
- `perceived_effort` - RPE 1-10 scale
- `skipped` - Boolean flag
- `skip_reason` - Why workout was skipped

---

## 📦 Training Plan Templates

### Template 1: Sprint Beginner (12 weeks)

**Target Audience**: First-time triathletes with basic swim/bike/run ability

**Structure**:
- **Weeks 1-4 (Base Building)**: Focus on technique and aerobic foundation
  - 3 swims (30 min), 2 bikes (45 min), 2 runs (30 min), 1 rest day
  - Total: ~5 hours/week
- **Weeks 5-8 (Build)**: Increase volume, introduce brick workouts
  - 3 swims (35-40 min), 3 bikes (50-60 min), 3 runs (35-40 min), 1 brick
  - Total: ~6-7 hours/week
- **Weeks 9-11 (Peak)**: Race-specific intensity
  - 3 swims (40 min), 3 bikes (60-75 min), 3 runs (40-45 min), 1 brick
  - Full race simulation in Week 10
  - Total: ~7-8 hours/week
- **Week 12 (Taper)**: 50% volume reduction, maintain intensity
  - Recovery focus, race week prep
  - Total: ~3-4 hours/week

**Key Features**:
- Gradual progression (no big jumps)
- Technique drills in every swim
- One rest day per week throughout
- Recovery week after Build phase (Week 8)

**Sample Workouts**:
- **Swim**: Drill-focused sets (catch-up, fingertip drag, zipper)
- **Bike**: Zone 2 base building, cadence work
- **Run**: Easy pace, form focus, progressive runs
- **Brick**: Bike-to-run transitions (30 min bike + 15 min run)

---

### Template 2: Sprint Intermediate (12 weeks)

**Target Audience**: Athletes with 1-2 sprint triathlons completed

**Structure**:
- **Weeks 1-4 (Base + Speed)**: Higher starting volume with intervals
  - 3 swims (40 min with intervals), 3 bikes (60 min), 3 runs (40 min)
  - Total: ~7-8 hours/week
- **Weeks 5-8 (Build + Intensity)**: Tempo sessions, threshold work
  - 3 swims (45 min), 3 bikes (60-75 min with tempo), 3 runs (45 min)
  - Multiple brick workouts per week
  - Total: ~8-9 hours/week
- **Weeks 9-11 (Peak + Race Pace)**: Race-specific efforts
  - 4 swims (40-50 min), 3 bikes (75-90 min), 3 runs (50 min)
  - Weekly brick workouts, race simulations
  - Total: ~9-10 hours/week
- **Week 12 (Taper)**: Strategic recovery

**Differences from Beginner**:
- Higher starting volume (no "ramp up")
- Interval training from Week 1
- More frequent brick workouts (2-3 per week in peak)
- Tempo and threshold sessions
- Race pace work throughout

**Sample Workouts**:
- **Swim**: 400m intervals @ race pace, descending sets
- **Bike**: 2x20 tempo efforts, sprint intervals
- **Run**: Fartlek runs, 5K pace repeats, tempo runs
- **Brick**: Advanced format (45 min bike @ threshold + 20 min run @ race pace)

---

### Template 3: Olympic Beginner (16 weeks)

**Target Audience**: Sprint veterans moving up to Olympic distance

**Structure**:
- **Weeks 1-6 (Extended Base)**: Build aerobic foundation
  - Progressive volume from Sprint to Olympic distances
  - 3 swims (35-45 min), 3 bikes (60-90 min), 3 runs (40-60 min)
  - Total: ~7-8 hours/week
- **Weeks 7-12 (Build)**: Olympic-specific volume
  - 3-4 swims (45-55 min), 3 bikes (90-120 min), 3-4 runs (60-75 min)
  - Weekly brick workouts
  - Total: ~9-10 hours/week
- **Week 9 (Recovery)**: Mid-plan recovery week
- **Weeks 13-15 (Peak)**: Race-ready fitness
  - Long swim sessions (60+ min), century-prep rides (3+ hrs)
  - Long runs (90+ min), race-pace work
  - Full Olympic simulation in Weeks 14-15
  - Total: ~10-11 hours/week
- **Week 16 (Taper)**: Final preparation

**Key Adaptations for Olympic**:
- 16-week duration (vs 12 for Sprint)
- Recovery week at Week 9 (mid-plan)
- Progressive distance building over longer timeline
- Longer "long" workouts (3hr+ bikes, 90min+ runs)
- Nutrition practice emphasized
- Mental preparation included

**Sample Workouts**:
- **Swim**: Building to 1.5K continuous, open water practice
- **Bike**: Progressive long rides (60min → 3hrs+), hill repeats
- **Run**: Long runs building to 10K+, marathon pace work
- **Brick**: Olympic-specific (2hr bike + 45min run)

---

## 🎯 TypeScript Types

**File**: `src/types/trainingPlans.ts` (716 lines)

### Core Type Aliases (5)
```typescript
type DistanceType = 'sprint' | 'olympic' | '70.3' | 'ironman'
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
type TrainingPlanStatus = 'active' | 'paused' | 'completed' | 'abandoned'
type DisciplineType = 'swim' | 'bike' | 'run' | 'brick' | 'strength' | 'rest'
type WorkoutType = 'base' | 'tempo' | 'intervals' | 'long' | 'recovery' | 'race_pace' | 'technique' | 'speed'
```

### Main Interfaces (4 + variants)
- `TrainingPlanTemplate` - Template metadata
- `UserTrainingPlan` - User's plan instance
- `TrainingPlanWorkout` - Workout definition
- `WorkoutCompletion` - Completion record

### UI/Display Types (4)
- `WorkoutWithCompletion` - Enriched workout for display
- `WeekSchedule` - Calendar week view
- `TrainingPlanProgress` - Overall metrics
- `TrainingPlanStats` - Detailed analytics

### Filter Types (3)
- `TrainingPlanTemplateFilters`
- `WorkoutFilters`
- `CompletionFilters`

---

## 🔌 API Service Layer

**File**: `src/services/trainingPlanService.ts` (790 lines, 23 functions)

### Template Operations (3 functions)
```typescript
getTrainingPlanTemplates(filters?) → TrainingPlanTemplate[]
getTrainingPlanTemplate(id) → TrainingPlanTemplate
getTemplateWorkouts(templateId, weekNumber?) → TrainingPlanWorkout[]
```

### User Plan Operations (5 functions)
```typescript
getUserTrainingPlans(userId, status?) → UserTrainingPlan[]
getUserTrainingPlan(planId) → UserTrainingPlan (with joins)
createUserTrainingPlan(data) → UserTrainingPlan
updateUserTrainingPlan(planId, updates) → UserTrainingPlan
deleteUserTrainingPlan(planId) → boolean
```

### Workout Scheduling (3 functions)
```typescript
getScheduledWorkouts(planId, weekNumber?) → WorkoutWithCompletion[]
getUpcomingWorkouts(planId, days?) → WorkoutWithCompletion[]
getTodaysWorkouts(planId) → WorkoutWithCompletion[]
```

### Workout Completion (5 functions)
```typescript
completeWorkout(data) → WorkoutCompletion
skipWorkout(data) → WorkoutCompletion
updateWorkoutCompletion(completionId, updates) → WorkoutCompletion
deleteWorkoutCompletion(completionId) → boolean
getWorkoutCompletions(planId, filters?) → WorkoutCompletion[]
```

### Progress & Analytics (4 functions)
```typescript
getTrainingPlanProgress(planId) → TrainingPlanProgress
getWeeklySchedule(planId, weekNumber) → WeekSchedule
calculateAdherenceRate(planId, weeksBack?) → AdherenceStats
matchStravaToWorkout(planId, stravaActivity) → WorkoutCompletion
```

### Utility Functions (3 functions)
```typescript
calculateWeekDates(startDate, weekNumber) → {start, end}
isWorkoutOverdue(scheduledDate) → boolean
isToday(dateString) → boolean
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS)

**Templates & Workouts**: Public read access
- Anyone can browse available training plans
- Only admins can create/modify templates

**User Plans**: Private (user-owned)
- Users can only view/edit their own plans
- RLS enforced via `auth.uid() = user_id`

**Completions**: Private (plan-owned)
- Users can only access completions for their own plans
- Nested RLS check via user_training_plans table

### Data Validation

**Database Constraints**:
- `duration_weeks` between 8-32
- `day_of_week` between 1-7
- `perceived_effort` between 1-10
- Enum checks on status/type fields
- UNIQUE constraint on user_id + planned_race_id

**Service Layer Validation**:
- Date calculations and boundary checks
- Null safety for optional fields
- Error handling with try/catch blocks

---

## 📊 Usage Examples

### 1. Browse Available Templates
```typescript
import { trainingPlanService } from './services/trainingPlanService';

// Get all Sprint plans for beginners
const result = await trainingPlanService.getTrainingPlanTemplates({
  distance_type: 'sprint',
  experience_level: 'beginner'
});

if (result.data) {
  console.log(`Found ${result.data.length} templates`);
  result.data.forEach(template => {
    console.log(`${template.name}: ${template.duration_weeks} weeks`);
  });
}
```

### 2. Create User Training Plan
```typescript
// User selects a template and race
const planData = {
  user_id: currentUser.id,
  template_id: 'a1111111-1111-1111-1111-111111111111', // Sprint Beginner
  planned_race_id: userRace.id,
  plan_name: 'My First Sprint Training',
  start_date: '2025-10-08', // Next Monday
  end_date: '2025-12-29', // 12 weeks later
  current_week: 1
};

const result = await trainingPlanService.createUserTrainingPlan(planData);

if (result.data) {
  console.log('Training plan created!', result.data.id);
}
```

### 3. Get This Week's Workouts
```typescript
const plan = await trainingPlanService.getUserTrainingPlan(planId);
const weekSchedule = await trainingPlanService.getWeeklySchedule(
  planId, 
  plan.data.current_week
);

if (weekSchedule.data) {
  console.log(`Week ${weekSchedule.data.weekNumber}`);
  console.log(`Completion: ${weekSchedule.data.completionRate}%`);
  
  weekSchedule.data.workouts.forEach(workout => {
    console.log(`${workout.discipline}: ${workout.duration_minutes} min`);
    if (workout.completion) {
      console.log('  ✅ Completed');
    } else if (workout.isOverdue) {
      console.log('  ⚠️ Overdue');
    }
  });
}
```

### 4. Complete Today's Workout
```typescript
const todaysWorkouts = await trainingPlanService.getTodaysWorkouts(planId);

if (todaysWorkouts.data?.[0]) {
  const workout = todaysWorkouts.data[0];
  
  const completion = await trainingPlanService.completeWorkout({
    user_training_plan_id: planId,
    planned_workout_id: workout.id,
    scheduled_date: new Date().toISOString().split('T')[0],
    actual_duration_minutes: 45,
    actual_distance_miles: 5.2,
    perceived_effort: 7,
    notes: 'Felt strong today!'
  });
  
  console.log('Workout logged!');
}
```

### 5. Auto-Match Strava Activity
```typescript
// When Strava webhook receives new activity
const stravaActivity = {
  id: 123456789,
  type: 'Run',
  start_date: '2025-10-15T06:30:00Z',
  moving_time: 2700, // 45 minutes
  distance: 8046.72, // 5 miles in meters
  name: 'Morning Run'
};

const result = await trainingPlanService.matchStravaToWorkout(
  planId, 
  stravaActivity
);

if (result.data) {
  console.log('Auto-matched to planned workout!');
} else {
  console.log('No matching workout found');
}
```

### 6. Check Progress & Adherence
```typescript
const progress = await trainingPlanService.getTrainingPlanProgress(planId);

if (progress.data) {
  console.log(`Week ${progress.data.currentWeek} of ${progress.data.totalWeeks}`);
  console.log(`Completed: ${progress.data.completedWorkouts}/${progress.data.totalWorkouts}`);
  console.log(`Adherence: ${progress.data.adherenceRate}%`);
  
  // Check upcoming workouts
  progress.data.upcomingWorkouts.forEach(w => {
    console.log(`  ${w.discipline} - ${w.duration_minutes} min`);
  });
}

// Detailed adherence for last 4 weeks
const adherence = await trainingPlanService.calculateAdherenceRate(planId, 4);
console.log('Last 4 weeks adherence:', adherence.data);
```

---

## 🧪 Testing Checklist

### Database Migration
- [x] Run migration 013 (schema)
- [x] Run migration 014 (seed data)
- [x] Verify 4 tables created
- [x] Verify 3 templates inserted
- [x] Verify 280 workouts inserted
- [x] Test RLS policies (public read templates, private user plans)

### Service Layer
- [x] Test template fetching with filters
- [ ] Test user plan CRUD operations
- [x] Test workout scheduling calculations
- [ ] Test completion tracking (complete, skip, update)
- [ ] Test progress calculation
- [ ] Test adherence rate calculation
- [ ] Test Strava auto-matching logic
- [ ] Test date utility functions

### Integration
- [ ] Create test user
- [ ] Create test training plan
- [ ] Schedule workouts for test plan
- [ ] Complete/skip test workouts
- [ ] Verify progress updates correctly
- [ ] Test plan deletion (cascade)

---

## 🚀 Next Steps (UI Development)

### Priority 1: Plan Selection Screen
**Component**: `src/screens/TrainingPlanSelectionScreen.tsx`

**Features**:
- Grid/list view of available templates
- Filter by distance and experience level
- Template details modal
- "Start This Plan" button → create user plan

### Priority 2: Training Calendar Component
**Component**: `src/components/training/TrainingCalendar.tsx`

**Features**:
- Weekly calendar view (7 columns)
- Show workouts by day with discipline icons
- Color-coded by completion status
- Click workout → details modal
- Swipe between weeks

### Priority 3: Workout Detail & Completion Modal
**Component**: `src/components/training/WorkoutDetailModal.tsx`

**Features**:
- Full workout description
- Warmup/main/cooldown breakdown
- "Complete Workout" button
- Log duration, distance, effort
- "Skip Workout" with reason
- Link Strava activity

### Priority 4: Progress Dashboard Widget
**Component**: `src/components/dashboard/TrainingPlanProgressWidget.tsx`

**Features**:
- Current week indicator
- Completion rate ring chart
- Adherence percentage
- This week's workouts summary
- Quick link to full calendar

### Priority 5: Plan Management Screen
**Component**: `src/screens/MyTrainingPlansScreen.tsx`

**Features**:
- List of user's active/completed plans
- Plan status (active/paused/completed)
- Progress summary for each
- Pause/resume/delete actions
- Link to full calendar view

---

## 📈 Future Enhancements

### Template Builder (Admin Tool)
- UI for creating custom templates
- Workout library with pre-made sessions
- Drag-and-drop week/workout ordering
- Copy from existing templates

### Plan Customization (User Feature)
- Modify individual workouts
- Swap workout days (rest day flexibility)
- Adjust weekly volume (±20%)
- Save as personal template

### Advanced Auto-Matching
- Match by duration + discipline (not just date)
- Fuzzy matching (±15 min duration tolerance)
- Multi-activity matching (brick workouts)
- Suggest which planned workout to link to

### Training Load Management
- Calculate TSS (Training Stress Score)
- Track CTL/ATL/TSB (Chronic/Acute/Balance)
- Fatigue warnings
- Recommend rest days when overreached

### AI-Powered Recommendations
- Analyze historical performance
- Suggest optimal template for goals
- Adjust plan based on progress
- Predict race times from training data

---

## 📝 Migration Guide

### Applying Database Changes

1. **Run Schema Migration**:
```bash
psql -d raceprep -f supabase/migrations/013_training_plan_engine.sql
```

2. **Run Seed Data Migration**:
```bash
psql -d raceprep -f supabase/migrations/014_training_plan_templates_seed.sql
```

3. **Verify Installation**:
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  AND tablename LIKE 'training_plan%' OR tablename = 'workout_completions';

-- Check templates loaded
SELECT slug, distance_type, experience_level, duration_weeks 
FROM training_plan_templates;

-- Check workout count per template
SELECT template_id, COUNT(*) as workout_count 
FROM training_plan_workouts 
GROUP BY template_id;
```

### Adding to Existing Codebase

1. **Import Service**:
```typescript
// In your component
import { trainingPlanService } from '@/services/trainingPlanService';
```

2. **Import Types**:
```typescript
import type { 
  TrainingPlanTemplate, 
  UserTrainingPlan,
  WorkoutWithCompletion 
} from '@/types/trainingPlans';
```

3. **Add to Navigation** (example):
```typescript
// In your tab navigator
<Tab.Screen 
  name="Training" 
  component={TrainingPlanScreen}
  options={{
    tabBarIcon: 'calendar',
    title: 'Training Plan'
  }}
/>
```

---

## 🐛 Known Limitations

1. **No Offline Support**: All operations require network connection
2. **Single Active Plan**: Users can only have one active plan per race
3. **No Workout Notifications**: Push notifications not implemented
4. **Basic Strava Matching**: Only matches by date + discipline (no smart fuzzy matching)
5. **No Workout History**: Can't view previous plan completions after plan deleted
6. **Fixed Templates**: Users can't customize templates before starting plan

---

## 💡 Design Decisions

### Why Templates Instead of AI-Generated?
- **Proven methods**: Based on established training science
- **Predictable**: Users know exactly what they're getting
- **Faster development**: No ML model training required
- **Lower maintenance**: No model retraining needed

### Why Separate Workout Completions Table?
- **Flexibility**: Track partial completion, reschedule workouts
- **History**: Keep completion data even if plan deleted
- **Analytics**: Calculate adherence, trends over time
- **Strava Integration**: Link external activities without modifying plan

### Why JSONB for Workout Structure?
- **Flexibility**: Different workout types need different structures
- **No Schema Changes**: Add new workout formats without migrations
- **Easy Querying**: PostgreSQL JSONB operators for filtering
- **Future-Proof**: Can evolve format over time

### Why User Plans Separate from Templates?
- **Reusability**: Many users can use same template
- **Customization**: Users can modify without affecting template
- **Versioning**: Template changes don't affect existing plans
- **Progress Tracking**: Each user has independent progress state

---

## 📞 Support & Questions

For questions about the Training Plan Engine:
1. Check this documentation first
2. Review `DEVELOPMENT_PLAN.md` for roadmap
3. See `CONTEXT.md` for overall architecture
4. Inspect actual code in:
   - `supabase/migrations/013_training_plan_engine.sql`
   - `supabase/migrations/014_training_plan_templates_seed.sql`
   - `src/types/trainingPlans.ts`
   - `src/services/trainingPlanService.ts`

---

*Last Updated: October 1, 2025*  
*Status: Foundation Complete - Ready for UI Development*
