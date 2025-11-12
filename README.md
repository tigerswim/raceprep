# RacePrep

**"The only triathlon app that understands your race as a complete event, not three separate sports."**

RacePrep is a mobile-first triathlon tracking application designed for beginner to intermediate triathletes. Unlike existing platforms, RacePrep provides integrated race analysis, environmental performance modeling, and predictive analytics tailored specifically for multi-sport endurance events.

## Features

### 🏊‍♂️ Comprehensive Race Analysis
- **Transition Analytics**: Dedicated widget tracking T1/T2 across all races with optimization tips
- **Age Group Comparison**: Percentile rankings vs. age group averages for all disciplines
- **Interactive Race Timeline**: Stacked visualization showing time distribution across swim→T1→bike→T2→run
- **Split Breakdowns**: Complete swim, bike, run performance tracking with color-coded performance indicators
- **Performance Insights**: AI-powered recommendations based on actual performance data
- **Personal Bests Widget**: Track PRs across all race distances with recent achievement tracking

### 🗺️ Race Discovery & Management
- **User-Created Races**: Custom race creation with comprehensive validation
- **Race Discovery**: Integration with RunSignup API for finding races
- **Race Details**: Distance type, location, date tracking

### 📋 Race Planning Tools
- **Nutrition Planning**: Science-based fueling strategies for race day
- **Packing Lists**: Customizable T1/T2 setup checklists
- **Race Predictions**: AI-powered time predictions based on course and conditions

### 🚴‍♂️ Training Integration & Analytics
- **Strava Integration**: Automatic sync of swimming, cycling, and running activities
- **Intelligent Workout Matching** ⭐ NEW: AI-powered matching between Strava activities and training plan workouts
  - 100-point scoring algorithm analyzing date, discipline, duration, and distance
  - Confidence-based grouping (high/medium/low confidence matches)
  - User review and approval workflow with detailed match reasoning
  - Automatic workout completion upon match acceptance
- **Structured Training Plans**: Pre-built templates (Sprint/Olympic, Beginner/Intermediate)
  - Weekly calendar view with scheduled workout dates
  - Progress tracking and adherence metrics
  - Start date customization for flexible planning
- **Enhanced Performance Metrics**: Heart rate zones, power data, elevation gain, training stress
- **Interactive Workout Details**: Click any workout for comprehensive performance breakdown
- **Training Load Analysis**: Track weekly volume and intensity across all disciplines
- **SVG Training Charts**: Interactive 7-day trend visualization with glassmorphism design
- **Performance Dashboard**: Real-time analytics with week-over-week comparisons
- **Modern UI Components**: Tabler Icons (react-icons/tb) for consistent iconography across dashboard widgets
- **Enhanced Chart Visualizations**: Gradient-free bar charts with improved readability and vibrant orange cycling colors
- **Cross-Platform Icon Support**: Lucide React Native icons for web-compatible components

### 🔒 Security & Performance
- **Input Validation**: Comprehensive parameter sanitization to prevent injection attacks
- **Resource Protection**: Rate limiting and parameter validation on all database queries
- **Secure Data Handling**: Validated and sanitized user inputs across all endpoints
- **Streamlined Dashboard**: Optimized data loading with security hardening
- **Enhanced Backend Services**: Request batching, connection pooling, and performance monitoring
- **User-Created Races**: Comprehensive race management with RLS security policies

### 🛡️ Privacy & Data Protection
- **Strava API Compliance**: Full adherence to Strava data usage guidelines and branding requirements
- **Data Export Rights**: Complete user data export in JSON/CSV formats for portability
- **48-Hour Data Deletion**: Automated deletion scheduling per Strava API requirements
- **"Powered by Strava" Attribution**: Proper branding on all Strava-sourced content
- **User Data Transparency**: Clear visibility into what data is collected and how it's used
- **GDPR Compliance**: Right to data portability and erasure for all user information

### 🤖 Development Innovation
- **Multi-Agent System**: Specialized AI agents for frontend, backend, and code review
- **Agent Templates**: Copy-paste agent descriptions for rapid development
- **Parallel Execution**: Multiple agents working simultaneously on different features
- **Comprehensive Debugging**: Advanced error tracking and resolution workflows

