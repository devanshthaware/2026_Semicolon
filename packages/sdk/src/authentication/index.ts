import { ArgusConfig } from "../configuration/index.js";
import { AuthenticationError } from "../exceptions/index.js";

export interface AuthenticationProvider {
  /**
   * Applies the authentication credentials to the given headers object.
   * @param headers The HTTP headers object to mutate
   */
  applyToHeaders(headers: Record<string, string>): void;
}

export class APIKeyAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly apiKey: string) {}

  applyToHeaders(headers: Record<string, string>): void {
    headers["Authorization"] = `Bearer ${this.apiKey}`;
  }
}

export class JWTAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly jwt: string) {}

  applyToHeaders(headers: Record<string, string>): void {
    headers["Authorization"] = `Bearer ${this.jwt}`;
  }
}

export class NoopAuthenticationProvider implements AuthenticationProvider {
  applyToHeaders(headers: Record<string, string>): void {
    // No-op
  }
}

/**
 * Creates the appropriate authentication provider based on the SDK configuration.
 */
export function createAuthenticationProvider(config: ArgusConfig): AuthenticationProvider {
  if (config.apiKey) {
    return new APIKeyAuthenticationProvider(config.apiKey);
  }
  
  if (config.jwt) {
    return new JWTAuthenticationProvider(config.jwt);
  }
  
  throw new AuthenticationError("No valid authentication credentials provided in configuration. You must provide an apiKey or jwt.");
}
