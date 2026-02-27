import type { ModuleLogger } from "../core";
import { fromOpenRouterChatCompletionsResponse, toOpenRouterChatCompletionsRequest } from "./adapter";
import { AuthError, LlmProviderError, ProviderError, TimeoutError } from "./errors";
import { requestOpenRouterChatCompletions } from "./client";
import type { GenerateTextInput, GenerateTextResult, LlmOpenRouterRuntimeConfig } from "./types";

export type { GenerateTextInput, GenerateTextResult, LlmOpenRouterRuntimeConfig } from "./types";
export { AuthError, ProviderError, RateLimitError, TimeoutError } from "./errors";

interface CreateLlmOpenRouterModuleOptions {
  logger?: ModuleLogger;
}

const noopLogger: ModuleLogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

export function createLlmOpenRouterModule(
  config: LlmOpenRouterRuntimeConfig,
  options: CreateLlmOpenRouterModuleOptions = {},
) {
  const logger = options.logger ?? noopLogger;

  return {
    async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
      if (!config.apiKey) {
        throw new AuthError("OpenRouter API key is not configured.");
      }

      if (!input.prompt?.trim()) {
        throw new ProviderError("Prompt is required.");
      }

      const model = input.model ?? config.defaultModel;
      const payload = toOpenRouterChatCompletionsRequest(input, model);
      const requestTimeoutMs = input.timeoutMs ?? config.timeoutMs;
      const startTime = Date.now();

      logger.info("llm.openrouter.request.start", {
        provider: "openrouter",
        model,
        timeoutMs: requestTimeoutMs,
      });

      try {
        const response = await requestOpenRouterChatCompletions({
          config,
          payload,
          timeoutMs: requestTimeoutMs,
        });
        const latencyMs = Date.now() - startTime;

        logger.info("llm.openrouter.request.end", {
          provider: "openrouter",
          model,
          latencyMs,
          status: "success",
        });

        return fromOpenRouterChatCompletionsResponse(response, model);
      } catch (error: unknown) {
        const latencyMs = Date.now() - startTime;
        const normalizedError = normalizeModuleError(error);

        logger.error("llm.openrouter.request.end", {
          provider: "openrouter",
          model,
          latencyMs,
          status: "error",
          errorCategory: normalizedError.category,
          errorCode: normalizedError.code,
          statusCode: normalizedError.status,
        });

        throw normalizedError.error;
      }
    },
  };
}

function normalizeModuleError(error: unknown): {
  error: Error;
  category: "timeout" | "auth" | "rate_limit" | "provider" | "unknown";
  code: string;
  status?: number;
} {
  if (error instanceof TimeoutError) {
    return {
      error,
      category: "timeout",
      code: error.code,
      status: error.status,
    };
  }

  if (error instanceof AuthError) {
    return {
      error,
      category: "auth",
      code: error.code,
      status: error.status,
    };
  }

  if (error instanceof LlmProviderError) {
    return {
      error,
      category: error.status === 429 ? "rate_limit" : "provider",
      code: error.code,
      status: error.status,
    };
  }

  const unknownError = error instanceof Error ? error : new ProviderError("OpenRouter request failed.", { cause: error });

  return {
    error: unknownError,
    category: "unknown",
    code: "UNKNOWN_ERROR",
  };
}
