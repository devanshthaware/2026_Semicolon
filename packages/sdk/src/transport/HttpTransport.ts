/**
 * HTTP Transport layer
 */

import {
  ApiError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  ValidationError,
} from '../errors/ApiError.js';
import { MiddlewareContext, ApiResponse, RequestOptions } from '../types/Common.js';

export interface TransportRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  options?: RequestOptions;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  text: string;
}

/**
 * HTTP Transport implementation
 */
export class HttpTransport {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor(baseUrl: string, timeout = 30000, retries = 3, retryDelay = 1000) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = timeout;
    this.defaultRetries = retries;
    this.defaultRetryDelay = retryDelay;
  }

  async request<T>(req: TransportRequest): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(req.url);
    const headers = this.normalizeHeaders(req.headers);
    const timeout = req.options?.timeout ?? this.defaultTimeout;
    const retries = req.options?.retries ?? this.defaultRetries;
    const retryDelay = req.options?.retryDelay ?? this.defaultRetryDelay;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const context: MiddlewareContext = {
          request: {
            method: req.method,
            url,
            headers,
            body: req.body,
          },
          attempt,
        };

        const response = await this.executeRequest(
          req.method,
          url,
          headers,
          req.body,
          timeout,
          req.options?.signal
        );

        context.response = {
          status: response.status,
          headers: response.headers,
          body: response.body,
        };

        if (response.status >= 400) {
          throw this.parseError(response);
        }

        return {
          data: response.body as T,
          status: response.status,
          headers: response.headers,
        };
      } catch (err) {
        const error = this.normalizeError(err);
        lastError = error;

        // Don't retry on validation or authentication errors
        if (
          error instanceof ValidationError ||
          error instanceof ApiError ||
          (error instanceof ApiError && error.statusCode === 401)
        ) {
          throw error;
        }

        // Don't retry on rate limit, just throw
        if (error instanceof RateLimitError) {
          throw error;
        }

        // Retry on other errors
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    throw lastError ?? new NetworkError('Request failed', new Error('Unknown error'));
  }

  private async executeRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeout: number,
    signal?: AbortSignal
  ): Promise<TransportResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const combinedSignal = this.combineSignals(signal, controller.signal);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: combinedSignal,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        if (body instanceof FormData) {
          fetchOptions.body = body;
          // Remove Content-Type header to let the browser set it with boundary
          if (fetchOptions.headers && typeof fetchOptions.headers === 'object') {
            const headersObj = fetchOptions.headers as Record<string, string>;
            delete headersObj['Content-Type'];
          }
        } else {
          fetchOptions.body = JSON.stringify(body);
          if (!fetchOptions.headers) {
            fetchOptions.headers = {};
          }
          (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url, fetchOptions);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      let text: string;
      try {
        text = await response.text();
      } catch {
        text = '';
      }

      let responseBody: unknown;
      if (text && responseHeaders['content-type']?.includes('application/json')) {
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } else {
        responseBody = text;
      }

      return {
        status: response.status,
        headers: responseHeaders,
        body: responseBody,
        text,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(timeout);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseError(response: TransportResponse): Error {
    const { status, body } = response;

    let message = `HTTP ${status}: `;
    let details: Record<string, unknown> | undefined;

    if (typeof body === 'object' && body !== null) {
      const error = body as Record<string, unknown>;
      message += (error.message as string) ?? (error.error as string) ?? 'Unknown error';
      if (error.details) {
        details = error.details as Record<string, unknown>;
      }
    } else if (typeof body === 'string') {
      message += body;
    } else {
      message += 'Unknown error';
    }

    if (status === 401) {
      return new ApiError(message, status, details);
    }

    if (status === 429) {
      const retryAfter = parseInt(
        response.headers['retry-after'] ?? response.headers['x-ratelimit-reset'] ?? '60',
        10
      );
      return new RateLimitError(retryAfter);
    }

    if (status === 400) {
      return new ValidationError(message, details as Record<string, string[]>);
    }

    return new ApiError(message, status, details);
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'string') {
      return new Error(error);
    }
    return new Error(JSON.stringify(error));
  }

  private normalizeHeaders(headers?: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {
      Accept: 'application/json',
    };

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private combineSignals(signal1?: AbortSignal, signal2?: AbortSignal): AbortSignal | undefined {
    if (!signal1 && !signal2) return undefined;
    if (!signal1) return signal2;
    if (!signal2) return signal1;

    const controller = new AbortController();
    const abort = (): void => controller.abort();

    signal1.addEventListener('abort', abort);
    signal2.addEventListener('abort', abort);

    return controller.signal;
  }
}
