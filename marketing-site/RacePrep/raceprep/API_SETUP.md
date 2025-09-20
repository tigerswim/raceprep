# RacePrep API Integration Setup

This document outlines how to set up and configure the external APIs used by RacePrep for course data synchronization.

## 🚀 Priority APIs (Required)

### 1. RunSignup API (HIGH PRIORITY)
**Purpose**: Primary source for triathlon race data, registration info, and course details.

**Setup Steps**:
1. Visit [RunSignup Developer Portal](https://runsignup.com/API)
2. Create a developer account and request API access
3. Get your API key and secret from the developer dashboard
4. Add to `.env.local`:
   ```
   EXPO_PUBLIC_RUNSIGNUP_API_KEY=your-api-key
   EXPO_PUBLIC_RUNSIGNUP_API_SECRET=your-api-secret
   ```

**Features**:
- Search triathlon races by location/date
- Get detailed race information
- Access registration data and pricing
- Automatic duplicate prevention

**Rate Limits**: 1000 requests/hour

### 2. ChronoTrack API (HIGH PRIORITY)
**Purpose**: Race timing data, results, and event information for performance analysis.

**Setup Steps**:
1. Visit [ChronoTrack API](https://www.chronotrack.com/api)
2. Contact ChronoTrack for API access (typically for race organizers/timing companies)
3. Obtain your Bearer token
4. Add to `.env.local`:
   ```
   EXPO_PUBLIC_CHRONOTRACK_API_KEY=your-bearer-token
   ```

**Features**:
- Access race results and timing data
- Historical performance analysis
- Event search and filtering
- Professional timing data integration

**Rate Limits**: 500 requests/hour

## 🎯 Secondary APIs (Enhanced Features)

### 3. Strava Segments API
**Purpose**: Elevation profiles, segment data, and community-driven course information.

**Setup Steps**:
1. Visit [Strava Developers](https://developers.strava.com/)
2. Create a Strava application
3. Get your Client ID and Client Secret
4. Add to `.env.local`:
   ```
   EXPO_PUBLIC_STRAVA_CLIENT_ID=your-client-id
   EXPO_PUBLIC_STRAVA_CLIENT_SECRET=your-client-secret
   ```

**OAuth Flow Required**: Users must authenticate with Strava to access segment data.

**Features**:
- Elevation profiles for courses
- Segment difficulty analysis
- Popular route data
- Community insights

**Rate Limits**: 1000 requests/day per user

### 4. Google Maps API
**Purpose**: Geocoding, elevation data, and mapping services.

**Setup Steps**:
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Geocoding API
   - Elevation API
   - Maps JavaScript API
4. Create credentials (API Key)
5. Add to `.env.local`:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
   ```

**Features**:
- Convert addresses to coordinates
- Get elevation profiles for any route
- Calculate elevation gain/loss
- Map visualization

**Pricing**: Pay-per-use (generous free tier)

### 5. OpenWeatherMap API
**Purpose**: Weather conditions and forecasts for race planning.

**Setup Steps**:
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`:
   ```
   EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=your-api-key
   ```

**Features**:
- Current weather conditions
- 5-day weather forecasts
- Historical weather data (paid feature)
- Race condition analysis

**Rate Limits**: 1000 calls/day (free tier)

## 📋 Implementation Status

| API | Status | Integration | Features |
|-----|--------|-------------|----------|
| RunSignup | ✅ Complete | `RunSignupAPIService` | Race search, details, sync |
| ChronoTrack | ✅ Complete | `ChronoTrackAPIService` | Results, events, timing data |
| Strava Segments | ✅ Complete | `StravaSegmentsAPIService` | Segments, elevation, OAuth |
| Google Maps | ✅ Complete | `GoogleMapsAPIService` | Geocoding, elevation |
| OpenWeatherMap | ✅ Complete | `OpenWeatherMapAPIService` | Weather, forecasts, analysis |

## 🔧 Usage Examples

### Sync Races from RunSignup
```javascript
import { RunSignupAPIService } from './services/apiIntegrations';

// Search for triathlon races
const races = await RunSignupAPIService.searchTriathlonRaces({
  location: 'Georgia',
  start_date: '2024-01-01'
});

// Sync races to database
const result = await RunSignupAPIService.syncTriathlonRaces(50);
```

### Get Weather for Race Location
```javascript
import { OpenWeatherMapAPIService } from './services/apiIntegrations';

// Get current weather
const weather = await OpenWeatherMapAPIService.getCurrentWeather(33.7490, -84.3880);

// Analyze conditions for triathlon
const analysis = OpenWeatherMapAPIService.analyzeTriathlonConditions(weather);
```

### Get Elevation Data
```javascript
import { GoogleMapsAPIService } from './services/apiIntegrations';

// Get coordinates for an address
const coords = await GoogleMapsAPIService.geocodeLocation('Lake Lanier, GA');

// Get elevation profile
const elevations = await GoogleMapsAPIService.getElevationData([
  { lat: 34.1, lng: -83.9 },
  { lat: 34.2, lng: -83.8 }
]);
```

## 🔐 Security Notes

1. **Environment Variables**: Never commit API keys to version control
2. **Rate Limiting**: All APIs include rate limiting to prevent abuse
3. **Error Handling**: Comprehensive error handling for failed API calls
4. **OAuth**: Strava requires user authentication for data access

## 🚦 Testing the APIs

1. **Start the development server**: `npm start`
2. **Navigate to Courses tab**
3. **Click "Sync Courses"** to test all API integrations
4. **Check browser console** for detailed logs and any errors
5. **Verify data** appears in the course database

## 📈 Monitoring & Analytics

The system includes:
- Request rate limiting
- Comprehensive logging
- Error tracking and reporting
- API response time monitoring
- Success/failure statistics

## 🔄 Fallback Strategy

If external APIs are unavailable:
1. **Primary**: Use cached data from database
2. **Secondary**: Fall back to mock data
3. **Alert**: Notify user of limited functionality

## 📞 Support & Resources

- **RunSignup**: [Developer Documentation](https://runsignup.com/API)
- **ChronoTrack**: Contact support for API access
- **Strava**: [Developer Portal](https://developers.strava.com/)
- **Google Maps**: [API Documentation](https://developers.google.com/maps/documentation)
- **OpenWeatherMap**: [API Guide](https://openweathermap.org/guide)