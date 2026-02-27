import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createLlmOpenRouterModule } from "../index";
import { LlmProviderError } from "../errors";

const baseConfig = {
  apiKey: "test-key",
  baseUrl: "https://openrouter.example/api/v1",
  defaultModel: "openrouter/default-model",
  timeoutMs: 25,
  maxRetries: 0,
  retryDelayMs: 0,
};

describe("llm-openrouter", () => {
  it("maps successful API response to { text, usage, model }", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          model: "openrouter/actual-model",
          choices: [{ message: { content: "  hello world  " } }],
          usage: {
            prompt_tokens: 11,
            completion_tokens: 7,
            total_tokens: 18,
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );

    try {
      const llmModule = createLlmOpenRouterModule(baseConfig);
      const result = await llmModule.generateText({ prompt: "Say hello" });

      assert.deepEqual(result, {
        text: "hello world",
        usage: {
          promptTokens: 11,
          completionTokens: 7,
          totalTokens: 18,
        },
        model: "openrouter/actual-model",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles auth/429/5xx/timeouts with normalized errors", async () => {
    const runErrorScenario = async (
      fetchImpl: typeof globalThis.fetch,
      expected: { name: string; code: string; status?: number },
    ) => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = fetchImpl;

      try {
        const llmModule = createLlmOpenRouterModule(baseConfig);

        await assert.rejects(llmModule.generateText({ prompt: "test prompt" }), (error: unknown) => {
          assert.ok(error instanceof LlmProviderError);
          assert.equal(error.name, expected.name);
          assert.equal(error.code, expected.code);
          assert.equal(error.status, expected.status);
          return true;
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    };

    await runErrorScenario(
      async () =>
        new Response(JSON.stringify({ error: { message: "unauthorized" } }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      { name: "AuthError", code: "AUTH_ERROR", status: 401 },
    );

    await runErrorScenario(
      async () =>
        new Response(JSON.stringify({ error: { message: "rate limited" } }), {
          status: 429,
          headers: { "content-type": "application/json" },
        }),
      { name: "RateLimitError", code: "RATE_LIMIT_ERROR", status: 429 },
    );

    await runErrorScenario(
      async () =>
        new Response(JSON.stringify({ error: { message: "upstream failure" } }), {
          status: 503,
          headers: { "content-type": "application/json" },
        }),
      { name: "ProviderError", code: "PROVIDER_ERROR", status: 503 },
    );

    await runErrorScenario(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const abortError = new Error("aborted");
            abortError.name = "AbortError";
            reject(abortError);
          });
        }),
      { name: "TimeoutError", code: "TIMEOUT_ERROR", status: undefined },
    );
  });

  it("respects model override and default model", async () => {
    const originalFetch = globalThis.fetch;
    const modelsSeen: string[] = [];

    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(String(init?.body)) as { model: string };
      modelsSeen.push(payload.model);

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "ok" } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    try {
      const llmModule = createLlmOpenRouterModule(baseConfig);

      await llmModule.generateText({ prompt: "default model prompt" });
      await llmModule.generateText({ prompt: "override model prompt", model: "openrouter/override-model" });

      assert.deepEqual(modelsSeen, ["openrouter/default-model", "openrouter/override-model"]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
