import { supabase } from './client';
import { logger } from '../../utils/logger';

// Late-binding reference to dbHelpers (set from index.ts after assembly)
// eslint-disable-next-line prefer-const
let dbHelpers: any = null;
export const setDbHelpersRef = (ref: any) => { dbHelpers = ref; };

export const cacheHelpers = {
  // Enhanced Caching Service for Dashboard Data
  cache: {
    // In-memory cache for dashboard data
    dashboardCache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

    // Cache TTL in milliseconds
    TTL: {
      dashboard_stats: 5 * 60 * 1000,      // 5 minutes
      training_stats: 2 * 60 * 1000,       // 2 minutes
      goal_progress: 10 * 60 * 1000,       // 10 minutes
      race_countdown: 30 * 60 * 1000,      // 30 minutes
      user_settings: 60 * 60 * 1000,       // 1 hour
      weather_data: 15 * 60 * 1000,        // 15 minutes
      strava_analytics: 5 * 60 * 1000      // 5 minutes
    },

    // Get cached data if valid
    get: (key: string) => {
      const cached = dbHelpers.cache.dashboardCache.get(key);
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        dbHelpers.cache.dashboardCache.delete(key);
        return null;
      }

      return cached.data;
    },

    // Set cached data with TTL
    set: (key: string, data: any, ttlType: keyof typeof dbHelpers.cache.TTL = 'dashboard_stats') => {
      const ttl = dbHelpers.cache.TTL[ttlType];
      dbHelpers.cache.dashboardCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    },

    // Cached dashboard overview data
    getDashboardOverview: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `dashboard_overview_${user.id}`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        // Fetch all dashboard data in parallel
        const [
          upcomingRaces,
          weeklyStats,
          goalStats,
          trainingLoad
        ] = await Promise.all([
          dbHelpers.races.getUpcoming(3),
          dbHelpers.trainingSessions.getWeeklyStats(),
          dbHelpers.userGoals.getGoalStatistics(),
          dbHelpers.trainingSessions.getTrainingLoad(4)
        ]);

        const overview = {
          upcomingRaces: upcomingRaces.data,
          weeklyStats: weeklyStats.data,
          goalStats: goalStats.data,
          trainingLoad: trainingLoad.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, overview, 'dashboard_stats');
        return { data: overview, error: null };
      } catch (error) {
        logger.error('Error fetching dashboard overview:', error);
        return { data: null, error: error.message };
      }
    },

    // Cached training analytics
    getTrainingAnalytics: async (weeks: number = 8) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `training_analytics_${user.id}_${weeks}w`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        const [
          advancedWeeklyStats,
          hrZoneAnalysis,
          consistencyMetrics,
          trainingTrends
        ] = await Promise.all([
          dbHelpers.trainingSessions.getAdvancedWeeklyStats(weeks),
          dbHelpers.trainingSessions.getHRZoneAnalysis(30),
          dbHelpers.trainingSessions.getConsistencyMetrics(12),
          dbHelpers.trainingSessions.getWithTrends(30)
        ]);

        const analytics = {
          weeklyStats: advancedWeeklyStats.data,
          hrZoneAnalysis: hrZoneAnalysis.data,
          consistency: consistencyMetrics.data,
          trends: trainingTrends.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, analytics, 'training_stats');
        return { data: analytics, error: null };
      } catch (error) {
        logger.error('Error fetching training analytics:', error);
        return { data: null, error: error.message };
      }
    },

    // Cached goal progress with smart invalidation
    getGoalProgress: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const cacheKey = `goal_progress_${user.id}`;
      let cached = dbHelpers.cache.get(cacheKey);
      if (cached) return { data: cached, error: null };

      try {
        const [goalsWithProgress, goalStatistics] = await Promise.all([
          dbHelpers.userGoals.getActiveWithDeadlines(),
          dbHelpers.userGoals.getGoalStatistics()
        ]);

        const goalData = {
          goals: goalsWithProgress.data,
          statistics: goalStatistics.data,
          lastUpdated: new Date().toISOString()
        };

        dbHelpers.cache.set(cacheKey, goalData, 'goal_progress');
        return { data: goalData, error: null };
      } catch (error) {
        logger.error('Error fetching goal progress:', error);
        return { data: null, error: error.message };
      }
    },

    // Cache invalidation for specific data types
    invalidate: (pattern: string) => {
      const keysToDelete = Array.from(dbHelpers.cache.dashboardCache.keys())
        .filter(key => key.includes(pattern));

      keysToDelete.forEach(key => {
        dbHelpers.cache.dashboardCache.delete(key);
      });

      logger.debug(`Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
    },

    // Clear all cache
    clear: () => {
      dbHelpers.cache.dashboardCache.clear();
      logger.debug('All cache entries cleared');
    },

    // Cache statistics
    getStats: () => {
      const now = Date.now();
      const entries = Array.from(dbHelpers.cache.dashboardCache.entries());

      const stats = {
        totalEntries: entries.length,
        validEntries: 0,
        expiredEntries: 0,
        totalSize: 0,
        oldestEntry: null as string | null,
        newestEntry: null as string | null
      };

      let oldestTime = Infinity;
      let newestTime = 0;

      entries.forEach(([key, value]) => {
        const age = now - value.timestamp;
        const isExpired = age > value.ttl;

        if (isExpired) {
          stats.expiredEntries++;
        } else {
          stats.validEntries++;
        }

        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          stats.oldestEntry = key;
        }

        if (value.timestamp > newestTime) {
          newestTime = value.timestamp;
          stats.newestEntry = key;
        }

        // Rough size estimation
        stats.totalSize += JSON.stringify(value.data).length;
      });

      return stats;
    },

    // Cleanup expired entries
    cleanup: () => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      dbHelpers.cache.dashboardCache.forEach((value, key) => {
        if (now - value.timestamp > value.ttl) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => {
        dbHelpers.cache.dashboardCache.delete(key);
      });

      if (keysToDelete.length > 0) {
        logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
      }

      return keysToDelete.length;
    },

    // Auto cleanup interval (5 minutes)
    startAutoCleanup: () => {
      setInterval(() => {
        dbHelpers.cache.cleanup();
      }, 5 * 60 * 1000);
    }
  }
};
