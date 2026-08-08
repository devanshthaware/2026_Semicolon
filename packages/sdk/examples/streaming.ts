/**
 * Streaming verification example
 */

import { ArgusClient, type StreamingEvent } from '@argus/sdk';

async function streamingExample(): Promise<void> {
  const client = new ArgusClient({
    apiKey: process.env.ARGUS_API_KEY || 'your-api-key',
  });

  console.log('Starting streaming verification...');

  // Stream verification events
  for await (const event of client.verifyStream({
    claim: 'London is the capital of the United Kingdom',
    evidence: [
      'https://en.wikipedia.org/wiki/London',
      'https://en.wikipedia.org/wiki/Government_of_the_United_Kingdom',
    ],
  })) {
    const streamEvent = event as StreamingEvent;

    switch (streamEvent.type) {
      case 'verification.started':
        console.log(`✓ Verification started: ${streamEvent.verificationId}`);
        break;

      case 'verification.processing':
        console.log(`◐ Processing: ${streamEvent.progress}%`);
        break;

      case 'verification.completed':
        console.log(`✓ Completed with trust score: ${streamEvent.result.trustScore}`);
        break;

      case 'verification.failed':
        console.error(`✗ Failed: ${streamEvent.error.message}`);
        break;
    }
  }
}

streamingExample().catch(console.error);
