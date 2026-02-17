// API Integration Services for Discover Tab
import { dbHelpers } from './supabase';
import { logger } from '../utils/logger';

// API Configuration - Using Local Proxy Server
const API_CONFIG = {
  proxy: {
    baseUrl: 'http://localhost:3001/api',
  },
  runsignup: {
    baseUrl: 'http://localhost:3001/api/runsignup',
    key: process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY,
    secret: process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET,
  },
  strava: {
    baseUrl: 'https://www.strava.com/api/v3',
    clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID,
    clientSecret: process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET,
    // Rate limits from Strava API documentation
    rateLimits: {
      daily: 1000,
      shortTerm: 100, // per 15 minutes
      oauth: 100 // per hour
    }
  },
  googleMaps: {
    baseUrl: 'http://localhost:3001/api/maps',
    key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  openWeather: {
    baseUrl: 'http://localhost:3001/api/weather',
    key: process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY,
  }
};

// Rate limiting helper
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(service: string, limit: number): boolean {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const requests = this.requests.get(service) || [];
    
    // Remove requests older than 1 hour
    const recentRequests = requests.filter(time => now - time < hour);
    this.requests.set(service, recentRequests);
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Race API Integrations
export class RaceAPIService {
  
  // Active.com API integration
  static async syncActiveComRaces() {
    if (!rateLimiter.canMakeRequest('active_com', 1000)) {
      throw new Error('Rate limit exceeded for Active.com API');
    }

    try {
      // Note: This would require actual Active.com API credentials
      // For now, we'll insert sample data to demonstrate the structure
      const sampleRaces = [
        {
          external_id: 'active_12345',
          api_source: 'active_com',
          name: 'Ironman 70.3 Miami',
          date: '2024-04-15',
          location: 'Miami, FL',
          city: 'Miami',
          state: 'FL',
          country: 'US',
          latitude: 25.7617,
          longitude: -80.1918,
          distance_type: '70.3',
          difficulty: 'intermediate',
          registration_url: 'https://www.active.com/miami-fl/triathlon/ironman-70-3-miami-2024',
          price_min: 285.00,
          price_max: 385.00,
          currency: 'USD',
          spots_available: 245,
          spots_total: 1500,
          is_sold_out: false,
          description: 'The premier 70.3 race in South Florida featuring a challenging ocean swim, scenic bike course, and exciting run through downtown Miami.',
          features: ['ocean_swim', 'flat_bike', 'urban_run']
        },
        {
          external_id: 'active_12346',
          api_source: 'active_com', 
          name: 'USAT Sprint Championship',
          date: '2024-05-22',
          location: 'Austin, TX',
          city: 'Austin',
          state: 'TX',
          country: 'US',
          latitude: 30.2672,
          longitude: -97.7431,
          distance_type: 'sprint',
          difficulty: 'beginner',
          registration_url: 'https://www.active.com/austin-tx/triathlon/usat-sprint-championship-2024',
          price_min: 95.00,
          price_max: 125.00,
          currency: 'USD',
          spots_available: 89,
          spots_total: 400,
          is_sold_out: false,
          description: 'USA Triathlon sanctioned sprint distance championship race at beautiful Lake Austin.',
          features: ['lake_swim', 'rolling_bike', 'flat_run']
        }
      ];

      for (const race of sampleRaces) {
        const { error } = await dbHelpers.externalRaces.create(race);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting race:', error);
        }
      }

      return { success: true, count: sampleRaces.length };
    } catch (error) {
      logger.error('Active.com API sync failed:', error);
      throw error;
    }
  }

  // RunSignUp API integration
  static async syncRunSignUpRaces() {
    if (!rateLimiter.canMakeRequest('runsignup', 500)) {
      throw new Error('Rate limit exceeded for RunSignUp API');
    }

    try {
      // Sample RunSignUp data
      const sampleRaces = [
        {
          external_id: 'runsignup_67890',
          api_source: 'runsignup',
          name: 'Challenge Roth',
          date: '2024-07-14', 
          location: 'Roth, Germany',
          city: 'Roth',
          state: 'Bavaria',
          country: 'DE',
          latitude: 49.2444,
          longitude: 11.0936,
          distance_type: 'ironman',
          difficulty: 'expert',
          registration_url: 'https://www.runsignup.com/race/challenge-roth-2024',
          price_min: 450.00,
          price_max: 450.00,
          currency: 'EUR',
          spots_available: 0,
          spots_total: 3500,
          is_sold_out: true,
          description: 'One of the most iconic Ironman-distance races in the world, known for incredible spectator support and festival atmosphere.',
          features: ['lake_swim', 'hilly_bike', 'flat_run', 'spectator_heavy']
        }
      ];

      for (const race of sampleRaces) {
        const { error } = await dbHelpers.externalRaces.create(race);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting race:', error);
        }
      }

      return { success: true, count: sampleRaces.length };
    } catch (error) {
      logger.error('RunSignUp API sync failed:', error);
      throw error;
    }
  }

  // Sync all race sources
  static async syncAllRaces() {
    const results = [];
    
    try {
      const activeResult = await this.syncActiveComRaces();
      results.push({ source: 'Active.com', ...activeResult });
    } catch (error) {
      results.push({ source: 'Active.com', success: false, error: error.message });
    }

    try {
      const runSignUpResult = await this.syncRunSignUpRaces();
      results.push({ source: 'RunSignUp', ...runSignUpResult });
    } catch (error) {
      results.push({ source: 'RunSignUp', success: false, error: error.message });
    }

    return results;
  }
}

// RunSignup API Integration
export class RunSignupAPIService {
  
  // Search for triathlon races
  static async searchTriathlonRaces(searchParams = {}) {
    if (!rateLimiter.canMakeRequest('runsignup', 1000)) {
      throw new Error('Rate limit exceeded for RunSignup API');
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        race_type: 'triathlon',
        only_partner_races: '0',
        ...searchParams
      });

      const response = await fetch(`${API_CONFIG.runsignup.baseUrl}/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RunSignup API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRunSignupRaces(data.races || []);
    } catch (error) {
      logger.error('RunSignup API error:', error);
      throw error;
    }
  }

  // Get race details by race ID
  static async getRaceDetails(raceId) {
    if (!rateLimiter.canMakeRequest('runsignup', 1000)) {
      throw new Error('Rate limit exceeded for RunSignup API');
    }

    try {
      const response = await fetch(`${API_CONFIG.runsignup.baseUrl}/race/${raceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RunSignup API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRunSignupRaceDetails(data.race);
    } catch (error) {
      logger.error('RunSignup race details error:', error);
      throw error;
    }
  }

