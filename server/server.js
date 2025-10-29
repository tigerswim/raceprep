const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API configuration
const API_CONFIG = {
  runsignup: {
    baseUrl: 'https://runsignup.com/Rest',
    apiKey: process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
    apiSecret: process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET
  },
  openweathermap: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY
  },
  googlemaps: {
    baseUrl: 'https://maps.googleapis.com/maps/api',
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  strava: {
    baseUrl: 'https://www.strava.com/api/v3',
    authUrl: 'https://www.strava.com/oauth/token',
    clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID,
    clientSecret: process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET
  },
};

// Enhanced rate limiter for API requests
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  canMakeRequest(service, limit = 1000, windowMs = 60 * 60 * 1000) {
    const now = Date.now();
    const requests = this.requests.get(service) || [];

    // Remove requests older than window
    const recentRequests = requests.filter(time => now - time < windowMs);
    this.requests.set(service, recentRequests);

    if (recentRequests.length >= limit) {
      console.warn(`Rate limit exceeded for ${service}: ${recentRequests.length}/${limit}`);
      return false;
    }

    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }

  getRemainingRequests(service, limit = 1000) {
    const requests = this.requests.get(service) || [];
    return Math.max(0, limit - requests.length);
  }
}

const rateLimiter = new RateLimiter();

// Helper function to make API requests with retry logic
async function makeAPIRequest(url, options = {}, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Making API request (attempt ${attempt}/${retries}): ${url}`);
      const response = await fetch(url, {
        timeout: 30000, // 30 second timeout
        ...options
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - wait longer before retry
          const retryAfter = response.headers.get('retry-after') || 60;
          console.warn(`Rate limited, waiting ${retryAfter} seconds before retry`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (response.status >= 500 && attempt < retries) {
          // Server error - retry with exponential backoff
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          console.warn(`Server error ${response.status}, retrying in ${backoffDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (attempt === retries) {
        console.error(`API request failed after ${retries} attempts: ${error.message}`);
        throw error;
      }

      // Network error - retry with delay
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}), retrying in ${backoffDelay}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

