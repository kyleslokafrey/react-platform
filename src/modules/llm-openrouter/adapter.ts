import type {
  GenerateTextInput,
  GenerateTextResult,
  OpenRouterChatCompletionsRequest,
  OpenRouterChatCompletionsResponse,
} from "./types";

export function toOpenRouterChatCompletionsRequest(
  input: GenerateTextInput,
  model: string,
): OpenRouterChatCompletionsRequest {
  return {
    model,
    messages: [
      {
        role: "user",
        content: input.prompt,
      },
    ],
    temperature: input.temperature,
    max_tokens: input.maxTokens,
  };
}

export function fromOpenRouterChatCompletionsResponse(
  response: OpenRouterChatCompletionsResponse,
  fallbackModel: string,
): GenerateTextResult {
  const text = response.choices?.[0]?.message?.content?.trim() ?? "";

  return {
    text,
    model: response.model ?? fallbackModel,
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}
