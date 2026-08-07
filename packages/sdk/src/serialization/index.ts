import { ValidationError } from "../exceptions/index.js";
import { z } from "zod";
import type { VerificationRequest } from "../models/index.js";

/**
 * Handles JSON Serialization and Deserialization safely.
 */
export class Serializer {
  
  static serialize(data: any): string {
    try {
      return JSON.stringify(data);
    } catch (e: any) {
      throw new ValidationError(`Failed to serialize payload: ${e.message}`);
    }
  }

  static deserialize<T>(data: string): T {
    try {
      return JSON.parse(data) as T;
    } catch (e: any) {
      throw new ValidationError(`Failed to parse response: ${e.message}`);
    }
  }

  // Zod schemas for runtime validation of critical paths
  
  static readonly VerificationRequestSchema = z.object({
    input: z.string().min(1, "Input is required"),
    response: z.string().min(1, "Response is required"),
    mode: z.enum(["standard", "strict"]).optional(),
    samples: z.array(z.string()).optional(),
    context: z.record(z.any()).optional(),
  });

  static validateVerificationRequest(request: VerificationRequest): void {
    const result = this.VerificationRequestSchema.safeParse(request);
    if (!result.success) {
      throw new ValidationError("Invalid verification request payload", result.error.format());
    }
  }
}
