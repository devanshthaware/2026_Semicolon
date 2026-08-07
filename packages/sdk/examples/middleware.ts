/**
 * Custom middleware example
 */

import { ArgusClient, type Middleware, type MiddlewareContext } from '@argus/sdk';
import { crypto } from '@std/crypto';

async function middlewareExample(): Promise<void> {
  const client = new ArgusClient({
    apiKey: process.env.ARGUS_API_KEY || 'your-api-key',
  });

  // Request ID middleware
  const requestIdMiddleware: Middleware = async (context, next) => {
    context.request.headers['X-Request-ID'] = crypto.randomUUID();
    await next();
  };

  // Timing middleware
  const timingMiddleware: Middleware = async (context, next) => {
    const startTime = Date.now();
    await next();
    const duration = Date.now() - startTime;
    console.log(`Request took ${duration}ms`);
  };

  // Logging middleware
  const loggingMiddleware: Middleware = async (context, next) => {
    console.log(`→ ${context.request.method} ${context.request.url}`);
    try {
      await next();
      console.log(`← ${context.response?.status}`);
    } catch (error) {
      console.error(`✗ Error:`, error);
      throw error;
    }
  };

  // Add middleware to client
  client.use(requestIdMiddleware).use(timingMiddleware).use(loggingMiddleware);

  // Now all requests will go through the middleware
  const result = await client.verify({
    claim: 'Example claim',
    evidence: ['example.com'],
  });

  console.log('Verification complete:', result.id);
}

middlewareExample().catch(console.error);
