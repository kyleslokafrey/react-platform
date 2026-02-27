import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env (committed defaults) then .env.local as optional local override
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
