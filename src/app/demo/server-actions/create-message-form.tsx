"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createMessageAction,
  initialMessageActionState,
} from "@/app/demo/server-actions/actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create message"}
    </Button>
  );
}

export function CreateMessageForm() {
  const [state, formAction] = useActionState(
    createMessageAction,
    initialMessageActionState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="body" className="text-sm font-medium">
          Message body
        </label>
        <input
          id="body"
          name="body"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Write a message"
          required
          maxLength={240}
        />
        {state.fieldErrors?.body ? (
          <p className="text-xs text-destructive">{state.fieldErrors.body}</p>
        ) : null}
      </div>

      <SubmitButton />

      {state.message ? (
        <p className="text-xs text-muted-foreground">{state.message}</p>
      ) : null}
    </form>
  );
}
