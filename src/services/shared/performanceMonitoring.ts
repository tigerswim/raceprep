// Comprehensive Performance Monitoring and Caching Strategies
// Provides advanced monitoring, analytics, and optimization for the RacePrep backend

import { RequestTracker } from './errorHandling';
import { connectionPool } from './connectionPool';
import { requestBatcher } from './requestBatching';
import { logger } from '../../utils/logger';

export interface PerformanceMetrics {
  timestamp: string;
  responseTime: number;
  throughput: number; // requests per second
  errorRate: number; // percentage
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheStats: {
    hitRate: number;
    size: number;
    evictions: number;
  };
  databaseStats: {
    connectionPoolSize: number;
    activeConnections: number;
    avgQueryTime: number;
    slowQueries: number;
  };
  apiStats: {
    stravaRequests: number;
    weatherRequests: number;
    rateLimitHits: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  category: 'response_time' | 'error_rate' | 'memory' | 'database' | 'api_limit';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'caching' | 'query' | 'api' | 'memory' | 'configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface CacheStrategy {
  name: string;
  type: 'memory' | 'redis' | 'database';
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  hitRate: number;
  enabled: boolean;
}

export interface PerformanceThresholds {
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
  memoryUsage: {
    warning: number;
    critical: number;
  };
  cacheHitRate: {
    warning: number;
    critical: number;
  };
  databaseConnections: {
    warning: number;
    critical: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private recommendations: OptimizationRecommendation[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timer;

  private thresholds: PerformanceThresholds = {
    responseTime: { warning: 1000, critical: 3000 }, // ms
    errorRate: { warning: 5, critical: 10 }, // percentage
    memoryUsage: { warning: 70, critical: 85 }, // percentage
    cacheHitRate: { warning: 60, critical: 40 }, // percentage
    databaseConnections: { warning: 80, critical: 95 } // percentage of max
  };

  // Request tracking
  private requestStats = {
    totalRequests: 0,
    totalErrors: 0,
    totalResponseTime: 0,
    requestsPerSecond: new Map<number, number>(),
    slowRequests: 0
  };

  // Cache performance tracking
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  };

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start performance monitoring
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    logger.debug('[PERFORMANCE_MONITOR] Starting performance monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.checkThresholds();
      this.generateRecommendations();
    }, intervalMs);

    // Also collect initial metrics
    this.collectMetrics();
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    logger.debug('[PERFORMANCE_MONITOR] Stopped performance monitoring');
  }

