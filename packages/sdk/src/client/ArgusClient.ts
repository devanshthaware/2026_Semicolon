import { ArgusConfig, ArgusConfigOptions } from "../configuration/index.js";
import { ArgusLogger } from "../logging/index.js";
import { createAuthenticationProvider } from "../authentication/index.js";
import { AuthenticationMiddleware, LoggingMiddleware, RetryMiddleware, TransportClient } from "../middleware/index.js";
import { StreamingClient } from "../streaming/index.js";
import { Serializer } from "../serialization/index.js";
import {
  VerificationRequest,
  VerificationResponse,
  Session,
  Receipt,
  Analytics,
  APIKey
} from "../models/index.js";

/**
 * The official Argus API Client.
 * 
 * Provides typed, predictable, and streaming-first access to the Argus Platform.
 */
export class ArgusClient {
  private readonly config: ArgusConfig;
  private readonly logger: ArgusLogger;
  private readonly transport: TransportClient;

  constructor(options: ArgusConfigOptions = {}) {
    this.config = new ArgusConfig(options);
    this.logger = new ArgusLogger(this.config.logLevel);

    const authProvider = createAuthenticationProvider(this.config);

    this.transport = new TransportClient(this.config, this.logger, [
      new LoggingMiddleware(this.logger),
      new AuthenticationMiddleware(authProvider),
      new RetryMiddleware(
        this.config.maxRetries,
        this.config.retryBaseDelay,
        this.config.retryMaxDelay,
        this.logger
      )
    ]);
  }

  /**
   * Health check for the Argus API.
   */
  async health(): Promise<{ status: string; version: string }> {
    return this.transport.request<{ status: string; version: string }>("/api/v1/health", { method: "GET" });
  }

  /**
   * Verifies a prompt/response pair synchronously.
   * @param request The verification request
   * @returns A Promise resolving to a strongly typed VerificationResponse
   */
  async verify(request: VerificationRequest): Promise<VerificationResponse> {
    Serializer.validateVerificationRequest(request);
    
    return this.transport.request<VerificationResponse>("/api/v1/verify", {
      method: "POST",
      body: Serializer.serialize(request)
    });
  }

  /**
   * Verifies a prompt/response pair and streams the verification events.
   * @param request The verification request
   * @returns A StreamingClient to listen to events
   */
  verify_stream(request: VerificationRequest): StreamingClient {
    Serializer.validateVerificationRequest(request);
    
    const streamingClient = new StreamingClient(this.transport, this.config);
    
    // Start streaming asynchronously
    streamingClient.stream("/api/v1/verify/stream", request).catch(err => {
      this.logger.error("Streaming encountered an error starting", err);
    });
    
    return streamingClient;
  }

  /**
   * Retrieves a verification session by ID.
   */
  async get_session(sessionId: string): Promise<Session> {
    return this.transport.request<Session>(`/api/v1/sessions/${sessionId}`, { method: "GET" });
  }

  /**
   * Lists recent verification sessions.
   */
  async list_sessions(limit: number = 20, offset: number = 0): Promise<{ sessions: Session[]; total: number }> {
    return this.transport.request<{ sessions: Session[]; total: number }>(`/api/v1/sessions?limit=${limit}&offset=${offset}`, { method: "GET" });
  }

  /**
   * Retrieves a receipt for a verified claim.
   */
  async get_receipt(receiptId: string): Promise<Receipt> {
    return this.transport.request<Receipt>(`/api/v1/receipts/${receiptId}`, { method: "GET" });
  }

  /**
   * Lists receipts.
   */
  async list_receipts(limit: number = 20, offset: number = 0): Promise<{ receipts: Receipt[]; total: number }> {
    return this.transport.request<{ receipts: Receipt[]; total: number }>(`/api/v1/receipts?limit=${limit}&offset=${offset}`, { method: "GET" });
  }

  /**
   * Retrieves analytics for the current authenticated account/workspace.
   */
  async analytics(): Promise<Analytics> {
    return this.transport.request<Analytics>("/api/v1/analytics", { method: "GET" });
  }

  /**
   * Creates a new API Key.
   */
  async create_api_key(name: string, expiresAt?: string): Promise<APIKey & { key: string }> {
    return this.transport.request<APIKey & { key: string }>("/api/v1/api-keys", {
      method: "POST",
      body: Serializer.serialize({ name, expiresAt })
    });
  }

  /**
   * Lists active API Keys.
   */
  async list_api_keys(): Promise<{ apiKeys: APIKey[] }> {
    return this.transport.request<{ apiKeys: APIKey[] }>("/api/v1/api-keys", { method: "GET" });
  }

  /**
   * Deletes (revokes) an API Key by ID.
   */
  async delete_api_key(keyId: string): Promise<void> {
    await this.transport.request<void>(`/api/v1/api-keys/${keyId}`, { method: "DELETE" });
  }
}
