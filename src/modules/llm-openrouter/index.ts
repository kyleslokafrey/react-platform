import { fromOpenRouterChatCompletionsResponse, toOpenRouterChatCompletionsRequest } from "./adapter";
import { AuthError, ProviderError } from "./errors";
import { requestOpenRouterChatCompletions } from "./client";
import type { GenerateTextInput, GenerateTextResult, LlmOpenRouterRuntimeConfig } from "./types";

export type { GenerateTextInput, GenerateTextResult, LlmOpenRouterRuntimeConfig } from "./types";
export { AuthError, ProviderError, RateLimitError, TimeoutError } from "./errors";

export function createLlmOpenRouterModule(config: LlmOpenRouterRuntimeConfig) {
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
      const response = await requestOpenRouterChatCompletions({ config, payload });

      return fromOpenRouterChatCompletionsResponse(response, model);
    },
  };
}
