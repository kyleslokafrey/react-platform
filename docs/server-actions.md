# Canonical Server Action CRUD Pattern

Use this pattern when adding form-driven server mutations in App Router.

## Goals

- Parse `FormData` safely.
- Validate early and return a typed action result.
- Mutate via the existing DB layer (`@/db` with `schema`).
- Call `revalidatePath(...)` after success so list pages refresh.

## Example action file

Create `src/app/demo/server-actions/actions.ts`:

```ts
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/db";

const messageBodySchema = z.string().trim().min(1).max(240);
const idSchema = z.coerce.number().int().positive();

export type MessageActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: {
    body?: string;
    id?: string;
  };
};

function readFormField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// CREATE
export async function createMessageAction(
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  "use server";

  const parsedBody = messageBodySchema.safeParse(readFormField(formData, "body"));
  if (!parsedBody.success) {
    return { ok: false, fieldErrors: { body: "Message is required" } };
  }

  await getDb().insert(schema.messages).values({ body: parsedBody.data });
  revalidatePath("/demo/server-actions");
  return { ok: true, message: "Message created" };
}

// UPDATE
export async function updateMessageAction(formData: FormData): Promise<MessageActionState> {
  "use server";

  const parsedId = idSchema.safeParse(readFormField(formData, "id"));
  const parsedBody = messageBodySchema.safeParse(readFormField(formData, "body"));
  if (!parsedId.success || !parsedBody.success) {
    return { ok: false, message: "Validation failed" };
  }

  await getDb()
    .update(schema.messages)
    .set({ body: parsedBody.data })
    .where(eq(schema.messages.id, parsedId.data));

  revalidatePath("/demo/server-actions");
  return { ok: true, message: "Message updated" };
}

// DELETE
export async function deleteMessageAction(formData: FormData): Promise<MessageActionState> {
  "use server";

  const parsedId = idSchema.safeParse(readFormField(formData, "id"));
  if (!parsedId.success) {
    return { ok: false, fieldErrors: { id: "Invalid message id" } };
  }

  await getDb().delete(schema.messages).where(eq(schema.messages.id, parsedId.data));
  revalidatePath("/demo/server-actions");
  return { ok: true, message: "Message deleted" };
}
```

## Minimal route integration

- Form action binding: `useActionState(createMessageAction, initialState)`.
- One mutation action used by the route: `createMessageAction`.
- One list query to verify post-mutation cache refresh.

See the in-repo demo route:

- `src/app/demo/server-actions/page.tsx`
- `src/app/demo/server-actions/create-message-form.tsx`
- `src/app/demo/server-actions/actions.ts`
