export class LlmProviderError extends Error {
  readonly status?: number;
  readonly code: string;
  readonly provider: string;
  readonly cause?: unknown;

  constructor(message: string, options: { status?: number; code: string; provider?: string; cause?: unknown }) {
    super(message);
    this.name = this.constructor.name;
    this.status = options.status;
    this.code = options.code;
    this.provider = options.provider ?? "openrouter";
    this.cause = options.cause;
  }
}

export class AuthError extends LlmProviderError {
  constructor(message = "Authentication failed for OpenRouter.", options: { status?: number; cause?: unknown } = {}) {
    super(message, { ...options, code: "AUTH_ERROR" });
  }
}

export class RateLimitError extends LlmProviderError {
  constructor(message = "OpenRouter rate limit exceeded.", options: { status?: number; cause?: unknown } = {}) {
    super(message, { ...options, code: "RATE_LIMIT_ERROR" });
  }
}

export class ProviderError extends LlmProviderError {
  constructor(message = "OpenRouter request failed.", options: { status?: number; cause?: unknown } = {}) {
    super(message, { ...options, code: "PROVIDER_ERROR" });
  }
}

export class TimeoutError extends LlmProviderError {
  constructor(message = "OpenRouter request timed out.", options: { status?: number; cause?: unknown } = {}) {
    super(message, { ...options, code: "TIMEOUT_ERROR" });
  }
}

interface NormalizeErrorInput {
  status?: number;
  message?: string;
  cause?: unknown;
}

export function normalizeOpenRouterError(input: NormalizeErrorInput): LlmProviderError {
  const { status, message, cause } = input;

  if (status === 401 || status === 403) {
    return new AuthError(message, { status, cause });
  }

  if (status === 429) {
    return new RateLimitError(message, { status, cause });
  }

  return new ProviderError(message, { status, cause });
}
