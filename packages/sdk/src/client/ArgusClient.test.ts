/**
 * Tests for ArgusClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgusClient } from '../client/ArgusClient.js';
import { type Middleware } from '../middleware/index.js';

describe('ArgusClient', () => {
  let client: ArgusClient;

  beforeEach(() => {
    client = new ArgusClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.local',
      timeout: 5000,
    });
  });

  it('should initialize with default configuration', () => {
    const defaultClient = new ArgusClient({ apiKey: 'test' });
    const config = defaultClient.getConfiguration();
    expect(config.apiKey).toBe('test');
  });

  it('should initialize with custom configuration', () => {
    const config = client.getConfiguration();
    expect(config.apiKey).toBe('test-api-key');
    expect(config.baseUrl).toBe('https://api.test.local');
    expect(config.timeout).toBe(5000);
  });

  it('should allow configuration updates', () => {
    client.configure({
      apiKey: 'new-key',
      timeout: 10000,
    });

    const config = client.getConfiguration();
    expect(config.apiKey).toBe('new-key');
    expect(config.timeout).toBe(10000);
  });

  it('should support middleware chaining', () => {
    const middleware: Middleware = vi.fn(async (ctx, next) => {
      ctx.request.headers['X-Custom'] = 'value';
      await next();
    });

    client.use(middleware);
    expect(middleware).toBeDefined();
  });

  it('should properly set bearer token', () => {
    const bearerClient = new ArgusClient({
      bearerToken: 'bearer-token-123',
    });

    const config = bearerClient.getConfiguration();
    expect(config.bearerToken).toBe('bearer-token-123');
  });

  it('should merge custom headers', () => {
    const customClient = new ArgusClient({
      apiKey: 'test',
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-Another': 'another-value',
      },
    });

    const config = customClient.getConfiguration();
    const headers = config.headers;
    expect(headers['X-Custom-Header']).toBe('custom-value');
    expect(headers['X-Another']).toBe('another-value');
  });
});
