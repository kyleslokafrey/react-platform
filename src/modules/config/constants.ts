import type { LlmOpenRouterModuleConfig } from "./types";

export const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
export const DEFAULT_OPENROUTER_TIMEOUT_MS = 15_000;
export const DEFAULT_OPENROUTER_MAX_RETRIES = 2;
export const DEFAULT_OPENROUTER_RETRY_DELAY_MS = 300;

export const DEFAULT_LLM_OPENROUTER_CONFIG: Omit<LlmOpenRouterModuleConfig, "enabled"> = {
  apiKey: undefined,
  baseUrl: DEFAULT_OPENROUTER_BASE_URL,
  defaultModel: DEFAULT_OPENROUTER_MODEL,
  timeoutMs: DEFAULT_OPENROUTER_TIMEOUT_MS,
  maxRetries: DEFAULT_OPENROUTER_MAX_RETRIES,
  retryDelayMs: DEFAULT_OPENROUTER_RETRY_DELAY_MS,
};
