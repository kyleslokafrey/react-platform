import {
  type LoadedModuleHandle,
  type LoadModulesOptions,
  type ModuleContext,
  type ModuleEventBus,
  type ModuleEventListener,
  type ModuleLogger,
  type ModuleManifest,
  type ModuleStorage,
} from "./types";

const moduleRegistry = new Map<string, ModuleManifest>();

const defaultLogger: ModuleLogger = {
  debug(message, ...meta) {
    console.debug(message, ...meta);
  },
  info(message, ...meta) {
    console.info(message, ...meta);
  },
  warn(message, ...meta) {
    console.warn(message, ...meta);
  },
  error(message, ...meta) {
    console.error(message, ...meta);
  },
};

class InMemoryEventBus implements ModuleEventBus {
  private listeners = new Map<string, Set<ModuleEventListener>>();

  on(event: string, listener: ModuleEventListener): () => void {
    const eventListeners = this.listeners.get(event) ?? new Set<ModuleEventListener>();

    eventListeners.add(listener);
    this.listeners.set(event, eventListeners);

    return () => {
      this.off(event, listener);
    };
  }

  off(event: string, listener: ModuleEventListener): void {
    const eventListeners = this.listeners.get(event);

    if (!eventListeners) {
      return;
    }

    eventListeners.delete(listener);

    if (eventListeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event: string, payload?: unknown): void {
    const eventListeners = this.listeners.get(event);

    if (!eventListeners) {
      return;
    }

    for (const listener of eventListeners) {
      listener(payload);
    }
  }
}

class InMemoryStorage implements ModuleStorage {
  private store = new Map<string, unknown>();

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export function createModuleContext(config: Record<string, unknown> = {}): ModuleContext {
  return {
    getConfig<T>(key: string): T | undefined {
      const directMatch = config[key];

      if (directMatch !== undefined) {
        return directMatch as T | undefined;
      }

      return key
        .split(".")
        .reduce<unknown>((current, segment) => {
          if (!current || typeof current !== "object") {
            return undefined;
          }

          return (current as Record<string, unknown>)[segment];
        }, config) as T | undefined;
    },
    logger: defaultLogger,
    events: new InMemoryEventBus(),
    storage: new InMemoryStorage(),
  };
}

export function registerModule(manifest: ModuleManifest): void {
  validateManifest(manifest);

  if (moduleRegistry.has(manifest.id)) {
    throw new Error(`Module with id "${manifest.id}" is already registered.`);
  }

  moduleRegistry.set(manifest.id, manifest);
}

export function getRegisteredModules(): ModuleManifest[] {
  return [...moduleRegistry.values()];
}

export function clearRegisteredModules(): void {
  moduleRegistry.clear();
}

export function getModulesByCapability(capability: string): ModuleManifest[] {
  return getRegisteredModules().filter((manifest) => manifest.capabilities.includes(capability));
}

export async function loadModules(
  manifests: ModuleManifest[],
  options: LoadModulesOptions,
): Promise<LoadedModuleHandle[]> {
  const manifestsById = new Map<string, ModuleManifest>();

  for (const manifest of manifests) {
    validateManifest(manifest);

    if (manifestsById.has(manifest.id)) {
      throw new Error(`Duplicate module id "${manifest.id}" in load list.`);
    }

    manifestsById.set(manifest.id, manifest);
  }

  const sortedManifests = [...manifestsById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  const loadedHandles: LoadedModuleHandle[] = [];

  for (const manifest of sortedManifests) {
    await manifest.init(options.context);
    loadedHandles.push({
      manifest,
      dispose: async () => {
        await manifest.dispose?.();
      },
    });
  }

  return loadedHandles;
}

export async function loadRegisteredModules(options: LoadModulesOptions): Promise<LoadedModuleHandle[]> {
  return loadModules(getRegisteredModules(), options);
}

function validateManifest(manifest: ModuleManifest): void {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("Invalid module manifest: expected an object.");
  }

  if (!manifest.id || typeof manifest.id !== "string") {
    throw new Error("Invalid module manifest: \"id\" is required and must be a string.");
  }

  if (!manifest.version || typeof manifest.version !== "string") {
    throw new Error("Invalid module manifest: \"version\" is required and must be a string.");
  }

  if (!Array.isArray(manifest.capabilities)) {
    throw new Error("Invalid module manifest: \"capabilities\" must be an array of strings.");
  }

  for (const capability of manifest.capabilities) {
    if (typeof capability !== "string") {
      throw new Error("Invalid module manifest: \"capabilities\" must be an array of strings.");
    }
  }

  if (typeof manifest.init !== "function") {
    throw new Error("Invalid module manifest: \"init\" lifecycle hook is required.");
  }

  if (manifest.dispose && typeof manifest.dispose !== "function") {
    throw new Error("Invalid module manifest: \"dispose\" must be a function when provided.");
  }
}
