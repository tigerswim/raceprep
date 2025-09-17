# RacePrep - Complete Development Documentation

## Project Overview - Current Implementation Status

RacePrep is a mobile-first triathlon tracking application designed for beginner to intermediate triathletes. The current implementation includes core race tracking functionality with plans for advanced analytics features.

### Current Implementation Status (Updated January 2025)

## 🔄 Recent Updates (September 2025)

### Race Discovery API Performance & Coverage Improvements
- **Nationwide Search Fix**: Fixed nationwide searches to return many more races by properly handling "radius=all" parameter without location restrictions
- **API Caching Implementation**: Added 10-minute intelligent caching to prevent redundant API calls when using same search parameters
- **Increased Results Limit**: Boosted from 25 to 100 results per search for more comprehensive race coverage
- **Server Parameter Handling**: Fixed server logic to distinguish between local searches (with location + radius) and nationwide searches (no location restrictions)

### Saved Races Display & Functionality Fixes
- **Fixed Save/Remove Button Logic**: Races in "My Upcoming Races" now correctly show Remove buttons instead of Save buttons
- **Unified Data Across Tabs**: Fixed inconsistent race data between Dashboard, Races, and Planning tabs - all now show the same saved races
- **Enhanced Planning Tab**: Saved races now properly appear in Planning tab for race-specific planning
- **Improved Location Search**: Any location input (zip code, city, state) now completely overrides browser geolocation
- **Better ID Handling**: Fixed issues with race ID tracking between external API IDs and local generated IDs

### Race Result Entry UI Integration (September 2025)
- **Races Tab Integration**: Added "Add Race Result" button to "My Past Races" section with complete modal integration
- **Dashboard Quick Action**: Added race result entry button to Quick Actions section for easy access  
- **Modal State Management**: Implemented proper state management for AddResultModal across both tabs
- **Data Flow Integration**: Connected existing AddResultModal infrastructure to user interface with proper error handling
- **User Experience**: Provides consistent access to race result entry from both main navigation areas

## 🚀 Live Features Available Now

### **Dashboard Tab**
- Welcome screen with user authentication status
- Clean, responsive design with glassmorphism effects
- Quick access to main application features

### **Races Tab** 
- **Race Discovery**: Search and browse triathlon races using RunSignUp API
- **Location-based Search**: Find races near you with radius filtering
- **Sample Data Fallback**: Displays sample races when external API is unavailable
- **Race Information**: View detailed race info including location, date, distance type
- **Save Races**: Bookmark races for planning (basic functionality)

### **Planning Tab**
- **Race-Specific Planning**: Select saved races for detailed planning
- **Nutrition Planning**: Pre-race, bike, and run nutrition strategies with timing
- **Gear & Packing**: Comprehensive checklists for T1/T2 setup by sport
- **Race Strategy**: Detailed swim, bike, run strategy plans with time targets
- **Race Day Timeline**: Hour-by-hour schedule from wake-up to race start
- **Toggle Modes**: Switch between race-specific and general planning

### **Profile Tab**
- **User Profile Management**: Update personal information, age groups, experience level
- **Age Group Support**: Comprehensive age groups including 17 & Under options
- **Settings Management**: Account preferences and app configuration

### **Core Technical Features**
- **Cross-Platform**: Native iOS and Android via Expo
- **Authentication**: Secure user accounts with Supabase Auth
- **Offline Resilience**: Graceful fallbacks when services are unavailable
- **Error Handling**: Comprehensive error boundaries and user-friendly messaging
- **Performance**: Optimized Metro bundler and caching
- **Dark Theme**: Beautiful glassmorphism design system

---

## 🔧 Technical Implementation Details

**✅ Completed Features:**
- React Native with Expo SDK 52
- Supabase backend integration for authentication and data storage
- Expo Router with tab navigation (Dashboard, Races, Courses, Planning, Profile)
- User authentication and profile management with comprehensive age groups
- Race discovery and search functionality (with RunSignUp API integration)
- Advanced race planning tools with nutrition, gear, strategy, and timeline sections
- Responsive UI with glassmorphism design system
- Comprehensive error handling and fallback data systems
- Cross-platform compatibility (iOS/Android via Expo)

**🚧 In Progress:**
- Enhanced user race tracking and saved races functionality
- Database schema optimization and integration improvements
- Course database and course-specific planning features
- Undo functionality for accidental race planning actions

**📋 Planned Features:**
- Comprehensive transition analytics (T1/T2 performance tracking)
- AI-powered race time prediction engine
- Environmental performance modeling with weather correlation
- Advanced nutrition planning with real-time race day adjustments
- Integration with timing platforms (ChronoTrack, RunSignUp results import)
- Social features and community challenges

### Target Market
- **Primary Users**: Beginner to intermediate triathletes
- **Race Focus**: Sprint and Olympic distance events  
- **Geographic Focus**: Initially US market (starting with Atlanta, GA region)
- **Business Model**: Freemium with $89.99/year premium tier

### Core Value Proposition
**"The only triathlon app that understands your race as a complete event, not three separate sports."**

Key differentiators:
- Comprehensive transition analytics (T1/T2 optimization)
- Environmental performance modeling with weather correlation
- Course-aware predictive analytics
- Integrated nutrition planning with race-specific timing
- Mobile-first design with beautiful, intuitive UI

## Technical Architecture

### Frontend Stack (Current Implementation)
- **Framework**: React Native with Expo SDK 52
- **State Management**: Redux Toolkit with context providers for races
- **UI Components**: Custom components with NativeWind (Tailwind CSS) styling
- **Navigation**: Expo Router with file-based routing and bottom tab navigation
- **Styling**: Glassmorphism design system with dark theme
- **Icons**: Expo Vector Icons
- **Authentication**: Supabase Auth integration
- **Charts**: Planned for future implementation
- **Maps**: Planned for future implementation

### Backend Stack (Current Implementation)
- **Database**: Supabase (PostgreSQL) for user data and race information
- **Authentication**: Supabase Auth with email/password and social login
- **Real-time**: Supabase real-time subscriptions for live data updates
- **File Storage**: Supabase Storage (planned for course maps and user uploads)
- **API Layer**: Direct Supabase client integration in React Native
- **Caching**: Local AsyncStorage for offline data persistence
- **Email**: Supabase integrated email service
- **External APIs**: RunSignUp API integration for race discovery

### Third-Party Integrations (Current Implementation)
- **Race Discovery**: RunSignUp API integration for race search and discovery
- **Future Integrations Planned**:
  - ChronoTrack API for race results import
  - OpenWeatherMap for environmental performance modeling
  - Google Maps SDK for course visualization
  - Analytics platform (Mixpanel or similar)
  - Stripe for premium subscriptions

