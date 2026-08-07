/**
 * SDK Configuration
 */

import { ClientConfig } from '../types/Common.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ClientConfig> = {
  apiKey: '',
  bearerToken: '',
  baseUrl: 'https://api.argus.ai',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent: `Argus SDK/1.0.0 (Node.js)`,
  headers: {},
};

/**
 * Configuration class
 */
export class Configuration {
  private config: Required<ClientConfig>;

  constructor(config?: ClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config?.headers,
      },
    };

    this.validate();
  }

  get apiKey(): string {
    return this.config.apiKey;
  }

  get bearerToken(): string {
    return this.config.bearerToken;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get timeout(): number {
    return this.config.timeout;
  }

  get retries(): number {
    return this.config.retries;
  }

  get retryDelay(): number {
    return this.config.retryDelay;
  }

  get userAgent(): string {
    return this.config.userAgent;
  }

  get headers(): Record<string, string> {
    return { ...this.config.headers };
  }

  setApiKey(apiKey: string): this {
    this.config.apiKey = apiKey;
    return this;
  }

  setBearerToken(bearerToken: string): this {
    this.config.bearerToken = bearerToken;
    return this;
  }

  setBaseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl;
    return this;
  }

  setTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  setRetries(retries: number): this {
    this.config.retries = retries;
    return this;
  }

  setRetryDelay(retryDelay: number): this {
    this.config.retryDelay = retryDelay;
    return this;
  }

  setUserAgent(userAgent: string): this {
    this.config.userAgent = userAgent;
    return this;
  }

  setHeaders(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  getConfig(): Required<ClientConfig> {
    return { ...this.config };
  }

  private validate(): void {
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required');
    }

    if (!this.config.apiKey && !this.config.bearerToken) {
      console.warn('No authentication credentials provided. API calls may fail.');
    }

    if (this.config.timeout < 0) {
      throw new Error('Timeout must be a positive number');
    }

    if (this.config.retries < 0) {
      throw new Error('Retries must be a non-negative number');
    }

    if (this.config.retryDelay < 0) {
      throw new Error('Retry delay must be a non-negative number');
    }
  }
}

/**
 * Create a configuration from environment variables
 */
export function fromEnvironment(): Configuration {
  const apiKey = process.env.ARGUS_API_KEY || '';
  const bearerToken = process.env.ARGUS_BEARER_TOKEN || '';
  const baseUrl = process.env.ARGUS_BASE_URL || 'https://api.argus.ai';
  const timeout = parseInt(process.env.ARGUS_TIMEOUT ?? '30000', 10);
  const retries = parseInt(process.env.ARGUS_RETRIES ?? '3', 10);
  const retryDelay = parseInt(process.env.ARGUS_RETRY_DELAY ?? '1000', 10);

  return new Configuration({
    apiKey,
    bearerToken,
    baseUrl,
    timeout,
    retries,
    retryDelay,
  });
}