  // Transform RunSignup race data to our course format
  static transformRunSignupRaces(races) {
    return races.map(race => ({
      external_id: race.race_id,
      source: 'runsignup',
      name: race.name,
      location: `${race.address?.city || ''}, ${race.address?.state || ''}`.trim(),
      distance_type: this.mapDistanceType(race.race_type_name),
      swim_type: 'open_water', // Default for triathlons
      description: race.description || '',
      website_url: race.url,
      race_date: race.next_date,
      registration_url: `https://runsignup.com/Race/${race.race_id}`,
      features: this.extractFeatures(race),
      created_at: new Date().toISOString()
    }));
  }

  // Transform detailed race data
  static transformRunSignupRaceDetails(race) {
    return {
      external_id: race.race_id,
      source: 'runsignup',
      name: race.name,
      location: `${race.address?.city || ''}, ${race.address?.state || ''}`.trim(),
      distance_type: this.mapDistanceType(race.race_type_name),
      swim_type: this.determineSwimType(race.description),
      description: race.description || '',
      website_url: race.url,
      race_date: race.next_date,
      registration_url: `https://runsignup.com/Race/${race.race_id}`,
      registration_opens: race.registration_opens,
      registration_closes: race.registration_closes,
      price_low: race.price_low,
      price_high: race.price_high,
      features: this.extractFeatures(race),
      latitude: race.address?.latitude,
      longitude: race.address?.longitude,
      created_at: new Date().toISOString()
    };
  }

  // Map RunSignup distance types to our format
  static mapDistanceType(raceType) {
    if (!raceType) return 'sprint';
    const type = raceType.toLowerCase();
    if (type.includes('ironman')) return 'ironman';
    if (type.includes('70.3') || type.includes('half')) return '70.3';
    if (type.includes('olympic') || type.includes('standard')) return 'olympic';
    return 'sprint';
  }

  // Determine swim type from description
  static determineSwimType(description) {
    if (!description) return null;
    const desc = description.toLowerCase();
    if (desc.includes('pool')) return 'pool';
    if (desc.includes('ocean') || desc.includes('sea')) return 'ocean';
    if (desc.includes('lake')) return 'lake';
    if (desc.includes('river')) return 'river';
    return null;
  }

  // Extract features from race data
  static extractFeatures(race) {
    const features = [];
    
    if (race.description) {
      const desc = race.description.toLowerCase();
      if (desc.includes('beginner')) features.push('beginner_friendly');
      if (desc.includes('challenging') || desc.includes('difficult')) features.push('challenging');
      if (desc.includes('scenic')) features.push('scenic_course');
      if (desc.includes('flat')) features.push('flat_course');
      if (desc.includes('hilly') || desc.includes('hills')) features.push('hilly_course');
    }

    if (race.price_low && race.price_low < 50) features.push('affordable');
    if (race.race_type_name?.toLowerCase().includes('sprint')) features.push('sprint_distance');
    
    return features;
  }

  // Sync triathlon races from RunSignup
  static async syncTriathlonRaces(maxResults = 50) {
    try {
      logger.debug('Syncing triathlon races from RunSignup...');
      
      // Search for triathlon races
      const races = await this.searchTriathlonRaces({
        results_per_page: maxResults,
        page: 1,
        race_type: 'triathlon',
        start_date: new Date().toISOString().split('T')[0] // From today forward
      });

      // Get existing races to check for duplicates
      const existingRaces = await dbHelpers.courses.getAll();
      const existingExternalIds = (existingRaces.data || [])
        .filter(race => race.external_id)
        .map(race => race.external_id);

      // Filter out duplicates
      const newRaces = races.filter(race => !existingExternalIds.includes(race.external_id));

      let successCount = 0;
      for (const race of newRaces) {
        try {
          const result = await dbHelpers.courses.create(race);
          if (result.data) {
            successCount++;
            logger.debug(`Added RunSignup race: ${race.name}`);
          }
        } catch (error) {
          logger.error(`Error adding race ${race.name}:`, error);
        }
      }

      return {
        success: true,
        count: successCount,
        skipped: races.length - successCount,
        total: races.length,
        source: 'RunSignup'
      };
    } catch (error) {
      logger.error('RunSignup sync error:', error);
      throw error;
    }
  }
}


// Enhanced Strava Training API Integration
export class StravaTrainingAPIService {
  private static readonly BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  // Enhanced activity sync with progress tracking
  static async syncActivitiesWithProgress(accessToken: string, options: {
    after?: number;
    before?: number;
    perPage?: number;
    onProgress?: (progress: any) => void;
  } = {}) {
    if (!rateLimiter.canMakeRequest('strava_sync', 20)) {
      throw new Error('Rate limit exceeded for Strava sync operations');
    }

    try {
      const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Start the sync operation
      const startResponse = await fetch(`${this.BASE_URL}/strava/sync/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: accessToken,
          sync_id: syncId
        })
      });

      if (!startResponse.ok) {
        const error = await startResponse.json();
        throw new Error(error.error || 'Failed to start sync');
      }

      const syncData = await startResponse.json();

      // Poll for progress if callback provided
      if (options.onProgress) {
        this.pollSyncProgress(syncId, options.onProgress);
      }

      return {
        syncId,
        trackingEndpoint: syncData.tracking_endpoint,
        initialProgress: syncData.progress
      };
    } catch (error) {
      logger.error('Strava sync with progress error:', error);
      throw error;
    }
  }

  // Poll sync progress
  private static async pollSyncProgress(syncId: string, onProgress: (progress: any) => void) {
    const poll = async () => {
      try {
        const response = await fetch(`${this.BASE_URL}/strava/sync/status/${syncId}`);
        if (response.ok) {
          const progress = await response.json();
          onProgress(progress);

          if (progress.status === 'in_progress') {
            setTimeout(poll, 2000); // Poll every 2 seconds
          }
        }
      } catch (error) {
        logger.error('Error polling sync progress:', error);
      }
    };

    poll();
  }

  // Get activities with enhanced error handling
  static async getActivities(accessToken: string, options: {
    after?: number;
    before?: number;
    perPage?: number;
  } = {}) {
    if (!rateLimiter.canMakeRequest('strava_api', 90)) {
      throw new Error('Rate limit exceeded for Strava API calls');
    }

    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        per_page: (options.perPage || 30).toString()
      });

      if (options.after) params.append('after', options.after.toString());
      if (options.before) params.append('before', options.before.toString());

      const response = await fetch(`${this.BASE_URL}/strava/activities?${params}`);

      if (response.status === 429) {
        const data = await response.json();
        throw new Error(`Rate limit exceeded. Retry after ${data.retry_after} seconds`);
      }

      if (response.status === 401) {
        throw new Error('Invalid or expired access token. Please refresh your token.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch activities');
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava activities error:', error);
      throw error;
    }
  }

  // Get weekly analytics
  static async getWeeklyAnalytics(accessToken: string, weeks: number = 4) {
    if (!rateLimiter.canMakeRequest('strava_analytics', 50)) {
      throw new Error('Rate limit exceeded for Strava analytics');
    }

    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        weeks: Math.min(weeks, 12).toString()
      });

      const response = await fetch(`${this.BASE_URL}/strava/analytics/weekly?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch weekly analytics');
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava weekly analytics error:', error);
      throw error;
    }
  }

  // Get monthly analytics
  static async getMonthlyAnalytics(accessToken: string, months: number = 6) {
    if (!rateLimiter.canMakeRequest('strava_analytics', 50)) {
      throw new Error('Rate limit exceeded for Strava analytics');
    }

    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        months: Math.min(months, 12).toString()
      });

