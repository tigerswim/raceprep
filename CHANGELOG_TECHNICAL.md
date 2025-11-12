# Technical Changelog - RacePrep

## Recent Updates (January 2025)

### 🚀 Training Plan & Strava Integration (January 12, 2025)

#### Strava Workout Matching System
- **ADDED**: Intelligent Strava-to-training-plan matching algorithm
  - 100-point scoring system: 40pts date proximity, 30pts discipline match, 20pts duration similarity, 10pts distance similarity
  - Confidence-based grouping: High (80-100%), Medium (50-79%), Low (40-49%)
  - Prevents duplicate matches (one activity = one workout max)
  - New service functions in `src/services/trainingPlanService.ts`:
    - `findStravaMatches()`: Analyzes past N days of workouts and Strava activities
    - `calculateMatchScore()`: Scores potential matches across multiple dimensions
    - `acceptStravaMatch()`: Creates workout completion with Strava activity data
- **ADDED**: Strava Match Review UI (`src/app/strava-match-review.tsx`)
  - Custom dark-themed header matching Training Calendar design
  - Side-by-side comparison of planned workout vs Strava activity
  - Accept/reject individual matches with real-time feedback
  - "Accept All High-Confidence Matches" batch processing
  - Match reasons and warnings display for transparency
  - Accessible via Strava icon button in Training Calendar header
- **ADDED**: Database table `strava_activities`
  - Migration: `supabase/migrations/015_create_strava_activities_table.sql`
  - Caches Strava activity data for efficient matching
  - Includes all performance metrics: distance, duration, elevation, heart rate, power, cadence
  - Row Level Security (RLS) policies ensure users only see their own activities
  - Indexes on user_id and start_date for optimized queries
  - Unique constraint on (user_id, strava_activity_id) prevents duplicates
- **ADDED**: New TypeScript interfaces in `src/types/trainingPlans.ts`
  - `StravaActivity`: Complete activity data structure
  - `WorkoutStravaMatch`: Match result with confidence and reasoning
  - `StravaMatchResult`: Grouped matches by confidence level

#### Training Calendar Enhancements
- **FIXED**: Scheduled dates now display on workout cards
  - Updated `getScheduledWorkouts()` in `trainingPlanService.ts` to include `scheduled_date` field
  - Training Calendar now shows "Jan 12" format dates for each workout
  - Helps users track progress and know where they are in their plan
- **IMPROVED**: Training Calendar header
  - Added Strava sync button (orange Strava icon) for quick access to matches
  - Maintains custom dark-themed header design
  - Consistent back button styling across Training Calendar and Strava Matches pages

#### Training Plan Creation
- **VERIFIED**: Start date selection already implemented
  - Users can set plan start date when creating new training plans
  - Default start date automatically set to next Monday
  - Implementation in `src/app/create-training-plan.tsx`

## Previous Updates (September 2024)

### 🚀 Major Improvements

#### Dashboard UX Enhancements (September 16, 2024)
- **FIXED**: Profile icon navigation in dashboard header
  - Converted static div to interactive button with router navigation to Profile tab
  - Added hover effects and smooth transitions for better UX
- **IMPROVED**: Performance Overview Widget metrics clarity
  - Removed meaningless cross-discipline metrics (Distance and Avg Speed)
  - Simplified grid from 4 columns to 2 columns for better focus
  - Kept Activities and Total Time metrics which are meaningful across swim/bike/run
- **ENHANCED**: Mobile Safari geolocation support in Weather Widget
  - Improved mobile device detection with specific Safari handling
  - Adjusted geolocation options for mobile compatibility (lower accuracy, longer timeout)
  - Added comprehensive error messaging with Safari-specific troubleshooting hints
  - Implemented loading spinner feedback for better user experience
  - Updated default location messaging to guide users to tap locate button

#### Code Quality & Stability (September 12, 2024)
- **FIXED**: Critical duplicate key error in `src/services/supabase.ts:652`
  - Consolidated duplicate `users` objects into single implementation
  - Merged all user database helper methods: `getProfile`, `updateProfile`, `createProfile`, `getCurrent`, `update`, `create`
- **FIXED**: 13 JSX unescaped entities errors across components
  - Updated `AddResultModal.tsx`, `AuthModal.tsx`, `EditResultModal.tsx`, `RaceSpecificPlanning.tsx`, `races.tsx`
  - Replaced `"` with `&quot;` in JSX strings
