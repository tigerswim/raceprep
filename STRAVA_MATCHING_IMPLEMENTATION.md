# Strava Workout Matching Implementation

**Implementation Date**: January 12, 2025
**Status**: ✅ Complete and Deployed

## Overview

RacePrep now features an intelligent Strava-to-training-plan workout matching system that automatically suggests which Strava activities correspond to scheduled training plan workouts, allowing users to mark workouts complete with a single tap.

## Problem Solved

Previously, users had to manually track workout completions even when they were logging activities to Strava. This created duplicate data entry and made it difficult to track training plan adherence. The new system bridges the gap between Strava activities and planned workouts.

## Solution Architecture

### 1. Matching Algorithm

**Scoring System** (100 points maximum):
- **Date Proximity** (40 points): How close the activity date is to the scheduled workout date
  - Same day: 40 points
  - 1 day off: 30 points
  - 2 days off: 20 points
  - 3+ days off: 10 points

- **Discipline Match** (30 points): Does the activity type match the workout discipline?
  - Perfect match: 30 points
  - Related match (e.g., "VirtualRide" for bike): 20 points
  - No match: 0 points

- **Duration Similarity** (20 points): How close is the activity duration to planned duration?
  - Within 10%: 20 points
  - Within 25%: 15 points
  - Within 50%: 10 points
  - More than 50% off: 5 points

- **Distance Similarity** (10 points): How close is the activity distance to planned distance?
  - Same scoring as duration

**Confidence Levels**:
- **High Confidence**: 80-100 points (strong match, likely correct)
- **Medium Confidence**: 50-79 points (possible match, needs review)
- **Low Confidence**: 40-49 points (weak match, probably not correct)

### 2. Database Schema

**New Table**: `strava_activities`

```sql
CREATE TABLE public.strava_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  strava_activity_id BIGINT UNIQUE,

  -- Activity metadata
  name TEXT,
  type TEXT,
  sport_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,

  -- Performance metrics
  distance_meters NUMERIC,
  moving_time_seconds INTEGER,
  elapsed_time_seconds INTEGER,
  total_elevation_gain_meters NUMERIC,

  -- Advanced metrics (optional)
  average_heartrate NUMERIC,
  max_heartrate NUMERIC,
  average_watts NUMERIC,
  max_watts NUMERIC,
  average_cadence NUMERIC,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Security**: Row Level Security (RLS) policies ensure users only see their own activities.

### 3. Service Layer

**File**: `src/services/trainingPlanService.ts`

**New Functions**:

1. **`findStravaMatches(planId, daysBack)`**
   - Retrieves scheduled workouts from past N days
   - Retrieves Strava activities from past N days
   - Calculates match scores for all combinations
   - Groups matches by confidence level
   - Returns high/medium/low confidence matches plus unmatched items

2. **`calculateMatchScore(workout, activity)`**
   - Implements the 100-point scoring algorithm
   - Returns match object with:
     - Confidence percentage
     - Match reasons (why it's a good match)
     - Warnings (why it might not be perfect)

3. **`acceptStravaMatch(workoutId, planId, stravaActivityId)`**
   - Retrieves Strava activity details
   - Creates workout_completion record
   - Links to strava_activity_id
   - Marks workout as complete with actual performance data

### 4. User Interface

**File**: `src/app/strava-match-review.tsx`

**Features**:
- Custom dark-themed header matching Training Calendar design
- Three sections: High/Medium/Low Confidence
- Side-by-side comparison cards showing:
  - Planned workout details (discipline, duration, distance)
  - Strava activity details (actual performance)
  - Match confidence percentage
  - Match reasons and warnings
- Accept/Reject buttons for each match
- "Accept All High-Confidence Matches" batch processing
- Real-time UI updates after accepting matches
- Loading states and error handling

**Access**: Strava icon button in Training Calendar header

### 5. Type Definitions

**File**: `src/types/trainingPlans.ts`

**New Interfaces**:

```typescript
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
  // ... additional metrics
}

export interface WorkoutStravaMatch {
  workout: WorkoutWithCompletion;
  activity: StravaActivity;
  confidence: number;
  matchReasons: string[];
  warnings?: string[];
}

