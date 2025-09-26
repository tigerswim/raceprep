# RacePrep

**"The only triathlon app that understands your race as a complete event, not three separate sports."**

RacePrep is a mobile-first triathlon tracking application designed for beginner to intermediate triathletes. Unlike existing platforms, RacePrep provides integrated race analysis, environmental performance modeling, and predictive analytics tailored specifically for multi-sport endurance events.

## Features

### 🏊‍♂️ Comprehensive Race Analysis
- **Transition Analytics**: Detailed T1/T2 analysis with age group comparisons  
- **Split Breakdowns**: Complete swim, bike, run performance tracking
- **Performance Insights**: AI-powered recommendations for improvement

### 🗺️ Course Database & Discovery
- **50+ Pre-loaded Courses**: Sprint and Olympic distance races
- **Detailed Course Info**: Elevation, swim type, weather patterns, difficulty ratings
- **Community Reviews**: User-driven ratings and tips

### 📋 Race Planning Tools
- **Nutrition Planning**: Science-based fueling strategies for race day
- **Packing Lists**: Customizable T1/T2 setup checklists
- **Race Predictions**: AI-powered time predictions based on course and conditions

### 🚴‍♂️ Training Integration & Analytics
- **Strava Integration**: Automatic sync of swimming, cycling, and running activities
- **Enhanced Performance Metrics**: Heart rate zones, power data, elevation gain, training stress
- **Interactive Workout Details**: Click any workout for comprehensive performance breakdown
- **Training Load Analysis**: Track weekly volume and intensity across all disciplines
- **SVG Training Charts**: Interactive 7-day trend visualization with glassmorphism design
- **Performance Dashboard**: Real-time analytics with week-over-week comparisons
- **Modern UI Components**: Tabler Icons for consistent iconography across all interfaces
- **Enhanced Chart Visualizations**: Gradient-free bar charts with improved readability and vibrant orange cycling colors

### 🔒 Security & Performance
- **Input Validation**: Comprehensive parameter sanitization to prevent injection attacks
- **Resource Protection**: Rate limiting and parameter validation on all database queries
- **Secure Data Handling**: Validated and sanitized user inputs across all endpoints
- **Streamlined Dashboard**: Optimized data loading with security hardening
- **Enhanced Backend Services**: Request batching, connection pooling, and performance monitoring
- **User-Created Races**: Comprehensive race management with RLS security policies

### 🤖 Development Innovation
- **Multi-Agent System**: Specialized AI agents for frontend, backend, and code review
- **Agent Templates**: Copy-paste agent descriptions for rapid development
- **Parallel Execution**: Multiple agents working simultaneously on different features
- **Comprehensive Debugging**: Advanced error tracking and resolution workflows

### 📱 Beautiful Mobile Experience
- **Native iOS & Android**: Smooth, responsive performance
- **Dark Theme**: Modern glassmorphism design optimized for readability
- **Offline Support**: Core features work without internet connection

## Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS only) or **Android Emulator** (for mobile development)
- **Supabase Account** (for database and authentication)

### Installation

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd RacePrep/raceprep
   ```

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
   - Review `.env.local` and update with your actual API keys:
     - **Supabase**: Update `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
     - **Strava**: Configure OAuth2 credentials for training data integration
     - **RunSignup**: API keys for race discovery (optional for development)
     - **OpenWeatherMap**: Weather data integration (optional)

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

### Phase 2: Core Features (95% Complete) ✅
- [x] **Complete profile management with goals and statistics**
- [x] **Advanced race planning and nutrition tools**
- [x] **Comprehensive training data integration (Strava)**
- [x] **Race discovery and management system**
- [x] **Planning tools with race-specific features**
- [x] **Enhanced dashboard with performance widgets and SVG charts**
- [x] **Multi-agent development system with specialized agents**
- [x] **Fixed Strava sync issues with enhanced database schema**
- [x] **Security hardening: Input validation and resource protection**
- [x] **Dashboard optimization: Removed legacy Recent Activities feature and fixed rendering issues**
- [x] **Backend enhancements: Request batching, connection pooling, and monitoring systems**
- [x] **User-created races system: Custom race management with comprehensive validation**
- [ ] Race result analytics and transition timing
- [ ] Course database population (50+ races)
- [ ] Weather integration for race planning

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

## License

Private project - Kinetic Brand Partners © 2024

---

Built with ❤️ for the triathlon community

---

**Recent Updates:**
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

*Last updated: September 26, 2024*
