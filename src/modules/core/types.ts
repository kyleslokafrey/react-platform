export type ModuleInitResult = void | Promise<void>;
export type ModuleDisposeResult = void | Promise<void>;

export interface ModuleLogger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export interface ModuleEventBus {
  on(event: string, listener: ModuleEventListener): () => void;
  off(event: string, listener: ModuleEventListener): void;
  emit(event: string, payload?: unknown): void;
}

export type ModuleEventListener = (payload?: unknown) => void;

export interface ModuleStorage {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
}

export interface ModuleContext {
  getConfig<T>(key: string): T | undefined;
  logger: ModuleLogger;
  events: ModuleEventBus;
  storage?: ModuleStorage;
}

export interface ModuleManifest {
  id: string;
  version: string;
  capabilities: string[];
  init(context: ModuleContext): ModuleInitResult;
  dispose?(): ModuleDisposeResult;
}

export interface LoadedModuleHandle {
  manifest: ModuleManifest;
  dispose(): ModuleDisposeResult;
}

export interface LoadModulesOptions {
  context: ModuleContext;
}
