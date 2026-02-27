import { normalizeOpenRouterError, ProviderError, TimeoutError } from "./errors";
import type {
  LlmOpenRouterRuntimeConfig,
  OpenRouterChatCompletionsRequest,
  OpenRouterChatCompletionsResponse,
} from "./types";

interface RequestOptions {
  config: LlmOpenRouterRuntimeConfig;
  payload: OpenRouterChatCompletionsRequest;
  fetchImpl?: typeof fetch;
}

export async function requestOpenRouterChatCompletions(
  options: RequestOptions,
): Promise<OpenRouterChatCompletionsResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.config.timeoutMs);

  try {
    const response = await fetchImpl(`${trimTrailingSlash(options.config.baseUrl)}/chat/completions`, {
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

    if (error instanceof ProviderError) {
      throw error;
    }

    throw new ProviderError("OpenRouter transport error.", { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