### Data Architecture

```sql
-- Core Database Schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  age_group VARCHAR, -- e.g., "35-39"
  gender VARCHAR,
  experience_level VARCHAR, -- beginner, intermediate, advanced
  location VARCHAR,
  usat_id VARCHAR,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR NOT NULL,
  distance_type VARCHAR NOT NULL, -- sprint, olympic, 70.3, ironman
  course_id UUID REFERENCES courses(id),
  timing_platform VARCHAR, -- chronotrack, runsignup, etc.
  external_race_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User race results
CREATE TABLE race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  race_id UUID REFERENCES races(id),
  overall_time INTERVAL NOT NULL,
  swim_time INTERVAL,
  t1_time INTERVAL,
  bike_time INTERVAL,
  t2_time INTERVAL,
  run_time INTERVAL,
  overall_placement INTEGER,
  age_group_placement INTEGER,
  bib_number VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- Course database
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  distance_type VARCHAR NOT NULL,
  swim_type VARCHAR, -- lake, ocean, river, pool
  bike_elevation_gain INTEGER, -- feet
  run_elevation_gain INTEGER, -- feet
  overall_elevation INTEGER, -- feet above sea level
  difficulty_score INTEGER, -- 1-10 scale
  wetsuit_legal BOOLEAN DEFAULT true,
  description TEXT,
  features JSONB, -- array of features like ["hilly", "scenic", "urban"]
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course ratings and reviews
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  rating DECIMAL(2,1), -- 1.0 to 5.0
  review_text TEXT,
  difficulty_rating INTEGER, -- 1-10
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Weather data for races
CREATE TABLE race_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID REFERENCES races(id),
  date DATE NOT NULL,
  temperature_f INTEGER,
  humidity DECIMAL(3,1),
  wind_speed INTEGER,
  conditions VARCHAR,
  water_temperature_f INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nutrition plans
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  race_id UUID REFERENCES races(id),
  pre_race_items JSONB,
  bike_items JSONB,
  run_items JSONB,
  total_carbs INTEGER,
  total_sodium INTEGER,
  total_calories INTEGER,
  total_caffeine INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User equipment preferences
CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category VARCHAR NOT NULL, -- swim, bike, run
  item_type VARCHAR NOT NULL, -- wetsuit, bike, shoes, etc.
  brand VARCHAR,
  model VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User goals
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  goal_type VARCHAR NOT NULL, -- race_count, time_target, transition_time
  target_value VARCHAR NOT NULL,
  current_value VARCHAR,
  target_date DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packing lists
CREATE TABLE packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  race_id UUID REFERENCES races(id),
  transition VARCHAR NOT NULL, -- t1, t2
  items JSONB NOT NULL, -- array of {item: string, checked: boolean}
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Current Application Structure

### Mobile App Architecture (React Native with Expo Router)

**Current File Structure:**

```
app/
├── (tabs)/             # Tab-based routes (Expo Router)
│   ├── index.tsx       # Dashboard/Home screen
│   ├── races.tsx       # Race discovery and management
│   ├── courses.tsx     # Course database (planned)
│   ├── planning.tsx    # Race planning tools
│   └── profile.tsx     # User profile and settings
├── _layout.tsx         # Root layout with tab navigation
└── +not-found.tsx      # 404 error screen

src/
├── components/         # Reusable UI components
│   ├── AuthGuard.tsx   # Authentication wrapper
│   ├── WebDashboard.tsx # Main dashboard component
│   ├── RaceSpecificPlanning.tsx # Race planning component
│   └── [other components] # Various UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── RacesContext.tsx # Race data management
├── services/           # External service integrations
│   ├── GeolocationService.ts # Location services
│   └── supabaseService.ts # Supabase client setup
├── store/              # Redux store (partial implementation)
│   └── index.ts        # Store configuration
├── utils/              # Utility functions
│   └── [various utilities] # Helper functions
└── types/              # TypeScript type definitions
```

### Backend API Architecture (Node.js/Express)

```
src/
├── routes/             # API route definitions
│   ├── auth/           # Authentication routes
│   ├── users/          # User management routes
│   ├── races/          # Race data routes
│   ├── courses/        # Course database routes
│   ├── nutrition/      # Nutrition planning routes
│   └── integrations/   # Third-party integration routes
├── controllers/        # Route controllers
├── middleware/         # Express middleware
│   ├── auth/           # Authentication middleware
│   ├── validation/     # Request validation
│   └── rateLimit/      # Rate limiting
├── services/           # Business logic services
│   ├── raceService/    # Race-related business logic
│   ├── courseService/  # Course analysis service
│   ├── weatherService/ # Weather data service
│   └── nutritionService/ # Nutrition calculation service
├── integrations/       # Third-party service integrations
│   ├── chronotrack/    # ChronoTrack API integration
│   ├── runsignup/      # RunSignUp API integration
│   └── openweather/    # OpenWeatherMap integration
├── utils/              # Utility functions
├── config/             # Configuration files
└── types/              # TypeScript type definitions
```

## Core Features Implementation

### 1. Race Results Integration & Tracking

#### ChronoTrack API Integration
```typescript
// services/timing/chronotrack.ts
interface ChronoTrackResult {
  participantId: string;
  bibNumber: string;
  firstName: string;
  lastName: string;
  overallTime: string;
  splits: {
    swim: string;
    t1: string;
    bike: string;
    t2: string;
    run: string;
  };
  placement: {
    overall: number;
    gender: number;
    ageGroup: number;
  };
}

