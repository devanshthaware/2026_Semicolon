import { ValidationError } from "../exceptions/index.js";

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE" | "NONE";

export interface ArgusConfigOptions {
  /** The base URL for the Argus API */
  baseUrl?: string;
  /** The API Key for authentication */
  apiKey?: string;
  /** JWT Bearer token, alternative to apiKey */
  jwt?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay for exponential backoff in milliseconds */
  retryBaseDelay?: number;
  /** Maximum delay for exponential backoff in milliseconds */
  retryMaxDelay?: number;
  /** Custom user agent string */
  userAgent?: string;
  /** Configured log level */
  logLevel?: LogLevel;
  /** Custom headers to send with each request */
  customHeaders?: Record<string, string>;
}

/**
 * Immutable configuration object for the Argus SDK.
 */
export class ArgusConfig {
  public readonly baseUrl: string;
  public readonly apiKey?: string;
  public readonly jwt?: string;
  public readonly timeout: number;
  public readonly maxRetries: number;
  public readonly retryBaseDelay: number;
  public readonly retryMaxDelay: number;
  public readonly userAgent: string;
  public readonly logLevel: LogLevel;
  public readonly customHeaders: Readonly<Record<string, string>>;

  constructor(options: ArgusConfigOptions = {}) {
    this.baseUrl = (options.baseUrl || "https://api.argus.com").replace(/\/$/, "");
    this.apiKey = options.apiKey || process.env.ARGUS_API_KEY;
    this.jwt = options.jwt;
    this.timeout = options.timeout ?? 30000; // 30 seconds default
    this.maxRetries = options.maxRetries ?? 3;
    this.retryBaseDelay = options.retryBaseDelay ?? 500; // 500ms
    this.retryMaxDelay = options.retryMaxDelay ?? 10000; // 10 seconds
    this.userAgent = options.userAgent || "argus-node-sdk/0.1.0";
    this.logLevel = options.logLevel || "NONE";
    this.customHeaders = Object.freeze({ ...options.customHeaders });

    this.validate();
    
    // Ensure the config is fully immutable
    Object.freeze(this);
  }

  private validate(): void {
    if (!this.baseUrl.startsWith("http://") && !this.baseUrl.startsWith("https://")) {
      throw new ValidationError("Base URL must start with http:// or https://");
    }
    
    if (this.timeout <= 0) {
      throw new ValidationError("Timeout must be greater than 0");
    }
    
    if (this.maxRetries < 0) {
      throw new ValidationError("Max retries cannot be negative");
    }
  }
}
