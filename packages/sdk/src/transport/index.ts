import { ArgusConfig } from "../configuration/index.js";
import { Middleware, MiddlewareContext } from "../middleware/index.js";
import { ArgusLogger } from "../logging/index.js";
import { TimeoutError, ConnectionError, AuthenticationError, AuthorizationError, ValidationError, ServerError, ArgusError } from "../exceptions/index.js";

export class TransportClient {
  private middlewares: Middleware[] = [];

  constructor(
    private readonly config: ArgusConfig,
    private readonly logger: ArgusLogger,
    middlewares: Middleware[] = []
  ) {
    this.middlewares = middlewares;
  }

  addMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    const context: MiddlewareContext = {
      url,
      config: this.config,
      request: {
        ...options,
        headers: {
          ...this.config.customHeaders,
          "User-Agent": this.config.userAgent,
          "Content-Type": "application/json",
          ...options.headers,
        }
      }
    };

    const finalFetch = async (ctx: MiddlewareContext): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      try {
        const response = await fetch(ctx.url, {
          ...ctx.request,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${this.config.timeout}ms`);
        }
        throw new ConnectionError(`Network request failed: ${error.message}`);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Chain middlewares
    const dispatch = async (index: number, ctx: MiddlewareContext): Promise<Response> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index].handle(ctx, (nextCtx) => dispatch(index + 1, nextCtx));
      }
      return finalFetch(ctx);
    };

    const response = await dispatch(0, context);

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
    
    // Allow empty responses
    if (response.status === 204) {
      return {} as T;
    }

    try {
      const data = await response.json();
      return data as T;
    } catch (error: any) {
       throw new ArgusError(`Failed to parse response body as JSON: ${error.message}`);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignored if response is not JSON
    }
    
    const message = errorData.message || `HTTP Error ${response.status}`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, response.status);
      case 403:
        throw new AuthorizationError(message, response.status);
      case 404:
        throw new ArgusError(message, response.status);
      case 422:
        throw new ValidationError(message, errorData.details || errorData, response.status);
      case 429:
        throw new ArgusError(message, response.status); // Handled generally by middleware, but fallback here
      default:
        if (response.status >= 500) {
          throw new ServerError(message, response.status);
        }
        throw new ArgusError(message, response.status);
    }
  }
}
