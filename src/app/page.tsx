import { desc } from 'drizzle-orm';

import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { messages } from '@/db/schema';

async function getMessages() {
  try {
    return await db.select().from(messages).orderBy(desc(messages.id)).limit(5);
  } catch (error) {
    console.error('Database query failed', error);
    return [];
  }
}

export default async function HomePage() {
  const recentMessages = await getMessages();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Next.js + Neon + Drizzle</h1>
      <p className="text-sm text-slate-600">This page runs server-side and queries Postgres on every request.</p>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent messages</h2>
        {recentMessages.length === 0 ? (
          <p className="text-sm text-slate-500">No rows yet. Add one row to public.messages to verify connectivity.</p>
        ) : (
          <ul className="space-y-2">
            {recentMessages.map((message) => (
              <li key={message.id} className="rounded border bg-slate-50 p-2 text-sm">
                #{message.id}: {message.body}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button>shadcn Button renders</Button>
    </main>
  );
}
