# Changelog

All notable changes to the RacePrep project will be documented in this file.

## [Unreleased] - 2025-12-26

### Added
- **Delete Manually Created Workouts** - Users can now delete workouts they've manually logged
  - Trash icon button on workout cards in Recent Workouts (Training → Overview)
  - Trash icon button on workout cards in Workout History (Training → Log Workout)
  - Confirmation dialog before deletion
  - Removes from both Supabase database and local display

- **Stacked Bar Chart for Monthly Training Volume** - Analytics now shows all disciplines
  - Each week column displays stacked color segments for swim, bike, and run
  - Swim (cyan #00D4FF), Bike (orange #FF6B35), Run (teal #4ECDC4)
  - Proportional heights based on hours per discipline
  - Replaces previous single-color "primary discipline" display

### Fixed
- **Timezone Bug for Workout Dates** - Dates now display correctly in user's local timezone
  - Fixed form default date using UTC instead of local time
  - Fixed date display in Recent Workouts showing previous day
  - Fixed date display in Workout History showing previous day
  - Added `parseLocalDateString()` helper for consistent local date parsing

- **Race Discovery City/State Search** - City and state combinations now work properly in Discover New Races
  - Changed geocoding from local server to direct Google Maps API calls
  - Eliminates dependency on local proxy server for race searches
  - City/state searches now geocode to zip codes for improved RunSignup API results
  - Maintains fallback to city/state parameters if geocoding fails
  - Expanded date range to search 12 months ahead (was only searching from today)
  - Added better logging to help debug searches with no results
  - Results now sorted by date ascending

### Improved
- **Demo User Training Data** - Demo user now has consistent recent training activities
  - Seed script now generates 2 weeks (14 days) of training data instead of 8 weeks
  - Ensures Performance Overview section on Dashboard always displays data for demo user
  - Guarantees new visitors see active, recent demo data when testing the app
  - Run `node scripts/seed-demo-user.js` to refresh demo user with latest 2 weeks of activities

- **Weather Widget Real-Time Data** - Weather Conditions section now fetches live weather data
  - Integrated OpenWeatherMap API for real-time weather information
  - Weather data (temperature, conditions, humidity, wind speed) now updates when location changes
  - Training conditions analysis (swim, bike, run) based on actual weather
  - Color-coded condition indicators: green (good), yellow (challenging), red (poor)
  - Overall conditions assessment updates dynamically based on temperature, wind, precipitation, and humidity

### Changed
- **Terminal Design Now Permanent** - Removed all conditional styling throughout the app
  - All screens, modals, and components now exclusively use terminal design
  - Removed `useTerminal` state variables and toggle functionality
  - Removed `useTerminalModeToggle` hook usage from components
  - Simplified codebase by eliminating legacy styling branches

### Updated Components (Terminal-Only)
- **All Modals**: AddResultModal, EditResultModal, AddCourseModal, EditCourseModal, RacePredictionModal, RaceComparisonModal, CourseDetailsModal, UserRaceManagement, AuthModal, ImportedRaceUpdateModal, WorkoutDetailModal, ConfirmDialog, UserRaceFormModal, RaceAnalysisModal
- **App Tabs**: training.tsx, planning.tsx, races.tsx, profile.tsx, _layout.tsx
- **Dashboard Widgets**: All widgets now use terminal versions exclusively
- **Screens**: TrainingPlanSelectionScreen, WebDashboard
- **Profile Page**: Complete terminal styling for all form fields, buttons, cards, and sections

---

## [Previous] - 2025-12-18

### Added
- **Landing Page** - New terminal-styled hero landing page for unauthenticated visitors
  - Compelling headline and CTA driving sign-ups
  - Dashboard preview screenshot with angled display and glow effect
  - Opens AuthModal in signup mode when CTA clicked
  - Authenticated users automatically redirect to dashboard
  - Files: `src/components/LandingPage.tsx`, `src/app/index.tsx`, `app/index.tsx`

- **Split-Flap Terminal Design System - Phase 3 Complete** ✅
  - Retro-futuristic terminal design system (airport departure board aesthetic)
  - **Phase 3 Complete**: All screens, navigation, and widgets migrated to terminal styling
  - Monospace typography with uppercase text and wider tracking
  - Hard edges (borderRadius: 0) instead of rounded corners
  - Terminal color palette: #0A0E14 background, accent-yellow (#FFD866), terminal borders (#1C2127)
  - Discipline colors: swim (#00D4FF), bike (#FF6B35), run (#4ECDC4)

### Phase 3 Completed (December 1-4, 2025)
- ✅ **Dashboard Screen**: Terminal header, background, widget layout
- ✅ **Races Screen**: Terminal-styled header, search, navigation buttons, race cards
  - ✅ **My Created Races Widget**: Complete terminal styling (Dec 4)
- ✅ **Training Screen**: Complete terminal mode implementation (Dec 4)
  - ✅ Overview card numbers with monospace fonts
  - ✅ Analytics section (8 major components with charts and stats)
  - ✅ Log Workout form and workout history cards
  - ✅ Training Plans section (TrainingPlanSelectionScreen)
- ✅ **Planning Screen**: Terminal header, mode toggles, planning tabs
- ✅ **Profile Screen**: Terminal-styled sections, navigation, forms containers
- ✅ **Navigation Bar**: Terminal colors (accent-yellow active), 2px borders, terminal-bg

### Technical Details (Terminal Design - Phase 3)
- **Branch**: `feature/split-flap-terminal-design` (merged to `main`)
- **Status**: Phase 3 (Screens & Navigation) complete - ready for Phase 4 (Modals & Forms)
- **Next Phase**: Phase 4 - Modals & Forms (AuthModal, race modals, goal modals, form inputs)

### Today's Updates (December 4, 2025)
- **Training Tab - Log Workout & History**: Complete terminal styling
  - Form inputs with monospace fonts and hard edges
  - Workout history cards with discipline-colored borders
  - Action buttons (EDIT/DELETE) with terminal colors
- **Training Tab - Training Plans**: Full TrainingPlanSelectionScreen terminal mode
  - Filter buttons with accent yellow active states
  - Plan cards with terminal badges and stats
  - Detail modal with complete terminal styling
- **Races Tab - My Created Races**: Complete widget terminal implementation
  - Search and filters with terminal inputs
  - Race cards with yellow borders for upcoming races
  - Distance and difficulty badges with terminal colors

### Files Modified (Phase 3)
- `src/components/WebDashboard.tsx`: Terminal header and background
- `app/(tabs)/races.tsx`: Complete terminal mode implementation
- `app/(tabs)/training.tsx`: Terminal styling for training screen (complete Dec 4)
- `app/(tabs)/planning.tsx`: Terminal mode for planning tools
- `app/(tabs)/profile.tsx`: Terminal styling for profile sections
- `app/(tabs)/_layout.tsx`: Terminal navigation bar colors and borders
- `src/screens/Training/TrainingPlanSelectionScreen.tsx`: Full terminal mode (Dec 4)
- `src/components/UserRaceManagement.tsx`: My Created Races terminal styling (Dec 4)

### Phase 1 & 2 Previously Completed
- **Phase 1**: Foundation & Components (TerminalCard, TerminalButton, ScanLineOverlay)
- **Phase 2**: Dashboard Widgets (Performance, Weather, Training Progress, Quick Actions, etc.)
- `src/utils/featureFlags.ts`: Feature flag system with master switch
- `tailwind.config.js`: Terminal color palette
- All dashboard widgets migrated to terminal mode

---

## [Unreleased] - 2025-01-18

### Fixed
- **Race Discovery - City Search**: City names now work in race search
  - Added Google Maps geocoding to convert city names to zip codes
  - "Chattanooga", "Atlanta", etc. now return results
  - Falls back gracefully to city/state parameters if geocoding unavailable
  - Enhanced search reliability for non-zip code locations

- **Race Distance Updates**: User's distance selection now persists correctly
  - Fixed data loading priority to respect user's choice over external race defaults
  - Distance changes (e.g., Sprint → Olympic) now save and display properly
  - Resolved issue where user_planned_races.distance_type was being overridden

### Technical Details
- **Files Modified**:
  - `app/(tabs)/races.tsx`: Added geocoding integration and fixed distance_type priority
  - `src/components/ImportedRaceUpdateModal.tsx`: Enhanced debug logging
- **Geocoding Integration**: Uses Google Maps API via local proxy to extract postal codes
- **Database**: Corrected data loading order to prioritize user preferences

---

## [Previous Release] - 2024-12-09

### Added
- **Multi-Agent Development System**: Implemented specialized AI agents for frontend, backend, and code review
  - Frontend-developer agent for UI/UX enhancements and component development
  - Backend-developer agent for API and database work
  - Code-reviewer agent for debugging and issue resolution
  - Agent templates and setup guides for rapid development

- **Enhanced Dashboard Analytics**:
  - SVG-based training trend charts with interactive tooltips
  - 7-day training time visualization with stacked area charts
  - Week-over-week performance comparisons
  - Glassmorphism design integration with backdrop blur effects
  - Mobile-responsive chart scaling and touch-friendly interactions

- **Comprehensive Strava Integration Fixes**:
  - Added 14 missing database columns for enhanced performance metrics
  - Fixed upsert conflict resolution with proper onConflict strategy
  - Enhanced training session data with heart rate, power, cadence, and elevation metrics
  - Improved error handling and debugging capabilities

### Fixed
- **Database Schema Issues**: Resolved 409 Conflict errors in Strava sync
  - Added missing columns: `name`, `average_speed`, `total_elevation_gain`, `average_heartrate`, `max_heartrate`, `average_watts`, `trainer`, `sport_type`, `suffer_score`, `elapsed_time`, `average_cadence`, `start_latlng`, `kudos_count`
  - Fixed bulkUpsert function with proper conflict resolution on `strava_activity_id`
  - Applied database migration scripts for schema consistency

- **Strava Sync Reliability**: Eliminated data insertion failures and improved sync success rate
  - Enhanced error logging and timeout handling
  - Improved activity transformation and filtering logic
  - Better handling of duplicate activities and conflict resolution

### Improved
- **Development Workflow**: Multi-agent system enables parallel development and specialized expertise
- **Code Quality**: Enhanced debugging capabilities and systematic issue resolution
- **User Experience**: More detailed training analytics and visual performance insights
- **Documentation**: Updated README with latest features and development progress

### Technical Details
- **Files Modified**:
  - `src/services/supabase.ts`: Enhanced bulkUpsert with conflict resolution
  - `src/components/dashboard/PerformanceOverviewWidget.tsx`: Added SVG training charts
  - Database schema: Added 14 new columns to training_sessions table
  - `README.md`: Updated feature list and development progress

- **Database Changes**:
  - Enhanced training_sessions table with comprehensive Strava metrics
  - Improved unique constraints and indexing for performance
  - Added proper RLS policies for secure data access

---

## Previous Releases

### [Phase 2 Core Features] - 2024-11-XX
- Complete profile management with goals and statistics
- Advanced race planning and nutrition tools
- Comprehensive training data integration (Strava)
- Race discovery and management system
- Planning tools with race-specific features

### [Phase 1 MVP] - 2024-10-XX
- Project setup and configuration
- Core UI components and design system
- Basic navigation structure and dashboard layout
- Redux store configuration
- Supabase backend setup with full database schema
- Complete user authentication system
- Race discovery with RunSignup API integration
- Strava integration with OAuth2 + activity sync
- Full profile management system
- User goals and tracking system
- Netlify deployment with working API redirects
- Jest testing framework with passing service tests