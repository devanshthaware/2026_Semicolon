import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgusClient } from '../src/client/ArgusClient.js';
import { AuthenticationError, ValidationError } from '../src/exceptions/index.js';

// Mock fetch globally
const originalFetch = global.fetch;

describe('ArgusClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('initializes with default configuration', () => {
    const client = new ArgusClient({ apiKey: 'test-key' });
    expect(client).toBeDefined();
  });

  it('throws authentication error when no credentials provided', () => {
    expect(() => new ArgusClient({ })).toThrowError(AuthenticationError);
  });

  it('validates verification requests', async () => {
    const client = new ArgusClient({ apiKey: 'test-key' });
    
    await expect(client.verify({ input: '', response: '' })).rejects.toThrowError(ValidationError);
  });

  it('includes auth headers in request', async () => {
    const client = new ArgusClient({ apiKey: 'test-key' });
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', version: '1.0.0' })
    });

    await client.health();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callArgs = (global.fetch as any).mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers['Authorization']).toBe('Bearer test-key');
  });

  it('retries on 503 Server Error', async () => {
    const client = new ArgusClient({ 
      apiKey: 'test-key', 
      maxRetries: 2,
      retryBaseDelay: 10,
      retryMaxDelay: 50
    });
    
    let calls = 0;
    (global.fetch as any).mockImplementation(async () => {
      calls++;
      if (calls < 3) {
        return { ok: false, status: 503, json: async () => ({ message: 'Service Unavailable' }) };
      }
      return { ok: true, status: 200, json: async () => ({ status: 'ok', version: '1.0.0' }) };
    });

    const res = await client.health();
    expect(res.status).toBe('ok');
    expect(calls).toBe(3);
  });
});
