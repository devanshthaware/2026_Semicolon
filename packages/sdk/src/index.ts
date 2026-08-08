/**
 * Argus SDK - Production-grade TypeScript SDK
 *
 * Main entry point for the Argus SDK
 */

import { ArgusClient } from './client/ArgusClient.js';

// Types - API Models
export type {
  VerificationRequest,
  VerificationResponse,
  Receipt,
  Session,
  Analytics,
  Claim,
  Evidence,
  TrustScore,
  StreamingEvent,
} from './types/Api.js';

export {
  VerificationRequestSchema,
  VerificationResponseSchema,
  ReceiptSchema,
  SessionSchema,
  AnalyticsSchema,
  ClaimSchema,
  EvidenceSchema,
  TrustScoreSchema,
  StreamingEventSchema,
} from './types/Api.js';

// Types - Common
export type {
  ApiResponse,
  ApiErrorResponse,
  RequestOptions,
  HealthResponse,
  PaginationParams,
  PaginatedResponse,
  MiddlewareContext,
  AsyncIterableIterator,
  StreamingEvent as CommonStreamingEvent,
  ClientConfig as CommonClientConfig,
} from './types/Common.js';

// Errors
export {
  ArgusError,
  ApiError,
  AuthenticationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  NetworkError,
  ConfigurationError,
  isArgusError,
  isApiError,
  isAuthenticationError,
  isValidationError,
  isTimeoutError,
  isRateLimitError,
  isNetworkError,
} from './errors/ApiError.js';

// Middleware
export {
  authenticationMiddleware,
  retryMiddleware,
  loggingMiddleware,
  timeoutMiddleware,
  userAgentMiddleware,
  headersMiddleware,
  contentTypeMiddleware,
  chainMiddleware,
  type Middleware,
} from './middleware/index.js';

// Transport
export {
  HttpTransport,
  type TransportRequest,
  type TransportResponse,
} from './transport/HttpTransport.js';
export { StreamingTransport, type StreamRequest } from './transport/StreamingTransport.js';

// Serialization
export {
  serialize,
  deserialize,
  parseWithSchema,
  safeSerialize,
  formDataToObject,
} from './serialization/Serializer.js';

// Default export
export default ArgusClient;
