"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/db";

const messageBodySchema = z
  .string()
  .trim()
  .min(1, "Message is required")
  .max(240, "Message must be 240 characters or fewer");

const idSchema = z.coerce.number().int().positive();

export type MessageActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: {
    body?: string;
    id?: string;
  };
};

export const initialMessageActionState: MessageActionState = {
  ok: false,
};

function readFormField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Minimal create action used by the demo route.
 */
export async function createMessageAction(
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {

  const parsedBody = messageBodySchema.safeParse(readFormField(formData, "body"));
  if (!parsedBody.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: {
        body: parsedBody.error.issues[0]?.message ?? "Invalid message",
      },
    };
  }

  try {
    await getDb().insert(schema.messages).values({ body: parsedBody.data });
    revalidatePath("/demo/server-actions");

    return {
      ok: true,
      message: "Message created",
    };
  } catch {
    return {
      ok: false,
      message: "Database write failed",
    };
  }
}

/**
 * Additional canonical update example for docs and contributors.
 */
export async function updateMessageAction(formData: FormData): Promise<MessageActionState> {

  const parsedId = idSchema.safeParse(readFormField(formData, "id"));
  const parsedBody = messageBodySchema.safeParse(readFormField(formData, "body"));

  if (!parsedId.success || !parsedBody.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: {
        id: parsedId.success ? undefined : "Invalid message id",
        body: parsedBody.success
          ? undefined
          : parsedBody.error.issues[0]?.message ?? "Invalid message",
      },
    };
  }

  try {
    await getDb()
      .update(schema.messages)
      .set({ body: parsedBody.data })
      .where(eq(schema.messages.id, parsedId.data));

    revalidatePath("/demo/server-actions");

    return {
      ok: true,
      message: "Message updated",
    };
  } catch {
    return {
      ok: false,
      message: "Database write failed",
    };
  }
}

/**
 * Additional canonical delete example for docs and contributors.
 */
export async function deleteMessageAction(formData: FormData): Promise<MessageActionState> {

  const parsedId = idSchema.safeParse(readFormField(formData, "id"));
  if (!parsedId.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: {
        id: "Invalid message id",
      },
    };
  }

  try {
    await getDb().delete(schema.messages).where(eq(schema.messages.id, parsedId.data));
    revalidatePath("/demo/server-actions");

    return {
      ok: true,
      message: "Message deleted",
    };
  } catch {
    return {
      ok: false,
      message: "Database write failed",
    };
  }
}