class ChronoTrackService {
  async importRaceResults(raceId: string, participantId: string): Promise<ChronoTrackResult> {
    const response = await fetch(`${CHRONOTRACK_API_BASE}/races/${raceId}/participants/${participantId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CHRONOTRACK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
  
  async searchParticipant(raceId: string, firstName: string, lastName: string) {
    // Implementation for participant search
  }
}
```

#### RunSignUp API Integration
```typescript
// services/timing/runsignup.ts
class RunSignUpService {
  async getRaceResults(raceId: string, participantId: string) {
    const response = await fetch(`${RUNSIGNUP_API_BASE}/race/${raceId}/results/participant/${participantId}`, {
      headers: {
        'X-API-Key': process.env.RUNSIGNUP_API_KEY
      }
    });
    
    return this.transformToStandardFormat(response.json());
  }
  
  private transformToStandardFormat(data: any): StandardRaceResult {
    // Transform RunSignUp format to internal format
  }
}
```

### 2. Transition Analytics Engine

```typescript
// services/raceService/transitionAnalysis.ts
interface TransitionAnalysis {
  t1Time: number; // seconds
  t2Time: number; // seconds
  totalTransitionTime: number;
  ageGroupAverage: number;
  percentileRanking: number;
  improvementOpportunity: number; // seconds
  recommendations: string[];
}

class TransitionAnalysisService {
  async analyzeTransitions(userId: string, raceResultId: string): Promise<TransitionAnalysis> {
    const result = await this.getRaceResult(raceResultId);
    const ageGroupStats = await this.getAgeGroupTransitionStats(
      result.user.ageGroup, 
      result.race.distanceType
    );
    
    const t1Seconds = this.timeToSeconds(result.t1Time);
    const t2Seconds = this.timeToSeconds(result.t2Time);
    const totalTransition = t1Seconds + t2Seconds;
    
    const percentile = this.calculatePercentile(totalTransition, ageGroupStats);
    const improvement = Math.max(0, totalTransition - ageGroupStats.median);
    
    return {
      t1Time: t1Seconds,
      t2Time: t2Seconds,
      totalTransitionTime: totalTransition,
      ageGroupAverage: ageGroupStats.average,
      percentileRanking: percentile,
      improvementOpportunity: improvement,
      recommendations: this.generateRecommendations(t1Seconds, t2Seconds, ageGroupStats)
    };
  }
  
  private generateRecommendations(t1: number, t2: number, stats: any): string[] {
    const recommendations = [];
    
    if (t1 > stats.t1Median + 30) {
      recommendations.push("Focus on wetsuit removal technique - practice at pool");
      recommendations.push("Consider body glide application for easier wetsuit removal");
    }
    
    if (t2 > stats.t2Median + 20) {
      recommendations.push("Practice bike-to-run transition with elastic laces");
      recommendations.push("Pre-plan T2 layout for maximum efficiency");
    }
    
    return recommendations;
  }
}
```

### 3. Environmental Performance Modeling

```typescript
// services/weatherService/performanceCorrelation.ts
interface EnvironmentalImpact {
  temperatureEffect: number; // percentage impact
  humidityEffect: number;
  windEffect: number;
  overallPredictedImpact: number;
  recommendations: string[];
}

class EnvironmentalPerformanceService {
  async analyzeEnvironmentalImpact(
    userId: string, 
    raceDate: Date, 
    location: string
  ): Promise<EnvironmentalImpact> {
    // Get historical weather for race location/date
    const weather = await this.weatherService.getHistoricalWeather(location, raceDate);
    
    // Get user's performance history under similar conditions
    const userPerformance = await this.getUserPerformanceByConditions(userId);
    
    // Calculate performance correlations
    const tempImpact = this.calculateTemperatureImpact(weather.temperature, userPerformance);
    const humidityImpact = this.calculateHumidityImpact(weather.humidity, userPerformance);
    const windImpact = this.calculateWindImpact(weather.windSpeed, userPerformance);
    
    return {
      temperatureEffect: tempImpact,
      humidityEffect: humidityImpact,
      windEffect: windImpact,
      overallPredictedImpact: (tempImpact + humidityImpact + windImpact) / 3,
      recommendations: this.generateWeatherRecommendations(weather)
    };
  }
  
  private calculateTemperatureImpact(temp: number, userHistory: any[]): number {
    // Analyze user's performance correlation with temperature
    // Return percentage impact on performance
  }
}
```

### 4. Course-Aware Predictive Analytics

```typescript
// services/courseService/racePredictor.ts
interface RacePrediction {
  predictedOverallTime: string;
  confidenceInterval: {
    min: string;
    max: string;
  };
  splitPredictions: {
    swim: string;
    t1: string;
    bike: string;
    t2: string;
    run: string;
  };
  factorsConsidered: string[];
}

class RacePredictorService {
  async predictRaceTime(
    userId: string, 
    courseId: string, 
    weatherConditions?: any
  ): Promise<RacePrediction> {
    const user = await this.getUserWithHistory(userId);
    const course = await this.getCourseDetails(courseId);
    const userStats = await this.calculateUserPerformanceStats(userId);
    
    // Factor in course difficulty
    const elevationFactor = this.calculateElevationImpact(
      course.bikeElevationGain, 
      course.runElevationGain,
      userStats.hillPerformance
    );
    
    // Factor in swim type
    const swimFactor = this.calculateSwimTypeImpact(
      course.swimType,
      userStats.swimPerformance
    );
    
    // Base prediction on similar courses
    const basePrediction = this.predictFromSimilarCourses(user, course);
    
    // Apply environmental factors if provided
    let environmentalFactor = 1.0;
    if (weatherConditions) {
      environmentalFactor = await this.environmentalService.calculateImpactFactor(
        userId, 
        weatherConditions
      );
    }
    
    const adjustedTime = basePrediction * elevationFactor * swimFactor * environmentalFactor;
    
    return {
      predictedOverallTime: this.secondsToTimeString(adjustedTime),
      confidenceInterval: {
        min: this.secondsToTimeString(adjustedTime * 0.95),
        max: this.secondsToTimeString(adjustedTime * 1.05)
      },
      splitPredictions: this.predictSplits(adjustedTime, course),
      factorsConsidered: [
        `Elevation gain: +${course.bikeElevationGain + course.runElevationGain}ft`,
        `Swim type: ${course.swimType}`,
        `Based on ${userStats.similarRaces} similar races`
      ]
    };
  }
}
```

### 5. Nutrition Planning System

```typescript
// services/nutritionService/raceNutrition.ts
interface NutritionPlan {
  preRace: NutritionItem[];
  bikeSegment: NutritionItem[];
  runSegment: NutritionItem[];
  totals: NutritionTotals;
  hourlyRates: {
    bike: NutritionTotals;
    run: NutritionTotals;
  };
}

interface NutritionItem {
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  carbs: number;
  sodium: number;
  calories: number;
  caffeine: number;
  timing?: string;
}

class NutritionPlanningService {
  async generateNutritionPlan(
    userId: string,
    raceId: string,
    predictedTimes: {
      bike: number; // seconds
      run: number; // seconds
    }
  ): Promise<NutritionPlan> {
    const userPrefs = await this.getUserNutritionPreferences(userId);
    const raceDistance = await this.getRaceDistance(raceId);
    
    // Calculate nutrition needs based on race duration and user preferences
    const bikeHours = predictedTimes.bike / 3600;
    const runHours = predictedTimes.run / 3600;
    
    const bikeNutrition = this.calculateBikeNutrition(bikeHours, userPrefs);
    const runNutrition = this.calculateRunNutrition(runHours, userPrefs);
    
    return {
      preRace: this.generatePreRaceNutrition(userPrefs),
      bikeSegment: bikeNutrition.items,
      runSegment: runNutrition.items,
      totals: this.calculateTotals(bikeNutrition.items, runNutrition.items),
      hourlyRates: {
        bike: this.calculateHourlyRate(bikeNutrition.totals, bikeHours),
        run: this.calculateHourlyRate(runNutrition.totals, runHours)
      }
    };
  }
  
  private calculateBikeNutrition(hours: number, prefs: UserNutritionPrefs) {
    const targetCarbsPerHour = 30; // grams
    const targetSodiumPerHour = 300; // mg
    
    const totalCarbs = hours * targetCarbsPerHour;
    const totalSodium = hours * targetSodiumPerHour;
    
    // Generate specific product recommendations based on preferences
    const items: NutritionItem[] = [];
    
    // Add energy gels
    const gelsNeeded = Math.ceil(totalCarbs / 22); // ~22g carbs per gel
    items.push({
      name: prefs.preferredEnergyGel || "Energy Gel",
      quantity: gelsNeeded,
      unit: "gel",
      carbs: gelsNeeded * 22,
      sodium: gelsNeeded * 50,
      calories: gelsNeeded * 100,
      caffeine: gelsNeeded * (prefs.caffeinePerGel || 25)
    });
    
    // Add sports drink
    const bottlesNeeded = Math.max(1, Math.ceil(hours / 1.5));
    items.push({
      name: prefs.preferredSportsDrink || "Sports Drink",
      quantity: bottlesNeeded,
      unit: "bottle (24oz)",
      carbs: bottlesNeeded * 36,
      sodium: bottlesNeeded * 270,
      calories: bottlesNeeded * 150,
      caffeine: 0
    });
    
    return { items, totals: this.calculateTotals(items) };
  }
}
```

## Mobile App Implementation

### Design System Components

```typescript
// components/ui/Card.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  className?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  className = '',
  style 
}) => {
  const { colors } = useTheme();
  
  const baseStyles = 'rounded-2xl border shadow-xl';
  const variantStyles = {
    default: 'bg-white/5 backdrop-blur-xl border-white/10',
    glass: 'bg-white/10 backdrop-blur-2xl border-white/20',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30'
  };
  
  return (
    <View 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};
```

```typescript
// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const baseStyles = 'rounded-xl font-medium shadow-lg flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-orange-500 text-white',
    secondary: 'bg-white/10 backdrop-blur-lg border border-white/20 text-white',
    outline: 'border border-blue-400/30 bg-blue-500/20 text-blue-300'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text className="font-medium">{title}</Text>
    </TouchableOpacity>
  );
};
```

### Screen Components

#### Dashboard Screen
```typescript
// screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useGetDashboardDataQuery } from '../services/api';
import { PerformanceMetrics, LatestRaceCard, NextRaceCard, InsightsCard } from '../components';

export const DashboardScreen: React.FC = () => {
  const { data: dashboardData, isLoading } = useGetDashboardDataQuery();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6 space-y-6">
        <PerformanceMetrics metrics={dashboardData.seasonStats} />
        <LatestRaceCard race={dashboardData.latestRace} />
        <InsightsCard insights={dashboardData.insights} />
        <NextRaceCard race={dashboardData.nextRace} />
      </View>
    </ScrollView>
  );
};
```

#### Race Analysis Screen
```typescript
// screens/Races/RaceAnalysisScreen.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useGetRaceAnalysisQuery } from '../services/api';
import { RaceHeader, SplitsBreakdown, TransitionAnalysis, PerformanceChart } from '../components';

export const RaceAnalysisScreen: React.FC = () => {
  const route = useRoute();
  const { raceId } = route.params;
  
  const { data: analysis, isLoading } = useGetRaceAnalysisQuery(raceId);
  
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6 space-y-6">
        <RaceHeader race={analysis.race} result={analysis.result} />
        <SplitsBreakdown splits={analysis.splits} />
        <TransitionAnalysis transitions={analysis.transitionAnalysis} />
        <PerformanceChart data={analysis.performanceData} />
      </View>
    </ScrollView>
  );
};
```

### Navigation Structure
```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen, RacesScreen, CoursesScreen, PlanningScreen, ProfileScreen } from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RacesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="RacesList" component={RacesScreen} />
    <Stack.Screen name="RaceAnalysis" component={RaceAnalysisScreen} />
    <Stack.Screen name="AddRace" component={AddRaceScreen} />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { backgroundColor: '#1e293b' },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#64748b'
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Races" component={RacesStack} />
    <Tab.Screen name="Courses" component={CoursesScreen} />
    <Tab.Screen name="Planning" component={PlanningScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
```

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/stats
PUT    /api/users/equipment
GET    /api/users/goals
POST   /api/users/goals
PUT    /api/users/goals/:id
DELETE /api/users/goals/:id
```

### Races
```
GET    /api/races                    # User's race history
POST   /api/races                    # Add new race result
GET    /api/races/:id                # Get specific race details
PUT    /api/races/:id                # Update race result
DELETE /api/races/:id                # Delete race result
GET    /api/races/:id/analysis       # Get detailed race analysis
POST   /api/races/import             # Import from timing platform
```

### Courses
```
GET    /api/courses                  # Browse course database
GET    /api/courses/:id              # Get course details
POST   /api/courses                  # Add new course
GET    /api/courses/:id/reviews      # Get course reviews
POST   /api/courses/:id/reviews      # Add course review
GET    /api/courses/search           # Search courses
GET    /api/courses/nearby           # Get nearby courses
```

### Nutrition
```
GET    /api/nutrition/plans/:raceId  # Get nutrition plan for race
POST   /api/nutrition/plans          # Create nutrition plan
PUT    /api/nutrition/plans/:id      # Update nutrition plan
GET    /api/nutrition/preferences    # Get user nutrition preferences
PUT    /api/nutrition/preferences    # Update nutrition preferences
```

### Race Planning
```
GET    /api/planning/race/:id        # Get complete race plan
POST   /api/planning/race            # Create new race plan
PUT    /api/planning/race/:id        # Update race plan
GET    /api/planning/predictions/:courseId  # Get race time predictions
GET    /api/planning/packing/:raceId # Get packing list
PUT    /api/planning/packing/:raceId # Update packing list
```

### Integrations
```
POST   /api/integrations/chronotrack/import
POST   /api/integrations/runsignup/import
POST   /api/integrations/trisignup/import
GET    /api/integrations/weather/:location/:date
```

## State Management

### Redux Store Configuration
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import raceSlice from './slices/raceSlice';
import courseSlice from './slices/courseSlice';
import planningSlice from './slices/planningSlice';

export const store = configureStore({
  reducer: {
    api: api.reducer,
    auth: authSlice,
    user: userSlice,
    races: raceSlice,
    courses: courseSlice,
    planning: planningSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### RTK Query API Service
```typescript
// store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Race', 'Course', 'NutritionPlan', 'RacePlan'],
  endpoints: (builder) => ({
    // User endpoints
    getUserProfile: builder.query<User, void>({
      query: () => 'users/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: 'users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Race endpoints
    getRaces: builder.query<Race[], void>({
      query: () => 'races',
      providesTags: ['Race'],
    }),
    getRaceAnalysis: builder.query<RaceAnalysis, string>({
      query: (raceId) => `races/${raceId}/analysis`,
    }),
    addRace: builder.mutation<Race, Partial<Race>>({
      query: (raceData) => ({
        url: 'races',
        method: 'POST',
        body: raceData,
      }),
      invalidatesTags: ['Race'],
    }),
    
    // Course endpoints
    getCourses: builder.query<Course[], CoursesQuery>({
      query: (params) => ({
        url: 'courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourseDetails: builder.query<CourseDetails, string>({
      query: (courseId) => `courses/${courseId}`,
    }),
    
    // Dashboard data
    getDashboardData: builder.query<DashboardData, void>({
      query: () => 'dashboard',
      providesTags: ['User', 'Race'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetRacesQuery,
  useGetRaceAnalysisQuery,
  useAddRaceMutation,
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useGetDashboardDataQuery,
} = api;
```

### Auth Slice
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
```

## Error Handling & Validation

### Input Validation
```typescript
// utils/validation/schemas.ts
import * as yup from 'yup';

export const raceResultSchema = yup.object({
  raceName: yup.string().required('Race name is required'),
  raceDate: yup.date().required('Race date is required').max(new Date(), 'Race date cannot be in the future'),
  overallTime: yup.string().required('Overall time is required').matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  swimTime: yup.string().matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  t1Time: yup.string().matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  bikeTime: yup.string().matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  t2Time: yup.string().matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  runTime: yup.string().matches(/^\d{1,2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format'),
  placement: yup.number().positive('Placement must be positive').integer(),
});

export const userProfileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  ageGroup: yup.string().required('Age group is required'),
  experienceLevel: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required(),
  location: yup.string().required('Location is required'),
});
```

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-6 bg-slate-900">
          <Text className="text-white text-xl font-bold mb-4">Something went wrong</Text>
          <Text className="text-white/70 text-center mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Security Considerations

### API Security
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user as { id: string; email: string };
    next();
  });
};

// Rate limiting
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});
```

### Data Sanitization
```typescript
// utils/sanitization.ts
import validator from 'validator';

export const sanitizeInput = (input: string): string => {
  return validator.escape(input.trim());
};

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const sanitizeRaceData = (data: any) => {
  return {
    ...data,
    raceName: sanitizeInput(data.raceName),
    location: sanitizeInput(data.location),
    notes: data.notes ? sanitizeInput(data.notes) : null,
  };
};
```

## Performance Optimization

### Image Optimization
```typescript
// components/OptimizedImage.tsx
import React from 'react';
import { Image, ImageProps } from 'react-native';
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: string;
  quality?: 'low' | 'normal' | 'high';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  placeholder,
  quality = 'normal',
  ...props
}) => {
  if (typeof source === 'number') {
    return <Image source={source} {...props} />;
  }

  const priority = quality === 'high' ? FastImage.priority.high : FastImage.priority.normal;
  
  return (
    <FastImage
      source={{
        uri: source.uri,
        priority,
      }}
      {...props}
    />
  );
};
```

### Memoization Hooks
```typescript
// hooks/useMemoizedCalculations.ts
import { useMemo } from 'react';
import { Race } from '../types';

export const useTransitionAnalysis = (races: Race[]) => {
  return useMemo(() => {
    if (!races.length) return null;
    
    const totalT1Time = races.reduce((sum, race) => sum + (race.t1Time || 0), 0);
    const totalT2Time = races.reduce((sum, race) => sum + (race.t2Time || 0), 0);
    const avgT1 = totalT1Time / races.length;
    const avgT2 = totalT2Time / races.length;
    
    return {
      averageT1: avgT1,
      averageT2: avgT2,
      totalTransitionTime: avgT1 + avgT2,
      improvementTrend: calculateTrend(races),
    };
  }, [races]);
};

const calculateTrend = (races: Race[]) => {
  if (races.length < 2) return 0;
  
  const sortedRaces = [...races].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const firstHalf = sortedRaces.slice(0, Math.floor(sortedRaces.length / 2));
  const secondHalf = sortedRaces.slice(Math.floor(sortedRaces.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, race) => 
    sum + (race.t1Time || 0) + (race.t2Time || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, race) => 
    sum + (race.t1Time || 0) + (race.t2Time || 0), 0) / secondHalf.length;
  
  return ((secondAvg - firstAvg) / firstAvg) * 100; // Percentage change
};
```

## Development Workflow

### Current Development Phase: Core Implementation (85% Complete)

**✅ Completed:**
1. **Setup & Infrastructure**
   - ✅ React Native project with Expo SDK 52
   - ✅ Supabase backend configuration
   - ✅ Basic authentication system
   - ✅ Expo Router navigation structure
   - ✅ Tab-based navigation with 5 main screens

2. **Core Features (Partially Complete)**
   - ✅ User authentication and profiles
   - ✅ Race discovery with external API integration
   - ✅ Basic race planning tools (nutrition, gear, strategy, timeline)
   - 🚧 Personal race tracking (in progress)
   - 📋 Race result entry (planned)
   - 📋 Race analysis features (planned)

3. **UI/UX Foundation**
   - ✅ Glassmorphism design system
   - ✅ Mobile-first responsive layouts
   - ✅ Dark theme with gradient backgrounds
   - ✅ Bottom tab navigation with icons
   - ✅ Loading states and error handling
   - ✅ Cross-platform compatibility

**🚧 Current Priorities:**
- Complete user race tracking functionality
- Enhance database integration
- Implement race-specific planning features
- Add offline data persistence
- Improve error handling and user feedback

### Next Phase: Enhanced Analytics & Integrations (Planned)

**📋 Planned Features:**
1. **Race Analysis Engine**
   - Transition analytics with T1/T2 efficiency scoring
   - Performance comparison tools with age group data
   - AI-powered insights and recommendations
   - Historical performance trending

2. **Enhanced API Integrations**
   - ✅ RunSignUp race discovery (implemented)
   - ChronoTrack API for race results import
   - Weather service integration for environmental factors
   - Timing platform integrations for automatic data import

3. **Course Database**
   - Comprehensive course data with elevation profiles
   - Course difficulty ratings and reviews
   - Environmental factors (water temperature, typical weather)
   - User-generated course tips and strategies

### Advanced Features Phase (Future Development)

**🔮 Advanced Analytics:**
1. **Predictive Analytics Engine**
   - Machine learning race time predictions
   - Environmental performance modeling with weather correlation
   - Course-specific performance factors
   - Personal best predictions based on training

2. **Enhanced Nutrition Planning**
   - ✅ Basic nutrition planning (implemented)
   - Personalized fueling strategies
   - Real-time race day nutrition tracking
   - Integration with wearable devices

3. **Comprehensive Race Planning**
   - ✅ Basic race planning tools (implemented)
   - Advanced packing list management
   - Goal setting with progress tracking
   - Training plan integration

### Launch Preparation & Premium Features (Future)

**🚀 Pre-Launch Polish:**
1. **Performance Optimization**
   - ✅ Basic error handling (implemented)
   - App performance profiling and optimization
   - Offline functionality enhancement
   - Database query optimization

2. **User Experience Enhancement**
   - Smooth animations and transitions
   - Advanced accessibility features
   - Onboarding and tutorial system
   - Push notifications and reminders

3. **Premium Features & Monetization**
   - Freemium subscription model ($89.99/year)
   - Advanced analytics and insights
   - Data export capabilities
   - Priority support and beta features
   - Integration with premium timing platforms

**📊 Current Technical Metrics:**
- React Native/Expo SDK 52
- Supabase backend with PostgreSQL
- Cross-platform iOS/Android support
- Offline-capable with local storage
- Modern UI with glassmorphism design
- Error boundaries and graceful degradation

## Testing Strategy

### Unit Testing
```typescript
// __tests__/utils/calculations.test.ts
import { calculateTransitionEfficiency, predictRaceTime } from '../src/utils/calculations';

describe('Calculation Utils', () => {
  describe('calculateTransitionEfficiency', () => {
    it('should calculate efficiency correctly for normal times', () => {
      const result = calculateTransitionEfficiency(120, 90); // 2:00 T1, 1:30 T2
      expect(result.efficiency).toBeCloseTo(75.5);
      expect(result.grade).toBe('B');
    });

    it('should handle edge cases', () => {
      const result = calculateTransitionEfficiency(0, 0);
      expect(result.efficiency).toBe(100);
      expect(result.grade).toBe('A+');
    });
  });

  describe('predictRaceTime', () => {
    it('should predict race time based on historical data', () => {
      const userHistory = [
        { overallTime: 4800, course: { elevation: 500, swimType: 'lake' } },
        { overallTime: 4920, course: { elevation: 600, swimType: 'lake' } },
      ];
      
      const targetCourse = { elevation: 550, swimType: 'lake' };
      const prediction = predictRaceTime(userHistory, targetCourse);
      
      expect(prediction.predictedTime).toBeGreaterThan(4800);
      expect(prediction.predictedTime).toBeLessThan(4920);
    });
  });
});
```

### Integration Testing
```typescript
// __tests__/api/races.test.ts
import request from 'supertest';
import app from '../src/app';
import { createTestUser, createTestRace } from './helpers';

describe('Races API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const { user, token } = await createTestUser();
    authToken = token;
    userId = user.id;
  });

  describe('POST /api/races', () => {
    it('should create a new race result', async () => {
      const raceData = {
        raceName: 'Test Sprint Triathlon',
        date: '2025-09-06',
        overallTime: '01:25:30',
        swimTime: '00:12:15',
        t1Time: '00:02:30',
        bikeTime: '00:45:20',
        t2Time: '00:01:45',
        runTime: '00:23:40',
      };

      const response = await request(app)
        .post('/api/races')
        .set('Authorization', `Bearer ${authToken}`)
        .send(raceData)
        .expect(201);

      expect(response.body.raceName).toBe(raceData.raceName);
      expect(response.body.userId).toBe(userId);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        raceName: '',
        date: 'invalid-date',
      };

      await request(app)
        .post('/api/races')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/races/:id/analysis', () => {
    it('should return detailed race analysis', async () => {
      const race = await createTestRace(userId);
      
      const response = await request(app)
        .get(`/api/races/${race.id}/analysis`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transitionAnalysis');
      expect(response.body).toHaveProperty('performanceMetrics');
      expect(response.body).toHaveProperty('recommendations');
    });
  });
});
```

### E2E Testing with Detox
```typescript
// e2e/race-flow.e2e.ts
import { device, element, by, expect } from 'detox';

describe('Race Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Login with test user
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
  });

  it('should allow user to add a new race', async () => {
    // Navigate to races tab
    await element(by.id('races-tab')).tap();
    
    // Tap add race button
    await element(by.id('add-race-button')).tap();
    
    // Fill race form
    await element(by.id('race-name-input')).typeText('Test Sprint');
    await element(by.id('race-date-input')).typeText('2025-09-06');
    await element(by.id('overall-time-input')).typeText('01:25:30');
    
    // Submit form
    await element(by.id('save-race-button')).tap();
    
    // Verify race appears in list
    await expect(element(by.text('Test Sprint'))).toBeVisible();
  });

  it('should display race analysis', async () => {
    await element(by.id('races-tab')).tap();
    await element(by.text('Test Sprint')).tap();
    await element(by.text('View Analysis')).tap();
    
    await expect(element(by.id('transition-analysis'))).toBeVisible();
    await expect(element(by.id('performance-chart'))).toBeVisible();
  });
});
```

## Deployment Configuration

### Environment Variables
```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_CHRONOTRACK_API_KEY=dev-key
EXPO_PUBLIC_ENVIRONMENT=development

# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
EXPO_PUBLIC_API_BASE_URL=https://api.raceprep.kineticbrandpartners.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_ENVIRONMENT=production
```

### EAS Build Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "ENVIRONMENT": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "channel": "production",
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      },
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "production"
      }
    }
  }
}
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run lint
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Success Metrics & Analytics

### User Engagement Metrics
- **Daily Active Users (DAU)**: Target 15% of MAU
- **Monthly Active Users (MAU)**: Target 60% retention rate
- **Session Duration**: Target 8+ minutes average
- **Feature Adoption**: 70% of users try transition analytics

### Business Metrics
- **Conversion Rate**: 8% free-to-premium in Year 1
- **Customer Lifetime Value**: $180 (2-year retention × $89.99)
- **Customer Acquisition Cost**: Target <$30 through organic growth
- **Monthly Recurring Revenue Growth**: 15% month-over-month

### Technical Metrics
- **App Crash Rate**: <0.5% of sessions
- **API Response Time**: <200ms for 95th percentile
- **App Store Rating**: Maintain 4.5+ stars
- **Load Time**: <3 seconds for initial app load

### Analytics Implementation
```typescript
// services/analytics.ts
import { Analytics } from '@segment/analytics-react-native';

class AnalyticsService {
  private analytics: Analytics;