### 📱 Beautiful Mobile Experience
- **Native iOS & Android**: Smooth, responsive performance
- **Dark Theme**: Modern glassmorphism design optimized for readability
- **Offline Support**: Core features work without internet connection

## 📖 Documentation Guide

**📋 See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for complete documentation catalog**

**New to this project? Start here:**

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ - Fast setup guide for Claude Code in Zed (START HERE)
2. **[CONTEXT.md](CONTEXT.md)** - Complete project context for AI assistants
3. **[.claude-session-template.md](.claude-session-template.md)** - Session starter templates
4. **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - Detailed roadmap and priorities
5. **[PHASE_2_COMPLETION_SUMMARY.md](PHASE_2_COMPLETION_SUMMARY.md)** - Recent accomplishments
6. **[README.md](README.md)** (this file) - General overview

---

## Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS only) or **Android Emulator** (for mobile development)
- **Supabase Account** (for database and authentication)

### Installation

1. **Navigate to the project**
   ```bash
   cd kineticbrandpartners/RacePrep
   ```

   > **Note**: RacePrep is a standalone repository located at `https://github.com/tigerswim/raceprep.git`

2. **Install main project dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**
   - A `.env.local` file template has been created at the project root
   - Update with your actual API keys (never commit this file to git!):
     - **Supabase** ✅: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
     - **Strava** ✅: OAuth2 credentials for training data integration
     - **RunSignup** ✅: API keys for race discovery
     - **OpenWeatherMap** ✅: Weather data integration
     - **Google Maps** ✅: Geocoding and elevation profile data (actively used)
   - Run `node test-env-connections.js` to verify all API connections

5. **Database Setup**
   - Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md) for complete database configuration
   - Run migrations for user-created races and enhanced features

6. **Start the API server (in a separate terminal)**
   ```bash
   cd server
   node server.js
   ```
   The API server will run on http://localhost:3001

7. **Start the development server**
   ```bash
   npm start
   ```
   The web app will be available at http://localhost:8081

8. **Open the app**
   - **Web**: Navigate to http://localhost:8081 in your browser
   - **iOS**: Press `i` for iOS simulator (macOS only)
   - **Android**: Press `a` for Android emulator
   - **Mobile Device**: Scan QR code with Expo Go app

### Verification

Run tests to ensure everything is working:
```bash
# Test the application
npm test

# Test specific services
npm run test:coverage

# Lint the codebase
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (buttons, inputs, cards)
│   ├── charts/         # Chart components for data visualization
│   ├── dashboard/      # Dashboard-specific widgets and components
│   ├── forms/          # Form components for data entry
│   ├── navigation/     # Navigation components
│   └── __tests__/      # Component test files
├── screens/            # Main application screens
│   ├── Auth/           # Authentication screens
│   ├── Dashboard/      # Performance overview and insights
│   ├── Races/          # Race history and analysis
│   ├── Courses/        # Course database and discovery
│   ├── Planning/       # Race planning and preparation
│   └── Profile/        # User profile and settings
├── services/           # API and external service integrations
│   ├── api/            # External API integrations (Strava, RunSignup)
│   ├── enhanced/       # Enhanced backend services with optimization
│   ├── shared/         # Shared utilities (error handling, monitoring)
│   ├── storage/        # Local storage management
│   ├── timing/         # Race timing and analytics
│   ├── weather/        # Weather data integration
│   └── __tests__/      # Service test files
├── store/              # Redux store configuration
│   ├── slices/         # Redux toolkit slices
│   └── middleware/     # Custom middleware
├── utils/              # Utility functions
│   ├── calculations/   # Mathematical calculations and algorithms
│   ├── formatting/     # Data formatting utilities
│   └── validation/     # Input validation functions
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── constants/          # App constants and configuration
├── types/              # TypeScript type definitions
├── data/               # Static data and mock data
└── test/               # Test utilities and setup
```

## Technology Stack

### Frontend
- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety
- **Redux Toolkit** with RTK Query for state management  
- **NativeWind** (Tailwind CSS) for styling
- **React Navigation** for navigation

### Backend ✅
- **Supabase** for database and authentication (Active)
- **Node.js/Express** API server (Running on port 3001)
- **PostgreSQL** database (Via Supabase)
- **Redis** for caching (Planned)

