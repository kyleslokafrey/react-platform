import { desc } from "drizzle-orm";

import { CreateMessageForm } from "@/app/demo/server-actions/create-message-form";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

async function getLatestMessages(): Promise<{
  rows: Array<{ id: number; body: string }>;
  error?: string;
}> {
  try {
    const rows = await getDb()
      .select({ id: schema.messages.id, body: schema.messages.body })
      .from(schema.messages)
      .orderBy(desc(schema.messages.id))
      .limit(10);

    return { rows };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { rows: [], error: message };
  }
}

export default async function ServerActionsDemoPage() {
  const { rows, error } = await getLatestMessages();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Server Action CRUD demo</h1>
        <p className="text-sm text-muted-foreground">
          Submit the form to create a row. The list below refreshes after
          mutation via revalidatePath.
        </p>
      </header>

      <section className="rounded-lg border p-4">
        <CreateMessageForm />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">Latest messages</h2>
        {error ? (
          <p className="text-sm text-destructive">
            Database read failed: {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((message) => (
              <li
                key={message.id}
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <span>{message.body}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  #{message.id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
