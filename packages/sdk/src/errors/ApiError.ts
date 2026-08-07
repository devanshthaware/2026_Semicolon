/**
 * Error classes for the Argus SDK
 */

/**
 * Base error class for all SDK errors
 */
export class ArgusError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly timestamp: Date;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Thrown when API returns an error response
 */
export class ApiError extends ArgusError {
  readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message, 'API_ERROR', statusCode);
    this.details = details;
  }
}

/**
 * Thrown when authentication fails
 */
export class AuthenticationError extends ArgusError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Thrown when request validation fails
 */
export class ValidationError extends ArgusError {
  readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    this.errors = errors;
  }
}

/**
 * Thrown when request times out
 */
export class TimeoutError extends ArgusError {
  readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`, 'TIMEOUT_ERROR', 408);
    this.timeout = timeout;
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends ArgusError {
  readonly retryAfter: number;

  constructor(retryAfter = 60) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 'RATE_LIMIT_ERROR', 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when network error occurs
 */
export class NetworkError extends ArgusError {
  readonly originalError: Error;

  constructor(message: string, originalError: Error) {
    super(message, 'NETWORK_ERROR', 0);
    this.originalError = originalError;
  }
}

/**
 * Thrown when SDK is not properly configured
 */
export class ConfigurationError extends ArgusError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 0);
  }
}

/**
 * Checks if an error is an ArgusError
 */
export function isArgusError(error: unknown): error is ArgusError {
  return error instanceof ArgusError;
}

/**
 * Checks if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Checks if an error is a timeout error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
