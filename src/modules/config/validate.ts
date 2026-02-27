import {
  DEFAULT_OPENROUTER_BASE_URL,
  DEFAULT_OPENROUTER_MAX_RETRIES,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_RETRY_DELAY_MS,
  DEFAULT_OPENROUTER_TIMEOUT_MS,
} from "./constants";
import type { AppConfig } from "./types";

export function validateConfig(config: AppConfig): AppConfig {
  const llmOpenRouter = config.modules.llmOpenRouter;

  if (llmOpenRouter.enabled && !llmOpenRouter.apiKey) {
    throw new Error(
      "Invalid configuration: modules.llmOpenRouter.apiKey is required when MODULES_LLM_OPENROUTER_ENABLED is true.",
    );
  }

  const sanitizedTimeoutMs =
    Number.isFinite(llmOpenRouter.timeoutMs) && llmOpenRouter.timeoutMs > 0
      ? Math.floor(llmOpenRouter.timeoutMs)
      : DEFAULT_OPENROUTER_TIMEOUT_MS;
  const sanitizedMaxRetries =
    Number.isFinite(llmOpenRouter.maxRetries) && llmOpenRouter.maxRetries >= 0
      ? Math.floor(llmOpenRouter.maxRetries)
      : DEFAULT_OPENROUTER_MAX_RETRIES;
  const sanitizedRetryDelayMs =
    Number.isFinite(llmOpenRouter.retryDelayMs) && llmOpenRouter.retryDelayMs >= 0
      ? Math.floor(llmOpenRouter.retryDelayMs)
      : DEFAULT_OPENROUTER_RETRY_DELAY_MS;

  return {
    modules: {
      llmOpenRouter: {
        ...llmOpenRouter,
        baseUrl: llmOpenRouter.baseUrl || DEFAULT_OPENROUTER_BASE_URL,
        defaultModel: llmOpenRouter.defaultModel || DEFAULT_OPENROUTER_MODEL,
        timeoutMs: sanitizedTimeoutMs,
        maxRetries: sanitizedMaxRetries,
        retryDelayMs: sanitizedRetryDelayMs,
      },
    },
  };
}