  constructor() {
    this.analytics = new Analytics({
      writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY!,
    });
  }

  trackRaceAdded(raceData: any) {
    this.analytics.track('Race Added', {
      raceType: raceData.distanceType,
      location: raceData.location,
      source: raceData.source, // manual, chronotrack, etc.
    });
  }

  trackTransitionAnalysisViewed(analysisData: any) {
    this.analytics.track('Transition Analysis Viewed', {
      t1Time: analysisData.t1Time,
      t2Time: analysisData.t2Time,
      improvementOpportunity: analysisData.improvementOpportunity,
    });
  }

  trackPremiumUpgrade(userId: string) {
    this.analytics.track('Premium Upgrade', {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  identifyUser(user: User) {
    this.analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      ageGroup: user.ageGroup,
      experienceLevel: user.experienceLevel,
      isPremium: user.premiumExpiresAt ? new Date(user.premiumExpiresAt) > new Date() : false,
    });
  }
}

export const analytics = new AnalyticsService();
```

## Monitoring & Observability

### Error Tracking with Sentry
```typescript
// services/errorTracking.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
});

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};
```

### Performance Monitoring
```typescript
// utils/performance.ts
export const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn.apply(this, args);
      const duration = performance.now() - start;
      
      // Log to analytics
      analytics.track('Performance Metric', {
        operation: name,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      analytics.track('Performance Metric', {
        operation: name,
        duration,
        success: false,
        error: error.message,
      });
      
      throw error;
    }
  };
};
```

## Data Privacy & Compliance

### GDPR Compliance
```typescript
// services/dataPrivacy.ts
export class DataPrivacyService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.getUserProfile(userId);
    const raceData = await this.getUserRaces(userId);
    const nutritionData = await this.getUserNutritionPlans(userId);
    
    return {
      profile: userData,
      races: raceData,
      nutritionPlans: nutritionData,
      exportDate: new Date().toISOString(),
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    // Soft delete user data while maintaining referential integrity
    await this.anonymizeUserProfile(userId);
    await this.deleteUserRaces(userId);
    await this.deleteUserNutritionPlans(userId);
    await this.deleteUserGoals(userId);
  }

  async anonymizeUserProfile(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({
        email: `deleted_${Date.now()}@deleted.com`,
        name: 'Deleted User',
        location: null,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }
}
```

## Accessibility Implementation

### Screen Reader Support
```typescript
// components/ui/AccessibleCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface AccessibleCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  value,
  description,
  icon,
}) => {
  const accessibilityLabel = `${title}: ${value}${description ? `. ${description}` : ''}`;
  
  return (
    <View
      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {icon && (
        <View className="mb-2" importantForAccessibility="no">
          {icon}
        </View>
      )}
      <Text className="text-sm text-white/60 mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-white font-mono">{value}</Text>
      {description && (
        <Text className="text-xs text-white/50 mt-1">{description}</Text>
      )}
    </View>
  );
};
```

### Focus Management
```typescript
// hooks/useFocusManagement.ts
import { useRef, useEffect } from 'react';
import { findNodeHandle, AccessibilityInfo } from 'react-native';

