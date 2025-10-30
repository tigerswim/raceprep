// Enhanced Backend Services Index
// Exports all enhanced services with improved error handling, caching, and performance monitoring

// Shared utilities
export * from '../shared/errorHandling';
export * from '../shared/requestBatching';
export * from '../shared/connectionPool';
export * from '../shared/performanceMonitoring';

// Enhanced services
export * from './raceDataService';
export * from './stravaApiService';
export * from './goalsService';

// Re-export existing services with enhancements
export { dbHelpers } from '../supabase';
export { dashboardService } from '../dashboardService';

// Enhanced API integrations
export * from '../apiIntegrations';

import { performanceMonitor } from '../shared/performanceMonitoring';
import { connectionPool } from '../shared/connectionPool';
import { requestBatcher } from '../shared/requestBatching';
import { logger } from '../../utils/logger';

// Service initialization and configuration
export class EnhancedBackendServices {
  private static initialized = false;

  // Initialize all enhanced services
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.debug('[ENHANCED_SERVICES] Initializing enhanced backend services...');

    try {
      // Start performance monitoring
      performanceMonitor.startMonitoring(30000); // 30 second intervals

      // Initialize connection pool (already initialized in constructor)
      logger.debug('[ENHANCED_SERVICES] Connection pool initialized');

      // Log service status
      this.logServiceStatus();

      this.initialized = true;
      logger.debug('[ENHANCED_SERVICES] All enhanced services initialized successfully');
    } catch (error) {
      logger.error('[ENHANCED_SERVICES] Failed to initialize services:', error);
      throw error;
    }
  }

  // Shutdown all services gracefully
  static async shutdown(): Promise<void> {
    if (!this.initialized) return;

    logger.debug('[ENHANCED_SERVICES] Shutting down enhanced services...');

    try {
      // Stop performance monitoring
      performanceMonitor.stopMonitoring();

      // Shutdown connection pool
      await connectionPool.shutdown();

      this.initialized = false;
      logger.debug('[ENHANCED_SERVICES] All services shut down successfully');
    } catch (error) {
      logger.error('[ENHANCED_SERVICES] Error during shutdown:', error);
      throw error;
    }
  }

  // Get overall health status
  static getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'up' | 'down' | 'degraded'>;
    metrics: any;
    alerts: any[];
  } {
    const performanceSummary = performanceMonitor.getPerformanceSummary();
    const connectionStats = connectionPool.getStats();
    const activeAlerts = performanceMonitor.getActiveAlerts();

    const services = {
      performance_monitor: performanceMonitor ? 'up' : 'down',
      connection_pool: connectionStats.totalConnections > 0 ? 'up' : 'down',
      request_batcher: requestBatcher ? 'up' : 'down',
      database: connectionStats.activeConnections >= 0 ? 'up' : 'down'
    };

    // Determine overall status
    const downServices = Object.values(services).filter(status => status === 'down').length;
    const degradedServices = Object.values(services).filter(status => status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (downServices > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices > 0 || performanceSummary.status !== 'healthy') {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services,
      metrics: {
        performance: performanceSummary,
        connections: connectionStats,
        cache: requestBatcher.getCacheStats()
      },
      alerts: activeAlerts
    };
  }

  // Log current service status
  private static logServiceStatus(): void {
    const healthStatus = this.getHealthStatus();

    logger.debug('[ENHANCED_SERVICES] Service Status:', {
      overall: healthStatus.status,
      services: healthStatus.services,
      performanceScore: healthStatus.metrics.performance.score,
      activeAlerts: healthStatus.alerts.length
    });
  }

  // Get service metrics for monitoring
  static getMetrics(): {
    performance: any;
    database: any;
    cache: any;
    requests: any;
  } {
    return {
      performance: performanceMonitor.getCurrentMetrics(),
      database: connectionPool.getStats(),
      cache: requestBatcher.getCacheStats(),
      requests: requestBatcher.getPendingRequestStats()
    };
  }

  // Export performance data
  static exportDiagnostics(): string {
    const healthStatus = this.getHealthStatus();
    const metrics = this.getMetrics();
    const recommendations = performanceMonitor.getRecommendations();

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      health: healthStatus,
      metrics,
      recommendations,
      configuration: {
        initialized: this.initialized,
        monitoringActive: true
      }
    }, null, 2);
  }
}

// Auto-initialize if in Node.js environment
if (typeof window === 'undefined') {
  // Server-side initialization
  EnhancedBackendServices.initialize().catch(error => {
    logger.error('[ENHANCED_SERVICES] Auto-initialization failed:', error);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    logger.debug('[ENHANCED_SERVICES] Received SIGTERM, shutting down gracefully...');
    await EnhancedBackendServices.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.debug('[ENHANCED_SERVICES] Received SIGINT, shutting down gracefully...');
    await EnhancedBackendServices.shutdown();
    process.exit(0);
  });
}

export default EnhancedBackendServices;