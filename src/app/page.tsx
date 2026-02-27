import { getDb, schema } from "@/db";
import type { Message } from "@/db/schema";

// Never statically render — always run server-side so the DB query
// executes at request time, not at build time.
export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getMessages(): Promise<{ rows: Message[]; error?: string }> {
  try {
    const rows = await getDb().select().from(schema.messages).limit(5);
    return { rows };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return { rows: [], error };
  }
}

export default async function Home() {
  const { rows, error } = await getMessages();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">React Platform</CardTitle>
            <Badge variant={error ? "destructive" : "default"}>
              {error
                ? "DB Error"
                : `${rows.length} row${rows.length !== 1 ? "s" : ""}`}
            </Badge>
          </div>
          <CardDescription>
            Next.js · App Router · Tailwind v4 · shadcn/ui · Neon + Drizzle
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-semibold">Could not connect to database</p>
              <p className="mt-1 font-mono text-xs opacity-80">{error}</p>
              <p className="mt-3 text-xs opacity-70">
                Add a{" "}
                <code className="font-mono font-semibold">DATABASE_URL</code>{" "}
                to{" "}
                <code className="font-mono font-semibold">.env.local</code> and
                run{" "}
                <code className="font-mono font-semibold">
                  npm run db:migrate
                </code>
                .
              </p>
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Seed the table:
              <code className="mt-2 block rounded bg-muted px-3 py-2 font-mono text-xs">
                {"INSERT INTO messages (body) VALUES ('Hello from Neon!');"}
              </code>
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((msg) => (
                <li
                  key={msg.id}
                  className="flex items-center justify-between rounded-md border px-4 py-2 text-sm"
                >
                  <span>{msg.body}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    #{msg.id}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Server-rendered at {new Date().toUTCString()}
          </p>
          <form action="/" method="GET">
            <Button type="submit" variant="outline" size="sm">
              Refresh
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