### Third-Party Integrations
- **Race Discovery**: ✅ RunSignUp API (Complete)
- **Training Data**: ✅ Strava OAuth2 + Activity Sync (Complete)
- **Database**: ✅ Supabase PostgreSQL + Auth (Complete)
- **Deployment**: ✅ Netlify Functions + Static Hosting (Complete)
- **Weather Data**: 🚧 OpenWeatherMap API (Configured, not integrated)
- **Maps**: 🚧 Google Maps API (Geocoding working)
- **Future**: ChronoTrack, TriSignUp, Advanced Analytics

## Development Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Project setup and configuration
- [x] Core UI components and design system
- [x] Basic navigation structure
- [x] Dashboard layout
- [x] Redux store configuration
- [x] **Supabase backend setup with full database schema**
- [x] **Complete user authentication system**
- [x] **Race discovery with RunSignup API integration**
- [x] **Strava integration with OAuth2 + activity sync**
- [x] **Full profile management system**
- [x] **User goals and tracking system**
- [x] **Netlify deployment with working API redirects**
- [x] **Code quality improvements (0 errors, 30 warnings)**
- [x] **Jest testing framework with 7/7 service tests passing**

### Phase 2: Core Features (100% Complete) ✅
- [x] **Complete profile management with goals and statistics**
- [x] **Advanced race planning and nutrition tools**
- [x] **Comprehensive training data integration (Strava)**
- [x] **Race discovery and management system**
- [x] **Planning tools with race-specific features**
- [x] **Enhanced dashboard with 6 comprehensive widgets** (All production-ready)
  - Performance Overview with SVG charts and discipline breakdowns
  - Upcoming Races with countdown timers and preparation status (Lucide icons)
  - Training Plan Progress with weekly adherence tracking (Tabler icons)
  - Goals Progress with trend analysis and completion tracking (Tabler icons)
  - Transition Analytics with T1/T2 optimization tips (Tabler icons)
  - Personal Bests tracking PRs across all race distances (Tabler icons)
- [x] **Advanced Race Result Analytics**
  - Enhanced T1/T2 tracking with real-time validation
  - Interactive race timeline visualization
  - Age group percentile comparisons
  - Color-coded performance indicators
- [x] **Multi-agent development system with specialized agents**
- [x] **Fixed Strava sync issues with enhanced database schema**
- [x] **Security hardening: Input validation and resource protection**
- [x] **Strava API compliance with data usage guidelines**
- [x] **Dashboard optimization: Removed legacy Recent Activities feature and fixed rendering issues**
- [x] **Backend enhancements: Request batching, connection pooling, and monitoring systems**
- [x] **User-created races system: Custom race management with comprehensive validation**
- [x] **Race result analytics and transition timing** ✅

### Phase 3: Advanced Features (Future)
- [ ] Training plan engine with structured workouts
- [ ] Advanced performance analytics and trends
- [ ] Race timing platform integrations (ChronoTrack)
- [ ] AI-powered race predictions and recommendations
- [ ] Social features and community aspects
- [ ] Advanced nutrition planning with personalization

### Phase 4: Polish & Launch
- [ ] Performance optimization
- [ ] Premium features
- [ ] App store deployment
- [ ] Domain configuration at raceprep.kineticbrandpartners.com

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Infrastructure
- **Jest 30.1.3**: Testing framework
- **React Native Testing Library**: Component testing
- **Service Tests**: Database and API integration tests
- **Coverage**: Tracks test coverage across components and services

### Current Test Status
- ✅ **Service Tests**: 7/7 passing - Database helpers validated
- ⚠️ **Component Tests**: Setup complete, some tests need refinement
- ✅ **Linting**: 0 errors, 30 warnings (down from 42 problems)

## Contributing

This project follows the development guidelines outlined in `raceprep_development_docs.2.md`. 

### Development Workflow
1. Create feature branch from `main`
2. Follow TypeScript and React Native best practices
3. Maintain test coverage
4. Update documentation as needed
5. Submit pull request for review

## Support

For questions or support regarding RacePrep development:
- Check the comprehensive documentation in `raceprep_development_docs.2.md`
- Review the project's technical architecture
- Follow the step-by-step implementation guide

## Privacy Policy & Data Handling

### Strava Data Integration
RacePrep integrates with Strava to provide comprehensive training analytics while maintaining strict compliance with Strava's API terms and data usage policies.

