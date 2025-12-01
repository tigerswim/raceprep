# Changelog

All notable changes to the RacePrep project will be documented in this file.

## [Unreleased] - 2025-12-01

### Added (In Development)
- **Split-Flap Terminal Design System - In Progress** 🚧
  - New retro-futuristic terminal design system (airport departure board aesthetic)
  - Feature flag system for safe gradual rollout
  - Terminal color palette: deep navy-black background, cream white text, cyan/coral/turquoise discipline colors
  - Base components: TerminalCard, TerminalButton, ScanLineOverlay
  - Terminal mode implementations for dashboard widgets:
    - Performance Overview with terminal-styled layout
    - Weather Widget with monospace text and terminal aesthetics
    - Training Plan Progress with vertical stats on mobile
    - Latest Race Performance with terminal design
    - Quick Actions with consistent terminal buttons
  - All features controlled by feature flags for safe deployment
  - See `PHASE_1_COMPLETION_SUMMARY.md` for full details

### Technical Details (Terminal Design)
- **Branch**: `feature/split-flap-terminal-design`
- **Files Created**:
  - `src/utils/featureFlags.ts`: Feature flag system with master switch and individual widget controls
  - `src/components/ui/terminal/TerminalCard.tsx`: Hard-edged card component
  - `src/components/ui/terminal/TerminalButton.tsx`: Monospace button component
  - `src/components/ui/terminal/ScanLineOverlay.tsx`: Subtle scan line effect (web-only)
  - `src/components/ui/terminal/index.ts`: Barrel exports
  - `src/components/dashboard/WeatherWidget.terminal.tsx`: Terminal mode weather display
  - `PHASE_1_COMPLETION_SUMMARY.md`: Complete phase 1 documentation
- **Files Modified**:
  - `tailwind.config.js`: Added terminal color palette and updated monospace font stack
  - `app/_layout.tsx`: Added terminal background and scan line overlay (controlled by flags)
  - `src/components/dashboard/PerformanceOverviewWidget.tsx`: Added terminal mode support
  - `src/components/dashboard/TrainingPlanProgressWidget.tsx`: Mobile layout improvements
  - `src/components/dashboard/LatestRacePerformanceWidget.tsx`: Terminal mode integration
  - `src/components/dashboard/QuickActionsWidget.tsx`: Terminal button consistency
  - `TERMINAL_DESIGN_CHECKLIST.md`: Updated with progress status
- **Status**: Foundation complete, widget migration in progress
- **Next**: Complete remaining widget migrations and polish terminal mode

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