export const useFocusManagement = (shouldFocus: boolean = false) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }, [shouldFocus]);

  return ref;
};
```

## Localization Support

### Internationalization Setup
```typescript
// services/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0], // Get language code from device
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Localization Files
```json
// locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  },
  "dashboard": {
    "title": "RacePrep",
    "seasonProgress": "Season Progress",
    "personalBest": "Personal Best",
    "latestRace": "Latest Race Analysis",
    "nextRace": "Next Challenge"
  },
  "races": {
    "title": "Race History",
    "addRace": "Add Race",
    "raceCompleted": "{{count}} races completed this season",
    "personalRecord": "Personal Record",
    "viewAnalysis": "View Analysis"
  },
  "transitions": {
    "t1": "T1 (Swim to Bike)",
    "t2": "T2 (Bike to Run)",
    "efficiency": "Efficiency",
    "recommendations": "Recommendations",
    "improvementOpportunity": "{{seconds}}s improvement opportunity"
  },
  "nutrition": {
    "title": "Nutrition Planning",
    "preRace": "Pre-Race",
    "bikeSegment": "Bike Segment",
    "runSegment": "Run Segment",
    "carbohydrates": "Carbohydrates",
    "sodium": "Sodium",
    "caffeine": "Caffeine"
  }
}
```

