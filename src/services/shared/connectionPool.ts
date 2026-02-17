// Connection Pooling and Query Optimization for Enhanced Performance
// Manages database connections efficiently and optimizes query execution

import { withRetry, withTimeout, TimeoutHandler, RequestTracker } from './errorHandling';
import { logger } from '../../utils/logger';

export interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  maxRetries: number;
  queryTimeoutMs: number;
}

export interface QueryBatch {
  id: string;
  queries: QueryRequest[];
  startTime: number;
  priority: number;
}

export interface QueryRequest {
  id: string;
  sql: string;
  params?: any[];
  timeout?: number;
  priority: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  startTime: number;
}

export interface QueryOptimization {
  enableBatching: boolean;
  batchSize: number;
  batchTimeoutMs: number;
  enableQueryCache: boolean;
  cacheTimeoutMs: number;
  enableIndexHints: boolean;
  enableQueryPlan: boolean;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
  totalQueries: number;
  avgQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface QueryPerformanceMetrics {
  queryId: string;
  sql: string;
  executionTime: number;
  rowsAffected: number;
  cacheHit: boolean;
  indexesUsed: string[];
  optimizationSuggestions: string[];
}

// Enhanced connection pool manager
export class ConnectionPoolManager {
  private config: ConnectionPoolConfig;
  private activeConnections = new Set<string>();
  private idleConnections = new Set<string>();
  private connectionQueue: Array<{
    resolve: (connectionId: string) => void;
    reject: (error: Error) => void;
    requestTime: number;
  }> = [];

  private queryQueue = new Map<number, QueryRequest[]>();
  private batchTimeouts = new Map<number, NodeJS.Timeout>();
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private metrics = {
    totalQueries: 0,
    totalExecutionTime: 0,
    cacheHits: 0,
    errors: 0
  };

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = {
      maxConnections: 20,
      minConnections: 5,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 300000, // 5 minutes
      maxRetries: 3,
      queryTimeoutMs: 30000, // 30 seconds
      ...config
    };

    this.initializePool();
    this.startCleanupTimer();
  }

  // Initialize connection pool with minimum connections
  private initializePool(): void {
    logger.debug('[CONNECTION_POOL] Initializing pool with config:', this.config);

    // Create initial connections (simulated)
    for (let i = 0; i < this.config.minConnections; i++) {
      const connectionId = `conn_${Date.now()}_${i}`;
      this.idleConnections.add(connectionId);
    }

    logger.debug(`[CONNECTION_POOL] Initialized with ${this.config.minConnections} connections`);
  }

  // Acquire a connection from the pool
  async acquireConnection(): Promise<string> {
    const trackingId = RequestTracker.start('connection_acquire');

    try {
      // Check for available idle connection
      if (this.idleConnections.size > 0) {
        const connectionId = this.idleConnections.values().next().value;
        this.idleConnections.delete(connectionId);
        this.activeConnections.add(connectionId);

        RequestTracker.end(trackingId, true);
        return connectionId;
      }

      // Create new connection if under limit
      if (this.getTotalConnections() < this.config.maxConnections) {
        const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.activeConnections.add(connectionId);

        logger.debug(`[CONNECTION_POOL] Created new connection: ${connectionId}`);
        RequestTracker.end(trackingId, true);
        return connectionId;
      }

      // Wait for available connection
      return await this.waitForConnection();
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      throw error;
    }
  }

  // Release connection back to pool
  releaseConnection(connectionId: string): void {
    if (this.activeConnections.has(connectionId)) {
      this.activeConnections.delete(connectionId);
      this.idleConnections.add(connectionId);

      // Notify waiting requests
      if (this.connectionQueue.length > 0) {
        const waiting = this.connectionQueue.shift();
        if (waiting) {
          this.idleConnections.delete(connectionId);
          this.activeConnections.add(connectionId);
          waiting.resolve(connectionId);
        }
      }
    }
  }

