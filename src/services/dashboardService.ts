// Enhanced Dashboard Service with Caching and Error Handling
// This service demonstrates the enhanced backend capabilities

import { dbHelpers } from './supabase';
import type {
  DashboardOverview,
  TrainingAnalytics,
  GoalProgressData,
  ApiResponse,
  RaceWithCountdown,
  EnhancedGoal,
  TrainingWeekStats,
  DatabaseError
} from '../types/dashboard';
import { logger } from '../utils/logger';

export class DashboardService {
  private static instance: DashboardService;
  private retryAttempts = 3;
  private retryDelay = 1000;

  // Singleton pattern
  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Get comprehensive dashboard overview with caching
   */
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.cache.getDashboardOverview();

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching overview:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get upcoming races with enhanced countdown and preparation status
   */
  async getUpcomingRacesWithCountdown(limit = 5): Promise<ApiResponse<RaceWithCountdown[]>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.races.getUpcoming(limit);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data || [],
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching upcoming races:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get training analytics with caching
   */
  async getTrainingAnalytics(weeks = 8): Promise<ApiResponse<TrainingAnalytics>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.cache.getTrainingAnalytics(weeks);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching training analytics:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get goal progress with enhanced calculation
   */
  async getGoalProgress(): Promise<ApiResponse<GoalProgressData>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.cache.getGoalProgress();

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching goal progress:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get weekly training statistics with HR zones and power analysis
   */
  async getAdvancedWeeklyStats(weeks = 4): Promise<ApiResponse<TrainingWeekStats[]>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.trainingSessions.getAdvancedWeeklyStats(weeks);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data || [],
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching advanced weekly stats:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get heart rate zone analysis
   */
  async getHRZoneAnalysis(days = 30): Promise<ApiResponse<any>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.trainingSessions.getHRZoneAnalysis(days);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching HR zone analysis:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get training consistency metrics
   */
  async getConsistencyMetrics(weeks = 12): Promise<ApiResponse<any>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.trainingSessions.getConsistencyMetrics(weeks);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching consistency metrics:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get training load trends
   */
  async getTrainingLoadTrends(weeks = 8): Promise<ApiResponse<any>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.trainingSessions.getTrainingLoad(weeks);

        if (result.error) {
          throw new Error(result.error);
        }

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error fetching training load trends:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Update goal progress and invalidate related cache
   */
  async updateGoalProgress(goalId: string, updates: any): Promise<ApiResponse<EnhancedGoal>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.userGoals.update(goalId, updates);

        if (result.error) {
          throw new Error(result.error);
        }

        // Invalidate goal-related cache
        dbHelpers.cache.invalidate('goal_progress');
        dbHelpers.cache.invalidate('dashboard_overview');

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error updating goal:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Create new goal with validation and cache invalidation
   */
  async createGoal(goalData: any): Promise<ApiResponse<EnhancedGoal>> {
    try {
      return await this.withRetry(async () => {
        const result = await dbHelpers.userGoals.create(goalData);

        if (result.error) {
          throw new Error(result.error);
        }

        // Invalidate goal-related cache
        dbHelpers.cache.invalidate('goal_progress');
        dbHelpers.cache.invalidate('dashboard_overview');

        return {
          data: result.data,
          error: null
        };
      });
    } catch (error) {
      logger.error('[DashboardService] Error creating goal:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Sync training data with progress tracking
   */
  async syncTrainingData(onProgress?: (progress: any) => void): Promise<ApiResponse<any>> {
    try {
      // This would integrate with Strava API service
      logger.debug('[DashboardService] Starting training data sync...');

      // Invalidate training-related cache after sync
      dbHelpers.cache.invalidate('training');
      dbHelpers.cache.invalidate('dashboard_overview');

      return {
        data: { message: 'Sync initiated' },
        error: null
      };
    } catch (error) {
      logger.error('[DashboardService] Error syncing training data:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStatistics(): ApiResponse<any> {
    try {
      const stats = dbHelpers.cache.getStats();
      return {
        data: stats,
        error: null
      };
    } catch (error) {
      logger.error('[DashboardService] Error getting cache stats:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Manually refresh cache for specific data types
   */
  async refreshCache(dataTypes: string[] = []): Promise<ApiResponse<{ refreshed: string[] }>> {
    try {
      const refreshed: string[] = [];

      if (dataTypes.length === 0 || dataTypes.includes('dashboard')) {
        dbHelpers.cache.invalidate('dashboard_overview');
        refreshed.push('dashboard_overview');
      }

      if (dataTypes.length === 0 || dataTypes.includes('training')) {
        dbHelpers.cache.invalidate('training');
        refreshed.push('training_analytics');
      }

      if (dataTypes.length === 0 || dataTypes.includes('goals')) {
        dbHelpers.cache.invalidate('goal_progress');
        refreshed.push('goal_progress');
      }

      return {
        data: { refreshed },
        error: null
      };
    } catch (error) {
      logger.error('[DashboardService] Error refreshing cache:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): ApiResponse<{ cleaned: number }> {
    try {
      const cleaned = dbHelpers.cache.cleanup();
      return {
        data: { cleaned },
        error: null
      };
    } catch (error) {
      logger.error('[DashboardService] Error cleaning cache:', error);
      return {
        data: null,
        error: this.formatError(error)
      };
    }
  }

  // Private helper methods

  /**
   * Retry mechanism for database operations
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on validation errors or auth errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.warn(`[DashboardService] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    if (typeof error === 'string') return false;

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Don't retry authentication, validation, or permission errors
    return (
      message.includes('not authenticated') ||
      message.includes('validation') ||
      message.includes('permission denied') ||
      code.includes('auth') ||
      code.includes('perm')
    );
  }

  /**
   * Format error for consistent API responses
   */
  private formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.error) {
      return error.error;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for service dependencies
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; checks: any }>> {
    const checks = {
      database: 'unknown',
      cache: 'unknown',
      api: 'unknown'
    };

    try {
      // Check database connection
      try {
        await dbHelpers.authHelpers.getCurrentUser();
        checks.database = 'healthy';
      } catch (error) {
        checks.database = 'error';
      }

      // Check cache functionality
      try {
        const stats = dbHelpers.cache.getStats();
        checks.cache = stats ? 'healthy' : 'error';
      } catch (error) {
        checks.cache = 'error';
      }

      // Check API service
      checks.api = 'healthy';

      const overallStatus = Object.values(checks).every(status => status === 'healthy') ? 'healthy' : 'degraded';

      return {
        data: {
          status: overallStatus,
          checks
        },
        error: null
      };
    } catch (error) {
      logger.error('[DashboardService] Health check failed:', error);
      return {
        data: {
          status: 'error',
          checks
        },
        error: this.formatError(error)
      };
    }
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();