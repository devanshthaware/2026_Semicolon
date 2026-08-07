import { ArgusConfig } from "../configuration/index.js";
import { ArgusEvent } from "../models/index.js";
import { Serializer } from "../serialization/index.js";
import { StreamingError, ArgusError } from "../exceptions/index.js";
import { TransportClient } from "../transport/index.js";

type EventHandler = (event: ArgusEvent) => void;
type ErrorHandler = (error: Error) => void;
type CloseHandler = () => void;

/**
 * A streaming client that uses HTTP fetch to read Server-Sent Events (SSE).
 */
export class StreamingClient {
  private eventHandlers: Set<EventHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private closeHandlers: Set<CloseHandler> = new Set();
  private abortController: AbortController | null = null;
  
  constructor(
    private readonly transport: TransportClient,
    private readonly config: ArgusConfig
  ) {}

  onEvent(handler: EventHandler): void {
    this.eventHandlers.add(handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  onClose(handler: CloseHandler): void {
    this.closeHandlers.add(handler);
  }

  removeEventHandler(handler: EventHandler): void {
    this.eventHandlers.delete(handler);
  }

  /**
   * Starts a streaming request
   */
  async stream(path: string, requestBody: any): Promise<void> {
    this.abortController = new AbortController();

    try {
      // We directly use fetch here to get access to the body stream,
      // but we need the transport to handle auth/middlewares. 
      // TransportClient.request assumes JSON response. We need to add a raw request method or
      // build the Request manually and pass through middlewares.
      // For simplicity, we will assume TransportClient has a request method that returns Response?
      // Wait, TransportClient.request parses JSON. We'll need a specialized method or adjust.
      // Let's manually fetch using the config, but we should reuse authentication.
      // Instead, we can build the headers using the provider from config...
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "User-Agent": this.config.userAgent,
        ...this.config.customHeaders
      };

      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`;
      } else if (this.config.jwt) {
        headers["Authorization"] = `Bearer ${this.config.jwt}`;
      }

      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers,
        body: Serializer.serialize(requestBody),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new ArgusError(`Streaming failed with status ${response.status}`, response.status);
      }

      if (!response.body) {
        throw new StreamingError("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          this.closeHandlers.forEach(h => h());
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE format
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            try {
              if (dataStr === '[DONE]') {
                 this.closeHandlers.forEach(h => h());
                 return; // Stream finished gracefully
              }
              const eventData = Serializer.deserialize<ArgusEvent>(dataStr);
              this.eventHandlers.forEach(h => h(eventData));
            } catch (e: any) {
              this.errorHandlers.forEach(h => h(new StreamingError(`Failed to parse stream event: ${e.message}`)));
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Stream cancelled intentionally
        this.closeHandlers.forEach(h => h());
      } else {
        this.errorHandlers.forEach(h => h(error));
      }
    }
  }

  close(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