  // Wait for available connection
  private waitForConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquire timeout'));
      }, this.config.acquireTimeoutMs);

      this.connectionQueue.push({
        resolve: (connectionId) => {
          clearTimeout(timeout);
          resolve(connectionId);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        requestTime: Date.now()
      });
    });
  }

  // Execute optimized query with connection pooling
  async executeQuery(
    sql: string,
    params?: any[],
    options: {
      priority?: number;
      timeout?: number;
      enableCache?: boolean;
      cacheTimeMs?: number;
    } = {}
  ): Promise<any> {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trackingId = RequestTracker.start('optimized_query', undefined, { queryId, sql: sql.substring(0, 50) });

    try {
      // Check cache first
      if (options.enableCache !== false) {
        const cached = this.getCachedResult(sql, params);
        if (cached) {
          this.metrics.cacheHits++;
          logger.debug(`[QUERY_CACHE] Cache hit for query: ${sql.substring(0, 50)}...`);
          RequestTracker.end(trackingId, true);
          return cached;
        }
      }

      const startTime = Date.now();

      // Acquire connection
      const connectionId = await this.acquireConnection();

      try {
        // Execute query with timeout
        const result = await withTimeout(
          this.performQuery(connectionId, sql, params),
          options.timeout || this.config.queryTimeoutMs,
          `query_${queryId}`
        );

        const executionTime = Date.now() - startTime;

        // Update metrics
        this.updateQueryMetrics(executionTime, false);

        // Cache result if enabled
        if (options.enableCache !== false && this.shouldCacheQuery(sql)) {
          this.cacheResult(sql, params, result, options.cacheTimeMs || 5 * 60 * 1000);
        }

        // Log slow queries
        if (executionTime > 1000) {
          logger.warn(`[SLOW_QUERY] Query took ${executionTime}ms: ${sql.substring(0, 100)}...`);
        }

        RequestTracker.end(trackingId, true);
        return result;
      } finally {
        // Always release connection
        this.releaseConnection(connectionId);
      }
    } catch (error) {
      this.metrics.errors++;
      RequestTracker.end(trackingId, false, error);
      logger.error('[QUERY_EXECUTION] Query failed:', error);
      throw error;
    }
  }

  // Execute batch of queries with optimization
  async executeBatch(queries: Array<{
    sql: string;
    params?: any[];
    priority?: number;
  }>): Promise<any[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trackingId = RequestTracker.start('query_batch', undefined, { batchId, queryCount: queries.length });

    try {
      logger.debug(`[QUERY_BATCH] Executing batch ${batchId} with ${queries.length} queries`);

      const startTime = Date.now();

      // Sort queries by priority
      const sortedQueries = queries.sort((a, b) => (b.priority || 1) - (a.priority || 1));

      // Execute queries in optimal order
      const results = [];
      for (const query of sortedQueries) {
        const result = await this.executeQuery(query.sql, query.params, {
          priority: query.priority,
          enableCache: true
        });
        results.push(result);
      }

      const totalTime = Date.now() - startTime;
      logger.debug(`[QUERY_BATCH] Batch ${batchId} completed in ${totalTime}ms`);

      RequestTracker.end(trackingId, true);
      return results;
    } catch (error) {
      RequestTracker.end(trackingId, false, error);
      logger.error('[QUERY_BATCH] Batch execution failed:', error);
      throw error;
    }
  }

  // Perform actual query execution (simulated)
  private async performQuery(connectionId: string, sql: string, params?: any[]): Promise<any> {
    // Simulate query execution time based on query complexity
    const complexity = this.analyzeQueryComplexity(sql);
    const executionTime = complexity * 10 + Math.random() * 50; // Base time + random variation

    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate different types of results
    if (sql.toLowerCase().includes('select')) {
      return {
        rows: this.generateMockRows(sql),
        rowCount: Math.floor(Math.random() * 100),
        command: 'SELECT'
      };
    } else if (sql.toLowerCase().includes('insert')) {
      return {
        rowCount: 1,
        command: 'INSERT'
      };
    } else if (sql.toLowerCase().includes('update')) {
      return {
        rowCount: Math.floor(Math.random() * 10) + 1,
        command: 'UPDATE'
      };
    }

    return { command: 'UNKNOWN' };
  }

  // Analyze query complexity for execution time estimation
  private analyzeQueryComplexity(sql: string): number {
    let complexity = 1;

    // Add complexity for JOINs
    const joinCount = (sql.match(/\bJOIN\b/gi) || []).length;
    complexity += joinCount * 2;

    // Add complexity for subqueries
    const subqueryCount = (sql.match(/\(/g) || []).length;
    complexity += subqueryCount;

    // Add complexity for aggregations
    const aggCount = (sql.match(/\b(COUNT|SUM|AVG|MAX|MIN|GROUP BY)\b/gi) || []).length;
    complexity += aggCount;

    // Add complexity for sorting
    if (sql.includes('ORDER BY')) complexity += 1;

    return Math.min(complexity, 10); // Cap at 10
  }

  // Generate mock data for development
  private generateMockRows(sql: string): any[] {
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : 'unknown';

    // Return mock data based on table
    switch (tableName.toLowerCase()) {
      case 'training_sessions':
        return Array(5).fill(null).map((_, i) => ({
          id: i + 1,
          type: ['swim', 'bike', 'run'][i % 3],
          distance: Math.random() * 10000,
          moving_time: Math.random() * 3600,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
      case 'user_goals':
        return Array(3).fill(null).map((_, i) => ({
          id: i + 1,
          goal_type: ['race_count', 'time_target', 'distance_target'][i],
          target_value: '10',
          progress_percentage: Math.random() * 100
        }));
      default:
        return [{ id: 1, data: 'mock_data' }];
    }
  }

  // Cache management
  private getCachedResult(sql: string, params?: any[]): any | null {
    const cacheKey = this.generateCacheKey(sql, params);
    const cached = this.queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result;
    }

    if (cached) {
      this.queryCache.delete(cacheKey);
    }

    return null;
  }

  private cacheResult(sql: string, params: any[] | undefined, result: any, ttl: number): void {
    const cacheKey = this.generateCacheKey(sql, params);
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl
    });

    // Limit cache size
    if (this.queryCache.size > 1000) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
  }

  private generateCacheKey(sql: string, params?: any[]): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${sql.replace(/\s+/g, ' ').trim()}_${paramStr}`;
  }

  private shouldCacheQuery(sql: string): boolean {
    const lowerSql = sql.toLowerCase();

    // Don't cache writes
    if (lowerSql.includes('insert') || lowerSql.includes('update') || lowerSql.includes('delete')) {
      return false;
    }

    // Don't cache queries with functions that return dynamic data
    if (lowerSql.includes('now()') || lowerSql.includes('random()')) {
      return false;
    }

    return true;
  }

  // Metrics and monitoring
  private updateQueryMetrics(executionTime: number, cacheHit: boolean): void {
    this.metrics.totalQueries++;
    this.metrics.totalExecutionTime += executionTime;

    if (cacheHit) {
      this.metrics.cacheHits++;
    }
  }

  // Get connection pool statistics
  getStats(): ConnectionStats {
    const totalConnections = this.getTotalConnections();
    const activeConnections = this.activeConnections.size;
    const idleConnections = this.idleConnections.size;
    const queuedRequests = this.connectionQueue.length;

    const avgQueryTime = this.metrics.totalQueries > 0
      ? this.metrics.totalExecutionTime / this.metrics.totalQueries
      : 0;

    const cacheHitRate = this.metrics.totalQueries > 0
      ? (this.metrics.cacheHits / this.metrics.totalQueries) * 100
      : 0;

    const errorRate = this.metrics.totalQueries > 0
      ? (this.metrics.errors / this.metrics.totalQueries) * 100
      : 0;

    return {
      totalConnections,
      activeConnections,
      idleConnections,
      queuedRequests,
      totalQueries: this.metrics.totalQueries,
      avgQueryTime: Math.round(avgQueryTime),
      cacheHitRate: Math.round(cacheHitRate),
      errorRate: Math.round(errorRate)
    };
  }

  // Query optimization analyzer
  analyzeQueryPerformance(sql: string, executionTime: number, result: any): QueryPerformanceMetrics {
    const suggestions: string[] = [];

    // Analyze for common performance issues
    if (sql.toLowerCase().includes('select *')) {
      suggestions.push('Use specific column names instead of SELECT *');
    }

    if (sql.toLowerCase().includes('like') && !sql.toLowerCase().includes('index')) {
      suggestions.push('Consider adding an index for LIKE queries');
    }

    if (executionTime > 1000) {
      suggestions.push('Query is slow - consider optimization');
    }

    if (!sql.toLowerCase().includes('limit') && sql.toLowerCase().includes('select')) {
      suggestions.push('Consider adding LIMIT to prevent large result sets');
    }

    return {
      queryId: `perf_${Date.now()}`,
      sql: sql.substring(0, 200),
      executionTime,
      rowsAffected: result?.rowCount || 0,
      cacheHit: false,
      indexesUsed: this.extractIndexUsage(sql),
      optimizationSuggestions: suggestions
    };
  }

  private extractIndexUsage(sql: string): string[] {
    // Simple heuristic to identify potential index usage
    const indexes: string[] = [];

    if (sql.toLowerCase().includes('where')) {
      // Extract potential indexed columns
      const whereMatch = sql.match(/WHERE\s+(\w+)/i);
      if (whereMatch) {
        indexes.push(`potential_index_${whereMatch[1]}`);
      }
    }

    return indexes;
  }

  // Cleanup and maintenance
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupIdleConnections();
      this.cleanupCache();
    }, 60000); // Run every minute
  }

  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idleTimeout = this.config.idleTimeoutMs;

    // In a real implementation, you would track connection last-used time
    // and close connections that have been idle too long

    // For now, ensure we maintain minimum connections
    while (this.idleConnections.size < this.config.minConnections &&
           this.getTotalConnections() < this.config.maxConnections) {
      const connectionId = `conn_${now}_${Math.random().toString(36).substr(2, 9)}`;
      this.idleConnections.add(connectionId);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`[CACHE_CLEANUP] Cleaned ${cleaned} expired cache entries`);
    }
  }

  private getTotalConnections(): number {
    return this.activeConnections.size + this.idleConnections.size;
  }

  // Shutdown pool gracefully
  async shutdown(): Promise<void> {
    logger.debug('[CONNECTION_POOL] Shutting down...');

    // Clear timeouts
    for (const timeout of this.batchTimeouts.values()) {
      clearTimeout(timeout);
    }

    // Reject pending connection requests
    for (const request of this.connectionQueue) {
      request.reject(new Error('Connection pool is shutting down'));
    }

    // Close all connections (simulated)
    this.activeConnections.clear();
    this.idleConnections.clear();
    this.queryCache.clear();

    logger.debug('[CONNECTION_POOL] Shutdown complete');
  }
}

// Query optimization utilities
export class QueryOptimizer {
  // Optimize query for better performance
  static optimizeQuery(sql: string): string {
    let optimized = sql;

    // Add basic optimizations
    optimized = this.addLimitIfMissing(optimized);
    optimized = this.optimizeWhereClauses(optimized);
    optimized = this.optimizeJoins(optimized);

    return optimized;
  }

  private static addLimitIfMissing(sql: string): string {
    if (sql.toLowerCase().includes('select') &&
        !sql.toLowerCase().includes('limit') &&
        !sql.toLowerCase().includes('count(')) {
      return sql + ' LIMIT 1000'; // Default limit
    }
    return sql;
  }

  private static optimizeWhereClauses(sql: string): string {
    // Move most selective conditions first
    return sql; // Placeholder for more sophisticated optimization
  }

  private static optimizeJoins(sql: string): string {
    // Suggest INNER JOINs where appropriate
    return sql.replace(/,\s+/g, ' INNER JOIN '); // Simple example
  }

  // Generate index suggestions
  static suggestIndexes(sql: string): string[] {
    const suggestions: string[] = [];
    const tables = this.extractTables(sql);
    const whereColumns = this.extractWhereColumns(sql);

    for (const table of tables) {
      for (const column of whereColumns) {
        suggestions.push(`CREATE INDEX idx_${table}_${column} ON ${table}(${column})`);
      }
    }

    return suggestions;
  }

  private static extractTables(sql: string): string[] {
    const matches = sql.match(/FROM\s+(\w+)/gi) || [];
    return matches.map(match => match.replace(/FROM\s+/i, ''));
  }

  private static extractWhereColumns(sql: string): string[] {
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
    if (!whereMatch) return [];

    const whereClause = whereMatch[1];
    const columns = whereClause.match(/\b(\w+)\s*[=<>]/g) || [];
    return columns.map(col => col.replace(/\s*[=<>].*/, ''));
  }
}

// Export singleton instance
export const connectionPool = new ConnectionPoolManager();

// Export utility functions
export const optimizeQuery = QueryOptimizer.optimizeQuery;
export const suggestIndexes = QueryOptimizer.suggestIndexes;