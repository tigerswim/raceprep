# Training Plan Engine - UI Implementation Guide

**Status**: UI Components Complete ✅  
**Date**: October 1, 2025

---

## 📦 Components Created

### 1. TrainingPlanSelectionScreen
**Location**: `src/screens/Training/TrainingPlanSelectionScreen.tsx`

**Purpose**: Browse and select training plan templates

**Features**:
- Filter by distance type (sprint, olympic, 70.3, ironman)
- Filter by experience level (beginner, intermediate, advanced)
- Template cards with key info (duration, hours/week, features)
- Detail modal with full template information
- "Start This Plan" action

**Usage**:
```typescript
import { TrainingPlanSelectionScreen } from '@/screens/Training';

<TrainingPlanSelectionScreen
  onSelectPlan={(template) => {
    // Handle plan selection - navigate to create user plan
    console.log('Selected:', template.name);
  }}
/>
```

---

### 2. TrainingCalendar
**Location**: `src/components/training/TrainingCalendar.tsx`

**Purpose**: Display weekly training schedule with workout cards

**Features**:
- Week navigation (previous/next)
- Workout cards by day with discipline icons
- Color-coded by discipline (swim=blue, bike=green, run=orange, etc.)
- Completion status indicators (✓, ⊘, !)
- Weekly completion statistics
- Tap workout to view details

**Usage**:
```typescript
import { TrainingCalendar } from '@/components/training';

<TrainingCalendar
  planId={userPlan.id}
  currentWeek={userPlan.current_week}
  onWorkoutPress={(workout) => setSelectedWorkout(workout)}
  onWeekChange={(week) => console.log('Changed to week', week)}
/>
```

---

### 3. WorkoutDetailModal
**Location**: `src/components/training/WorkoutDetailModal.tsx`

**Purpose**: View workout details and log completion or skip

**Features**:
- Full workout description and structure (warmup/main/cooldown)
- Coaching notes and workout goals
- Complete workout form (duration, distance, effort, notes)
- Skip workout form (reason)
- Displays completion status if already logged
- Color-coded header by discipline

**Usage**:
```typescript
import { WorkoutDetailModal } from '@/components/training';

<WorkoutDetailModal
  visible={showModal}
  workout={selectedWorkout}
  planId={userPlan.id}
  onClose={() => setShowModal(false)}
  onWorkoutUpdated={() => {
    // Refresh calendar after workout logged
    loadWeekWorkouts();
  }}
/>
```

---

### 4. TrainingPlanProgressWidget
**Location**: `src/components/dashboard/TrainingPlanProgressWidget.tsx`

**Purpose**: Dashboard widget showing training plan progress

**Features**:
- Current week indicator
- Completion percentage ring
- Stats: completed, adherence rate, remaining
- This week's upcoming workouts preview
- "View Calendar" action
- Empty state with "Start a Plan" button

**Usage**:
```typescript
import { TrainingPlanProgressWidget } from '@/components/dashboard/TrainingPlanProgressWidget';

<TrainingPlanProgressWidget
  userId={currentUser.id}
  onViewDetails={() => navigation.navigate('TrainingCalendar')}
/>
```

---

## 🎨 Design System

### Colors
- **Primary**: #007AFF (Blue)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)
- **Error**: #FF3B30 (Red)
- **Purple**: #AF52DE (Brick workouts)
- **Gray**: #8E8E93 (Rest days)