#### Data Collection
- **Training Activities**: Workout data including duration, distance, pace, heart rate, and elevation
- **User Profile**: Basic Strava profile information (name, photo) with user consent
- **Performance Metrics**: Aggregated statistics for training analysis and trend visualization

#### Data Usage
- **Training Analysis**: Activity data is used exclusively for performance insights and training trends
- **Race Preparation**: Historical training data helps predict race performance and suggest improvements
- **Personal Dashboard**: All data remains private to the individual user account

#### Data Rights
- **Export**: Users can export all their data (training, races, goals, profile) in JSON or CSV format
- **Deletion**: Users can request complete data deletion with 48-hour processing (Strava API requirement)
- **Transparency**: Full visibility into what data is stored and how it's used

#### Compliance
- **"Powered by Strava" Attribution**: Displayed on all screens showing Strava-sourced training data
- **Strava Branding Guidelines**: Logo usage and attribution follow official Strava brand standards
- **API Terms Compliance**: Strict adherence to Strava's developer terms and data usage policies
- **48-Hour Deletion**: Automated data deletion within required timeframe per Strava API terms

#### User Control
Users maintain full control over their data through the Profile settings:
- **Connect/Disconnect Strava**: Easy OAuth2 integration and disconnection
- **Data Export**: One-click export of all personal data
- **Deletion Request**: Schedule complete data removal with confirmation
- **Privacy Settings**: Control what training data is analyzed and displayed

### GDPR Compliance
RacePrep respects user privacy rights under GDPR and similar data protection regulations:
- **Right to Access**: Complete data export functionality
- **Right to Erasure**: Comprehensive data deletion capabilities
- **Right to Portability**: Data export in standard formats (JSON/CSV)
- **Data Minimization**: Only necessary data is collected and stored
- **Purpose Limitation**: Data used only for stated training and race analysis purposes

## License

Private project - Kinetic Brand Partners © 2024

---

Built with ❤️ for the triathlon community

---

**Recent Updates:**
- **Dashboard Widget Icon Fix (January 2025)**
  - ✅ Resolved React Error #130 in UpcomingRacesWidget caused by react-icons bundling in production
  - ✅ Replaced problematic react-icons with Lucide React Native icons in UpcomingRacesWidget
  - ✅ Maintained Tabler Icons (react-icons/tb) across all other dashboard widgets for consistency
  - ✅ Added null safety checks for user.id in localStorage operations
  - ✅ Confirmed all 6 dashboard widgets now render successfully in production
  - ✅ Dashboard widgets: PerformanceOverview, UpcomingRaces, TrainingPlanProgress, GoalsProgress, TransitionAnalytics, PersonalBests
- **Strava API Compliance Implementation (September 30, 2024)**
  - ✅ Implemented "Powered by Strava" branding on all training data displays
  - ✅ Added comprehensive user data export functionality (JSON/CSV formats)
  - ✅ Created 48-hour data deletion system per Strava API requirements
  - ✅ Enhanced privacy controls with complete data transparency
  - ✅ Updated privacy policy and documentation for Strava data handling
  - ✅ Full compliance with Strava branding guidelines and API terms
  - ✅ Resolved Strava OAuth connection issues in development environment
  - ✅ Enhanced debugging tools and server configuration validation
- **Race Management System Overhaul (September 26, 2024)**
  - ✅ Fixed status update persistence for both imported and user-created races
  - ✅ Resolved custom distance settings not saving correctly
  - ✅ Fixed React component caching preventing UI updates
  - ✅ Eliminated data duplication between race arrays
  - ✅ Enhanced modal race detection with comprehensive field mapping
  - ✅ Improved database operations with proper field validation
  - ✅ Complete race update workflow now functions reliably across all race types
- Security hardening and SQL injection vulnerability fixes
- Enhanced backend services with performance optimizations
- User-created races system for custom race management
- Dashboard performance improvements and bug fixes
- Comprehensive backend monitoring and error handling

*Last updated: January 2025*

---

## Logging Policy

- All direct `console.log` statements have been removed from production code.
- Logging is now routed through `src/utils/logger.ts`. Developers should use `logger.debug`, `logger.info`, `logger.warn`, or `logger.error` for in-code logging.
- **By default, logs only appear in development and are silent in production builds.**
- This improves performance, avoids leaking sensitive data, and follows best practices for production code quality.
