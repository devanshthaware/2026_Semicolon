import { LogLevel } from "../configuration/index.js";

const LOG_LEVELS: Record<LogLevel, number> = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
};

/**
 * A lightweight logger that filters sensitive information like API Keys and JWTs.
 */
export class ArgusLogger {
  private level: number;

  constructor(level: LogLevel = "NONE") {
    this.level = LOG_LEVELS[level];
  }

  private filterSensitive(data: any): any {
    if (typeof data === "string") {
      // Redact Bearer tokens and API keys in strings if they appear
      return data
        .replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, "Bearer ***REDACTED***")
        .replace(/(api_key|apiKey|token|jwt)=([^&\s]*)/gi, "$1=***REDACTED***");
    }

    if (data && typeof data === "object") {
      const redacted = { ...data };
      const sensitiveKeys = ["authorization", "apikey", "api_key", "token", "jwt", "password", "secret"];
      
      for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          redacted[key] = "***REDACTED***";
        } else if (typeof redacted[key] === "object") {
          redacted[key] = this.filterSensitive(redacted[key]);
        } else if (typeof redacted[key] === "string") {
          redacted[key] = this.filterSensitive(redacted[key]);
        }
      }
      return redacted;
    }
    
    return data;
  }

  private log(levelName: LogLevel, ...args: any[]) {
    const currentLevel = LOG_LEVELS[levelName];
    if (this.level >= currentLevel && currentLevel > 0) {
      const safeArgs = args.map(arg => this.filterSensitive(arg));
      const timestamp = new Date().toISOString();
      const prefix = `[Argus SDK][${timestamp}][${levelName}]`;
      
      switch (levelName) {
        case "ERROR":
          console.error(prefix, ...safeArgs);
          break;
        case "WARN":
          console.warn(prefix, ...safeArgs);
          break;
        case "INFO":
          console.info(prefix, ...safeArgs);
          break;
        case "DEBUG":
        case "TRACE":
          console.debug(prefix, ...safeArgs);
          break;
      }
    }
  }

  error(...args: any[]) {
    this.log("ERROR", ...args);
  }

  warn(...args: any[]) {
    this.log("WARN", ...args);
  }

  info(...args: any[]) {
    this.log("INFO", ...args);
  }

  debug(...args: any[]) {
    this.log("DEBUG", ...args);
  }

  trace(...args: any[]) {
    this.log("TRACE", ...args);
  }
}