- **FIXED**: useCallback dependency issues and syntax errors
  - Restructured `profile.tsx` and `races.tsx` useCallback implementations
  - Added proper dependency arrays and function ordering
- **RESULT**: Reduced from 42 problems (13 errors, 29 warnings) to 30 problems (0 errors, 30 warnings)

#### Testing Infrastructure Setup (September 12, 2024)
- **Added**: Complete Jest testing environment
  - Jest 30.1.3 with React Native preset
  - React Native Testing Library integration
  - Test setup with mocks for Expo components
- **Added**: Service test coverage
  - `src/services/__tests__/supabase.test.ts`: 7/7 tests passing
  - Database helpers validation for users, goals, and race results
- **Added**: Component test structure
  - `src/components/__tests__/AuthModal.test.tsx`
  - Basic component rendering and interaction tests
- **Added**: Test scripts in package.json
  - `npm test`, `npm run test:watch`, `npm run test:coverage`

#### Backend Integration (Active)
- **RunSignup API**: Fully functional race discovery
  - API server running on port 3001
  - Active triathlon race queries across multiple locations
  - Comprehensive race data including course details and registration info
- **Supabase Database**: Complete integration
  - User authentication system
  - Profile management
  - Race planning and goals tracking
  - User settings and preferences

### 🔧 Technical Details

#### Fixed Files
- `/app/(tabs)/profile.tsx`: useCallback restructuring, function consolidation
- `/app/(tabs)/races.tsx`: JSX entities, useCallback dependencies  
- `/src/services/supabase.ts`: Duplicate key resolution, method consolidation
- `/src/components/AddResultModal.tsx`: JSX entities fix
- `/src/components/AuthModal.tsx`: JSX entities fix
- `/src/components/EditResultModal.tsx`: JSX entities fix
- `/src/components/RaceSpecificPlanning.tsx`: JSX entities fix

#### New Files Added
- `/jest.config.js`: Jest configuration for React Native
- `/src/test/setup.ts`: Test environment setup with mocks
- `/src/services/__tests__/supabase.test.ts`: Service test suite
- `/src/components/__tests__/AuthModal.test.tsx`: Component test suite
- `/src/components/__tests__/simple.test.tsx`: Basic test validation

#### Development Workflow Improvements
- **Cache Management**: Implemented proper Metro bundler cache clearing
- **Error Resolution**: Systematic approach to syntax error identification and fixing
- **Dependency Management**: useCallback patterns and React hooks optimization
- **Code Organization**: Function ordering and dependency cycle prevention

### 📊 Current Status

#### Application Status
- ✅ **Web App**: Loading successfully at http://localhost:8081
- ✅ **API Server**: Running on http://localhost:3001 with active RunSignup integration
- ✅ **Database**: Supabase connection active and validated
- ✅ **Authentication**: User auth system functional
- ✅ **Core Features**: Race discovery, profile management, planning tools

#### Code Quality Metrics
- **ESLint**: 0 errors, 30 warnings (significant improvement from 42 problems)
- **TypeScript**: All type definitions working correctly
- **Test Coverage**: Service layer 100%, component layer in progress
- **Bundle Status**: Clean builds without syntax errors

#### Known Issues
- Jest version compatibility warning (using 30.1.3 vs recommended 29.7.0)
- Minor styling warnings for shadow props and pointerEvents
- Some component tests need refinement for text matching
- Remaining useEffect dependency warnings in 2 files

### 🎯 Next Steps

1. **Component Test Reliability**: Improve React Native testing library text matching
2. **Remaining Warnings**: Address final useEffect dependency warnings
3. **Jest Version**: Consider downgrading to recommended version if needed
4. **Performance Optimization**: Bundle size analysis and optimization
5. **Feature Completion**: Transition analytics, course database integration

### 🛠️ Development Commands

```bash
# Start full development environment
cd server && node server.js &  # API server (port 3001)
npm start                       # Expo dev server (port 8081)

# Testing
npm test                        # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report

# Quality checks
npm run lint                   # ESLint analysis
npx expo start --clear         # Clear cache restart
```

---

**Updated**: September 16, 2024
**Status**: Production-ready with enhanced mobile support and improved dashboard UX