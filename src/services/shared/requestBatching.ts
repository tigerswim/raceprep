// Request Batching System for Dashboard Data Loading
// Optimizes database queries by batching multiple requests and sharing common data

import { dbHelpers } from '../supabase';
import { withRetry, withTimeout, TimeoutHandler, RequestTracker } from './errorHandling';

export interface BatchRequest<T = any> {
  id: string;
  type: string;
  params: any;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
  priority: number;
}

export interface BatchResult<T = any> {
  id: string;
  data: T | null;
  error: any;
  cached: boolean;
  duration: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  priorityThreshold: number;
}

// Default batch configuration
const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 10,
  maxWaitTime: 50, // 50ms
  priorityThreshold: 5
};

// Request types for batching
export enum BatchRequestType {
  USER_PROFILE = 'USER_PROFILE',
  USER_SETTINGS = 'USER_SETTINGS',
  UPCOMING_RACES = 'UPCOMING_RACES',
  TRAINING_STATS = 'TRAINING_STATS',
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  WEEKLY_STATS = 'WEEKLY_STATS',
  HR_ZONE_ANALYSIS = 'HR_ZONE_ANALYSIS',
  TRAINING_LOAD = 'TRAINING_LOAD'
}

// Shared data cache for dashboard components
class SharedDataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Request batcher implementation
export class RequestBatcher {
  private pendingRequests = new Map<string, BatchRequest[]>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  private sharedCache = new SharedDataCache();
  private config: BatchConfig;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
  }

  // Add request to batch queue
  async request<T>(
    type: BatchRequestType,
    params: any = {},
    priority: number = 1
  ): Promise<T> {
    const requestId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check cache first for cacheable requests
    const cacheKey = this.getCacheKey(type, params);
    const cachedData = this.sharedCache.get(cacheKey);
    if (cachedData) {
      console.log(`[BATCH_CACHE] Cache hit for ${type}:`, cacheKey);
      return cachedData;
    }

    return new Promise<T>((resolve, reject) => {
      const request: BatchRequest<T> = {
        id: requestId,
        type,
        params,
        resolve,
        reject,
        timestamp: Date.now(),
        priority
      };

      // Add to pending requests
      if (!this.pendingRequests.has(type)) {
        this.pendingRequests.set(type, []);
      }

      const requests = this.pendingRequests.get(type)!;
      requests.push(request);

      // Sort by priority (higher priority first)
      requests.sort((a, b) => b.priority - a.priority);

      console.log(`[BATCH_QUEUE] Added ${type} request, queue size: ${requests.length}`);

      // Process immediately if batch is full or high priority
      if (requests.length >= this.config.maxBatchSize || priority >= this.config.priorityThreshold) {
        this.processBatch(type);
      } else {
        // Set timer for batch processing
        this.scheduleProcessing(type);
      }
    });
  }

  // Schedule batch processing with timeout
  private scheduleProcessing(type: string): void {
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(type);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.processBatch(type);
    }, this.config.maxWaitTime);

    this.timeouts.set(type, timeout);
  }

  // Process a batch of requests
  private async processBatch(type: string): Promise<void> {
    const requests = this.pendingRequests.get(type);
    if (!requests || requests.length === 0) return;

    // Clear pending requests and timeout
    this.pendingRequests.delete(type);
    const timeout = this.timeouts.get(type);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(type);
    }

    console.log(`[BATCH_PROCESSOR] Processing batch of ${requests.length} ${type} requests`);

    const startTime = Date.now();
    const trackingId = RequestTracker.start(`BATCH_${type}`, undefined, {
      requestCount: requests.length,
      type
    });

    try {
      // Process requests based on type
      await this.executeTypedBatch(type, requests);
    } catch (error) {
      console.error(`[BATCH_PROCESSOR] Batch ${type} failed:`, error);
      // Reject all requests in the batch
      requests.forEach(request => {
        request.reject(error);
      });
    } finally {
      RequestTracker.end(trackingId, true);
      const duration = Date.now() - startTime;
      console.log(`[BATCH_PROCESSOR] Batch ${type} completed in ${duration}ms`);
    }
  }

  // Execute batch based on request type
  private async executeTypedBatch(type: string, requests: BatchRequest[]): Promise<void> {
    switch (type) {
      case BatchRequestType.USER_PROFILE:
        return this.executeBatchUserProfile(requests);

      case BatchRequestType.USER_SETTINGS:
        return this.executeBatchUserSettings(requests);

      case BatchRequestType.UPCOMING_RACES:
        return this.executeBatchUpcomingRaces(requests);

      case BatchRequestType.TRAINING_STATS:
        return this.executeBatchTrainingStats(requests);

      case BatchRequestType.GOAL_PROGRESS:
        return this.executeBatchGoalProgress(requests);

      case BatchRequestType.WEEKLY_STATS:
        return this.executeBatchWeeklyStats(requests);

      case BatchRequestType.HR_ZONE_ANALYSIS:
        return this.executeBatchHRZoneAnalysis(requests);

      case BatchRequestType.TRAINING_LOAD:
        return this.executeBatchTrainingLoad(requests);

      default:
        throw new Error(`Unknown batch type: ${type}`);
    }
  }

  // Batch implementations for each request type
  private async executeBatchUserProfile(requests: BatchRequest[]): Promise<void> {
    try {
      const result = await withTimeout(
        withRetry(() => dbHelpers.users.getCurrent(), {}, 'batch_user_profile'),
        TimeoutHandler.getTimeout('database'),
        'batch_user_profile'
      );

      // Cache result and resolve all requests with same data
      this.sharedCache.set('user_profile', result.data, 10 * 60 * 1000); // 10 minutes

      requests.forEach(request => {
        request.resolve(result.data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchUserSettings(requests: BatchRequest[]): Promise<void> {
    try {
      const result = await withTimeout(
        withRetry(() => dbHelpers.userSettings.get(), {}, 'batch_user_settings'),
        TimeoutHandler.getTimeout('database'),
        'batch_user_settings'
      );

      this.sharedCache.set('user_settings', result.data, 30 * 60 * 1000); // 30 minutes

      requests.forEach(request => {
        request.resolve(result.data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchUpcomingRaces(requests: BatchRequest[]): Promise<void> {
    try {
      // Get max limit from all requests
      const maxLimit = Math.max(...requests.map(r => r.params?.limit || 5));

      const result = await withTimeout(
        withRetry(() => dbHelpers.races.getUpcoming(maxLimit), {}, 'batch_upcoming_races'),
        TimeoutHandler.getTimeout('database'),
        'batch_upcoming_races'
      );

      // Cache result
      this.sharedCache.set(`upcoming_races_${maxLimit}`, result.data, 15 * 60 * 1000); // 15 minutes

      // Resolve each request with appropriate subset
      requests.forEach(request => {
        const limit = request.params?.limit || 5;
        const data = result.data ? result.data.slice(0, limit) : null;
        request.resolve(data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchTrainingStats(requests: BatchRequest[]): Promise<void> {
    try {
      // Execute multiple training stats queries in parallel
      const [weeklyStats, trainingLoad] = await Promise.all([
        withTimeout(
          withRetry(() => dbHelpers.trainingSessions.getWeeklyStats(), {}, 'weekly_stats'),
          TimeoutHandler.getTimeout('database'),
          'weekly_stats'
        ),
        withTimeout(
          withRetry(() => dbHelpers.trainingSessions.getTrainingLoad(4), {}, 'training_load'),
          TimeoutHandler.getTimeout('database'),
          'training_load'
        )
      ]);

      // Cache results
      this.sharedCache.set('weekly_stats', weeklyStats.data, 5 * 60 * 1000);
      this.sharedCache.set('training_load', trainingLoad.data, 10 * 60 * 1000);

      // Compile comprehensive training stats
      const trainingStats = {
        weekly: weeklyStats.data,
        trainingLoad: trainingLoad.data,
        lastUpdated: new Date().toISOString()
      };

      requests.forEach(request => {
        request.resolve(trainingStats);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchGoalProgress(requests: BatchRequest[]): Promise<void> {
    try {
      const [goals, goalStats] = await Promise.all([
        withTimeout(
          withRetry(() => dbHelpers.userGoals.getActiveWithDeadlines(), {}, 'goals_active'),
          TimeoutHandler.getTimeout('database'),
          'goals_active'
        ),
        withTimeout(
          withRetry(() => dbHelpers.userGoals.getGoalStatistics(), {}, 'goal_stats'),
          TimeoutHandler.getTimeout('database'),
          'goal_stats'
        )
      ]);

      const goalProgress = {
        goals: goals.data,
        statistics: goalStats.data,
        lastUpdated: new Date().toISOString()
      };

      this.sharedCache.set('goal_progress', goalProgress, 10 * 60 * 1000);

      requests.forEach(request => {
        request.resolve(goalProgress);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }


  private async executeBatchWeeklyStats(requests: BatchRequest[]): Promise<void> {
    try {
      const maxWeeks = Math.max(...requests.map(r => r.params?.weeks || 4));

      const result = await withTimeout(
        withRetry(() => dbHelpers.trainingSessions.getAdvancedWeeklyStats(maxWeeks), {}, 'batch_weekly_stats'),
        TimeoutHandler.getTimeout('database'),
        'batch_weekly_stats'
      );

      this.sharedCache.set(`weekly_stats_${maxWeeks}`, result.data, 5 * 60 * 1000);

      requests.forEach(request => {
        const weeks = request.params?.weeks || 4;
        const data = result.data ? result.data.slice(0, weeks) : null;
        request.resolve(data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchHRZoneAnalysis(requests: BatchRequest[]): Promise<void> {
    try {
      const maxDays = Math.max(...requests.map(r => r.params?.days || 30));

      const result = await withTimeout(
        withRetry(() => dbHelpers.trainingSessions.getHRZoneAnalysis(maxDays), {}, 'batch_hr_analysis'),
        TimeoutHandler.getTimeout('database'),
        'batch_hr_analysis'
      );

      this.sharedCache.set(`hr_zone_analysis_${maxDays}`, result.data, 15 * 60 * 1000);

      requests.forEach(request => {
        request.resolve(result.data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async executeBatchTrainingLoad(requests: BatchRequest[]): Promise<void> {
    try {
      const maxWeeks = Math.max(...requests.map(r => r.params?.weeks || 8));

      const result = await withTimeout(
        withRetry(() => dbHelpers.trainingSessions.getTrainingLoad(maxWeeks), {}, 'batch_training_load'),
        TimeoutHandler.getTimeout('database'),
        'batch_training_load'
      );

      this.sharedCache.set(`training_load_${maxWeeks}`, result.data, 10 * 60 * 1000);

      requests.forEach(request => {
        const weeks = request.params?.weeks || 8;
        const data = result.data ? result.data.slice(0, weeks) : null;
        request.resolve(data);
      });
    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  // Generate cache key for request
  private getCacheKey(type: BatchRequestType, params: any): string {
    const paramStr = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${type}_${paramStr}`;
  }

  // Dashboard-specific batch loader
  async loadDashboardData(userId: string): Promise<{
    userProfile: any;
    userSettings: any;
    upcomingRaces: any[];
    trainingStats: any;
    goalProgress: any;
    recentActivities: any[];
  }> {
    console.log('[DASHBOARD_BATCH] Loading dashboard data...');

    const startTime = Date.now();

    try {
      // Execute all dashboard requests in parallel using batching
      const [
        userProfile,
        userSettings,
        upcomingRaces,
        trainingStats,
        goalProgress
      ] = await Promise.all([
        this.request(BatchRequestType.USER_PROFILE, {}, 10), // High priority
        this.request(BatchRequestType.USER_SETTINGS, {}, 10), // High priority
        this.request(BatchRequestType.UPCOMING_RACES, { limit: 5 }, 8),
        this.request(BatchRequestType.TRAINING_STATS, {}, 7),
        this.request(BatchRequestType.GOAL_PROGRESS, {}, 6)
      ]);

      const duration = Date.now() - startTime;
      console.log(`[DASHBOARD_BATCH] Dashboard data loaded in ${duration}ms`);

      return {
        userProfile,
        userSettings,
        upcomingRaces: upcomingRaces || [],
        trainingStats,
        goalProgress
      };
    } catch (error) {
      console.error('[DASHBOARD_BATCH] Failed to load dashboard data:', error);
      throw error;
    }
  }

  // Clear cache for user-specific data
  invalidateUserCache(userId: string): void {
    this.sharedCache.invalidate(userId);
    console.log(`[BATCH_CACHE] Invalidated cache for user ${userId}`);
  }

  // Get cache statistics
  getCacheStats(): any {
    return this.sharedCache.getStats();
  }

  // Get pending request counts
  getPendingRequestStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, requests] of this.pendingRequests.entries()) {
      stats[type] = requests.length;
    }
    return stats;
  }
}

// Export singleton instance
export const requestBatcher = new RequestBatcher();

// Convenience functions for common dashboard requests
export const batchRequests = {
  userProfile: () => requestBatcher.request(BatchRequestType.USER_PROFILE),
  userSettings: () => requestBatcher.request(BatchRequestType.USER_SETTINGS),
  upcomingRaces: (limit = 5) => requestBatcher.request(BatchRequestType.UPCOMING_RACES, { limit }),
  trainingStats: () => requestBatcher.request(BatchRequestType.TRAINING_STATS),
  goalProgress: () => requestBatcher.request(BatchRequestType.GOAL_PROGRESS),
  weeklyStats: (weeks = 4) => requestBatcher.request(BatchRequestType.WEEKLY_STATS, { weeks }),
  hrZoneAnalysis: (days = 30) => requestBatcher.request(BatchRequestType.HR_ZONE_ANALYSIS, { days }),
  trainingLoad: (weeks = 8) => requestBatcher.request(BatchRequestType.TRAINING_LOAD, { weeks })
};