## Backup & Recovery

### Data Backup Strategy
```typescript
// services/backupService.ts
export class BackupService {
  async createUserBackup(userId: string): Promise<string> {
    const userData = await this.exportAllUserData(userId);
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId,
      data: userData,
    };

    // Store backup in Supabase Storage
    const fileName = `backup_${userId}_${Date.now()}.json`;
    const { data, error } = await supabase.storage
      .from('backups')
      .upload(fileName, JSON.stringify(backupData), {
        contentType: 'application/json',
      });

    if (error) throw error;
    return fileName;
  }

  async restoreFromBackup(userId: string, backupFile: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from('backups')
      .download(backupFile);

    if (error) throw error;

    const backupData = JSON.parse(await data.text());
    await this.restoreUserData(userId, backupData.data);
  }

  private async exportAllUserData(userId: string) {
    const [profile, races, nutritionPlans, goals, equipment] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserRaces(userId),
      this.getUserNutritionPlans(userId),
      this.getUserGoals(userId),
      this.getUserEquipment(userId),
    ]);

    return { profile, races, nutritionPlans, goals, equipment };
  }
}
```

## Offline Support

### Offline Data Management
```typescript
// services/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private pendingActions: any[] = [];

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async cacheRaceData(races: Race[]): Promise<void> {
    await AsyncStorage.setItem('cached_races', JSON.stringify(races));
  }

  async getCachedRaceData(): Promise<Race[]> {
    const cachedData = await AsyncStorage.getItem('cached_races');
    return cachedData ? JSON.parse(cachedData) : [];
  }

  async queueAction(action: OfflineAction): Promise<void> {
    this.pendingActions.push(action);
    await AsyncStorage.setItem('pending_actions', JSON.stringify(this.pendingActions));
  }

  async syncPendingActions(): Promise<void> {
    const pendingActionsData = await AsyncStorage.getItem('pending_actions');
    if (!pendingActionsData) return;

    const actions = JSON.parse(pendingActionsData);
    
    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Keep failed actions for retry
        continue;
      }
    }

    // Clear successfully synced actions
    await AsyncStorage.removeItem('pending_actions');
    this.pendingActions = [];
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'ADD_RACE':
        await api.addRace(action.payload);
        break;
      case 'UPDATE_RACE':
        await api.updateRace(action.payload.id, action.payload.data);
        break;
      // Handle other action types
    }
  }
}
```

