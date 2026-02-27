import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { getDb, schema } from "./index";

async function seed() {
  const db = getDb();

  console.log("Seeding messages...");

  await db.insert(schema.messages).values([
    { body: "Hello from Neon!" },
    { body: "shadcn/ui is wired up." },
    { body: "Dark mode by default." },
    { body: "Drizzle migrations work." },
    { body: "Ready to deploy to Vercel." },
  ]);

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
