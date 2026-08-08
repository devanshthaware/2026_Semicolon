/**
 * Basic usage example
 */

import { ArgusClient, type VerificationResponse } from '@argus/sdk';

async function basicExample(): Promise<void> {
  // Initialize client
  const client = new ArgusClient({
    apiKey: process.env.ARGUS_API_KEY || 'your-api-key',
  });

  // Verify a claim
  const result: VerificationResponse = await client.verify({
    claim: 'Paris is the capital of France',
    evidence: [
      'https://en.wikipedia.org/wiki/Paris',
      'https://en.wikipedia.org/wiki/Geography_of_France',
    ],
  });

  console.log('Verification Result:', {
    id: result.id,
    status: result.status,
    trustScore: result.trustScore,
    confidence: result.confidence,
    reasoning: result.reasoning,
  });

  // Get receipt
  const receipt = await client.getReceipt(result.id);
  console.log('Receipt:', receipt);
}

basicExample().catch(console.error);
