// Enhanced Strava API Integration with Token Refresh and Performance Analytics
// Provides robust Strava integration with automatic token management and advanced analytics

import { dbHelpers, supabase } from '../supabase';
import { withRetry, withTimeout, TimeoutHandler, RequestTracker, CircuitBreaker } from '../shared/errorHandling';
import { logger } from '../../utils/logger';

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete_id: number;
  scope: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  date: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  average_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  suffer_score?: number;
  trainer: boolean;
  kudos_count: number;
}

export interface StravaAnalytics {
  weeklyStats: {
    week: string;
    totalDistance: number;
    totalTime: number;
    totalElevation: number;
    activityCount: number;
    swim: { distance: number; time: number; count: number };
    bike: { distance: number; time: number; count: number; elevation: number; avgWatts?: number };
    run: { distance: number; time: number; count: number; elevation: number; avgPace?: number };
  }[];
  monthlyTrends: {
    month: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  }[];
  performanceInsights: {
    consistency: number; // percentage
    improvementAreas: string[];
    recommendations: string[];
  };
}

export interface StravaSyncProgress {
  syncId: string;
  status: 'starting' | 'fetching' | 'processing' | 'completed' | 'failed';
  totalActivities: number;
  processedActivities: number;
  successfulActivities: number;
  failedActivities: number;
  currentStep: string;
  errors: any[];
  startedAt: string;
  completedAt?: string;
}

export class EnhancedStravaApiService {
  private static readonly BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  private static circuitBreaker = new CircuitBreaker(3, 60000); // 3 failures, 1 minute timeout
  private static tokenCache = new Map<string, StravaTokens>();
  private static syncProgress = new Map<string, StravaSyncProgress>();

  // Rate limiting configuration
  private static readonly RATE_LIMITS = {
    daily: 1000,
    short_term: 100, // per 15 minutes
    oauth: 100 // per hour
  };

  private static requestCounts = {
    daily: { count: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 },
    short_term: { count: 0, resetTime: Date.now() + 15 * 60 * 1000 },
    oauth: { count: 0, resetTime: Date.now() + 60 * 60 * 1000 }
  };

  // Enhanced token management with automatic refresh
  static async ensureValidToken(userId: string): Promise<StravaTokens> {
    const trackingId = RequestTracker.start('strava_token_ensure', userId);

    try {
      // Check cache first
      const cachedTokens = this.tokenCache.get(userId);
      if (cachedTokens && this.isTokenValid(cachedTokens)) {
        RequestTracker.end(trackingId, true);
        return cachedTokens;
      }

      // Get tokens from database
      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('strava_access_token, strava_refresh_token, strava_expires_at, strava_athlete_id')
        .eq('user_id', userId)
        .single();

      if (error || !userSettings?.strava_refresh_token) {
        throw new Error('No Strava tokens found for user');
      }

      const tokens: StravaTokens = {
        access_token: userSettings.strava_access_token,
        refresh_token: userSettings.strava_refresh_token,
        expires_at: userSettings.strava_expires_at,
        athlete_id: userSettings.strava_athlete_id,
        scope: 'read,activity:read_all'
      };

      // Check if token needs refresh
      if (!this.isTokenValid(tokens)) {
        const refreshedTokens = await this.refreshToken(tokens.refresh_token, userId);
        this.tokenCache.set(userId, refreshedTokens);
        RequestTracker.end(trackingId, true);
        return refreshedTokens;
      }

      // Cache valid tokens
      this.tokenCache.set(userId, tokens);
      RequestTracker.end(trackingId, true);
      return tokens;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[STRAVA_API] Error ensuring valid token:', error);
      throw error;
    }
  }

