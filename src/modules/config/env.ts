import {
  DEFAULT_LLM_OPENROUTER_CONFIG,
  DEFAULT_OPENROUTER_TIMEOUT_MS,
} from "./constants";
import type { AppConfig } from "./types";

export type Env = Record<string, string | undefined>;

export function mapEnvToConfig(env: Env = process.env): AppConfig {
  return {
    modules: {
      llmOpenRouter: {
        enabled: parseBoolean(env.MODULES_LLM_OPENROUTER_ENABLED),
        apiKey: env.OPENROUTER_API_KEY,
        baseUrl: env.OPENROUTER_BASE_URL ?? DEFAULT_LLM_OPENROUTER_CONFIG.baseUrl,
        defaultModel: env.OPENROUTER_DEFAULT_MODEL ?? DEFAULT_LLM_OPENROUTER_CONFIG.defaultModel,
        timeoutMs: parseInteger(env.OPENROUTER_TIMEOUT_MS, DEFAULT_OPENROUTER_TIMEOUT_MS),
      },
    },
  };
}

function parseBoolean(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value ?? "").toLowerCase());
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}
