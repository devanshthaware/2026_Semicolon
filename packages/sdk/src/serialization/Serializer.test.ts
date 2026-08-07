/**
 * Tests for Serialization
 */

import { describe, it, expect } from 'vitest';
import {
  serialize,
  deserialize,
  parseWithSchema,
  safeSerialize,
  formDataToObject,
} from '../serialization/Serializer.js';
import { z } from 'zod';
import { ValidationError } from '../errors/ApiError.js';

describe('Serialization', () => {
  describe('serialize', () => {
    it('should serialize objects to JSON string', () => {
      const obj = { key: 'value', number: 42 };
      const result = serialize(obj);
      expect(result).toBe('{"key":"value","number":42}');
    });

    it('should serialize arrays', () => {
      const arr = [1, 2, 3];
      const result = serialize(arr);
      expect(result).toBe('[1,2,3]');
    });

    it('should throw on circular references', () => {
      const obj: Record<string, unknown> = { key: 'value' };
      obj.self = obj; // circular reference

      expect(() => {
        serialize(obj);
      }).toThrow(ValidationError);
    });
  });

  describe('deserialize', () => {
    it('should deserialize JSON string to object', () => {
      const json = '{"key":"value","number":42}';
      const result = deserialize(json);
      expect(result).toEqual({ key: 'value', number: 42 });
    });

    it('should deserialize arrays', () => {
      const json = '[1,2,3]';
      const result = deserialize(json);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should throw on invalid JSON', () => {
      expect(() => {
        deserialize('invalid json');
      }).toThrow(ValidationError);
    });
  });

  describe('parseWithSchema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('should validate and parse data', () => {
      const data = { name: 'John', age: 30 };
      const result = parseWithSchema(data, schema);
      expect(result).toEqual(data);
    });

    it('should throw on validation failure', () => {
      const data = { name: 'John', age: 'thirty' };
      expect(() => {
        parseWithSchema(data, schema);
      }).toThrow(ValidationError);
    });

    it('should include validation errors', () => {
      const data = { name: 123, age: 'not a number' };
      try {
        parseWithSchema(data, schema);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(Object.keys(error.errors).length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('safeSerialize', () => {
    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { key: 'value' };
      obj.self = obj;
      const result = safeSerialize(obj);
      expect(result).toContain('Circular Reference');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const obj = { date };
      const result = safeSerialize(obj);
      expect(result).toContain('2024-01-01');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const obj = { error };
      const result = safeSerialize(obj);
      expect(result).toContain('Test error');
    });

    it('should support indentation', () => {
      const obj = { key: 'value' };
      const result = safeSerialize(obj, 2);
      expect(result).toContain('  "key"');
    });
  });

  describe('formDataToObject', () => {
    it('should convert FormData to object', () => {
      const formData = new FormData();
      formData.append('name', 'John');
      formData.append('email', 'john@example.com');

      const result = formDataToObject(formData);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle multiple values for same key', () => {
      const formData = new FormData();
      formData.append('tags', 'tag1');
      formData.append('tags', 'tag2');

      const result = formDataToObject(formData);
      expect(Array.isArray(result.tags)).toBe(true);
      expect((result.tags as unknown[]).length).toBe(2);
    });
  });
});
