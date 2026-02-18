import { dbHelpers } from '../supabase';
import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';

// API Configuration - Using Local Proxy Server
const API_CONFIG = {
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
};

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