      const response = await fetch(`${this.BASE_URL}/strava/analytics/monthly?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch monthly analytics');
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava monthly analytics error:', error);
      throw error;
    }
  }

  // Enhanced token management
  static async refreshToken(refreshToken: string) {
    if (!rateLimiter.canMakeRequest('strava_oauth', 100)) {
      throw new Error('Rate limit exceeded for Strava OAuth operations');
    }

    try {
      const response = await fetch(`${this.BASE_URL}/strava/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (response.status === 401) {
        throw new Error('Invalid refresh token. Please reconnect your Strava account.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refresh token');
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava token refresh error:', error);
      throw error;
    }
  }

  // Connect Strava account
  static async connectAccount(authCode: string) {
    if (!rateLimiter.canMakeRequest('strava_oauth', 100)) {
      throw new Error('Rate limit exceeded for Strava OAuth operations');
    }

    try {
      const response = await fetch(`${this.BASE_URL}/strava/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: authCode
        })
      });

      if (response.status === 400) {
        throw new Error('Invalid authorization code. Please try connecting again.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect Strava account');
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava connect error:', error);
      throw error;
    }
  }

  // Calculate training metrics from activities
  static calculateTrainingMetrics(activities: any[]) {
    const metrics = {
      total: {
        sessions: activities.length,
        distance: 0,
        time: 0,
        elevation: 0
      },
      swim: {
        sessions: 0,
        distance: 0,
        time: 0
      },
      bike: {
        sessions: 0,
        distance: 0,
        time: 0,
        elevation: 0,
        avgWatts: 0
      },
      run: {
        sessions: 0,
        distance: 0,
        time: 0,
        elevation: 0,
        avgPace: 0
      }
    };

    let totalWatts = 0;
    let bikeSessionsWithWatts = 0;
    let totalRunDistance = 0;
    let totalRunTime = 0;

    activities.forEach(activity => {
      const type = activity.type;
      const distance = activity.distance || 0;
      const time = activity.moving_time || 0;
      const elevation = activity.total_elevation_gain || 0;

      // Update totals
      metrics.total.distance += distance;
      metrics.total.time += time;
      metrics.total.elevation += elevation;

      // Update by discipline
      if (type === 'swim') {
        metrics.swim.sessions++;
        metrics.swim.distance += distance;
        metrics.swim.time += time;
      } else if (type === 'bike') {
        metrics.bike.sessions++;
        metrics.bike.distance += distance;
        metrics.bike.time += time;
        metrics.bike.elevation += elevation;

        if (activity.average_watts) {
          totalWatts += activity.average_watts;
          bikeSessionsWithWatts++;
        }
      } else if (type === 'run') {
        metrics.run.sessions++;
        metrics.run.distance += distance;
        metrics.run.time += time;
        metrics.run.elevation += elevation;

        if (distance > 0 && time > 0) {
          totalRunDistance += distance;
          totalRunTime += time;
        }
      }
    });

    // Calculate averages
    if (bikeSessionsWithWatts > 0) {
      metrics.bike.avgWatts = Math.round(totalWatts / bikeSessionsWithWatts);
    }

    if (totalRunDistance > 0 && totalRunTime > 0) {
      // Calculate average pace in minutes per mile
      const avgSpeedMs = totalRunDistance / totalRunTime; // m/s
      const avgPaceMinPerMile = 26.8224 / avgSpeedMs; // Convert to min/mile
      metrics.run.avgPace = Math.round(avgPaceMinPerMile * 100) / 100;
    }

    return metrics;
  }

  // Generate training insights
  static generateTrainingInsights(weeklyData: any[]) {
    if (weeklyData.length < 2) {
      return {
        trends: [],
        recommendations: ['Need more data to generate insights'],
        summary: 'Insufficient training data'
      };
    }

    const insights = {
      trends: [] as string[],
      recommendations: [] as string[],
      summary: ''
    };

    const currentWeek = weeklyData[0];
    const previousWeek = weeklyData[1];

    // Analyze trends
    const totalDistanceChange = ((currentWeek.total.distance - previousWeek.total.distance) / previousWeek.total.distance) * 100;
    const totalTimeChange = ((currentWeek.total.time - previousWeek.total.time) / previousWeek.total.time) * 100;

    if (totalDistanceChange > 10) {
      insights.trends.push(`Training volume increased by ${Math.round(totalDistanceChange)}%`);
    } else if (totalDistanceChange < -10) {
      insights.trends.push(`Training volume decreased by ${Math.round(Math.abs(totalDistanceChange))}%`);
    }

    // Generate recommendations
    if (currentWeek.swim.sessions < 2) {
      insights.recommendations.push('Consider adding more swim sessions for balanced triathlon training');
    }

    if (currentWeek.bike.distance < 50000) { // Less than 50km
      insights.recommendations.push('Increase bike volume for improved endurance');
    }

    if (currentWeek.run.sessions < 3) {
      insights.recommendations.push('Add more run sessions to build running fitness');
    }

    if (totalDistanceChange > 20) {
      insights.recommendations.push('Be careful of rapid volume increases to avoid injury');
    }

    // Generate summary
    const totalSessions = currentWeek.total.sessions;
    const totalHours = Math.round(currentWeek.total.time / 3600 * 10) / 10;
    const totalKm = Math.round(currentWeek.total.distance / 1000);

    insights.summary = `This week: ${totalSessions} sessions, ${totalHours} hours, ${totalKm}km total`;

    return insights;
  }
}

// Strava Segments API Integration (Legacy)
export class StravaSegmentsAPIService {
  
  // Get access token (requires OAuth flow)
  static async getAccessToken(authCode) {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: API_CONFIG.strava.clientId,
          client_secret: API_CONFIG.strava.clientSecret,
          code: authCode,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Strava OAuth error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava OAuth error:', error);
      throw error;
    }
  }

  // Search for segments near a location
  static async searchSegments(latitude, longitude, accessToken) {
    if (!rateLimiter.canMakeRequest('strava', 1000)) {
      throw new Error('Rate limit exceeded for Strava API');
    }

    try {
      const response = await fetch(
        `${API_CONFIG.strava.baseUrl}/segments/explore?bounds=${latitude-0.01},${longitude-0.01},${latitude+0.01},${longitude+0.01}&activity_type=running`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'RacePrep/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }

      const data = await response.json();
      return data.segments || [];
    } catch (error) {
      logger.error('Strava segments error:', error);
      throw error;
    }
  }

  // Get detailed segment information
  static async getSegmentDetails(segmentId, accessToken) {
    if (!rateLimiter.canMakeRequest('strava', 1000)) {
      throw new Error('Rate limit exceeded for Strava API');
    }

    try {
      const response = await fetch(`${API_CONFIG.strava.baseUrl}/segments/${segmentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'RacePrep/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Strava segment details error:', error);
      throw error;
    }
  }

  // Transform Strava segment to course format
  static transformStravaSegment(segment) {
    return {
      external_id: segment.id,
      source: 'strava',
      name: segment.name,
      location: `${segment.city || ''}, ${segment.state || ''}`.trim(),
      distance_type: this.mapSegmentToDistance(segment),
      description: `Strava segment: ${segment.name}. Distance: ${(segment.distance / 1000).toFixed(2)}km, Elevation: ${segment.elevation_high - segment.elevation_low}m`,
      bike_elevation_gain: segment.total_elevation_gain,
      overall_elevation: segment.total_elevation_gain,
      difficulty_score: this.calculateDifficultyFromSegment(segment),
      latitude: segment.start_latitude,
      longitude: segment.start_longitude,
      features: this.extractSegmentFeatures(segment),
      strava_segment_id: segment.id,
      created_at: new Date().toISOString()
    };
  }

  // Map segment distance to triathlon distance type
  static mapSegmentToDistance(segment) {
    const distance = segment.distance / 1000; // Convert to km
    if (distance > 40) return 'ironman';
    if (distance > 20) return '70.3';
    if (distance > 10) return 'olympic';
    return 'sprint';
  }

  // Calculate difficulty score from segment data
  static calculateDifficultyFromSegment(segment) {
    if (!segment.total_elevation_gain || !segment.distance) return 5;
    
    // Calculate elevation gain per km
    const elevationPerKm = segment.total_elevation_gain / (segment.distance / 1000);
    
    if (elevationPerKm > 100) return 10;
    if (elevationPerKm > 75) return 9;
    if (elevationPerKm > 50) return 8;
    if (elevationPerKm > 30) return 7;
    if (elevationPerKm > 20) return 6;
    return 5;
  }

  // Extract features from segment data
  static extractSegmentFeatures(segment) {
    const features = ['strava_segment'];
    
    if (segment.climb_category > 0) features.push('climbing');
    if (segment.total_elevation_gain > 500) features.push('hilly_course');
    if (segment.total_elevation_gain < 50) features.push('flat_course');
    if (segment.hazardous) features.push('technical_course');
    
    return features;
  }

  // Sync segments from popular triathlon locations
  static async syncTriathlonSegments(accessToken) {
    try {
      logger.debug('Syncing segments from Strava...');
      
      // Popular triathlon locations
      const locations = [
        { name: 'Kona, Hawaii', lat: 19.6390, lng: -155.9969 },
        { name: 'Nice, France', lat: 43.7102, lng: 7.2620 },
        { name: 'Boulder, Colorado', lat: 40.0150, lng: -105.2705 }
      ];

      let allSegments = [];
      for (const location of locations) {
        try {
          const segments = await this.searchSegments(location.lat, location.lng, accessToken);
          const transformedSegments = segments.map(segment => ({
            ...this.transformStravaSegment(segment),
            location: location.name
          }));
          allSegments.push(...transformedSegments);
        } catch (error) {
          logger.error(`Error fetching segments for ${location.name}:`, error);
        }
      }

      // Get existing courses to check for duplicates
      const existingCourses = await dbHelpers.courses.getAll();
      const existingExternalIds = (existingCourses.data || [])
        .filter(course => course.external_id)
        .map(course => course.external_id);

      // Filter out duplicates
      const newSegments = allSegments.filter(segment => !existingExternalIds.includes(segment.external_id));

      let successCount = 0;
      for (const segment of newSegments) {
        try {
          const result = await dbHelpers.courses.create(segment);
          if (result.data) {
            successCount++;
            logger.debug(`Added Strava segment: ${segment.name}`);
          }
        } catch (error) {
          logger.error(`Error adding segment ${segment.name}:`, error);
        }
      }

      return {
        success: true,
        count: successCount,
        skipped: allSegments.length - successCount,
        total: allSegments.length,
        source: 'Strava Segments'
      };
    } catch (error) {
      logger.error('Strava segments sync error:', error);
      throw error;
    }
  }
}

// Google Maps API Integration
export class GoogleMapsAPIService {
  