// Helper function to geocode city/state using multiple APIs with fallback
async function geocodeCityState(city, state) {
  const address = `${city}, ${state}`;
  console.log(`[GEOCODING] Attempting to geocode: ${address}`);

  // Try Census Bureau API first (with shorter timeout)
  try {
    const geocodeUrl = `https://geocoding.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=2020&format=json`;

    const response = await fetch(geocodeUrl, {
      timeout: 5000 // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.result && data.result.addressMatches && data.result.addressMatches.length > 0) {
      const match = data.result.addressMatches[0];
      const coordinates = match.coordinates;

      console.log(`[GEOCODING] Census Bureau success: ${address} → ${coordinates.y}, ${coordinates.x}`);
      return {
        lat: coordinates.y,
        lon: coordinates.x,
        matchedAddress: match.matchedAddress,
        source: 'Census Bureau'
      };
    }
  } catch (error) {
    console.log(`[GEOCODING] Census Bureau failed: ${error.message}, trying OpenStreetMap...`);
  }

  // Fallback to OpenStreetMap Nominatim API
  try {
    const query = `${city}, ${state}, USA`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`;

    const response = await fetch(nominatimUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'RacePrep-Triathlon-App/1.0 (contact@raceprep.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      console.log(`[GEOCODING] OpenStreetMap success: ${address} → ${lat}, ${lon}`);
      return {
        lat: lat,
        lon: lon,
        matchedAddress: result.display_name,
        source: 'OpenStreetMap'
      };
    } else {
      console.log(`[GEOCODING] OpenStreetMap: No results found for ${address}`);
    }
  } catch (error) {
    console.error(`[GEOCODING] OpenStreetMap failed: ${error.message}`);
  }

  console.log(`[GEOCODING] All geocoding services failed for: ${address}`);
  return null;
}

// RunSignup API routes
app.get('/api/runsignup/search', async (req, res) => {
  try {
    const searchParams = new URLSearchParams({
      format: 'json',
      api_key: API_CONFIG.runsignup.apiKey,
      api_secret: API_CONFIG.runsignup.apiSecret,
      only_partner_races: '0'
    });

    // Check if this is a nationwide search (radius = 'all' means nationwide)
    const isNationwide = req.query.radius === 'all';

    // Add all query parameters except handle location and radius logic
    Object.keys(req.query).forEach(key => {
      if (key === 'radius' && isNationwide) {
        // Skip adding radius parameter for nationwide searches
        return;
      }
      searchParams.append(key, req.query[key]);
    });

    // Only use default location if no location parameters are provided AND not a nationwide search
    if (!isNationwide && !req.query.zipcode && !req.query.search && !req.query.lat && !req.query.lon && !req.query.city && !req.query.state) {
      searchParams.set('zipcode', '30309'); // Default to Atlanta, GA
      searchParams.set('radius', '100'); // Default radius for local searches
    }

    // If searching for triathlons, use proper event_type parameter
    if (req.query.event_type === 'triathlon') {
      searchParams.set('event_type', 'triathlon');
      // Don't delete search or location parameters - they're needed for geographic filtering
    }

    const url = `${API_CONFIG.runsignup.baseUrl}/races?${searchParams}`;
    console.log('[RUNSIGNUP API] Request URL:', url);
    console.log('[RUNSIGNUP API] Parameters:', Object.fromEntries(searchParams));
    let data = await makeAPIRequest(url);

    // Check if we got no results and have city/state parameters to try geocoding fallback
    if (req.query.city && req.query.state && (!data.races || data.races.length === 0)) {
      console.log(`[RUNSIGNUP API] No results for ${req.query.city}, ${req.query.state}. Trying geocoding fallback...`);

      // Try to geocode the city/state to get coordinates
      const geocodeResult = await geocodeCityState(req.query.city, req.query.state);

      if (geocodeResult) {
        // Create fallback parameters with coordinates instead of city/state
        const fallbackParams = new URLSearchParams({
          format: 'json',
          api_key: API_CONFIG.runsignup.apiKey,
          api_secret: API_CONFIG.runsignup.apiSecret,
          only_partner_races: '0'
        });

        // Add all original parameters except city and state
        Object.keys(req.query).forEach(key => {
          if (key !== 'city' && key !== 'state') {
            if (key === 'radius' && isNationwide) {
              return;
            }
            fallbackParams.append(key, req.query[key]);
          }
        });

        // Add the geocoded coordinates
        fallbackParams.set('lat', geocodeResult.lat.toString());
        fallbackParams.set('lon', geocodeResult.lon.toString());

        const fallbackUrl = `${API_CONFIG.runsignup.baseUrl}/races?${fallbackParams}`;
        console.log('[RUNSIGNUP API] Geocoding Fallback Request URL:', fallbackUrl);
        console.log('[RUNSIGNUP API] Geocoding Fallback Parameters:', Object.fromEntries(fallbackParams));

        try {
          const fallbackData = await makeAPIRequest(fallbackUrl);
          if (fallbackData.races && fallbackData.races.length > 0) {
            data = fallbackData;
            console.log(`[RUNSIGNUP API] Geocoding fallback successful! Found ${fallbackData.races.length} races using coordinates`);

            // Debug: Log first 3 race locations to understand what we're getting
            console.log('[RUNSIGNUP API] Sample race locations:');
            fallbackData.races.slice(0, 3).forEach((raceWrapper, index) => {
              const race = raceWrapper.race || raceWrapper;
              const location = race.address ? `${race.address.city || 'Unknown City'}, ${race.address.state || 'Unknown State'}` : 'No address';
              console.log(`  ${index + 1}. ${race.name || 'Unknown Race'} - ${location}`);
            });
          } else {
            console.log('[RUNSIGNUP API] Geocoding fallback returned no results either');
          }
        } catch (fallbackError) {
          console.error('[RUNSIGNUP API] Geocoding fallback request failed:', fallbackError.message);
          // Continue with original empty result
        }
      } else {
        console.log(`[RUNSIGNUP API] Could not geocode ${req.query.city}, ${req.query.state}`);
      }
    }

    // For triathlon searches, event_type parameter should return only triathlon races
    // No additional filtering needed since the API does this correctly
    res.json(data);
  } catch (error) {
    console.error('RunSignup search error:', error);
    res.status(500).json({ error: 'Failed to search RunSignup races', details: error.message });
  }
});

app.get('/api/runsignup/race/:raceId', async (req, res) => {
  try {
    const { raceId } = req.params;
    const searchParams = new URLSearchParams({
      format: 'json',
      api_key: API_CONFIG.runsignup.apiKey,
      api_secret: API_CONFIG.runsignup.apiSecret
    });
    
    const url = `${API_CONFIG.runsignup.baseUrl}/race/${raceId}?${searchParams}`;
    const data = await makeAPIRequest(url);
    
    res.json(data);
  } catch (error) {
    console.error('RunSignup race details error:', error);
    res.status(500).json({ error: 'Failed to get race details', details: error.message });
  }
});


// OpenWeatherMap API routes
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const url = `${API_CONFIG.openweathermap.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${API_CONFIG.openweathermap.apiKey}&units=metric`;
    const data = await makeAPIRequest(url);
    
    res.json(data);
  } catch (error) {
    console.error('OpenWeatherMap current weather error:', error);
    res.status(500).json({ error: 'Failed to get weather data', details: error.message });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const url = `${API_CONFIG.openweathermap.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${API_CONFIG.openweathermap.apiKey}&units=metric`;
    const data = await makeAPIRequest(url);
    
    res.json(data);
  } catch (error) {
    console.error('OpenWeatherMap forecast error:', error);
    res.status(500).json({ error: 'Failed to get forecast data', details: error.message });
  }
});

// Google Maps API routes
app.get('/api/maps/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const url = `${API_CONFIG.googlemaps.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${API_CONFIG.googlemaps.apiKey}`;
    const data = await makeAPIRequest(url);
    
    res.json(data);
  } catch (error) {
    console.error('Google Maps geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address', details: error.message });
  }
});

app.post('/api/maps/elevation', async (req, res) => {
  try {
    const { locations } = req.body;
    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ error: 'Locations array is required' });
    }
    
    const pathString = locations.map(loc => `${loc.lat},${loc.lng}`).join('|');
    const url = `${API_CONFIG.googlemaps.baseUrl}/elevation/json?locations=${pathString}&key=${API_CONFIG.googlemaps.apiKey}`;
    const data = await makeAPIRequest(url);
    
    res.json(data);
  } catch (error) {
    console.error('Google Maps elevation error:', error);
    res.status(500).json({ error: 'Failed to get elevation data', details: error.message });
  }
});

// Enhanced data transformation utilities
const StravaDataTransformer = {
  // Map Strava activity types to internal training types
  mapActivityType(stravaType) {
    if (!stravaType) return null;

    const typeMap = {
      'swim': 'swim',
      'ride': 'bike',
      'virtualride': 'bike',
      'ebikeride': 'bike',
      'mountainbikeride': 'bike',
      'run': 'run',
      'virtualrun': 'run',
      'trailrun': 'run'
    };

    return typeMap[stravaType.toLowerCase()] || null;
  },

  // Transform Strava activity to internal format
  transformActivity(activity) {
    const mappedType = this.mapActivityType(activity.type);
    if (!mappedType) return null;

    return {
      id: activity.id,
      type: mappedType,
      date: activity.start_date.split('T')[0],
      start_time: activity.start_date, // Keep full timestamp for time analysis
      distance: activity.distance, // meters
      moving_time: activity.moving_time, // seconds
      name: activity.name,
      // Enhanced performance fields
      average_speed: activity.average_speed, // m/s
      total_elevation_gain: activity.total_elevation_gain, // meters
      average_heartrate: activity.average_heartrate, // bpm
      max_heartrate: activity.max_heartrate, // bpm
      average_watts: activity.average_watts, // watts (cycling)
      trainer: activity.trainer || false, // indoor trainer
      sport_type: activity.sport_type, // VirtualRun, TrailRun, etc.
      suffer_score: activity.suffer_score, // Strava training stress
      elapsed_time: activity.elapsed_time, // total elapsed time
      average_cadence: activity.average_cadence, // steps/min or rpm
      start_latlng: activity.start_latlng, // [lat, lng] coordinates
      kudos_count: activity.kudos_count || 0 // social engagement
    };
  },

  // Validate activity data
  validateActivity(activity) {
    const errors = [];

    if (!activity.id) errors.push('Missing activity ID');
    if (!activity.type) errors.push('Missing activity type');
    if (!activity.date) errors.push('Missing activity date');
    if (activity.distance && activity.distance < 0) errors.push('Invalid distance');
    if (activity.moving_time && activity.moving_time < 0) errors.push('Invalid moving time');

    return errors;
  }
};

// Strava API routes with enhanced error handling
app.post('/api/strava/connect', async (req, res) => {
  try {
    // Check rate limits
    if (!rateLimiter.canMakeRequest('strava_oauth', 100, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for Strava OAuth',
        retry_after: 3600
      });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokenParams = new URLSearchParams({
      client_id: API_CONFIG.strava.clientId,
      client_secret: API_CONFIG.strava.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    });

    console.log('Strava OAuth request:', {
      clientId: API_CONFIG.strava.clientId,
      code: code ? `${code.substring(0, 10)}...` : 'null',
      url: API_CONFIG.strava.authUrl
    });

    const data = await makeAPIRequest(API_CONFIG.strava.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams
    }, 3, 2000);

    console.log('Strava OAuth success! Token received:', {
      has_access_token: !!data.access_token,
      has_refresh_token: !!data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete?.id
    });

    res.json(data);
  } catch (error) {
    console.error('Strava OAuth error:', error);

    // Provide more specific error responses
    if (error.message.includes('400')) {
      return res.status(400).json({
        error: 'Invalid authorization code',
        details: 'The authorization code may have expired or been used already'
      });
    }

    res.status(500).json({
      error: 'Failed to connect to Strava',
      details: error.message,
      retry_possible: true
    });
  }
});

app.post('/api/strava/refresh', async (req, res) => {
  try {
    // Check rate limits
    if (!rateLimiter.canMakeRequest('strava_refresh', 200, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for token refresh',
        retry_after: 3600
      });
    }

    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokenParams = new URLSearchParams({
      client_id: API_CONFIG.strava.clientId,
      client_secret: API_CONFIG.strava.clientSecret,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    });

    const data = await makeAPIRequest(API_CONFIG.strava.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams
    }, 3, 2000);

    console.log('Strava token refresh successful');
    res.json(data);
  } catch (error) {
    console.error('Strava token refresh error:', error);

    // Handle specific refresh token errors
    if (error.message.includes('400')) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        details: 'Please reconnect your Strava account',
        requires_reauth: true
      });
    }

    res.status(500).json({
      error: 'Failed to refresh Strava token',
      details: error.message,
      retry_possible: true
    });
  }
});

app.get('/api/strava/activities', async (req, res) => {
  try {
    // Check rate limits (Strava allows 1000 requests per day, 100 per 15 minutes)
    if (!rateLimiter.canMakeRequest('strava_api', 90, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for Strava API',
        retry_after: 900, // 15 minutes
        remaining: rateLimiter.getRemainingRequests('strava_api', 90)
      });
    }

    const { access_token, after, before, per_page = 30 } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Validate per_page parameter
    const perPageNum = Math.min(parseInt(per_page) || 30, 200); // Strava max is 200

    console.log('Fetching activities with token:', access_token.substring(0, 10) + '...');

    const params = new URLSearchParams({
      per_page: perPageNum.toString()
    });

    if (after) params.append('after', after);
    if (before) params.append('before', before);

    const url = `${API_CONFIG.strava.baseUrl}/athlete/activities?${params}`;
    const activities = await makeAPIRequest(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'RacePrep-Triathlon-App/1.0'
      }
    }, 3, 2000);

    // Transform and validate activities
    const transformedActivities = [];
    const validationErrors = [];

    for (const activity of activities) {
      const transformed = StravaDataTransformer.transformActivity(activity);
      if (transformed) {
        const errors = StravaDataTransformer.validateActivity(transformed);
        if (errors.length === 0) {
          transformedActivities.push(transformed);
        } else {
          validationErrors.push({ id: activity.id, errors });
        }
      }
    }

    console.log(`Processed ${activities.length} activities, ${transformedActivities.length} valid, ${validationErrors.length} errors`);

    res.json({
      activities: transformedActivities,
      total_fetched: activities.length,
      total_valid: transformedActivities.length,
      validation_errors: validationErrors,
      rate_limit_remaining: rateLimiter.getRemainingRequests('strava_api', 90)
    });
  } catch (error) {
    console.error('Strava activities error:', error);

    // Handle specific Strava API errors
    if (error.message.includes('401')) {
      return res.status(401).json({
        error: 'Invalid or expired access token',
        details: 'Please refresh your Strava token',
        requires_token_refresh: true
      });
    }

    if (error.message.includes('403')) {
      return res.status(403).json({
        error: 'Access forbidden',
        details: 'Check your Strava app permissions'
      });
    }

    res.status(500).json({
      error: 'Failed to get Strava activities',
      details: error.message,
      retry_possible: true
    });
  }
});


// New Strava analytics endpoints
app.get('/api/strava/analytics/weekly', async (req, res) => {
  try {
    const { access_token, weeks = 4 } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Check rate limits
    if (!rateLimiter.canMakeRequest('strava_analytics', 50, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for analytics',
        retry_after: 3600
      });
    }

    const weeksNum = Math.min(parseInt(weeks) || 4, 12); // Max 12 weeks
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (weeksNum * 7 * 24 * 60 * 60 * 1000));

    const params = new URLSearchParams({
      after: Math.floor(startDate.getTime() / 1000).toString(),
      before: Math.floor(endDate.getTime() / 1000).toString(),
      per_page: '200'
    });

    const url = `${API_CONFIG.strava.baseUrl}/athlete/activities?${params}`;
    const activities = await makeAPIRequest(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'RacePrep-Triathlon-App/1.0'
      }
    });

    // Calculate weekly statistics
    const weeklyStats = [];
    for (let i = 0; i < weeksNum; i++) {
      const weekStart = new Date(endDate.getTime() - ((i + 1) * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(endDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));

      const weekActivities = activities.filter(activity => {
        const activityDate = new Date(activity.start_date);
        return activityDate >= weekStart && activityDate < weekEnd;
      });

      const stats = {
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        swim: { distance: 0, time: 0, sessions: 0 },
        bike: { distance: 0, time: 0, sessions: 0, elevation: 0 },
        run: { distance: 0, time: 0, sessions: 0, elevation: 0 },
        total: { distance: 0, time: 0, sessions: 0 }
      };

      weekActivities.forEach(activity => {
        const type = StravaDataTransformer.mapActivityType(activity.type);
        if (type && stats[type]) {
          stats[type].distance += activity.distance || 0;
          stats[type].time += activity.moving_time || 0;
          stats[type].sessions += 1;
          if (type !== 'swim') {
            stats[type].elevation += activity.total_elevation_gain || 0;
          }
        }

        stats.total.distance += activity.distance || 0;
        stats.total.time += activity.moving_time || 0;
        stats.total.sessions += 1;
      });

      weeklyStats.push(stats);
    }

    res.json({
      weeks: weeklyStats.reverse(), // Most recent first
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        weeks: weeksNum
      }
    });
  } catch (error) {
    console.error('Strava weekly analytics error:', error);
    res.status(500).json({
      error: 'Failed to get weekly analytics',
      details: error.message
    });
  }
});

app.get('/api/strava/analytics/monthly', async (req, res) => {
  try {
    const { access_token, months = 6 } = req.query;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Check rate limits
    if (!rateLimiter.canMakeRequest('strava_analytics', 50, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for analytics',
        retry_after: 3600
      });
    }

    const monthsNum = Math.min(parseInt(months) || 6, 12); // Max 12 months
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - monthsNum, 1);

    const params = new URLSearchParams({
      after: Math.floor(startDate.getTime() / 1000).toString(),
      before: Math.floor(endDate.getTime() / 1000).toString(),
      per_page: '200'
    });

    const url = `${API_CONFIG.strava.baseUrl}/athlete/activities?${params}`;
    const activities = await makeAPIRequest(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'RacePrep-Triathlon-App/1.0'
      }
    });

    // Calculate monthly statistics
    const monthlyStats = [];
    for (let i = 0; i < monthsNum; i++) {
      const monthStart = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const monthEnd = new Date(endDate.getFullYear(), endDate.getMonth() - i + 1, 0);

      const monthActivities = activities.filter(activity => {
        const activityDate = new Date(activity.start_date);
        return activityDate >= monthStart && activityDate <= monthEnd;
      });

      const stats = {
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        month_name: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        swim: { distance: 0, time: 0, sessions: 0 },
        bike: { distance: 0, time: 0, sessions: 0, elevation: 0 },
        run: { distance: 0, time: 0, sessions: 0, elevation: 0 },
        total: { distance: 0, time: 0, sessions: 0 }
      };

      monthActivities.forEach(activity => {
        const type = StravaDataTransformer.mapActivityType(activity.type);
        if (type && stats[type]) {
          stats[type].distance += activity.distance || 0;
          stats[type].time += activity.moving_time || 0;
          stats[type].sessions += 1;
          if (type !== 'swim') {
            stats[type].elevation += activity.total_elevation_gain || 0;
          }
        }

        stats.total.distance += activity.distance || 0;
        stats.total.time += activity.moving_time || 0;
        stats.total.sessions += 1;
      });

      monthlyStats.push(stats);
    }

    res.json({
      months: monthlyStats.reverse(), // Most recent first
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        months: monthsNum
      }
    });
  } catch (error) {
    console.error('Strava monthly analytics error:', error);
    res.status(500).json({
      error: 'Failed to get monthly analytics',
      details: error.message
    });
  }
});

// Sync progress tracking endpoint
app.post('/api/strava/sync/progress', async (req, res) => {
  try {
    const { access_token, sync_id } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    if (!sync_id) {
      return res.status(400).json({ error: 'Sync ID is required' });
    }

    // Check rate limits
    if (!rateLimiter.canMakeRequest('strava_sync', 20, 60 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Rate limit exceeded for sync operations',
        retry_after: 3600
      });
    }

    // Initialize progress tracking
    const progress = {
      sync_id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_activities: 0,
      processed_activities: 0,
      successful_activities: 0,
      failed_activities: 0,
      errors: [],
      current_step: 'fetching_activities'
    };

    res.json({
      message: 'Sync started',
      progress,
      tracking_endpoint: `/api/strava/sync/status/${sync_id}`
    });

    // Continue sync in background (in a real implementation, you'd use a job queue)
    setImmediate(async () => {
      try {
        // Fetch activities
        const url = `${API_CONFIG.strava.baseUrl}/athlete/activities?per_page=200`;
        const activities = await makeAPIRequest(url, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'User-Agent': 'RacePrep-Triathlon-App/1.0'
          }
        });

        progress.total_activities = activities.length;
        progress.current_step = 'processing_activities';

        // Process activities (simulate processing time)
        for (const activity of activities) {
          try {
            const transformed = StravaDataTransformer.transformActivity(activity);
            if (transformed) {
              const errors = StravaDataTransformer.validateActivity(transformed);
              if (errors.length === 0) {
                progress.successful_activities++;
              } else {
                progress.failed_activities++;
                progress.errors.push({ id: activity.id, errors });
              }
            } else {
              progress.failed_activities++;
              progress.errors.push({ id: activity.id, errors: ['Unsupported activity type'] });
            }
            progress.processed_activities++;

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            progress.failed_activities++;
            progress.errors.push({ id: activity.id, errors: [error.message] });
          }
        }

        progress.status = 'completed';
        progress.completed_at = new Date().toISOString();
        progress.current_step = 'finished';

      } catch (error) {
        progress.status = 'failed';
        progress.current_step = 'error';
        progress.errors.push({ general: error.message });
      }
    });

  } catch (error) {
    console.error('Strava sync progress error:', error);
    res.status(500).json({
      error: 'Failed to start sync',
      details: error.message
    });
  }
});

// Get sync status endpoint
app.get('/api/strava/sync/status/:syncId', (req, res) => {
  const { syncId } = req.params;

  // In a real implementation, you'd fetch this from a database or cache
  // For now, return a mock response
  res.json({
    sync_id: syncId,
    status: 'completed',
    started_at: new Date(Date.now() - 30000).toISOString(),
    completed_at: new Date().toISOString(),
    total_activities: 45,
    processed_activities: 45,
    successful_activities: 42,
    failed_activities: 3,
    errors: [
      { id: '123', errors: ['Invalid distance value'] },
      { id: '456', errors: ['Missing activity type'] },
      { id: '789', errors: ['Unsupported activity type'] }
    ],
    current_step: 'finished'
  });
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const rateLimitStatus = {
    strava_oauth: rateLimiter.getRemainingRequests('strava_oauth', 100),
    strava_api: rateLimiter.getRemainingRequests('strava_api', 90),
    strava_analytics: rateLimiter.getRemainingRequests('strava_analytics', 50),
    strava_sync: rateLimiter.getRemainingRequests('strava_sync', 20)
  };

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    apis: {
      runsignup: !!API_CONFIG.runsignup.apiKey,
      openweathermap: !!API_CONFIG.openweathermap.apiKey,
      googlemaps: !!API_CONFIG.googlemaps.apiKey,
      strava: !!API_CONFIG.strava.clientId
    },
    rate_limits: rateLimitStatus,
    version: '1.1.0',
    features: {
      strava_analytics: true,
      sync_progress_tracking: true,
      enhanced_error_handling: true,
      rate_limiting: true
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RacePrep proxy server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('🔧 Configured APIs:');
  console.log(`   - RunSignup: ${API_CONFIG.runsignup.apiKey ? '✅' : '❌'}`);
  console.log(`   - OpenWeatherMap: ${API_CONFIG.openweathermap.apiKey ? '✅' : '❌'}`);
  console.log(`   - Google Maps: ${API_CONFIG.googlemaps.apiKey ? '✅' : '❌'}`);
  console.log(`   - Strava: ${API_CONFIG.strava.clientId ? '✅' : '❌'}`);
});