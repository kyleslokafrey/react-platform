export interface LlmOpenRouterModuleConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl: string;
  defaultModel: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface AppConfig {
  modules: {
    llmOpenRouter: LlmOpenRouterModuleConfig;
  };
}