  // Geocode location to get coordinates
  static async geocodeLocation(address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_CONFIG.googleMaps.key}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results[0]?.geometry?.location || null;
    } catch (error) {
      logger.error('Google Maps geocoding error:', error);
      throw error;
    }
  }

  // Get elevation data for coordinates
  static async getElevationData(coordinates) {
    try {
      const locations = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_CONFIG.googleMaps.key}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      logger.error('Google Maps elevation error:', error);
      throw error;
    }
  }

  // Calculate course elevation profile
  static calculateElevationProfile(elevations) {
    if (elevations.length < 2) return { gain: 0, loss: 0, max: 0, min: 0 };

    let gain = 0;
    let loss = 0;
    let max = elevations[0].elevation;
    let min = elevations[0].elevation;

    for (let i = 1; i < elevations.length; i++) {
      const current = elevations[i].elevation;
      const previous = elevations[i - 1].elevation;
      const diff = current - previous;

      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);

      max = Math.max(max, current);
      min = Math.min(min, current);
    }

    return {
      gain: Math.round(gain),
      loss: Math.round(loss),
      max: Math.round(max),
      min: Math.round(min)
    };
  }
}

// OpenWeatherMap API Integration
export class OpenWeatherMapAPIService {
  
  // Get current weather for coordinates
  static async getCurrentWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/current?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        conditions: data.weather[0].main,
        description: data.weather[0].description,
        visibility: data.visibility,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('OpenWeatherMap current weather error:', error);
      throw error;
    }
  }

  // Get weather forecast for coordinates
  static async getWeatherForecast(latitude, longitude, days = 5) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return data.list.map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        conditions: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0
      }));
    } catch (error) {
      logger.error('OpenWeatherMap forecast error:', error);
      throw error;
    }
  }

  // Get historical weather data (requires paid plan)
  static async getHistoricalWeather(latitude, longitude, timestamp) {
    try {
      const response = await fetch(
        `${API_CONFIG.openWeather.baseUrl}/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${timestamp}&appid=${API_CONFIG.openWeather.key}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        temperature: data.current.temp,
        feels_like: data.current.feels_like,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_speed,
        wind_direction: data.current.wind_deg,
        conditions: data.current.weather[0].main,
        description: data.current.weather[0].description
      };
    } catch (error) {
      logger.error('OpenWeatherMap historical weather error:', error);
      throw error;
    }
  }

  // Analyze weather conditions for triathlon suitability
  static analyzeTriathlonConditions(weather) {
    const conditions = {
      overall: 'good',
      swim: 'good',
      bike: 'good',
      run: 'good',
      warnings: []
    };

    // Temperature analysis
    if (weather.temperature < 10) {
      conditions.overall = 'poor';
      conditions.warnings.push('Very cold conditions - hypothermia risk');
    } else if (weather.temperature > 35) {
      conditions.overall = 'poor';
      conditions.warnings.push('Very hot conditions - heat exhaustion risk');
    }

    // Wind analysis
    if (weather.wind_speed > 15) {
      conditions.bike = 'challenging';
      conditions.warnings.push('Strong winds - challenging bike conditions');
    }

    // Precipitation analysis
    if (weather.conditions.includes('Rain') || weather.conditions.includes('Storm')) {
      conditions.bike = 'poor';
      conditions.run = 'challenging';
      conditions.warnings.push('Wet conditions - reduced visibility and traction');
    }

    // Humidity analysis
    if (weather.humidity > 80 && weather.temperature > 25) {
      conditions.run = 'challenging';
      conditions.warnings.push('High humidity - increased dehydration risk');
    }

    return conditions;
  }
}

// Course Database API Integration
export class CourseAPIService {
  
  // Triathlon course database API integration
  static async syncTriathlonCourseData() {
    logger.debug('syncTriathlonCourseData() started');
    if (!rateLimiter.canMakeRequest('course_database', 500)) {
      throw new Error('Rate limit exceeded for Course Database API');
    }

    try {
      logger.debug('Rate limit passed, starting sync...');
      // Sample triathlon course data from various sources
      const sampleCourses = [
        {
          name: 'Ironman Louisville',
          location: 'Louisville, KY',
          distance_type: 'ironman',
          swim_type: 'river',
          bike_elevation_gain: 3200,
          run_elevation_gain: 400,
          overall_elevation: 3600,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Challenging Ironman course featuring a downstream/upstream Ohio River swim, rolling Kentucky countryside bike course, and multi-loop run through downtown Louisville.',
          website_url: 'https://www.ironman.com/louisville',
          features: ['river_swim', 'rolling_hills', 'urban_run', 'spectator_friendly']
        },
        {
          name: 'Escape from Alcatraz Triathlon',
          location: 'San Francisco, CA',
          distance_type: 'olympic',
          swim_type: 'ocean',
          bike_elevation_gain: 1800,
          run_elevation_gain: 900,
          overall_elevation: 2700,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Legendary triathlon featuring a frigid swim from Alcatraz Island, steep climbs through San Francisco hills, and challenging trail run.',
          website_url: 'https://www.escapefromalcatraztriathlon.com',
          features: ['cold_water_swim', 'steep_climbs', 'trail_run', 'iconic_course']
        },
        {
          name: 'ITU World Triathlon Championship',
          location: 'Yokohama, Japan',
          distance_type: 'olympic',
          swim_type: 'ocean',
          bike_elevation_gain: 800,
          run_elevation_gain: 200,
          overall_elevation: 1000,
          difficulty_score: 8,
          wetsuit_legal: false,
          description: 'Fast and technical Olympic distance course in Yokohama with non-wetsuit swim, technical bike course, and flat run.',
          features: ['non_wetsuit_swim', 'technical_bike', 'flat_run', 'draft_legal']
        },
        {
          name: 'Challenge Roth',
          location: 'Roth, Germany',
          distance_type: 'ironman',
          swim_type: 'lake',
          bike_elevation_gain: 3900,
          run_elevation_gain: 150,
          overall_elevation: 4050,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'One of the most scenic Ironman-distance races with incredible spectator support, featuring rolling Bavarian countryside and the famous "Solar Hill".',
          features: ['lake_swim', 'rolling_hills', 'spectator_heavy', 'solar_hill']
        },
        {
          name: 'Wildflower Long Course',
          location: 'Lake San Antonio, CA',
          distance_type: '70.3',
          swim_type: 'lake',
          bike_elevation_gain: 2800,
          run_elevation_gain: 800,
          overall_elevation: 3600,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Brutal half-Ironman known as "The Beast" featuring massive climbs, challenging descents, and California heat.',
          features: ['reservoir_swim', 'massive_climbs', 'hot_weather', 'challenging_run']
        },
        {
          name: 'London Triathlon',
          location: 'London, UK',
          distance_type: 'olympic',
          swim_type: 'river',
          bike_elevation_gain: 200,
          run_elevation_gain: 50,
          overall_elevation: 250,
          difficulty_score: 7,
          wetsuit_legal: true,
          description: 'Urban triathlon through the heart of London with Thames river swim, closed-road cycling, and iconic landmarks on the run.',
          features: ['river_swim', 'urban_course', 'flat_profile', 'landmark_views']
        },
        {
          name: 'Ironman Hawaii Kona',
          location: 'Kailua-Kona, HI',
          distance_type: 'ironman',
          swim_type: 'ocean',
          bike_elevation_gain: 5200,
          run_elevation_gain: 800,
          overall_elevation: 6000,
          difficulty_score: 10,
          wetsuit_legal: false,
          description: 'The most legendary triathlon course in the world. Brutal heat, crosswinds, and lava fields make this the ultimate test.',
          features: ['ocean_swim', 'lava_fields', 'crosswinds', 'extreme_heat', 'world_championship']
        },
        {
          name: 'Eagleman 70.3',
          location: 'Cambridge, MD',
          distance_type: '70.3',
          swim_type: 'river',
          bike_elevation_gain: 400,
          run_elevation_gain: 100,
          overall_elevation: 500,
          difficulty_score: 6,
          wetsuit_legal: true,
          description: 'Fast and flat half-Ironman course perfect for personal bests, featuring Choptank River swim and pancake-flat bike and run.',
          features: ['river_swim', 'flat_fast', 'pr_course', 'beginner_friendly']
        },
        {
          name: 'St. George Ironman 70.3',
          location: 'St. George, UT',
          distance_type: '70.3',
          swim_type: 'reservoir',
          bike_elevation_gain: 2600,
          run_elevation_gain: 400,
          overall_elevation: 3000,
          difficulty_score: 8,
          wetsuit_legal: true,
          description: 'Challenging desert course with stunning red rock scenery, featuring Sand Hollow Reservoir swim and hilly terrain.',
          features: ['reservoir_swim', 'desert_course', 'red_rocks', 'hilly_terrain']
        },
        {
          name: 'IM 70.3 World Championship',
          location: 'Nice, France',
          distance_type: '70.3',
          swim_type: 'ocean',
          bike_elevation_gain: 1200,
          run_elevation_gain: 150,
          overall_elevation: 1350,
          difficulty_score: 8,
          wetsuit_legal: true,
          description: 'Prestigious world championship course along the French Riviera with Mediterranean swim and scenic coastal roads.',
          features: ['mediterranean_swim', 'coastal_roads', 'world_championship', 'scenic_course']
        }
      ];

      // Get existing courses to check for duplicates
      logger.debug('Getting existing courses...');
      const existingCoursesResult = await dbHelpers.courses.getAll();
      logger.debug('Existing courses result:', existingCoursesResult);
      const existingCourses = existingCoursesResult.data || [];
      logger.debug('Found', existingCourses.length, 'existing courses');

      let successCount = 0;
      let skippedCount = 0;

      for (const course of sampleCourses) {
        try {
          // Check if course already exists by name and location
          const isDuplicate = existingCourses.some(existing =>
            existing.name.toLowerCase() === course.name.toLowerCase() &&
            existing.location.toLowerCase() === course.location.toLowerCase()
          );

          if (isDuplicate) {
            logger.debug(`Skipping duplicate course: ${course.name}`);
            skippedCount++;
            continue;
          }

          const result = await dbHelpers.courses.create(course);
          if (result.data) {
            successCount++;
            logger.debug(`Added new course: ${course.name}`);
          } else if (result.error) {
            logger.error('Error inserting course:', result.error);
          }
        } catch (error) {
          logger.error('Error creating course:', error);
        }
      }

      return { success: true, count: successCount, skipped: skippedCount, total: sampleCourses.length };
    } catch (error) {
      logger.error('Course Database API sync failed:', error);
      throw error;
    }
  }

  // Strava Segments API integration (for course elevation profiles)
  static async syncStravaSegments() {
    if (!rateLimiter.canMakeRequest('strava', 100)) {
      throw new Error('Rate limit exceeded for Strava API');
    }

    try {
      // Sample Strava segment data that could be used to enhance course information
      const sampleSegments = [
        {
          name: 'Kona Queen K Highway',
          location: 'Kailua-Kona, HI',
          distance_type: 'ironman',
          swim_type: null,
          bike_elevation_gain: 2800,
          run_elevation_gain: null,
          overall_elevation: 2800,
          difficulty_score: 10,
          wetsuit_legal: null,
          description: 'The infamous bike segment from Ironman Hawaii featuring relentless headwinds and scorching heat across lava fields.',
          features: ['lava_fields', 'crosswinds', 'heat', 'iconic_segment']
        },
        {
          name: 'Wildflower Nasty Grade',
          location: 'Lake San Antonio, CA',
          distance_type: '70.3',
          swim_type: null,
          bike_elevation_gain: 1200,
          run_elevation_gain: null,
          overall_elevation: 1200,
          difficulty_score: 10,
          wetsuit_legal: null,
          description: 'Legendary climb at Wildflower with 18% gradients that breaks athletes every year.',
          features: ['steep_climb', 'legendary_difficulty', 'race_breaker']
        }
      ];

      // Get existing courses to check for duplicates
      logger.debug('Getting existing courses...');
      const existingCoursesResult = await dbHelpers.courses.getAll();
      logger.debug('Existing courses result:', existingCoursesResult);
      const existingCourses = existingCoursesResult.data || [];
      logger.debug('Found', existingCourses.length, 'existing courses');

      let successCount = 0;
      let skippedCount = 0;

      for (const segment of sampleSegments) {
        try {
          // Check if course already exists by name and location
          const isDuplicate = existingCourses.some(existing =>
            existing.name.toLowerCase() === segment.name.toLowerCase() &&
            existing.location.toLowerCase() === segment.location.toLowerCase()
          );

          if (isDuplicate) {
            logger.debug(`Skipping duplicate segment: ${segment.name}`);
            skippedCount++;
            continue;
          }

          const result = await dbHelpers.courses.create(segment);
          if (result.data) {
            successCount++;
            logger.debug(`Added new segment: ${segment.name}`);
          } else if (result.error) {
            logger.error('Error inserting segment course:', result.error);
          }
        } catch (error) {
          logger.error('Error creating segment course:', error);
        }
      }

      return { success: true, count: successCount, skipped: skippedCount, total: sampleSegments.length };
    } catch (error) {
      logger.error('Strava Segments API sync failed:', error);
      throw error;
    }
  }

  // Sync all course sources
  static async syncAllCourses() {
    logger.debug('CourseAPIService.syncAllCourses() started');
    const results = [];

    // Priority 1: RunSignup API
    try {
      logger.debug('Starting RunSignup sync...');
      const runSignupResult = await RunSignupAPIService.syncTriathlonRaces(25);
      logger.debug('RunSignup sync result:', runSignupResult);
      results.push(runSignupResult);
    } catch (error) {
      logger.error('RunSignup sync error:', error);
      results.push({ source: 'RunSignup', success: false, error: error.message });
    }

    // Priority 3: Strava Segments (requires OAuth token)
    try {
      // Note: Strava requires OAuth token - this would need to be handled in UI
      logger.debug('Strava sync skipped - requires OAuth token');
      results.push({ source: 'Strava Segments', success: false, error: 'OAuth token required' });
    } catch (error) {
      logger.error('Strava sync error:', error);
      results.push({ source: 'Strava Segments', success: false, error: error.message });
    }

    // Fallback: Mock data
    try {
      logger.debug('Starting syncTriathlonCourseData...');
      const courseResult = await this.syncTriathlonCourseData();
      logger.debug('syncTriathlonCourseData result:', courseResult);
      results.push({ source: 'Triathlon Database', ...courseResult });
    } catch (error) {
      logger.error('syncTriathlonCourseData error:', error);
      results.push({ source: 'Triathlon Database', success: false, error: error.message });
    }

    return results;
  }
}

// Training Events API Integration
export class TrainingEventsService {
  
  // Meetup API integration
  static async syncMeetupEvents(city: string = 'Austin', state: string = 'TX') {
    if (!rateLimiter.canMakeRequest('meetup', 200)) {
      throw new Error('Rate limit exceeded for Meetup API');
    }

    try {
      // Sample Meetup data
      const sampleEvents = [
        {
          external_id: 'meetup_123',
          api_source: 'meetup',
          title: 'Open Water Swim Clinic - Lake Michigan',
          description: 'Join experienced open water swimmers for technique clinic and group swim. All skill levels welcome.',
          event_type: 'clinic',
          date: '2024-04-20',
          time: '07:00:00',
          duration_minutes: 90,
          location: 'Oak Street Beach, Chicago, IL',
          city: 'Chicago',
          state: 'IL',
          country: 'US',
          latitude: 41.9028,
          longitude: -87.6317,
          organizer_name: 'Chicago Triathlon Club',
          organizer_contact: 'info@chicagotri.com',
          event_url: 'https://www.meetup.com/chicago-tri/events/open-water-clinic',
          price: 15.00,
          currency: 'USD',
          spots_available: 12,
          skill_level: 'all',
          disciplines: ['swim']
        },
        {
          external_id: 'meetup_124',
          api_source: 'meetup',
          title: 'Brick Workout Training Session',
          description: 'Bike-to-run transition practice with structured intervals. Bring bike and running gear.',
          event_type: 'group_training',
          date: '2024-04-25',
          time: '06:00:00',
          duration_minutes: 120,
          location: 'Zilker Park, Austin, TX',
          city: 'Austin',
          state: 'TX',
          country: 'US',
          latitude: 30.2672,
          longitude: -97.7431,
          organizer_name: 'Austin Triathlon Group',
          organizer_contact: 'coach@austintri.com',
          event_url: 'https://www.meetup.com/austin-tri/events/brick-workout',
          price: 0.00,
          currency: 'USD',
          spots_available: 8,
          skill_level: 'intermediate',
          disciplines: ['bike', 'run', 'transition']
        }
      ];

      for (const event of sampleEvents) {
        const { error } = await dbHelpers.trainingEvents.create(event);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting event:', error);
        }
      }

      return { success: true, count: sampleEvents.length };
    } catch (error) {
      logger.error('Meetup API sync failed:', error);
      throw error;
    }
  }
}

// Amazon Product API Integration  
export class GearProductsService {
  
  // Amazon Product Advertising API integration
  static async syncAmazonProducts() {
    if (!rateLimiter.canMakeRequest('amazon_paapi', 8640)) {
      throw new Error('Rate limit exceeded for Amazon Product API');
    }

    try {
      // Sample Amazon product data
      const sampleProducts = [
        {
          external_id: 'amazon_B08XYZ123',
          api_source: 'amazon',
          name: 'XTERRA Vector Pro Wetsuit',
          brand: 'XTERRA',
          category: 'wetsuit',
          subcategory: 'fullsuit',
          price: 249.99,
          currency: 'USD',
          rating: 4.5,
          review_count: 847,
          image_url: 'https://images-na.ssl-images-amazon.com/images/I/71xyz123.jpg',
          product_url: 'https://amazon.com/dp/B08XYZ123',
          description: 'High-performance triathlon wetsuit with superior flexibility and buoyancy. Yamamoto neoprene construction.',
          features: ['yamamoto_neoprene', 'full_flexibility', 'easy_removal'],
          specifications: {
            thickness: '3/2mm',
            material: 'Yamamoto #39 Neoprene',
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
          },
          is_featured: true
        },
        {
          external_id: 'amazon_B09ABC456',
          api_source: 'amazon',
          name: 'Garmin Forerunner 945',
          brand: 'Garmin',
          category: 'electronics',
          subcategory: 'gps_watch',
          price: 599.99,
          currency: 'USD',
          rating: 4.7,
          review_count: 1203,
          image_url: 'https://images-na.ssl-images-amazon.com/images/I/71abc456.jpg', 
          product_url: 'https://amazon.com/dp/B09ABC456',
          description: 'Premium GPS running/triathlon smartwatch with performance metrics, mapping, and music.',
          features: ['gps_mapping', 'performance_metrics', 'music_storage', 'long_battery'],
          specifications: {
            battery_life: 'Up to 2 weeks smartwatch mode',
            water_rating: '5 ATM',
            connectivity: ['ANT+', 'Bluetooth', 'WiFi']
          },
          is_featured: true
        }
      ];

      for (const product of sampleProducts) {
        const { error } = await dbHelpers.gearProducts.create(product);
        if (error && !error.message.includes('duplicate')) {
          logger.error('Error inserting product:', error);
        }
      }

      return { success: true, count: sampleProducts.length };
    } catch (error) {
      logger.error('Amazon Product API sync failed:', error);
      throw error;
    }
  }
}

// RSS Feed Integration
export class RSSFeedService {
  
  // Fetch and parse RSS feeds
  static async syncRSSFeeds() {
    const { data: feeds } = await dbHelpers.rssFeeds.getActive();
    if (!feeds) return { success: false, error: 'No active RSS feeds found' };

    const results = [];

    for (const feed of feeds) {
      try {
        // Note: In a real implementation, you'd use an RSS parser library
        // For now, we'll insert sample articles to demonstrate the structure
        const sampleArticles = [
          {
            external_id: `${feed.name.toLowerCase().replace(/\s+/g, '_')}_1`,
            rss_source: feed.name,
            title: 'How to Improve Your Transition Times',
            content: 'Detailed guide on optimizing T1 and T2 transitions for better race performance...',
            excerpt: 'Learn key strategies to shave minutes off your transition times.',
            author: 'Coach Sarah Johnson',
            category: 'technique',
            disciplines: ['transition'],
            skill_level: 'all',
            reading_time_minutes: 5,
            article_url: `${feed.url}/improve-transition-times`,
            image_url: 'https://example.com/transition-image.jpg',
            published_at: new Date().toISOString(),
            is_featured: false
          },
          {
            external_id: `${feed.name.toLowerCase().replace(/\s+/g, '_')}_2`,
            rss_source: feed.name,
            title: 'Building Endurance for Long Distance Events',
            content: 'Comprehensive training approach for Ironman and 70.3 distance preparation...',
            excerpt: 'Master the art of aerobic base building and periodization.',
            author: 'Dr. Mike Thompson',
            category: 'training',
            disciplines: ['general'],
            skill_level: 'intermediate',
            reading_time_minutes: 8,
            article_url: `${feed.url}/building-endurance`,
            image_url: 'https://example.com/endurance-image.jpg',
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_featured: true
          }
        ];

        for (const article of sampleArticles) {
          const { error } = await dbHelpers.trainingArticles.create(article);
          if (error && !error.message.includes('duplicate')) {
            logger.error('Error inserting article:', error);
          }
        }

        results.push({ source: feed.name, success: true, count: sampleArticles.length });
      } catch (error) {
        results.push({ source: feed.name, success: false, error: error.message });
      }
    }

    return results;
  }
}

// Geolocation Service
export class GeolocationService {
  
  // Get user's current location
  static async getCurrentLocation(): Promise<{latitude: number, longitude: number} | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          logger.error('Geolocation error:', error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points (Haversine formula)
  static calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Filter events/races by location
  static filterByLocation<T extends {latitude?: number, longitude?: number}>(
    items: T[], 
    userLat: number, 
    userLon: number, 
    radiusMiles: number = 50
  ): T[] {
    return items.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      const distance = this.calculateDistance(userLat, userLon, item.latitude, item.longitude);
      return distance <= radiusMiles;
    });
  }
}

// Enhanced Training Data Sync Service
export class TrainingDataSyncService {

  // Sync Strava training data with progress tracking
  static async syncStravaData(accessToken: string, onProgress?: (progress: any) => void) {
    try {
      logger.debug('Starting Strava training data sync...');

      const result = await StravaTrainingAPIService.syncActivitiesWithProgress(accessToken, {
        perPage: 200,
        onProgress
      });

      logger.debug('Strava sync initiated:', result);
      return result;
    } catch (error) {
      logger.error('Strava sync error:', error);
      throw error;
    }
  }

  // Get comprehensive training analytics
  static async getTrainingAnalytics(accessToken: string) {
    try {
      const [weeklyData, monthlyData] = await Promise.all([
        StravaTrainingAPIService.getWeeklyAnalytics(accessToken, 8),
        StravaTrainingAPIService.getMonthlyAnalytics(accessToken, 6)
      ]);

      const insights = StravaTrainingAPIService.generateTrainingInsights(weeklyData.weeks);

      return {
        weekly: weeklyData,
        monthly: monthlyData,
        insights,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Training analytics error:', error);
      throw error;
    }
  }

  // Refresh Strava tokens automatically
  static async refreshStravaToken(refreshToken: string) {
    try {
      return await StravaTrainingAPIService.refreshToken(refreshToken);
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}

// Main sync service to orchestrate all data syncing
export class DiscoverSyncService {
  
  static async syncAllData() {
    logger.debug('Starting Discover tab data sync...');
    
    const results = {
      races: [],
      events: [],
      gear: [],
      articles: [],
      courses: [],
      errors: []
    };

    try {
      // Sync races
      const raceResults = await RaceAPIService.syncAllRaces();
      results.races = raceResults;
    } catch (error) {
      results.errors.push({ service: 'Races', error: error.message });
    }

    try {
      // Sync training events
      const eventResults = await TrainingEventsService.syncMeetupEvents();
      results.events.push(eventResults);
    } catch (error) {
      results.errors.push({ service: 'Training Events', error: error.message });
    }

    try {
      // Sync gear products
      const gearResults = await GearProductsService.syncAmazonProducts();
      results.gear.push(gearResults);
    } catch (error) {
      results.errors.push({ service: 'Gear Products', error: error.message });
    }

    try {
      // Sync RSS articles
      const articleResults = await RSSFeedService.syncRSSFeeds();
      results.articles.push(articleResults);
    } catch (error) {
      results.errors.push({ service: 'RSS Articles', error: error.message });
    }

    try {
      // Sync course data
      const courseResults = await CourseAPIService.syncAllCourses();
      results.courses = courseResults;
    } catch (error) {
      results.errors.push({ service: 'Course Database', error: error.message });
    }

    logger.debug('Discover tab data sync completed:', results);
    return results;
  }
}

// Training Performance Analysis Service
export class TrainingPerformanceService {

  // Analyze training periodization
  static analyzeTrainingPeriodization(monthlyData: any[]) {
    if (monthlyData.length < 3) {
      return {
        phase: 'insufficient_data',
        recommendation: 'Need at least 3 months of data for periodization analysis'
      };
    }

    const volumes = monthlyData.map(month => month.total.distance);
    const recentVolume = volumes.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const historicalVolume = volumes.slice(2).reduce((a, b) => a + b, 0) / (volumes.length - 2);

    const volumeChange = ((recentVolume - historicalVolume) / historicalVolume) * 100;

    let phase = 'maintenance';
    let recommendation = 'Continue current training load';

    if (volumeChange > 20) {
      phase = 'build';
      recommendation = 'Monitor fatigue levels during build phase';
    } else if (volumeChange < -20) {
      phase = 'recovery';
      recommendation = 'Good time for recovery and technique focus';
    } else if (volumeChange > 10) {
      phase = 'progressive_build';
      recommendation = 'Gradual volume increase - sustainable approach';
    }

    return {
      phase,
      recommendation,
      volumeChange: Math.round(volumeChange),
      recentVolume: Math.round(recentVolume / 1000), // km
      historicalVolume: Math.round(historicalVolume / 1000) // km
    };
  }

  // Calculate training stress balance
  static calculateTrainingStress(activities: any[]) {
    let totalStress = 0;
    let stressfulSessions = 0;

    activities.forEach(activity => {
      if (activity.suffer_score) {
        totalStress += activity.suffer_score;
        stressfulSessions++;
      }
    });

    const avgStress = stressfulSessions > 0 ? totalStress / stressfulSessions : 0;

    let stressLevel = 'moderate';
    let advice = 'Balanced training stress';

    if (avgStress > 80) {
      stressLevel = 'high';
      advice = 'Consider adding more recovery sessions';
    } else if (avgStress < 40) {
      stressLevel = 'low';
      advice = 'Could benefit from some higher intensity sessions';
    }

    return {
      avgStress: Math.round(avgStress),
      totalStress: Math.round(totalStress),
      stressLevel,
      advice,
      sessionsWithData: stressfulSessions
    };
  }

  // Identify training patterns
  static identifyTrainingPatterns(weeklyData: any[]) {
    const patterns = {
      consistency: 0,
      preferredDays: [] as string[],
      disciplineBalance: {
        swim: 0,
        bike: 0,
        run: 0
      },
      insights: [] as string[]
    };

    if (weeklyData.length === 0) return patterns;

    // Calculate consistency (percentage of weeks with at least 3 sessions)
    const consistentWeeks = weeklyData.filter(week => week.total.sessions >= 3).length;
    patterns.consistency = Math.round((consistentWeeks / weeklyData.length) * 100);

    // Calculate discipline balance
    const totalSessions = weeklyData.reduce((sum, week) => sum + week.total.sessions, 0);
    if (totalSessions > 0) {
      patterns.disciplineBalance.swim = Math.round((weeklyData.reduce((sum, week) => sum + week.swim.sessions, 0) / totalSessions) * 100);
      patterns.disciplineBalance.bike = Math.round((weeklyData.reduce((sum, week) => sum + week.bike.sessions, 0) / totalSessions) * 100);
      patterns.disciplineBalance.run = Math.round((weeklyData.reduce((sum, week) => sum + week.run.sessions, 0) / totalSessions) * 100);
    }

    // Generate insights
    if (patterns.consistency > 80) {
      patterns.insights.push('Excellent training consistency');
    } else if (patterns.consistency < 50) {
      patterns.insights.push('Focus on improving training consistency');
    }

    if (patterns.disciplineBalance.swim < 20) {
      patterns.insights.push('Consider increasing swim training frequency');
    }

    if (patterns.disciplineBalance.bike > 50) {
      patterns.insights.push('Bike-focused training - good for cycling strength');
    }

    if (patterns.disciplineBalance.run < 30) {
      patterns.insights.push('Running could use more attention in your training plan');
    }

    return patterns;
  }

  // Generate comprehensive performance report
  static generatePerformanceReport(analytics: any) {
    const { weekly, monthly } = analytics;

    const periodization = this.analyzeTrainingPeriodization(monthly.months);
    const stress = this.calculateTrainingStress(weekly.weeks.flatMap((week: any) => week.activities || []));
    const patterns = this.identifyTrainingPatterns(weekly.weeks);

    return {
      summary: {
        totalWeeks: weekly.weeks.length,
        totalMonths: monthly.months.length,
        currentPhase: periodization.phase,
        consistency: patterns.consistency
      },
      periodization,
      trainingStress: stress,
      patterns,
      recommendations: [
        periodization.recommendation,
        stress.advice,
        ...patterns.insights
      ].filter(Boolean),
      generatedAt: new Date().toISOString()
    };
  }
}