  // Enhanced token refresh with automatic database update
  static async refreshToken(refreshToken: string, userId: string): Promise<StravaTokens> {
    const trackingId = RequestTracker.start('strava_token_refresh', userId);

    try {
      // Check rate limits
      this.checkRateLimit('oauth');

      const response = await this.circuitBreaker.execute(async () => {
        return await withTimeout(
          fetch(`${this.BASE_URL}/strava/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          }),
          TimeoutHandler.getTimeout('api'),
          'strava_token_refresh'
        );
      }, 'strava_token_refresh');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token refresh failed');
      }

      const tokenData = await response.json();

      const newTokens: StravaTokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_id: tokenData.athlete?.id || tokenData.athlete_id,
        scope: tokenData.scope || 'read,activity:read_all'
      };

      // Update database with new tokens
      await this.updateTokensInDatabase(userId, newTokens);

      // Update cache
      this.tokenCache.set(userId, newTokens);

      RequestTracker.end(trackingId, true);
      return newTokens;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[STRAVA_API] Token refresh failed:', error);
      throw error;
    }
  }

  // Enhanced activity sync with progress tracking
  static async syncActivitiesWithProgress(
    userId: string,
    options: {
      after?: number;
      before?: number;
      onProgress?: (progress: StravaSyncProgress) => void;
    } = {}
  ): Promise<string> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trackingId = RequestTracker.start('strava_activity_sync', userId, { syncId });

    // Initialize progress tracking
    const progress: StravaSyncProgress = {
      syncId,
      status: 'starting',
      totalActivities: 0,
      processedActivities: 0,
      successfulActivities: 0,
      failedActivities: 0,
      currentStep: 'Initializing sync',
      errors: [],
      startedAt: new Date().toISOString()
    };

    this.syncProgress.set(syncId, progress);

    // Start async sync process
    setImmediate(async () => {
      try {
        // Get valid tokens
        progress.status = 'fetching';
        progress.currentStep = 'Getting access tokens';
        this.updateProgress(syncId, progress, options.onProgress);

        const tokens = await this.ensureValidToken(userId);

        // Fetch activities from Strava
        progress.currentStep = 'Fetching activities from Strava';
        this.updateProgress(syncId, progress, options.onProgress);

        const activities = await this.fetchAllActivities(tokens.access_token, options);
        progress.totalActivities = activities.length;

        // Process activities
        progress.status = 'processing';
        progress.currentStep = 'Processing and saving activities';
        this.updateProgress(syncId, progress, options.onProgress);

        const processedActivities = [];
        for (const activity of activities) {
          try {
            const transformed = this.transformActivity(activity);
            if (transformed) {
              processedActivities.push({
                ...transformed,
                user_id: userId,
                strava_activity_id: activity.id.toString()
              });
              progress.successfulActivities++;
            } else {
              progress.failedActivities++;
              progress.errors.push({ id: activity.id, error: 'Unsupported activity type' });
            }
          } catch (error) {
            progress.failedActivities++;
            progress.errors.push({ id: activity.id, error: error.message });
          }

          progress.processedActivities++;
          if (progress.processedActivities % 10 === 0) {
            this.updateProgress(syncId, progress, options.onProgress);
          }
        }

        // Bulk insert activities
        if (processedActivities.length > 0) {
          progress.currentStep = 'Saving activities to database';
          this.updateProgress(syncId, progress, options.onProgress);

          const { error } = await dbHelpers.trainingSessions.bulkUpsert(processedActivities);
          if (error) {
            logger.error('[STRAVA_SYNC] Bulk upsert error:', error);
            progress.errors.push({ general: 'Database save error: ' + error });
          }
        }

        // Complete sync
        progress.status = 'completed';
        progress.currentStep = 'Sync completed successfully';
        progress.completedAt = new Date().toISOString();
        this.updateProgress(syncId, progress, options.onProgress);

        // Invalidate related caches
        dbHelpers.cache.invalidate(`training_${userId}`);
        dbHelpers.cache.invalidate(`dashboard_overview_${userId}`);

        RequestTracker.end(trackingId, true);
      } catch (error) {
        progress.status = 'failed';
        progress.currentStep = 'Sync failed';
        progress.errors.push({ general: error.message });
        this.updateProgress(syncId, progress, options.onProgress);

        RequestTracker.end(trackingId, false, error);
        logger.error('[STRAVA_SYNC] Sync failed:', error);
      }
    });

    return syncId;
  }

  // Get comprehensive training analytics
  static async getTrainingAnalytics(userId: string, weeks: number = 12): Promise<StravaAnalytics> {
    const trackingId = RequestTracker.start('strava_analytics', userId, { weeks });

    try {
      const tokens = await this.ensureValidToken(userId);

      // Check rate limits
      this.checkRateLimit('short_term');

      // Fetch analytics data
      const response = await this.circuitBreaker.execute(async () => {
        return await withTimeout(
          fetch(`${this.BASE_URL}/strava/analytics/comprehensive?access_token=${tokens.access_token}&weeks=${weeks}`, {
            headers: { 'User-Agent': 'RacePrep-Triathlon-App/1.0' }
          }),
          TimeoutHandler.getTimeout('api'),
          'strava_analytics'
        );
      }, 'strava_analytics');

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      const analyticsData = await response.json();

      // Process and enhance analytics
      const enhancedAnalytics = this.enhanceAnalytics(analyticsData);

      RequestTracker.end(trackingId, true);
      return enhancedAnalytics;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[STRAVA_ANALYTICS] Error getting analytics:', error);
      throw error;
    }
  }

  // Get sync progress
  static getSyncProgress(syncId: string): StravaSyncProgress | null {
    return this.syncProgress.get(syncId) || null;
  }

  // Connect Strava account
  static async connectAccount(authCode: string, userId: string): Promise<StravaTokens> {
    const trackingId = RequestTracker.start('strava_connect', userId);

    try {
      // Check rate limits
      this.checkRateLimit('oauth');

      const response = await this.circuitBreaker.execute(async () => {
        return await withTimeout(
          fetch(`${this.BASE_URL}/strava/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode })
          }),
          TimeoutHandler.getTimeout('api'),
          'strava_connect'
        );
      }, 'strava_connect');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect Strava account');
      }

      const tokenData = await response.json();

      const tokens: StravaTokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_id: tokenData.athlete?.id,
        scope: tokenData.scope
      };

      // Save tokens to database
      await this.updateTokensInDatabase(userId, tokens);

      // Cache tokens
      this.tokenCache.set(userId, tokens);

      RequestTracker.end(trackingId, true);
      return tokens;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[STRAVA_CONNECT] Connection failed:', error);
      throw error;
    }
  }

  // Disconnect Strava account
  static async disconnectAccount(userId: string): Promise<void> {
    const trackingId = RequestTracker.start('strava_disconnect', userId);

    try {
      // Remove tokens from database
      await supabase
        .from('user_settings')
        .update({
          strava_access_token: null,
          strava_refresh_token: null,
          strava_expires_at: null,
          strava_athlete_id: null
        })
        .eq('user_id', userId);

      // Remove from cache
      this.tokenCache.delete(userId);

      // Clear user's training sessions from Strava
      await dbHelpers.trainingSessions.deleteAll();

      RequestTracker.end(trackingId, true);
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[STRAVA_DISCONNECT] Disconnection failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private static isTokenValid(tokens: StravaTokens): boolean {
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 300; // 5 minutes buffer
    return tokens.expires_at > (now + bufferTime);
  }

  private static async updateTokensInDatabase(userId: string, tokens: StravaTokens): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        strava_access_token: tokens.access_token,
        strava_refresh_token: tokens.refresh_token,
        strava_expires_at: tokens.expires_at,
        strava_athlete_id: tokens.athlete_id
      });

    if (error) {
      throw new Error(`Failed to update tokens in database: ${error.message}`);
    }
  }

  private static async fetchAllActivities(
    accessToken: string,
    options: { after?: number; before?: number }
  ): Promise<any[]> {
    const activities: any[] = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      // Check rate limits
      this.checkRateLimit('short_term');

      const params = new URLSearchParams({
        access_token: accessToken,
        per_page: perPage.toString(),
        page: page.toString()
      });

      if (options.after) params.append('after', options.after.toString());
      if (options.before) params.append('before', options.before.toString());

      const response = await withTimeout(
        fetch(`${this.BASE_URL}/strava/activities?${params}`),
        TimeoutHandler.getTimeout('api'),
        `strava_activities_page_${page}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activities page ${page}: ${response.status}`);
      }

      const pageActivities = await response.json();

      if (!pageActivities.activities || pageActivities.activities.length === 0) {
        break;
      }

      activities.push(...pageActivities.activities);

      // Stop if we got less than the full page
      if (pageActivities.activities.length < perPage) {
        break;
      }

      page++;

      // Safety limit to prevent infinite loops
      if (page > 100) {
        logger.warn('[STRAVA_API] Reached page limit of 100, stopping fetch');
        break;
      }
    }

    return activities;
  }

  private static transformActivity(activity: any): StravaActivity | null {
    // Map Strava activity types to our format
    const typeMap: Record<string, string> = {
      'swim': 'swim',
      'ride': 'bike',
      'virtualride': 'bike',
      'ebikeride': 'bike',
      'run': 'run',
      'virtualrun': 'run',
      'trailrun': 'run'
    };

    const mappedType = typeMap[activity.type?.toLowerCase()];
    if (!mappedType) return null;

    return {
      id: activity.id,
      name: activity.name,
      type: mappedType,
      sport_type: activity.sport_type,
      date: activity.start_date.split('T')[0],
      distance: activity.distance || 0,
      moving_time: activity.moving_time || 0,
      total_elevation_gain: activity.total_elevation_gain || 0,
      average_speed: activity.average_speed || 0,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      average_watts: activity.average_watts,
      suffer_score: activity.suffer_score,
      trainer: activity.trainer || false,
      kudos_count: activity.kudos_count || 0
    };
  }

  private static enhanceAnalytics(rawData: any): StravaAnalytics {
    // Process weekly stats
    const weeklyStats = rawData.weeks?.map((week: any) => ({
      week: week.week_start,
      totalDistance: week.total.distance,
      totalTime: week.total.time,
      totalElevation: week.total.elevation || 0,
      activityCount: week.total.sessions,
      swim: {
        distance: week.swim.distance,
        time: week.swim.time,
        count: week.swim.sessions
      },
      bike: {
        distance: week.bike.distance,
        time: week.bike.time,
        count: week.bike.sessions,
        elevation: week.bike.elevation || 0,
        avgWatts: week.bike.avgWatts
      },
      run: {
        distance: week.run.distance,
        time: week.run.time,
        count: week.run.sessions,
        elevation: week.run.elevation || 0,
        avgPace: week.run.avgPace
      }
    })) || [];

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(weeklyStats);

    // Generate performance insights
    const performanceInsights = this.generatePerformanceInsights(weeklyStats);

    return {
      weeklyStats,
      monthlyTrends,
      performanceInsights
    };
  }

  private static calculateMonthlyTrends(weeklyStats: any[]): any[] {
    // Group weeks into months and calculate trends
    const monthlyData = new Map();

    weeklyStats.forEach(week => {
      const monthKey = week.week.substring(0, 7); // YYYY-MM
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          totalDistance: 0,
          totalTime: 0,
          weeks: 0
        });
      }

      const monthData = monthlyData.get(monthKey);
      monthData.totalDistance += week.totalDistance;
      monthData.totalTime += week.totalTime;
      monthData.weeks++;
    });

    // Calculate trends
    const months = Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));

    return months.map((month, index) => {
      if (index === 0) {
        return { ...month, trend: 'stable' as const, changePercent: 0 };
      }

      const prevMonth = months[index - 1];
      const changePercent = ((month.totalDistance - prevMonth.totalDistance) / prevMonth.totalDistance) * 100;

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (changePercent > 10) trend = 'increasing';
      else if (changePercent < -10) trend = 'decreasing';

      return { ...month, trend, changePercent: Math.round(changePercent) };
    });
  }

  private static generatePerformanceInsights(weeklyStats: any[]): any {
    if (weeklyStats.length < 4) {
      return {
        consistency: 0,
        improvementAreas: ['Need more training data'],
        recommendations: ['Continue training consistently to build analytics']
      };
    }

    // Calculate consistency (percentage of weeks with training)
    const weeksWithTraining = weeklyStats.filter(week => week.activityCount > 0).length;
    const consistency = Math.round((weeksWithTraining / weeklyStats.length) * 100);

    // Identify improvement areas
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Check swim frequency
    const avgSwimSessions = weeklyStats.reduce((sum, week) => sum + week.swim.count, 0) / weeklyStats.length;
    if (avgSwimSessions < 1) {
      improvementAreas.push('Swim frequency');
      recommendations.push('Increase swim training to 2-3 sessions per week');
    }

    // Check bike volume
    const avgBikeDistance = weeklyStats.reduce((sum, week) => sum + week.bike.distance, 0) / weeklyStats.length;
    if (avgBikeDistance < 50000) { // 50km
      improvementAreas.push('Bike volume');
      recommendations.push('Increase weekly bike volume for better endurance');
    }

    // Check run consistency
    const avgRunSessions = weeklyStats.reduce((sum, week) => sum + week.run.count, 0) / weeklyStats.length;
    if (avgRunSessions < 2) {
      improvementAreas.push('Run consistency');
      recommendations.push('Maintain 2-3 run sessions per week minimum');
    }

    return {
      consistency,
      improvementAreas,
      recommendations
    };
  }

  private static updateProgress(
    syncId: string,
    progress: StravaSyncProgress,
    onProgress?: (progress: StravaSyncProgress) => void
  ): void {
    this.syncProgress.set(syncId, progress);
    if (onProgress) {
      onProgress(progress);
    }
  }

  private static checkRateLimit(type: 'daily' | 'short_term' | 'oauth'): void {
    const limit = this.RATE_LIMITS[type];
    const counter = this.requestCounts[type];

    // Reset counter if time window has passed
    if (Date.now() > counter.resetTime) {
      counter.count = 0;
      counter.resetTime = Date.now() + (type === 'daily' ? 24 * 60 * 60 * 1000 :
                                        type === 'short_term' ? 15 * 60 * 1000 :
                                        60 * 60 * 1000);
    }

    if (counter.count >= limit) {
      throw new Error(`Strava rate limit exceeded for ${type}`);
    }

    counter.count++;
  }

  // Get API status and rate limit info
  static getApiStatus(): any {
    return {
      circuitBreakerState: this.circuitBreaker.getState(),
      rateLimits: {
        daily: {
          used: this.requestCounts.daily.count,
          limit: this.RATE_LIMITS.daily,
          resetTime: new Date(this.requestCounts.daily.resetTime).toISOString()
        },
        shortTerm: {
          used: this.requestCounts.short_term.count,
          limit: this.RATE_LIMITS.short_term,
          resetTime: new Date(this.requestCounts.short_term.resetTime).toISOString()
        },
        oauth: {
          used: this.requestCounts.oauth.count,
          limit: this.RATE_LIMITS.oauth,
          resetTime: new Date(this.requestCounts.oauth.resetTime).toISOString()
        }
      },
      cacheSize: this.tokenCache.size,
      activeSyncs: this.syncProgress.size
    };
  }
}