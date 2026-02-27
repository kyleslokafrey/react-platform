import { mapEnvToConfig, type Env } from "./env";
import type { AppConfig } from "./types";
import { validateConfig } from "./validate";

export type { AppConfig, LlmOpenRouterModuleConfig } from "./types";

export function createConfigFromEnv(env: Env = process.env): AppConfig {
  return validateConfig(mapEnvToConfig(env));
}
