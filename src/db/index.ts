import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

// Lazy singleton — the client is not created until getDb() is first invoked,
// so builds without DATABASE_URL don't fail at module evaluation time.
let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) {
    _db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  }
  return _db;
}

/** Convenience re-export for direct usage in server components */
export { schema };
