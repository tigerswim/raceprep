# Technical Changelog - RacePrep

## Recent Updates (January 2025)

### 🎨 Terminal Design & Dashboard Improvements (January 19, 2026)

#### Dashboard Layout Optimization
- **REMOVED**: Goals Progress widget from dashboard (`src/components/WebDashboard.tsx`)
  - Removed import and component reference for `GoalsProgressWidget`
  - Consolidated dashboard into single 2-column grid for consistent layout
- **FIXED**: Dashboard section width consistency
  - All widgets now use same grid layout (`grid-cols-1 lg:grid-cols-2`)
  - Weather widget moved into main grid instead of separate container
  - Quick Actions resized to match other sections (2-column instead of 4-column)
- **FIXED**: Performance Overview widget margin issue
  - Removed `margin: 10` from widget container (`src/components/dashboard/PerformanceOverviewWidget.terminal.tsx:366`)
  - Widget now aligns properly with other dashboard sections

#### Terminal Design Consistency
- **UPDATED**: Create Training Plan page to terminal design (`src/app/create-training-plan.tsx`)
  - Applied terminal color palette: `bg: #0A0E14`, `panel: #0F1419`, `border: #1C2127`, `yellow: #FFD866`
  - All text converted to monospace font with uppercase styling
  - Form labels with `>` prefix (terminal prompt style)
  - Square borders (borderRadius: 0) throughout
  - Yellow accent color for labels and primary button
  - Terminal-style headers and error states

- **UPDATED**: Training Calendar to full terminal design
  - Screen wrapper (`app/training-calendar.tsx`): Terminal header, colors, and error states
  - Calendar component (`src/components/training/TrainingCalendar.tsx`):
    - All discipline colors updated to terminal palette: swim `#00D4FF`, bike `#FF6B35`, run `#4ECDC4`
    - Dark terminal backgrounds and borders throughout
    - Monospace font family with uppercase text and letter spacing
    - Square buttons and cards (borderRadius: 0)
    - Navigation buttons: yellow background for active, border style for disabled
    - Stats display with yellow values and monospace styling
    - Modal forms with terminal input styling and borders

- **UPDATED**: Workout Detail Modal to terminal design (`src/components/training/WorkoutDetailModal.tsx`)
  - Converted all style references to use existing `terminalStyles` object
  - Updated discipline color functions to match terminal palette
  - Removed old `styles` StyleSheet object (no longer used)
  - All sections, forms, buttons now use terminal styling
  - Consistent monospace fonts and square borders throughout modal

#### Demo User Data System
- **ENHANCED**: Auto-updating demo training data (`scripts/seed-demo-user.js`)
  - Generates rolling 12-week window: 4 weeks past + 8 weeks future
  - Creates ~120 training sessions with realistic triathlon schedule
  - Dates dynamically calculated from current date (never goes stale)
  - Weekly pattern: Mon (swim/run), Tue (bike), Wed (swim/run), Thu (bike), Fri (swim/run), Sat (long bike/run), Sun (rest)
  - Simply re-run script to refresh demo data with current dates
  - Updated documentation in script comments

#### Files Modified
- `src/components/WebDashboard.tsx` - Dashboard layout improvements
- `src/components/dashboard/PerformanceOverviewWidget.terminal.tsx` - Fixed margin
- `src/app/create-training-plan.tsx` - Terminal design implementation
- `app/create-training-plan.tsx` - Synced with src version
- `app/training-calendar.tsx` - Terminal header and error states
- `src/components/training/TrainingCalendar.tsx` - Full terminal styling
- `src/components/training/WorkoutDetailModal.tsx` - Terminal design consistency
- `scripts/seed-demo-user.js` - Auto-updating rolling window data generation

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