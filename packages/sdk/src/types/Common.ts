/**
 * Common types and utilities for the Argus SDK
 */

/**
 * Represents a generic API response
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Represents an API error response
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Response from a health check
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime?: number;
}

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Middleware context passed through the request pipeline
 */
export interface MiddlewareContext {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
  };
  error?: Error;
  attempt?: number;
}

/**
 * Async iterator for streaming responses
 */
export interface AsyncIterableIterator<T> extends AsyncIterable<T>, AsyncIterator<T> {}

/**
 * Server-Sent Event data
 */
export interface StreamingEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

/**
 * Configuration for the SDK client
 */
export interface ClientConfig {
  apiKey?: string;
  bearerToken?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

/**
 * Discriminated union type for streaming events
 */
export type StreamEvent<T extends { type: string }> = T;

/**
 * Helper type for extracting response data from async iterables
 */
export type StreamEventType<T extends AsyncIterable<any>> =
  T extends AsyncIterable<infer U> ? U : never;
