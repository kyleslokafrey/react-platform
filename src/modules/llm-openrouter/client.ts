import { LlmProviderError, normalizeOpenRouterError, ProviderError, TimeoutError } from "./errors";
import type {
  LlmOpenRouterRuntimeConfig,
  OpenRouterChatCompletionsRequest,
  OpenRouterChatCompletionsResponse,
} from "./types";

interface RequestOptions {
  config: LlmOpenRouterRuntimeConfig;
  payload: OpenRouterChatCompletionsRequest;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

export async function requestOpenRouterChatCompletions(
  options: RequestOptions,
): Promise<OpenRouterChatCompletionsResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? options.config.timeoutMs;
  const maxRetries = normalizeInteger(options.config.maxRetries, DEFAULT_MAX_RETRIES);
  const retryDelayMs = normalizeInteger(options.config.retryDelayMs, DEFAULT_RETRY_DELAY_MS);

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await requestOpenRouterChatCompletionsAttempt({
        fetchImpl,
        config: options.config,
        payload: options.payload,
        timeoutMs,
      });
    } catch (error: unknown) {
      lastError = error;

      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }

      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new ProviderError("OpenRouter request failed.", { cause: lastError });
}

async function requestOpenRouterChatCompletionsAttempt(options: {
  fetchImpl: typeof fetch;
  config: LlmOpenRouterRuntimeConfig;
  payload: OpenRouterChatCompletionsRequest;
  timeoutMs: number;
}): Promise<OpenRouterChatCompletionsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await options.fetchImpl(`${trimTrailingSlash(options.config.baseUrl)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.config.apiKey}`,
      },
      body: JSON.stringify(options.payload),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => ({}))) as OpenRouterChatCompletionsResponse;

    if (!response.ok) {
      throw normalizeOpenRouterError({
        status: response.status,
        message: body.error?.message ?? `OpenRouter request failed with status ${response.status}`,
      });
    }

    return body;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(undefined, { cause: error });
    }

    if (error instanceof LlmProviderError) {
      throw error;
    }

    throw new ProviderError("OpenRouter transport error.", { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof TimeoutError) {
    return true;
  }

  if (error instanceof ProviderError) {
    if (error.status === 429) {
      return true;
    }

    if (typeof error.status === "number" && error.status >= 500) {
      return true;
    }
  }

  return false;
}

function normalizeInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value as number));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
