export interface GenerateTextInput {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface GenerateTextUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface GenerateTextResult {
  text: string;
  usage?: GenerateTextUsage;
  model: string;
}

export interface LlmOpenRouterRuntimeConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  timeoutMs: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface OpenRouterChatCompletionsRequest {
  model: string;
  messages: Array<{
    role: "user";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterChatCompletionsResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}
