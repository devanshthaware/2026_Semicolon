/**
 * Serialization and deserialization utilities
 */

import { z } from 'zod';
import { ValidationError } from '../errors/ApiError.js';

/**
 * Serializes data to JSON
 */
export function serialize(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    throw new ValidationError('Failed to serialize data', {
      serialization: ['Data could not be serialized to JSON'],
    });
  }
}

/**
 * Deserializes JSON string to an object
 */
export function deserialize(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new ValidationError('Failed to deserialize data', {
      deserialization: ['Invalid JSON received from API'],
    });
  }
}

/**
 * Validates and parses data using a Zod schema
 */
export function parseWithSchema<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      }
      throw new ValidationError('Data validation failed', errors);
    }
    throw error;
  }
}

/**
 * Safely serializes data, handling circular references and special types
 */
export function safeSerialize(data: unknown, space = 0): string {
  const seen = new WeakSet();

  const replacer = (_key: string, value: unknown): unknown => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    return value;
  };

  return JSON.stringify(data, replacer, space);
}

/**
 * Converts FormData to object (for logging/debugging)
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        (obj[key] as unknown[]).push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  });
  return obj;
}
