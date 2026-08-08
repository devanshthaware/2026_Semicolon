/**
 * Error handling example
 */

import {
  ArgusClient,
  isTimeoutError,
  isRateLimitError,
  isValidationError,
  AuthenticationError,
  ApiError,
} from '@argus/sdk';

async function errorHandlingExample(): Promise<void> {
  const client = new ArgusClient({
    apiKey: process.env.ARGUS_API_KEY || 'your-api-key',
    timeout: 5000,
  });

  try {
    // Try to verify with invalid claim (will fail validation)
    await client.verify({
      claim: '', // Empty claim will fail validation
      evidence: [],
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      console.error('⏱️  Request timed out');
      console.error(`Try again in: ${error.timeout}ms`);
    } else if (isRateLimitError(error)) {
      console.error('🚫 Rate limit exceeded');
      console.error(`Retry after: ${error.retryAfter} seconds`);

      // Implement exponential backoff
      await new Promise((resolve) => setTimeout(resolve, error.retryAfter * 1000));
    } else if (isValidationError(error)) {
      console.error('❌ Validation failed:');
      for (const [field, messages] of Object.entries(error.errors)) {
        console.error(`  ${field}: ${messages.join(', ')}`);
      }
    } else if (error instanceof AuthenticationError) {
      console.error('🔐 Authentication failed');
      console.error('Please check your API credentials');
    } else if (error instanceof ApiError) {
      console.error(`API Error [${error.statusCode}]: ${error.message}`);
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else if (error instanceof Error) {
      console.error(`Unexpected error: ${error.message}`);
    }
  }
}

errorHandlingExample().catch(console.error);
