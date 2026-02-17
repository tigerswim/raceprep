// Enhanced Error Handling Utilities for RacePrep Backend
// Standardizes error handling, timeout, and retry logic across all services

import { logger } from '../../utils/logger';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number;
  timestamp: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

export interface TimeoutConfig {
  default: number;
  database: number;
  api: number;
  strava: number;
  weather: number;
}

// Standardized timeout configurations (reduced from 8 seconds)
export const TIMEOUT_CONFIG: TimeoutConfig = {
  default: 3000,     // 3 seconds (reduced from 8)
  database: 5000,    // 5 seconds for database queries
  api: 4000,         // 4 seconds for external APIs
  strava: 6000,      // 6 seconds for Strava (can be slower)
  weather: 3000      // 3 seconds for weather APIs
};

// Standardized retry configurations
export const RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
    'RATE_LIMITED',
    'DATABASE_CONNECTION_ERROR',
    'TEMPORARY_UNAVAILABLE'
  ]
};

// Error classification
export class ErrorClassifier {
  static classify(error: any): ApiError {
    const timestamp = new Date().toISOString();

    // Network/Connection errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: error.message,
        retryable: true,
        timestamp
      };
    }

    // Timeout errors
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out',
        details: error.message,
        retryable: true,
        timestamp
      };
    }

    // HTTP status errors
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;

      if (status === 401) {
        return {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed',
          details: 'Invalid or expired credentials',
          retryable: false,
          timestamp
        };
      }

      if (status === 403) {
        return {
          code: 'PERMISSION_ERROR',
          message: 'Permission denied',
          details: 'Insufficient permissions',
          retryable: false,
          timestamp
        };
      }

      if (status === 404) {
        return {
          code: 'NOT_FOUND_ERROR',
          message: 'Resource not found',
          details: 'The requested resource was not found',
          retryable: false,
          timestamp
        };
      }

      if (status === 429) {
        return {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          details: error.message || 'Too many requests',
          retryable: true,
          retryAfter: error.retryAfter || 60,
          timestamp
        };
      }

      if (status >= 500) {
        return {
          code: 'SERVER_ERROR',
          message: 'Server error occurred',
          details: error.message,
          retryable: true,
          timestamp
        };
      }

      if (status >= 400) {
        return {
          code: 'CLIENT_ERROR',
          message: 'Client request error',
          details: error.message,
          retryable: false,
          timestamp
        };
      }
    }

    // Database errors
    if (error.code?.startsWith('PGRST') || error.message?.includes('database')) {
      return {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: error.message,
        retryable: true,
        timestamp
      };
    }

    // Validation errors
    if (error.message?.includes('validation') || error.code === 'VALIDATION_ERROR') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: error.message,
        retryable: false,
        timestamp
      };
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
      retryable: false,
      timestamp
    };
  }

  static isRetryable(error: ApiError): boolean {
    return error.retryable && RETRY_CONFIG.retryableErrors.includes(error.code);
  }
}

// Enhanced retry mechanism with exponential backoff
export class RetryHandler {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<T> {
    const retryConfig = { ...RETRY_CONFIG, ...config };
    let lastError: ApiError;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = ErrorClassifier.classify(error);

        // Log attempt for debugging
        logger.warn(`[RETRY ${context || 'operation'}] Attempt ${attempt}/${retryConfig.maxAttempts} failed:`, {
          code: lastError.code,
          message: lastError.message,
          retryable: lastError.retryable
        });

        // Don't retry if error is not retryable
        if (!ErrorClassifier.isRetryable(lastError)) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxAttempts) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        let delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1),
          retryConfig.maxDelay
        );

        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000;

        // Use retry-after header if available (for rate limiting)
        if (lastError.retryAfter) {
          delay = Math.max(delay, lastError.retryAfter * 1000);
        }

        logger.debug(`[RETRY ${context || 'operation'}] Waiting ${delay}ms before attempt ${attempt + 1}`);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }
}

// Timeout wrapper with proper cleanup
export class TimeoutHandler {
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    context?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(ErrorClassifier.classify({
          code: 'TIMEOUT',
          message: `Operation timed out after ${timeoutMs}ms`,
          context
        }));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  static getTimeout(operation: keyof TimeoutConfig): number {
    return TIMEOUT_CONFIG[operation];
  }
}

// Circuit breaker pattern for external APIs
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        logger.debug(`[CIRCUIT_BREAKER ${context}] Transitioning to HALF_OPEN`);
      } else {
        throw ErrorClassifier.classify({
          code: 'CIRCUIT_BREAKER_OPEN',
          message: 'Circuit breaker is open',
          context
        });
      }
    }

    try {
      const result = await operation();
      this.onSuccess(context);
      return result;
    } catch (error) {
      this.onFailure(context);
      throw error;
    }
  }

  private onSuccess(context?: string): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.debug(`[CIRCUIT_BREAKER ${context}] Transitioning to CLOSED`);
    }
  }

  private onFailure(context?: string): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.warn(`[CIRCUIT_BREAKER ${context}] Transitioning to OPEN after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}

// Standardized error response formatter
export class ErrorResponse {
  static format(error: any, context?: string): {
    error: string;
    code: string;
    details?: any;
    timestamp: string;
    context?: string;
  } {
    const classified = ErrorClassifier.classify(error);

    return {
      error: classified.message,
      code: classified.code,
      details: classified.details,
      timestamp: classified.timestamp,
      context
    };
  }

  static isClientError(error: ApiError): boolean {
    return error.code.includes('VALIDATION') ||
           error.code.includes('AUTHENTICATION') ||
           error.code.includes('PERMISSION') ||
           error.code.includes('NOT_FOUND');
  }

  static isServerError(error: ApiError): boolean {
    return error.code.includes('SERVER') ||
           error.code.includes('DATABASE') ||
           error.code.includes('NETWORK') ||
           error.code.includes('TIMEOUT');
  }
}

// Request context for better error tracking
export interface RequestContext {
  userId?: string;
  operation: string;
  startTime: number;
  metadata?: Record<string, any>;
}

export class RequestTracker {
  private static activeRequests = new Map<string, RequestContext>();

  static start(operation: string, userId?: string, metadata?: Record<string, any>): string {
    const requestId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activeRequests.set(requestId, {
      userId,
      operation,
      startTime: Date.now(),
      metadata
    });

    return requestId;
  }

  static end(requestId: string, success: boolean = true, error?: any): void {
    const context = this.activeRequests.get(requestId);
    if (!context) return;

    const duration = Date.now() - context.startTime;

    logger.debug(`[REQUEST_TRACKER] ${context.operation} ${success ? 'completed' : 'failed'} in ${duration}ms`, {
      requestId,
      userId: context.userId,
      duration,
      success,
      error: error ? ErrorClassifier.classify(error).code : undefined,
      metadata: context.metadata
    });

    this.activeRequests.delete(requestId);
  }

  static getActiveRequests(): RequestContext[] {
    return Array.from(this.activeRequests.values());
  }
}

// Export convenience functions
export const handleError = ErrorClassifier.classify;
export const withRetry = RetryHandler.withRetry;
export const withTimeout = TimeoutHandler.withTimeout;
export const formatError = ErrorResponse.format;