export interface StravaMatchResult {
  highConfidence: WorkoutStravaMatch[];
  mediumConfidence: WorkoutStravaMatch[];
  lowConfidence: WorkoutStravaMatch[];
  unmatchedActivities: StravaActivity[];
  unmatchedWorkouts: WorkoutWithCompletion[];
}
```

## User Workflow

1. User creates/selects a training plan with scheduled workouts
2. User completes workouts and logs them to Strava
3. User navigates to Training Calendar
4. User taps Strava icon to review matches
5. System displays suggested matches grouped by confidence
6. User reviews high-confidence matches
   - Option A: Accept individual matches
   - Option B: "Accept All High-Confidence Matches"
7. User reviews medium-confidence matches if needed
8. Accepted matches automatically mark workouts complete
9. Training Calendar updates to show completion status

## Technical Implementation Details

### Preventing Duplicate Matches
- Each Strava activity can only match to one workout
- Each workout can only be matched to one activity
- Database unique constraint on (user_id, strava_activity_id)

### Performance Optimization
- Indexes on user_id and start_date for fast queries
- Only queries activities from past N days (default: 14 days)
- Efficient scoring algorithm with early termination

### Error Handling
- Missing Strava activities gracefully handled
- Missing workout data shows appropriate warnings
- Network errors display user-friendly messages
- Failed matches can be retried

## UI Design Consistency

The Strava Match Review screen maintains design consistency with Training Calendar:
- Custom dark-themed header
- Same back button styling
- Matching color scheme
- Consistent typography and spacing
- Mobile-responsive layout

## Files Changed/Created

### Created
- `src/app/strava-match-review.tsx` - Match review UI
- `supabase/migrations/015_create_strava_activities_table.sql` - Database migration

### Modified
- `src/services/trainingPlanService.ts` - Added matching functions
- `src/types/trainingPlans.ts` - Added Strava types
- `src/components/training/TrainingCalendar.tsx` - Added Strava button, scheduled dates
- `README.md` - Updated feature documentation
- `CHANGELOG_TECHNICAL.md` - Documented changes
- `DEVELOPMENT_PLAN.md` - Updated training plan status

## Future Enhancements

Potential improvements for future iterations:

1. **Automatic Matching**: Option to auto-accept high-confidence matches
2. **Match History**: Track which matches were accepted/rejected
3. **Learning Algorithm**: Improve scoring based on user preferences
4. **Bulk Import**: Process multiple weeks of Strava activities at once
5. **Custom Rules**: Allow users to set matching preferences
6. **Match Notifications**: Alert users when new matches are available
7. **Undo Functionality**: Reverse accepted matches if incorrect

## Testing

**Manual Testing Completed**:
- ✅ Match scoring algorithm with various scenarios
- ✅ UI rendering with different confidence levels
- ✅ Accept/reject workflow
- ✅ Database migration applied successfully
- ✅ Back button styling consistency
- ✅ Error handling with missing table (fixed)

**Test Scenarios**:
- Same-day exact match → High confidence (95-100%)
- Same discipline, close duration → High confidence (80-90%)
- Different day, same discipline → Medium confidence (60-75%)
- Wrong discipline but close date → Low confidence (40-50%)
- No activities in timeframe → Shows "No matches" message

## Known Issues

None currently. All reported issues have been resolved:
- ✅ Missing strava_activities table - Fixed with migration
- ✅ Back button styling - Now consistent with Training Calendar
- ✅ Scheduled dates not showing - Fixed in service layer

## Deployment

**Database Migration**: Applied via Supabase SQL Editor
**Frontend**: Auto-deployed via Expo/Netlify build process
**Environment Variables**: No new variables required
**Dependencies**: No new npm packages required

## Success Metrics

The feature is successful if:
- Users can see suggested Strava matches
- High-confidence matches are accurate (>90%)
- Workout completion is faster than manual entry
- Users track better adherence to training plans

---

**Built with**: React Native, TypeScript, Supabase, Expo Router
**Documentation**: This file, CHANGELOG_TECHNICAL.md, DEVELOPMENT_PLAN.md
