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
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd RacePrep/raceprep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.local` and update with your API keys
   - Configure Supabase credentials (see Setup Guide below)

4. **Start the API server (in a separate terminal)**
   ```bash
   cd server
   node server.js
   ```
   The API server will run on http://localhost:3001

5. **Start the development server**
   ```bash
   npm start
   ```
   The web app will be available at http://localhost:8081

6. **Open the app**
   - **Web**: Navigate to http://localhost:8081 in your browser
   - Press `i` for iOS simulator
   - Press `a` for Android emulator  
   - Scan QR code with Expo Go app on your device

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (buttons, inputs, cards)
│   ├── charts/         # Chart components for data visualization
│   └── forms/          # Form components for data entry
├── screens/            # Main application screens
│   ├── Dashboard/      # Performance overview and insights
│   ├── Races/          # Race history and analysis
│   ├── Courses/        # Course database and discovery
│   ├── Planning/       # Race planning and preparation
│   └── Profile/        # User profile and settings
├── services/           # API and external service integrations
├── store/              # Redux store configuration
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── constants/          # App constants and configuration
└── types/              # TypeScript type definitions
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

### Phase 2: Core Features (90% Complete) ✅
- [x] **Complete profile management with goals and statistics**
- [x] **Advanced race planning and nutrition tools**
- [x] **Comprehensive training data integration (Strava)**
- [x] **Race discovery and management system**
- [x] **Planning tools with race-specific features**
- [x] **Enhanced dashboard with performance widgets and SVG charts**
- [x] **Multi-agent development system with specialized agents**
- [x] **Fixed Strava sync issues with enhanced database schema**
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
# Trigger deployment - Sun Sep 21 11:29:07 EDT 2025
