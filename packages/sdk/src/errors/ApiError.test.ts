/**
 * Tests for Error Classes
 */

import { describe, it, expect } from 'vitest';
import {
  ArgusError,
  ApiError,
  AuthenticationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  NetworkError,
  isArgusError,
  isApiError,
  isAuthenticationError,
  isValidationError,
  isTimeoutError,
  isRateLimitError,
  isNetworkError,
} from '../errors/ApiError.js';

describe('Error Classes', () => {
  describe('ArgusError', () => {
    it('should create error with message and code', () => {
      const error = new ArgusError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ArgusError');
    });

    it('should include timestamp', () => {
      const error = new ArgusError('Test', 'TEST');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should serialize to JSON', () => {
      const error = new ArgusError('Test error', 'TEST_ERROR', 500);
      const json = error.toJSON();
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.statusCode).toBe(500);
    });
  });

  describe('ApiError', () => {
    it('should create API error with status code', () => {
      const error = new ApiError('API call failed', 500);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('API_ERROR');
    });

    it('should include details', () => {
      const details = { field: 'value' };
      const error = new ApiError('Failed', 400, details);
      expect(error.details).toBe(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError();
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication failed');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should include validation errors', () => {
      const errors = {
        email: ['Invalid email format'],
        password: ['Too short'],
      };
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toBe(errors);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError(5000);
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.statusCode).toBe(408);
      expect(error.timeout).toBe(5000);
    });

    it('should include timeout in message', () => {
      const error = new TimeoutError(3000);
      expect(error.message).toContain('3000');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError(60);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });

    it('should have default retry after', () => {
      const error = new RateLimitError();
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const originalError = new Error('Connection refused');
      const error = new NetworkError('Network request failed', originalError);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('Type guards', () => {
    it('should identify ArgusError', () => {
      const error = new ArgusError('Test', 'TEST');
      expect(isArgusError(error)).toBe(true);
      expect(isArgusError(new Error('Other'))).toBe(false);
    });

    it('should identify ApiError', () => {
      const error = new ApiError('API error', 500);
      expect(isApiError(error)).toBe(true);
      expect(isApiError(new ArgusError('Test', 'TEST'))).toBe(false);
    });

    it('should identify AuthenticationError', () => {
      const error = new AuthenticationError();
      expect(isAuthenticationError(error)).toBe(true);
    });

    it('should identify ValidationError', () => {
      const error = new ValidationError('Failed');
      expect(isValidationError(error)).toBe(true);
    });

    it('should identify TimeoutError', () => {
      const error = new TimeoutError(5000);
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should identify RateLimitError', () => {
      const error = new RateLimitError();
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify NetworkError', () => {
      const error = new NetworkError('Failed', new Error('Test'));
      expect(isNetworkError(error)).toBe(true);
    });
  });
});
