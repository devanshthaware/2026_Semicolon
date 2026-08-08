/**
 * Main Argus SDK Client
 */

import { HttpTransport, TransportRequest } from '../transport/HttpTransport.js';
import { StreamingTransport, StreamRequest } from '../transport/StreamingTransport.js';
import { Configuration } from '../configuration/Configuration.js';
import {
  authenticationMiddleware,
  retryMiddleware,
  userAgentMiddleware,
  headersMiddleware,
  loggingMiddleware,
  Middleware,
  chainMiddleware,
} from '../middleware/index.js';
import {
  VerificationRequest,
  VerificationResponse,
  VerificationResponseSchema,
  ReceiptSchema,
  Receipt,
  SessionSchema,
  Session,
  AnalyticsSchema,
  Analytics,
  HealthResponse,
  StreamingEvent,
  StreamingEventSchema,
} from '../types/Api.js';
import { ClientConfig, MiddlewareContext, AsyncIterableIterator } from '../types/Common.js';
import { ConfigurationError } from '../errors/ApiError.js';
import { z } from 'zod';

/**
 * Main Argus SDK Client
 *
 * Example usage:
 * ```typescript
 * const client = new ArgusClient({ apiKey: 'your-api-key' });
 * const result = await client.verify({ claim: 'Example claim', evidence: ['...'] });
 * ```
 */
export class ArgusClient {
  private config: Configuration;
  private transport: HttpTransport;
  private streamingTransport: StreamingTransport;
  private middleware: Middleware[] = [];

  constructor(config?: ClientConfig) {
    this.config = new Configuration(config);
    this.transport = new HttpTransport(
      this.config.baseUrl,
      this.config.timeout,
      this.config.retries,
      this.config.retryDelay
    );
    this.streamingTransport = new StreamingTransport(this.config.baseUrl, this.config.timeout);

    this.setupDefaultMiddleware();
  }

  /**
   * Verify a claim with evidence
   */
  async verify(request: VerificationRequest): Promise<VerificationResponse> {
    return this.post<VerificationResponse>('/verify', request, VerificationResponseSchema);
  }

  /**
   * Stream verification events
   */
  verifyStream(request: VerificationRequest): AsyncIterableIterator<StreamingEvent> {
    return this.stream<StreamingEvent>('/verify/stream', request);
  }

  /**
   * Get a receipt for a verification
   */
  async getReceipt(verificationId: string): Promise<Receipt> {
    return this.get<Receipt>(`/receipts/${verificationId}`, ReceiptSchema);
  }

  /**
   * Get a session
   */
  async getSession(sessionId: string): Promise<Session> {
    return this.get<Session>(`/sessions/${sessionId}`, SessionSchema);
  }

  /**
   * Get health status
   */
  async health(): Promise<HealthResponse> {
    const healthSchema = z.object({
      status: z.enum(['healthy', 'degraded', 'unhealthy']),
      timestamp: z.string(),
      version: z.string(),
      uptime: z.number().optional(),
    });
    return this.get<HealthResponse>('/health', healthSchema as z.ZodSchema<HealthResponse>);
  }

  /**
   * Get analytics
   */
  async analytics(): Promise<Analytics> {
    return this.get<Analytics>('/analytics', AnalyticsSchema);
  }

  /**
   * Add custom middleware
   */
  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<ClientConfig>): this {
    const newConfig = { ...this.config.getConfig(), ...config };
    this.config = new Configuration(newConfig);
    this.transport = new HttpTransport(
      this.config.baseUrl,
      this.config.timeout,
      this.config.retries,
      this.config.retryDelay
    );
    this.streamingTransport = new StreamingTransport(this.config.baseUrl, this.config.timeout);
    return this;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): Configuration {
    return new Configuration(this.config.getConfig());
  }

  private async get<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
    const request: TransportRequest = {
      method: 'GET',
      url: path,
      headers: this.config.headers,
    };

    const response = await this.executeRequest<unknown>(request);
    return schema.parse(response);
  }

  private async post<T>(path: string, body: unknown, schema: z.ZodSchema<T>): Promise<T> {
    const request: TransportRequest = {
      method: 'POST',
      url: path,
      headers: this.config.headers,
      body,
    };

    const response = await this.executeRequest<unknown>(request);
    return schema.parse(response);
  }

  private stream<T extends { type: string }>(
    path: string,
    body: unknown
  ): AsyncIterableIterator<T> {
    const request: StreamRequest = {
      method: 'POST',
      url: path,
      headers: this.config.headers,
      body,
    };

    return this.streamingTransport.stream<T>(request);
  }

  private async executeRequest<T>(request: TransportRequest): Promise<T> {
    const context: MiddlewareContext = {
      request: {
        method: request.method,
        url: request.url,
        headers: { ...request.headers },
        body: request.body,
      },
    };

    const chain = chainMiddleware(...this.middleware);
    await chain(context, async () => {
      // Update request with potentially modified context
      request.headers = context.request.headers;

      const response = await this.transport.request<T>(request);
      context.response = {
        status: response.status,
        headers: response.headers,
        body: response.data,
      };
    });

    if (!context.response) {
      throw new ConfigurationError('No response received from API');
    }

    return context.response.body as T;
  }

  private setupDefaultMiddleware(): void {
    this.middleware = [];

    // Add authentication
    if (this.config.apiKey || this.config.bearerToken) {
      this.middleware.push(authenticationMiddleware(this.config.apiKey, this.config.bearerToken));
    }

    // Add user agent
    this.middleware.push(userAgentMiddleware(this.config.userAgent));

    // Add custom headers
    if (Object.keys(this.config.headers).length > 0) {
      this.middleware.push(headersMiddleware(this.config.headers));
    }

    // Add retry logic
    this.middleware.push(retryMiddleware(this.config.retries, this.config.retryDelay));
  }
}

export default ArgusClient;
