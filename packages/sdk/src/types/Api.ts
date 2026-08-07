/**
 * API-specific types and models
 */

import { z } from 'zod';

/**
 * Health response
 */
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number().optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Verification request schema
 */
export const VerificationRequestSchema = z.object({
  claim: z.string().min(1, 'Claim cannot be empty'),
  evidence: z.array(z.string()).min(1, 'At least one piece of evidence is required'),
  context: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  timeout: z.number().optional(),
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

/**
 * Verification response schema
 */
export const VerificationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  claim: z.string(),
  evidence: z.array(z.string()),
  trustScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type VerificationResponse = z.infer<typeof VerificationResponseSchema>;

/**
 * Receipt for a verification result
 */
export const ReceiptSchema = z.object({
  id: z.string().uuid(),
  verificationId: z.string().uuid(),
  trustScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  status: z.enum(['verified', 'unverified', 'uncertain']),
  timestamp: z.string().datetime(),
  evidence: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      weight: z.number(),
      status: z.enum(['supporting', 'contradicting', 'neutral']),
    })
  ),
  explanation: z.string().optional(),
});

export type Receipt = z.infer<typeof ReceiptSchema>;

/**
 * Session tracking
 */
export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().optional(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  verifications: z.array(z.string().uuid()).optional(),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Analytics data
 */
export const AnalyticsSchema = z.object({
  totalVerifications: z.number().nonnegative(),
  averageTrustScore: z.number().min(0).max(1),
  successRate: z.number().min(0).max(1),
  averageProcessingTime: z.number().nonnegative(),
  timestamp: z.string().datetime(),
  period: z.enum(['hour', 'day', 'week', 'month']),
});

export type Analytics = z.infer<typeof AnalyticsSchema>;

/**
 * Claim data model
 */
export const ClaimSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  type: z.string().optional(),
  source: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type Claim = z.infer<typeof ClaimSchema>;

/**
 * Evidence model
 */
export const EvidenceSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  content: z.string(),
  source: z.string().optional(),
  weight: z.number().min(0).max(1),
  timestamp: z.string().datetime(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

/**
 * Trust score model
 */
export const TrustScoreSchema = z.object({
  overall: z.number().min(0).max(1),
  components: z.record(z.string(), z.number().min(0).max(1)),
  reasoning: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type TrustScore = z.infer<typeof TrustScoreSchema>;

/**
 * Event types for streaming
 */
export const StreamingEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('verification.started'),
    verificationId: z.string().uuid(),
    timestamp: z.string().datetime(),
  }),
  z.object({
    type: z.literal('verification.processing'),
    verificationId: z.string().uuid(),
    progress: z.number().min(0).max(100),
    timestamp: z.string().datetime(),
  }),
  z.object({
    type: z.literal('verification.completed'),
    verificationId: z.string().uuid(),
    result: VerificationResponseSchema,
    timestamp: z.string().datetime(),
  }),
  z.object({
    type: z.literal('verification.failed'),
    verificationId: z.string().uuid(),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
    timestamp: z.string().datetime(),
  }),
]);

export type StreamingEvent = z.infer<typeof StreamingEventSchema>;
