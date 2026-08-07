export class ArgusError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ArgusError";
    Object.setPrototypeOf(this, ArgusError.prototype);
  }
}

export class AuthenticationError extends ArgusError {
  constructor(message: string, status: number = 401) {
    super(message, status);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ArgusError {
  constructor(message: string, status: number = 403) {
    super(message, status);
    this.name = "AuthorizationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends ArgusError {
  constructor(message: string, public readonly details?: any, status: number = 422) {
    super(message, status);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends ArgusError {
  constructor(message: string, public readonly retryAfter?: number, status: number = 429) {
    super(message, status);
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class TimeoutError extends ArgusError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ConnectionError extends ArgusError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "ConnectionError";
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class StreamingError extends ArgusError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "StreamingError";
    Object.setPrototypeOf(this, StreamingError.prototype);
  }
}

export class VerificationError extends ArgusError {
  constructor(message: string, public readonly metadata?: any, status?: number) {
    super(message, status);
    this.name = "VerificationError";
    Object.setPrototypeOf(this, VerificationError.prototype);
  }
}

export class ServerError extends ArgusError {
  constructor(message: string, status: number = 500) {
    super(message, status);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