## Push Notifications

### Notification Service
```typescript
// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export class NotificationService {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  async scheduleRaceReminder(race: Race, daysBeforeOptions: number[] = [7, 3, 1]): Promise<void> {
    const raceDate = new Date(race.date);
    
    for (const daysBefore of daysBeforeOptions) {
      const reminderDate = new Date(raceDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);
      
      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Race Reminder: ${race.name}`,
            body: `Your race is in ${daysBefore} ${daysBefore === 1 ? 'day' : 'days'}! Time to finalize your preparation.`,
            data: { raceId: race.id, type: 'race_reminder' },
          },
          trigger: {
            date: reminderDate,
          },
        });
      }
    }
  }

  async scheduleTrainingReminder(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Training Check-in',
        body: 'How was your training this week? Log your sessions to track progress.',
        data: { type: 'training_reminder' },
      },
      trigger: {
        weekday: 7, // Sunday
        hour: 18,
        minute: 0,
        repeats: true,
      },
    });
  }
}
```

## Beta Testing & Feedback

### Feedback Collection
```typescript
// components/FeedbackModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput } from 'react-native';
import { Button } from './ui/Button';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  feature,
}) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);

  const submitFeedback = async () => {
    try {
      await api.submitFeedback({
        feedback,
        rating,
        feature,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
      
      analytics.track('Feedback Submitted', {
        feature,
        rating,
        hasText: feedback.length > 0,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-slate-900 p-6">
        <Text className="text-xl font-bold text-white mb-4">Share Your Feedback</Text>
        
        {feature && (
          <Text className="text-white/70 mb-4">About: {feature}</Text>
        )}
        
        <View className="mb-6">
          <Text className="text-white mb-2">How would you rate this feature?</Text>
          <View className="flex-row space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                title={star.toString()}
                variant={rating >= star ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setRating(star)}
              />
            ))}
          </View>
        </View>
        
        <View className="mb-6 flex-1">
          <Text className="text-white mb-2">Additional Comments</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg p-4 text-white h-32"
            multiline
            textAlignVertical="top"
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Tell us what you think..."
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        
        <View className="flex-row space-x-3">
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            title="Submit"
            onPress={submitFeedback}
            className="flex-1"
          />
        </View>
      </View>
    </Modal>
  );
};
```

## Documentation Standards

### API Documentation
```typescript
/**
 * Race Analysis Service
 * 
 * Provides comprehensive analysis of triathlon race performance including
 * transition efficiency, split comparisons, and improvement recommendations.
 * 
 * @example
 * ```typescript
 * const analysis = await raceAnalysisService.analyzeRace(userId, raceId);
 * console.log(analysis.transitionAnalysis.recommendations);
 * ```
 */
export class RaceAnalysisService {
  /**
   * Analyzes a complete race performance
   * 
   * @param userId - The user's unique identifier
   * @param raceId - The race result identifier
   * @returns Complete race analysis including transitions, splits, and recommendations
   * 
   * @throws {NotFoundError} When race or user is not found
   * @throws {ValidationError} When race data is incomplete
   */
  async analyzeRace(userId: string, raceId: string): Promise<RaceAnalysis> {
    // Implementation
  }

  /**
   * Calculates transition efficiency score
   * 
   * @param t1Time - T1 transition time in seconds
   * @param t2Time - T2 transition time in seconds
   * @param ageGroup - User's age group for comparison
   * @returns Efficiency score (0-100) and grade (A+ to F)
   */
  calculateTransitionEfficiency(
    t1Time: number, 
    t2Time: number, 
    ageGroup: string
  ): TransitionEfficiency {
    // Implementation
  }
}
```

### Component Documentation
```typescript
/**
 * Performance Chart Component
 * 
 * Displays user's race performance trends over time with interactive
 * data points and customizable time ranges.
 * 
 * @example
 * ```tsx
 * <PerformanceChart
 *   data={raceHistory}
 *   metric="overallTime"
 *   timeRange="6months"
 *   onDataPointPress={(race) => navigateToRace(race.id)}
 * />
 * ```
 */
interface PerformanceChartProps {
  /** Array of race results to display */
  data: RaceResult[];
  /** Performance metric to chart */
  metric: 'overallTime' | 'swimTime' | 'bikeTime' | 'runTime' | 'transitionTime';
  /** Time range for data display */
  timeRange?: '3months' | '6months' | '1year' | 'all';
  /** Callback when user taps on data point */
  onDataPointPress?: (race: RaceResult) => void;
  /** Optional custom styling */
  style?: ViewStyle;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = (props) => {
  // Implementation
};
```

## Release Notes Template

### Version 1.0.0 Release Notes
```markdown
# RacePrep v1.0.0 - Initial Release

## 🎉 Welcome to RacePrep!

The first triathlon app that understands your race as a complete event, not three separate sports.

### ✨ New Features

#### Race Tracking & Analysis
- **Comprehensive Race Entry**: Manual entry with full split timing support
- **Transition Analytics**: Detailed T1/T2 analysis with age group comparisons
- **Performance Insights**: AI-powered recommendations for improvement
- **Race History**: Beautiful timeline view of all your races

#### Course Database
- **50+ Pre-loaded Courses**: Sprint and Olympic distance races across major markets
- **Detailed Course Info**: Elevation, swim type, weather patterns, difficulty ratings
- **Course Reviews**: Community-driven ratings and tips

#### Race Planning
- **Nutrition Planning**: Science-based fueling strategies for race day
- **Packing Lists**: Customizable T1/T2 setup checklists
- **Race Predictions**: AI-powered time predictions based on course and conditions

#### Mobile Experience
- **Native iOS & Android**: Smooth, responsive performance on all devices
- **Dark Mode**: Beautiful glassmorphism design optimized for readability
- **Offline Support**: Core features work without internet connection

### 🔧 Technical Improvements
- Built with React Native for cross-platform consistency
- Real-time sync with cloud backup
- Secure authentication with social login options
- Accessibility features for all users

### 📊 What's Coming Next
- Integration with major timing platforms (ChronoTrack, RunSignUp)
- Advanced environmental performance modeling
- Training plan integration
- Social features and community challenges

### 🆘 Support
Having issues? Contact us at support@raceprep.kineticbrandpartners.com or visit our help center.

### 🙏 Thank You
Special thanks to our beta testers for their invaluable feedback.

---
*RacePrep is proudly built by triathletes, for triathletes.*
```

This completes the comprehensive development documentation for RacePrep. The documentation covers all aspects of the application from technical architecture to deployment strategies, providing a complete reference for the development team to build a production-ready triathlon tracking application.