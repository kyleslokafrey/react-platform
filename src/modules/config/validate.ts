import {
  DEFAULT_OPENROUTER_BASE_URL,
  DEFAULT_OPENROUTER_MODEL,
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

  return {
    modules: {
      llmOpenRouter: {
        ...llmOpenRouter,
        baseUrl: llmOpenRouter.baseUrl || DEFAULT_OPENROUTER_BASE_URL,
        defaultModel: llmOpenRouter.defaultModel || DEFAULT_OPENROUTER_MODEL,
        timeoutMs: sanitizedTimeoutMs,
      },
    },
  };
}
