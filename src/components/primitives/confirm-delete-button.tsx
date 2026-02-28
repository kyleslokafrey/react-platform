"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ConfirmDeleteButtonProps = {
  title: string
  description: string
  formId: string
  confirmLabel?: string
  label?: React.ReactNode
  children?: React.ReactNode
  size?: React.ComponentProps<typeof Button>["size"]
}

function ConfirmDeleteButton({
  title,
  description,
  formId,
  confirmLabel = "Delete",
  label,
  children,
  size = "default",
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = React.useState(false)

  const triggerContent = children ?? label

  const handleConfirm = () => {
    const form = document.getElementById(formId)
    if (!(form instanceof HTMLFormElement)) return

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit()
    } else {
      form.submit()
    }

    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={size} variant="destructive" type="button">
          {triggerContent}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDeleteButton }
export type { ConfirmDeleteButtonProps }
