# Changelog

All notable changes to the RacePrep project will be documented in this file.

## [Unreleased] - 2025-12-01

### Added
- **Split-Flap Terminal Design System - Phase 3 Complete** ✅
  - Retro-futuristic terminal design system (airport departure board aesthetic)
  - **Phase 3 Complete**: All screens and navigation migrated to terminal styling
  - Monospace typography with uppercase text and wider tracking
  - Hard edges (borderRadius: 0) instead of rounded corners
  - Terminal color palette: #1a1a1a background, accent-yellow (#fbbf24), terminal borders (#333333)
  - Feature flag system for safe gradual rollout

### Phase 3 Completed (Screens & Navigation)
- ✅ **Dashboard Screen**: Terminal header, background, widget layout
- ✅ **Races Screen**: Terminal-styled header, search, navigation buttons, race cards
- ✅ **Training Screen**: Terminal header, tab navigation, calendar, stats
- ✅ **Planning Screen**: Terminal header, mode toggles, planning tabs
- ✅ **Profile Screen**: Terminal-styled sections, navigation, forms containers
- ✅ **Navigation Bar**: Terminal colors (accent-yellow active), 2px borders, terminal-bg

### Technical Details (Terminal Design - Phase 3)
- **Branch**: `feature/split-flap-terminal-design` (merged to `main`)
- **Status**: Phase 3 (Screens & Navigation) complete - ready for Phase 4 (Modals & Forms)
- **Next Phase**: Phase 4 - Modals & Forms (AuthModal, race modals, goal modals, form inputs)

### Files Modified (Phase 3)
- `src/components/WebDashboard.tsx`: Terminal header and background
- `app/(tabs)/races.tsx`: Complete terminal mode implementation
- `app/(tabs)/training.tsx`: Terminal styling for training screen
- `app/(tabs)/planning.tsx`: Terminal mode for planning tools
- `app/(tabs)/profile.tsx`: Terminal styling for profile sections
- `app/(tabs)/_layout.tsx`: Terminal navigation bar colors and borders

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