  // Collect current performance metrics
  private collectMetrics(): void {
    const timestamp = new Date().toISOString();

    // Calculate response time metrics
    const avgResponseTime = this.requestStats.totalRequests > 0
      ? this.requestStats.totalResponseTime / this.requestStats.totalRequests
      : 0;

    // Calculate throughput
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    const throughput = this.calculateThroughput();

    // Calculate error rate
    const errorRate = this.requestStats.totalRequests > 0
      ? (this.requestStats.totalErrors / this.requestStats.totalRequests) * 100
      : 0;

    // Get memory usage
    const memoryUsage = this.getMemoryUsage();

    // Get cache statistics
    const cacheHitRate = (this.cacheStats.hits + this.cacheStats.misses) > 0
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100
      : 0;

    // Get database statistics
    const dbStats = connectionPool.getStats();

    const metrics: PerformanceMetrics = {
      timestamp,
      responseTime: Math.round(avgResponseTime),
      throughput: Math.round(throughput * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsage,
      cacheStats: {
        hitRate: Math.round(cacheHitRate * 100) / 100,
        size: this.cacheStats.size,
        evictions: this.cacheStats.evictions
      },
      databaseStats: {
        connectionPoolSize: dbStats.totalConnections,
        activeConnections: dbStats.activeConnections,
        avgQueryTime: dbStats.avgQueryTime,
        slowQueries: 0 // Would track queries > threshold
      },
      apiStats: {
        stravaRequests: 0, // Would track from Strava service
        weatherRequests: 0, // Would track from weather service
        rateLimitHits: 0 // Would track rate limit hits
      }
    };

    this.metrics.push(metrics);

    // Keep only last 1000 metrics (about 8 hours at 30s intervals)
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  // Calculate current throughput
  private calculateThroughput(): number {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);

    // Get requests from last 10 seconds
    let totalRequests = 0;
    for (let i = 0; i < 10; i++) {
      const second = currentSecond - i;
      totalRequests += this.requestStats.requestsPerSecond.get(second) || 0;
    }

    return totalRequests / 10; // Average over 10 seconds
  }

  // Get memory usage statistics
  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const used = usage.heapUsed;
      const total = usage.heapTotal;
      const percentage = (used / total) * 100;

      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentage: Math.round(percentage * 100) / 100
      };
    }

    // Fallback for browser environment
    return {
      used: 0,
      total: 0,
      percentage: 0
    };
  }

  // Track request for performance monitoring
  trackRequest(duration: number, isError: boolean = false): void {
    this.requestStats.totalRequests++;
    this.requestStats.totalResponseTime += duration;

    if (isError) {
      this.requestStats.totalErrors++;
    }

    if (duration > this.thresholds.responseTime.warning) {
      this.requestStats.slowRequests++;
    }

    // Track requests per second
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentCount = this.requestStats.requestsPerSecond.get(currentSecond) || 0;
    this.requestStats.requestsPerSecond.set(currentSecond, currentCount + 1);

    // Cleanup old entries
    const cutoff = currentSecond - 60; // Keep last minute
    for (const [second] of this.requestStats.requestsPerSecond) {
      if (second < cutoff) {
        this.requestStats.requestsPerSecond.delete(second);
      }
    }
  }

  // Track cache operations
  trackCacheHit(): void {
    this.cacheStats.hits++;
  }

  trackCacheMiss(): void {
    this.cacheStats.misses++;
  }

  trackCacheEviction(): void {
    this.cacheStats.evictions++;
  }

  updateCacheSize(size: number): void {
    this.cacheStats.size = size;
  }

  // Analyze performance trends
  private analyzePerformance(): void {
    if (this.metrics.length < 2) return;

    const current = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];

    // Check for significant changes
    if (current.responseTime > previous.responseTime * 1.5) {
      this.addAlert('warning', 'response_time',
        'Response time increased significantly',
        current.responseTime, this.thresholds.responseTime.warning);
    }

    if (current.errorRate > previous.errorRate * 2) {
      this.addAlert('critical', 'error_rate',
        'Error rate spiked',
        current.errorRate, this.thresholds.errorRate.critical);
    }

    if (current.cacheStats.hitRate < previous.cacheStats.hitRate * 0.5) {
      this.addAlert('warning', 'response_time',
        'Cache hit rate dropped significantly',
        current.cacheStats.hitRate, this.thresholds.cacheHitRate.warning);
    }
  }

  // Check performance thresholds
  private checkThresholds(): void {
    if (this.metrics.length === 0) return;

    const current = this.metrics[this.metrics.length - 1];

    // Response time thresholds
    if (current.responseTime > this.thresholds.responseTime.critical) {
      this.addAlert('critical', 'response_time',
        'Response time exceeds critical threshold',
        current.responseTime, this.thresholds.responseTime.critical);
    } else if (current.responseTime > this.thresholds.responseTime.warning) {
      this.addAlert('warning', 'response_time',
        'Response time exceeds warning threshold',
        current.responseTime, this.thresholds.responseTime.warning);
    }

    // Error rate thresholds
    if (current.errorRate > this.thresholds.errorRate.critical) {
      this.addAlert('critical', 'error_rate',
        'Error rate exceeds critical threshold',
        current.errorRate, this.thresholds.errorRate.critical);
    } else if (current.errorRate > this.thresholds.errorRate.warning) {
      this.addAlert('warning', 'error_rate',
        'Error rate exceeds warning threshold',
        current.errorRate, this.thresholds.errorRate.warning);
    }

    // Memory usage thresholds
    if (current.memoryUsage.percentage > this.thresholds.memoryUsage.critical) {
      this.addAlert('critical', 'memory',
        'Memory usage exceeds critical threshold',
        current.memoryUsage.percentage, this.thresholds.memoryUsage.critical);
    } else if (current.memoryUsage.percentage > this.thresholds.memoryUsage.warning) {
      this.addAlert('warning', 'memory',
        'Memory usage exceeds warning threshold',
        current.memoryUsage.percentage, this.thresholds.memoryUsage.warning);
    }

    // Cache hit rate thresholds
    if (current.cacheStats.hitRate < this.thresholds.cacheHitRate.critical) {
      this.addAlert('critical', 'response_time',
        'Cache hit rate below critical threshold',
        current.cacheStats.hitRate, this.thresholds.cacheHitRate.critical);
    } else if (current.cacheStats.hitRate < this.thresholds.cacheHitRate.warning) {
      this.addAlert('warning', 'response_time',
        'Cache hit rate below warning threshold',
        current.cacheStats.hitRate, this.thresholds.cacheHitRate.warning);
    }
  }

  // Add performance alert
  private addAlert(
    type: 'warning' | 'critical',
    category: PerformanceAlert['category'],
    message: string,
    value: number,
    threshold: number
  ): void {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(alert =>
      alert.category === category &&
      alert.type === type &&
      !alert.resolved
    );

    if (existingAlert) return; // Don't create duplicate alerts

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      message,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);
    logger.warn(`[PERFORMANCE_ALERT] ${type.toUpperCase()}: ${message} (${value} > ${threshold})`);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  // Generate optimization recommendations
  private generateRecommendations(): void {
    if (this.metrics.length < 5) return; // Need enough data

    const recent = this.metrics.slice(-5);
    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const avgCacheHitRate = recent.reduce((sum, m) => sum + m.cacheStats.hitRate, 0) / recent.length;
    const avgMemoryUsage = recent.reduce((sum, m) => sum + m.memoryUsage.percentage, 0) / recent.length;

    // Clear existing recommendations
    this.recommendations = [];

    // Response time recommendations
    if (avgResponseTime > 1000) {
      this.addRecommendation('caching', 'high',
        'Implement aggressive caching',
        'Response times are consistently high. Consider implementing more aggressive caching strategies.',
        'Reduce response times by 30-50%',
        'Add caching layers for frequently accessed data and implement request batching.',
        'medium'
      );
    }

    // Cache hit rate recommendations
    if (avgCacheHitRate < 60) {
      this.addRecommendation('caching', 'medium',
        'Optimize cache strategy',
        'Cache hit rate is below optimal. Review and optimize caching strategies.',
        'Improve cache hit rate by 20-30%',
        'Analyze cache access patterns and adjust TTL values and cache size.',
        'low'
      );
    }

    // Memory usage recommendations
    if (avgMemoryUsage > 70) {
      this.addRecommendation('memory', 'high',
        'Optimize memory usage',
        'Memory usage is consistently high. Consider memory optimization.',
        'Reduce memory usage by 20-30%',
        'Implement memory pooling, optimize data structures, and add garbage collection tuning.',
        'high'
      );
    }

    // Database connection recommendations
    const dbStats = connectionPool.getStats();
    if (dbStats.activeConnections > dbStats.totalConnections * 0.8) {
      this.addRecommendation('configuration', 'medium',
        'Increase database connection pool',
        'Database connection pool is near capacity. Consider increasing pool size.',
        'Improve database throughput by 15-25%',
        'Increase max connections in pool configuration.',
        'low'
      );
    }

    // Query optimization recommendations
    if (dbStats.avgQueryTime > 500) {
      this.addRecommendation('query', 'high',
        'Optimize database queries',
        'Average query time is high. Review and optimize database queries.',
        'Reduce query times by 40-60%',
        'Add database indexes, optimize query structure, and implement query caching.',
        'medium'
      );
    }
  }

  // Add optimization recommendation
  private addRecommendation(
    type: OptimizationRecommendation['type'],
    priority: OptimizationRecommendation['priority'],
    title: string,
    description: string,
    expectedImpact: string,
    implementation: string,
    effort: OptimizationRecommendation['effort']
  ): void {
    const recommendation: OptimizationRecommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      title,
      description,
      expectedImpact,
      implementation,
      effort
    };

    this.recommendations.push(recommendation);
  }

  // Get current performance metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // Get historical metrics
  getHistoricalMetrics(hours: number = 24): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => new Date(metric.timestamp) > cutoff);
  }

  // Get active alerts
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get all alerts
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Get optimization recommendations
  getRecommendations(): OptimizationRecommendation[] {
    return [...this.recommendations];
  }

  // Get performance summary
  getPerformanceSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    score: number; // 0-100
    issues: string[];
    improvements: string[];
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      return {
        status: 'warning',
        score: 50,
        issues: ['No performance data available'],
        improvements: ['Start performance monitoring']
      };
    }

    let score = 100;
    const issues: string[] = [];
    const improvements: string[] = [];

    // Response time scoring
    if (current.responseTime > this.thresholds.responseTime.critical) {
      score -= 30;
      issues.push('Critical response time issues');
    } else if (current.responseTime > this.thresholds.responseTime.warning) {
      score -= 15;
      issues.push('Slow response times');
    }

    // Error rate scoring
    if (current.errorRate > this.thresholds.errorRate.critical) {
      score -= 25;
      issues.push('High error rate');
    } else if (current.errorRate > this.thresholds.errorRate.warning) {
      score -= 10;
      issues.push('Elevated error rate');
    }

    // Memory usage scoring
    if (current.memoryUsage.percentage > this.thresholds.memoryUsage.critical) {
      score -= 20;
      issues.push('Critical memory usage');
    } else if (current.memoryUsage.percentage > this.thresholds.memoryUsage.warning) {
      score -= 10;
      issues.push('High memory usage');
    }

    // Cache performance scoring
    if (current.cacheStats.hitRate < this.thresholds.cacheHitRate.critical) {
      score -= 15;
      issues.push('Poor cache performance');
    } else if (current.cacheStats.hitRate < this.thresholds.cacheHitRate.warning) {
      score -= 8;
      issues.push('Suboptimal cache hit rate');
    }

    // Generate improvements based on score
    if (score < 70) {
      improvements.push('Implement caching optimizations');
      improvements.push('Review and optimize database queries');
    }
    if (score < 50) {
      improvements.push('Increase system resources');
      improvements.push('Implement load balancing');
    }

    const status: 'healthy' | 'warning' | 'critical' =
      score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';

    return {
      status,
      score: Math.max(0, Math.round(score)),
      issues,
      improvements
    };
  }

  // Update performance thresholds
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logger.debug('[PERFORMANCE_MONITOR] Updated thresholds:', this.thresholds);
  }

  // Export performance data
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        metrics: this.metrics,
        alerts: this.alerts,
        recommendations: this.recommendations,
        summary: this.getPerformanceSummary(),
        exportedAt: new Date().toISOString()
      }, null, 2);
    }

    // CSV format
    const headers = [
      'timestamp', 'responseTime', 'throughput', 'errorRate',
      'memoryUsed', 'memoryPercentage', 'cacheHitRate', 'activeConnections'
    ];

    const rows = this.metrics.map(metric => [
      metric.timestamp,
      metric.responseTime,
      metric.throughput,
      metric.errorRate,
      metric.memoryUsage.used,
      metric.memoryUsage.percentage,
      metric.cacheStats.hitRate,
      metric.databaseStats.activeConnections
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// Middleware for automatic request tracking
export function createPerformanceMiddleware() {
  const monitor = PerformanceMonitor.getInstance();

  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Track when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      monitor.trackRequest(duration, isError);
    });

    next();
  };
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();