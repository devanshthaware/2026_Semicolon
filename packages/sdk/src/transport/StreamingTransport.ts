/**
 * Streaming transport for Server-Sent Events
 */

import { TimeoutError, NetworkError, ApiError } from '../errors/ApiError.js';
import { MiddlewareContext, RequestOptions, AsyncIterableIterator } from '../types/Common.js';

export interface StreamRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  options?: RequestOptions;
}

/**
 * Streaming Transport implementation for Server-Sent Events
 */
export class StreamingTransport {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeout = timeout;
  }

  stream<T extends { type: string }>(req: StreamRequest): AsyncIterableIterator<T> {
    const iterator = this.streamEvents<T>(req);
    return iterator;
  }

  private async *streamEvents<T extends { type: string }>(
    req: StreamRequest
  ): AsyncGenerator<T, void, undefined> {
    const url = this.resolveUrl(req.url);
    const headers = this.normalizeHeaders(req.headers);
    const timeout = req.options?.timeout ?? this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
      };

      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const text = await response.text();
        let body: unknown = text;
        try {
          body = JSON.parse(text);
        } catch {
          // Keep as text
        }
        throw new ApiError(
          `HTTP ${response.status}: Stream request failed`,
          response.status,
          typeof body === 'object' ? (body as Record<string, unknown>) : undefined
        );
      }

      if (!response.body) {
        throw new NetworkError('Stream response has no body', new Error('No response body'));
      }

      const context: MiddlewareContext = {
        request: {
          method: req.method,
          url,
          headers,
          body: req.body,
        },
      };

      yield* this.parseStream<T>(response.body);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(timeout);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      controller.abort();
    }
  }

  private async *parseStream<T extends { type: string }>(
    body: ReadableStream<Uint8Array>
  ): AsyncGenerator<T, void, undefined> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            yield* this.parseServerSentEvent<T>(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) {
            // Empty line signals end of event
            continue;
          }

          if (line.startsWith(':')) {
            // Comment, ignore
            continue;
          }

          if (line.startsWith('data: ')) {
            yield* this.parseServerSentEvent<T>(line.substring(6));
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async *parseServerSentEvent<T extends { type: string }>(
    data: string
  ): AsyncGenerator<T, void, undefined> {
    if (!data.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(data) as T;
      yield parsed;
    } catch {
      // Invalid JSON, skip
      console.warn('Failed to parse streaming event:', data);
    }
  }

  private normalizeHeaders(headers?: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
