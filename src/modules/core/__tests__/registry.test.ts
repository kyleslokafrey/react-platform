import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  clearRegisteredModules,
  createModuleContext,
  getModulesByCapability,
  loadModules,
  registerModule,
  type ModuleManifest,
} from "../index";

afterEach(() => {
  clearRegisteredModules();
});

function createManifest(id: string, capabilities: string[], onInit?: () => void): ModuleManifest {
  return {
    id,
    version: "1.0.0",
    capabilities,
    init: async () => {
      onInit?.();
    },
  };
}

describe("module loader", () => {
  it("rejects duplicate IDs", async () => {
    const context = createModuleContext();

    await assert.rejects(
      loadModules(
        [
          createManifest("alpha", ["llm.generate"]),
          createManifest("alpha", ["llm.embed"]),
        ],
        { context },
      ),
      /Duplicate module id "alpha" in load list\./,
    );
  });

  it("initializes modules in order", async () => {
    const initOrder: string[] = [];

    const manifests = [
      createManifest("charlie", ["cap.c"], () => initOrder.push("charlie")),
      createManifest("alpha", ["cap.a"], () => initOrder.push("alpha")),
      createManifest("bravo", ["cap.b"], () => initOrder.push("bravo")),
    ];

    await loadModules(manifests, { context: createModuleContext() });

    assert.deepEqual(initOrder, ["alpha", "bravo", "charlie"]);
  });

  it("exposes capability lookup", () => {
    registerModule(createManifest("openrouter", ["llm.generate", "llm.chat"]));
    registerModule(createManifest("embeddings", ["llm.embed"]));
    registerModule(createManifest("backup", ["llm.generate"]));

    const manifests = getModulesByCapability("llm.generate");

    assert.deepEqual(
      manifests.map((manifest) => manifest.id),
      ["openrouter", "backup"],
    );
  });
});
