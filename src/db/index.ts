import { drizzle as drizzleNeon, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzlePg, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

// Lazy singleton — the client is not created until getDb() is first invoked,
// so builds without DATABASE_URL don't fail at module evaluation time.
let _db: Db | null = null;

function isLocal(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getDb(): Db {
  if (!_db) {
    const url = process.env.DATABASE_URL!;
    if (isLocal(url)) {
      // Local dev: standard postgres.js driver (docker compose up -d)
      _db = drizzlePg(postgres(url), { schema });
    } else {
      // Production: Neon serverless HTTP driver
      _db = drizzleNeon(neon(url), { schema });
    }
  }
  return _db;
}

/** Convenience re-export for direct usage in server components */
export { schema };
