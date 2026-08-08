/**
 * Tests for Middleware
 */

import { describe, it, expect, vi } from 'vitest';
import {
  authenticationMiddleware,
  retryMiddleware,
  userAgentMiddleware,
  headersMiddleware,
  chainMiddleware,
} from '../middleware/index.js';
import { MiddlewareContext } from '../types/Common.js';

describe('Middleware', () => {
  describe('authenticationMiddleware', () => {
    it('should add API key to headers', async () => {
      const middleware = authenticationMiddleware('test-key');
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await middleware(context, async () => {});
      expect(context.request.headers.Authorization).toBe('Bearer test-key');
    });

    it('should add bearer token to headers', async () => {
      const middleware = authenticationMiddleware(undefined, 'bearer-token');
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await middleware(context, async () => {});
      expect(context.request.headers.Authorization).toBe('Bearer bearer-token');
    });

    it('should prefer API key over bearer token', async () => {
      const middleware = authenticationMiddleware('api-key', 'bearer-token');
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await middleware(context, async () => {});
      expect(context.request.headers.Authorization).toBe('Bearer api-key');
    });
  });

  describe('userAgentMiddleware', () => {
    it('should add user agent to headers', async () => {
      const middleware = userAgentMiddleware('Custom/1.0');
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await middleware(context, async () => {});
      expect(context.request.headers['User-Agent']).toBe('Custom/1.0');
    });
  });

  describe('headersMiddleware', () => {
    it('should merge headers', async () => {
      const middleware = headersMiddleware({
        'X-Custom': 'value',
        'X-Another': 'another',
      });

      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await middleware(context, async () => {});
      expect(context.request.headers['X-Custom']).toBe('value');
      expect(context.request.headers['X-Another']).toBe('another');
    });
  });

  describe('chainMiddleware', () => {
    it('should execute middlewares in order', async () => {
      const calls: number[] = [];

      const middleware1 = vi.fn(async (ctx, next) => {
        calls.push(1);
        await next();
      });

      const middleware2 = vi.fn(async (ctx, next) => {
        calls.push(2);
        await next();
      });

      const middleware3 = vi.fn(async (ctx, next) => {
        calls.push(3);
        await next();
      });

      const chain = chainMiddleware(middleware1, middleware2, middleware3);
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await chain(context, async () => {
        calls.push(4);
      });

      expect(calls).toEqual([1, 2, 3, 4]);
    });

    it('should handle errors in middleware', async () => {
      const middleware1 = async (_ctx: MiddlewareContext, next: () => Promise<void>) => {
        await next();
      };

      const middleware2 = async (_ctx: MiddlewareContext, _next: () => Promise<void>) => {
        throw new Error('Middleware error');
      };

      const chain = chainMiddleware(middleware1, middleware2);
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await expect(chain(context, async () => {})).rejects.toThrow('Middleware error');
    });

    it('should detect multiple next() calls', async () => {
      const middleware = async (_ctx: MiddlewareContext, next: () => Promise<void>) => {
        await next();
        await next(); // Call next twice
      };

      const chain = chainMiddleware(middleware);
      const context: MiddlewareContext = {
        request: {
          method: 'GET',
          url: '/test',
          headers: {},
        },
      };

      await expect(chain(context, async () => {})).rejects.toThrow(
        'Middleware called next() multiple times'
      );
    });
  });
});
