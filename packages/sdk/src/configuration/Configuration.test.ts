/**
 * Tests for Configuration
 */

import { describe, it, expect, vi } from 'vitest';
import { Configuration, fromEnvironment } from '../configuration/Configuration.js';
import { ClientConfig } from '../types/Common.js';

describe('Configuration', () => {
  it('should create configuration with defaults', () => {
    const config = new Configuration();
    expect(config.timeout).toBe(30000);
    expect(config.retries).toBe(3);
    expect(config.retryDelay).toBe(1000);
  });

  it('should merge provided config with defaults', () => {
    const config = new Configuration({
      apiKey: 'test-key',
      timeout: 5000,
    });

    expect(config.apiKey).toBe('test-key');
    expect(config.timeout).toBe(5000);
    expect(config.retries).toBe(3); // default
  });

  it('should allow method chaining', () => {
    const config = new Configuration().setApiKey('key1').setTimeout(15000).setRetries(5);

    expect(config.apiKey).toBe('key1');
    expect(config.timeout).toBe(15000);
    expect(config.retries).toBe(5);
  });

  it('should validate timeout is positive', () => {
    expect(() => {
      new Configuration({ timeout: -1 });
    }).toThrow();
  });

  it('should validate retries is non-negative', () => {
    expect(() => {
      new Configuration({ retries: -1 });
    }).toThrow();
  });

  it('should get configuration object', () => {
    const original: ClientConfig = {
      apiKey: 'test',
      timeout: 1000,
    };

    const config = new Configuration(original);
    const retrieved = config.getConfig();

    expect(retrieved.apiKey).toBe(original.apiKey);
    expect(retrieved.timeout).toBe(original.timeout);
  });

  it('should warn if no authentication provided', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    new Configuration({ baseUrl: 'https://api.test' });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should merge headers correctly', () => {
    const config = new Configuration({
      headers: {
        'X-Custom': 'value',
      },
    });

    config.setHeaders({
      'X-Another': 'another',
    });

    const headers = config.headers;
    expect(headers['X-Custom']).toBe('value');
    expect(headers['X-Another']).toBe('another');
  });
});

describe('fromEnvironment', () => {
  it('should load configuration from environment variables', () => {
    const originalEnv = process.env;
    const env = { ...originalEnv };

    process.env.ARGUS_API_KEY = 'env-key';
    process.env.ARGUS_BASE_URL = 'https://env.api';
    process.env.ARGUS_TIMEOUT = '60000';

    const config = fromEnvironment();
    expect(config.apiKey).toBe('env-key');
    expect(config.baseUrl).toBe('https://env.api');
    expect(config.timeout).toBe(60000);

    process.env = originalEnv;
  });
});