### Discipline Colors
- 🏊 Swim: Blue (#007AFF)
- 🚴 Bike: Green (#34C759)
- 🏃 Run: Orange (#FF9500)
- 🔄 Brick: Purple (#AF52DE)
- 💪 Strength: Red (#FF3B30)
- 😴 Rest: Gray (#8E8E93)

### Typography
- **Title**: 20-24px, bold
- **Subtitle**: 16-18px, semi-bold
- **Body**: 14-16px, regular
- **Label**: 12-14px, regular

### Spacing
- Container padding: 16-20px
- Section margins: 16-24px
- Card padding: 16-20px
- Button padding: 12-14px vertical

---

## 🔌 Integration Steps

### Step 1: Add to Navigation

```typescript
// In your navigation stack
import { TrainingPlanSelectionScreen } from '@/screens/Training';

// Add training screens to your navigator
<Stack.Screen 
  name="TrainingPlanSelection" 
  component={TrainingPlanSelectionScreen} 
/>

<Stack.Screen 
  name="TrainingCalendar" 
  component={TrainingCalendarScreen} // Create wrapper screen
/>
```

### Step 2: Create Training Calendar Screen

Create `src/screens/Training/TrainingCalendarScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TrainingCalendar, WorkoutDetailModal } from '@/components/training';
import type { WorkoutWithCompletion } from '@/types/trainingPlans';

export const TrainingCalendarScreen = ({ route }) => {
  const { planId, currentWeek } = route.params;
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithCompletion | null>(null);

  return (
    <View style={styles.container}>
      <TrainingCalendar
        planId={planId}
        currentWeek={currentWeek}
        onWorkoutPress={setSelectedWorkout}
      />
      
      <WorkoutDetailModal
        visible={selectedWorkout !== null}
        workout={selectedWorkout}
        planId={planId}
        onClose={() => setSelectedWorkout(null)}
        onWorkoutUpdated={() => {
          // Trigger calendar refresh
          setSelectedWorkout(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
```

### Step 3: Add to Dashboard

Update your dashboard to include the progress widget:

```typescript
// In WebDashboard.tsx or DashboardScreen.tsx
import { TrainingPlanProgressWidget } from '@/components/dashboard/TrainingPlanProgressWidget';

// Inside your dashboard render:
<TrainingPlanProgressWidget
  userId={currentUser.id}
  onViewDetails={() => navigation.navigate('TrainingCalendar', {
    planId: activePlan.id,
    currentWeek: activePlan.current_week
  })}
/>
```

### Step 4: Create User Plan Flow

When user selects a template, create their training plan:

```typescript
import { trainingPlanService } from '@/services/trainingPlanService';

const handleSelectPlan = async (template: TrainingPlanTemplate) => {
  try {
    // Optional: Link to a race
    const raceId = await showRaceSelectionModal(); // Your custom modal
    
    const result = await trainingPlanService.createUserTrainingPlan({
      user_id: currentUser.id,
      template_id: template.id,
      plan_name: template.name,
      start_date: calculateStartDate(), // Your logic (e.g., next Monday)
      end_date: calculateEndDate(template.duration_weeks),
      current_week: 1,
      planned_race_id: raceId, // Optional
    });

    if (result.data) {
      navigation.navigate('TrainingCalendar', {
        planId: result.data.id,
        currentWeek: 1
      });
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to create training plan');
  }
};
```

---

## 🧪 Testing the UI

### Manual Testing Checklist

**Plan Selection Screen**:
- [ ] Templates load from database
- [ ] Distance filter works (sprint, olympic, etc.)
- [ ] Experience filter works (beginner, intermediate, advanced)
- [ ] Template cards display correctly
- [ ] Detail modal shows full information
- [ ] "Start This Plan" triggers onSelectPlan callback

**Training Calendar**:
- [ ] Week navigation works (previous/next)
- [ ] 7 workout cards display for each week
- [ ] Discipline colors show correctly
- [ ] Completion indicators appear (✓, ⊘, !)
- [ ] Tapping workout opens detail modal
- [ ] Week stats calculate correctly

**Workout Detail Modal**:
- [ ] Workout details display (structure, notes, goals)
- [ ] Complete form allows input (duration, distance, effort)
- [ ] Skip form allows reason input
- [ ] Completion saves to database
- [ ] Modal closes after save
- [ ] Calendar refreshes after completion

**Progress Widget**:
- [ ] Shows "No active plan" when no plan exists
- [ ] Displays current week correctly
- [ ] Completion percentage calculates
- [ ] Adherence rate shows
- [ ] Upcoming workouts preview displays
- [ ] "View Calendar" navigates correctly

---

## 🚀 Next Steps

### Priority Features to Add

1. **Plan Management Screen** - View all user plans, pause/resume/delete
2. **Weekly Summary View** - Alternative to calendar grid
3. **Workout Notes History** - View past workout logs
4. **Strava Integration UI** - Auto-match activities to workouts
5. **Training Load Chart** - Visualize training stress over time
6. **Plan Customization** - Allow users to modify workouts

### Enhancement Ideas

- **Notifications**: Remind users of today's workouts
- **Achievements**: Badges for streaks, milestones
- **Social Features**: Share workouts with friends
- **Export**: Download plan as PDF/CSV
- **Offline Mode**: Cache workouts for offline access
- **Apple Health/Google Fit**: Sync completed workouts

---

## 📝 Component Props Reference

### TrainingPlanSelectionScreen
```typescript
interface TrainingPlanSelectionScreenProps {
  onSelectPlan?: (template: TrainingPlanTemplate) => void;
}
```

### TrainingCalendar
```typescript
interface TrainingCalendarProps {
  planId: string;
  currentWeek: number;
  onWorkoutPress: (workout: WorkoutWithCompletion) => void;
  onWeekChange?: (weekNumber: number) => void;
}
```

### WorkoutDetailModal
```typescript
interface WorkoutDetailModalProps {
  visible: boolean;
  workout: WorkoutWithCompletion | null;
  planId: string;
  onClose: () => void;
  onWorkoutUpdated?: () => void;
}
```

### TrainingPlanProgressWidget
```typescript
interface TrainingPlanProgressWidgetProps {
  userId: string;
  onViewDetails?: () => void;
}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/types/trainingPlans'"
**Solution**: Ensure TypeScript path aliases are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "Network request failed" when loading templates
**Solution**: Check Supabase connection in `src/services/supabase.ts`. Ensure RLS policies allow public read access to `training_plan_templates`.

### Issue: Workout completion not saving
**Solution**: This requires authentication. User must be logged in and `auth.uid()` must match the plan's `user_id`. Check RLS policies on `workout_completions` table.

### Issue: Progress widget shows "No active plan" when plan exists
**Solution**: Ensure the plan `status` is set to `'active'` (not `'paused'` or `'completed'`). Check with:
```sql
SELECT status FROM user_training_plans WHERE user_id = 'YOUR_USER_ID';
```

---

## 📚 Related Documentation

- **TRAINING_PLAN_ENGINE.md** - Database schema and service layer
- **src/types/trainingPlans.ts** - TypeScript type definitions
- **src/services/trainingPlanService.ts** - API service functions

---

*Last Updated: October 1, 2025*  
*Status: UI Complete - Ready for Integration*

---

## 🎨 Recent Updates (October 2, 2025)

### Gradient Button Styling
All primary action buttons in the Training Plan feature now use the app's signature gradient style (blue-to-orange) to match the Quick Actions section:

**Updated Components**:
- **TrainingPlanProgressWidget**: "View Calendar" and "Start a Plan" buttons
- **TrainingCalendar**: "Back to Dashboard" button

**Implementation**: Uses `expo-linear-gradient` with colors `['#3B82F6', '#F97316']` (blue-500 to orange-500)

### Tabler Icons Integration
Replaced emoji-based discipline icons with colored Tabler Icons for consistency:

**Icon Mapping**:
- 🏊 Swim → `TbSwimming` (blue #007AFF)
- 🚴 Bike → `TbBike` (orange #FF9500)
- 🏃 Run → `TbRun` (green #34C759)
- 🔄 Brick → `TbFlame` (purple #AF52DE)
- 💪 Strength → `TbWeight` (red #FF3B30)
- 😴 Rest → `TbBed` (gray #8E8E93)

**Components Updated**:
- `TrainingPlanProgressWidget.tsx`
- `TrainingCalendar.tsx`

### Dark Theme Consistency
All Training Plan screens now follow the app's dark glassmorphism theme:
- Background: `#1a1a1a`
- Widget backgrounds: `rgba(255, 255, 255, 0.05)`
- Borders: `rgba(255, 255, 255, 0.1)`
- Header bars: Dark with white text

### Navigation Improvements
- Added "Back to Dashboard" button in TrainingCalendar
- Fixed navigation state management with proper `useRouter` implementation
- Improved planId validation to prevent UUID errors

