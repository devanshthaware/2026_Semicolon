# Argus SDK

Production-grade TypeScript SDK for the Argus verification platform.

## Features

✨ **Fully Typed** - Complete TypeScript type definitions with Zod validation
🚀 **Tree-Shakeable** - ESM and CommonJS builds with proper code splitting
🔄 **Streaming Support** - Server-Sent Events for real-time verification streams
🛡️ **Error Handling** - Comprehensive, typed error classes for all scenarios
🔌 **Middleware System** - Extensible middleware for authentication, retries, logging
⚙️ **Configurable** - Flexible configuration with environment variables support
📦 **Production Ready** - Fully tested, documented, and optimized for npm

## Installation

```bash
npm install @argus/sdk
# or
pnpm add @argus/sdk
# or
yarn add @argus/sdk
```

## Quick Start

### Basic Usage

```typescript
import { ArgusClient } from '@argus/sdk';

const client = new ArgusClient({
  apiKey: 'your-api-key',
});

const result = await client.verify({
  claim: 'Paris is the capital of France',
  evidence: ['https://example.com/evidence1', 'https://example.com/evidence2'],
});

console.log(result.trustScore); // 0.95
```

### Streaming Verification

```typescript
const client = new ArgusClient({ apiKey: 'your-api-key' });

for await (const event of client.verifyStream({
  claim: 'Example claim',
  evidence: ['...'],
})) {
  if (event.type === 'verification.completed') {
    console.log('Result:', event.result);
  }
}
```

### Configuration

```typescript
const client = new ArgusClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.argus.ai',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-Custom-Header': 'value',
  },
});

// Update configuration later
client.configure({
  timeout: 60000,
});
```

### Environment Variables

```bash
export ARGUS_API_KEY=your-api-key
export ARGUS_BASE_URL=https://api.argus.ai
export ARGUS_TIMEOUT=30000
export ARGUS_RETRIES=3
export ARGUS_RETRY_DELAY=1000
```

```typescript
import { Configuration, fromEnvironment } from '@argus/sdk';

const config = fromEnvironment();
const client = new ArgusClient(config.getConfig());
```

### Authentication

```typescript
// API Key authentication
const client = new ArgusClient({
  apiKey: 'your-api-key',
});

// Bearer token authentication
const client = new ArgusClient({
  bearerToken: 'your-bearer-token',
});
```

### Custom Middleware

```typescript
const client = new ArgusClient({ apiKey: 'your-api-key' });

// Add logging middleware
client.use(async (context, next) => {
  console.log(`→ ${context.request.method} ${context.request.url}`);
  await next();
  console.log(`← ${context.response?.status}`);
});

// Add custom headers
client.use(async (context, next) => {
  context.request.headers['X-Request-ID'] = crypto.randomUUID();
  await next();
});
```

## API Methods

### verify()

Verify a claim with supporting evidence.

```typescript
const result = await client.verify({
  claim: 'Paris is the capital of France',
  evidence: ['https://example.com/evidence1'],
  priority: 'high',
  timeout: 10000,
});
```

### verifyStream()

Stream verification events in real-time.

```typescript
for await (const event of client.verifyStream({
  claim: 'Example claim',
  evidence: ['...'],
})) {
  console.log(event);
}
```

### getReceipt()

Retrieve a verification receipt.

```typescript
const receipt = await client.getReceipt('verification-id');
```

### getSession()

Get session information.

```typescript
const session = await client.getSession('session-id');
```

### health()

Check API health status.

```typescript
const health = await client.health();
console.log(health.status); // 'healthy'
```

### analytics()

Get usage analytics.

```typescript
const analytics = await client.analytics();
console.log(analytics.totalVerifications);
```

## Error Handling

The SDK provides typed error classes for different error scenarios:

```typescript
import {
  ArgusError,
  ApiError,
  AuthenticationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  NetworkError,
  isTimeoutError,
  isRateLimitError,
} from '@argus/sdk';

try {
  await client.verify({ claim: '', evidence: [] });
} catch (error) {
  if (isTimeoutError(error)) {
    console.error('Request timed out');
  } else if (isRateLimitError(error)) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof ApiError) {
    console.error(`API error: ${error.statusCode} - ${error.message}`);
  } else if (error instanceof ArgusError) {
    console.error(`Argus error: ${error.code}`);
  }
}
```

## Types

All types are exported from the SDK:

```typescript
import {
  VerificationRequest,
  VerificationResponse,
  Receipt,
  Session,
  Analytics,
  Claim,
  Evidence,
  TrustScore,
  StreamingEvent,
  HealthResponse,
} from '@argus/sdk';
```

## Serialization

The SDK includes serialization utilities:

```typescript
import { serialize, deserialize, parseWithSchema, safeSerialize } from '@argus/sdk';

// Serialize to JSON
const json = serialize({ key: 'value' });

// Deserialize from JSON
const obj = deserialize(json);

// Validate with schema
import { z } from 'zod';
const schema = z.object({ key: z.string() });
const validated = parseWithSchema(obj, schema);

// Safe serialization (handles circular refs, Dates, Errors)
const safe = safeSerialize(complexObject);
```

## Tree-Shaking

The SDK is fully tree-shakeable. Only import what you need:

```typescript
// ✅ Only ArgusClient is bundled
import { ArgusClient } from '@argus/sdk';

// ✅ Only error classes are bundled
import { AuthenticationError, ValidationError } from '@argus/sdk';

// ❌ Avoids bundling unused types
import * as Argus from '@argus/sdk';
```

## Browser Support

The SDK works in modern browsers and Node.js 20+:

```typescript
// Browser
import { ArgusClient } from '@argus/sdk';

// Node.js
import { ArgusClient } from '@argus/sdk';

// TypeScript
import { ArgusClient, type VerificationResponse } from '@argus/sdk';
```

## Examples

See the [examples](./examples/) directory for:

- Basic usage
- Streaming verification
- Error handling
- Custom middleware
- Environment configuration
- TypeScript and JavaScript examples
- Node.js and browser examples
- Next.js integration
- React hooks

## Testing

```bash
pnpm test              # Run tests
pnpm test:ui          # Interactive test UI
pnpm test:coverage    # Coverage report
```

## Building

```bash
pnpm build            # Build for production
pnpm typecheck        # Check types
pnpm lint             # Lint code
pnpm format           # Format code
```

## Publishing

```bash
npm publish --access public
```

## License

Apache License 2.0 - see [LICENSE](./LICENSE) for details

## Support

For issues and questions:

- 📧 Email: support@argus.ai
- 🐛 GitHub Issues: https://github.com/argus-ai/sdk/issues
- 📚 Documentation: https://docs.argus.ai
