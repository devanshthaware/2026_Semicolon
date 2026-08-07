/**
 * Middleware system for request/response processing
 */

import { MiddlewareContext } from '../types/Common.js';

/**
 * Middleware function type
 */
export type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Authentication middleware
 */
export function authenticationMiddleware(apiKey?: string, bearerToken?: string): Middleware {
  return async (context, next) => {
    if (apiKey) {
      context.request.headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (bearerToken) {
      context.request.headers['Authorization'] = `Bearer ${bearerToken}`;
    }
    await next();
  };
}

/**
 * Retry middleware with exponential backoff
 */
export function retryMiddleware(maxRetries = 3, baseDelay = 1000): Middleware {
  return async (context, next) => {
    for (let i = 0; i <= maxRetries; i++) {
      context.attempt = i;
      try {
        await next();
        return;
      } catch (error) {
        if (i === maxRetries) {
          throw error;
        }

        // Don't retry on certain status codes
        if (context.response?.status && [401, 403, 404, 422].includes(context.response.status)) {
          throw error;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
}

/**
 * Logging middleware
 */
export function loggingMiddleware(
  onLog: (message: string, context: MiddlewareContext) => void
): Middleware {
  return async (context, next) => {
    const startTime = Date.now();
    onLog(`→ ${context.request.method} ${context.request.url}`, context);

    try {
      await next();
      const duration = Date.now() - startTime;
      if (context.response) {
        onLog(
          `← ${context.response.status} (${duration}ms) ${context.request.method} ${context.request.url}`,
          context
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      onLog(`✗ ERROR (${duration}ms) ${context.request.method} ${context.request.url}`, context);
      throw error;
    }
  };
}

/**
 * Timeout middleware
 */
export function timeoutMiddleware(timeout: number): Middleware {
  return async (context, next) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (context.request && typeof context.request === 'object') {
        (context.request as Record<string, unknown>).signal = controller.signal;
      }
      await next();
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * User agent middleware
 */
export function userAgentMiddleware(userAgent: string): Middleware {
  return async (context, next) => {
    context.request.headers['User-Agent'] = userAgent;
    await next();
  };
}

/**
 * Custom header middleware
 */
export function headersMiddleware(headers: Record<string, string>): Middleware {
  return async (context, next) => {
    for (const [key, value] of Object.entries(headers)) {
      context.request.headers[key] = value;
    }
    await next();
  };
}

/**
 * Content type middleware
 */
export function contentTypeMiddleware(): Middleware {
  return async (context, next) => {
    if (context.request.body && !context.request.headers['Content-Type']) {
      context.request.headers['Content-Type'] = 'application/json';
    }
    await next();
  };
}

/**
 * Chain middleware functions together
 */
export function chainMiddleware(...middlewares: Middleware[]): Middleware {
  return async (context, next) => {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('Middleware called next() multiple times');
      }
      index = i;

      if (i < middlewares.length) {
        await middlewares[i](context, () => dispatch(i + 1));
      } else {
        await next();
      }
    };

    await dispatch(0);
  };
}
