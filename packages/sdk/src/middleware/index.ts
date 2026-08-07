import { ArgusConfig } from "../configuration/index.js";
import { AuthenticationProvider } from "../authentication/index.js";
import { ArgusLogger } from "../logging/index.js";
import { RateLimitError, ServerError, ConnectionError, TimeoutError } from "../exceptions/index.js";

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface MiddlewareContext {
  request: RequestInit;
  url: string;
  config: ArgusConfig;
}

export interface Middleware {
  /**
   * Intercepts the request/response.
   * @param context The middleware context
   * @param next The next middleware or final fetch call in the chain
   */
  handle(context: MiddlewareContext, next: (ctx: MiddlewareContext) => Promise<Response>): Promise<Response>;
}

export class AuthenticationMiddleware implements Middleware {
  constructor(private readonly provider: AuthenticationProvider) {}

  async handle(context: MiddlewareContext, next: (ctx: MiddlewareContext) => Promise<Response>): Promise<Response> {
    if (!context.request.headers) {
      context.request.headers = {};
    }
    
    // Create a new headers object to safely mutate
    const headers = new Headers(context.request.headers);
    const headersObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    this.provider.applyToHeaders(headersObj);
    context.request.headers = headersObj;

    return next(context);
  }
}

export class LoggingMiddleware implements Middleware {
  constructor(private readonly logger: ArgusLogger) {}

  async handle(context: MiddlewareContext, next: (ctx: MiddlewareContext) => Promise<Response>): Promise<Response> {
    const start = Date.now();
    const method = context.request.method || "GET";
    
    this.logger.debug(`Sending ${method} request to ${context.url}`, {
      headers: context.request.headers,
      body: context.request.body ? "present" : "none"
    });

    try {
      const response = await next(context);
      const duration = Date.now() - start;
      
      this.logger.info(`${method} ${context.url} completed with status ${response.status} in ${duration}ms`);
      
      if (!response.ok) {
        this.logger.warn(`Request failed with status ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.logger.error(`${method} ${context.url} failed after ${duration}ms`, error);
      throw error;
    }
  }
}

export class RetryMiddleware implements Middleware {
  constructor(
    private readonly maxRetries: number,
    private readonly baseDelay: number,
    private readonly maxDelay: number,
    private readonly logger: ArgusLogger
  ) {}

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(error: any, response?: Response): boolean {
    if (response) {
      // Retry on Rate Limits or Server Errors (502, 503, 504)
      return response.status === 429 || response.status === 502 || response.status === 503 || response.status === 504;
    }
    
    if (error instanceof ConnectionError || error instanceof TimeoutError) {
      return true;
    }
    
    // Also catch typical fetch connection errors
    if (error.name === 'FetchError' || error.message.includes('fetch') || error.message.includes('network') || error.message.includes('socket')) {
      return true;
    }
    
    return false;
  }

  async handle(context: MiddlewareContext, next: (ctx: MiddlewareContext) => Promise<Response>): Promise<Response> {
    let attempt = 0;
    
    while (true) {
      try {
        const response = await next(context);
        
        if (response.ok || !this.shouldRetry(null, response) || attempt >= this.maxRetries) {
          if (!response.ok && response.status === 429) {
             const retryAfter = response.headers.get("Retry-After");
             throw new RateLimitError("Rate limit exceeded", retryAfter ? parseInt(retryAfter, 10) : undefined);
          }
          if (!response.ok && response.status >= 500) {
             throw new ServerError(`Server Error: ${response.status}`, response.status);
          }
          return response;
        }

        this.logger.warn(`Received status ${response.status}. Retrying attempt ${attempt + 1}/${this.maxRetries}`);
      } catch (error: any) {
        if (!this.shouldRetry(error) || attempt >= this.maxRetries) {
          throw error;
        }
        this.logger.warn(`Request failed: ${error.message}. Retrying attempt ${attempt + 1}/${this.maxRetries}`);
      }
      
      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
      const delay = Math.min(exponentialDelay, this.maxDelay);
      const jitter = Math.random() * 0.2 * delay; // 20% jitter
      const finalDelay = delay + jitter;
      
      await this.sleep(finalDelay);
      attempt++;
    }
  }
}
