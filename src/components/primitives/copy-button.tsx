"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyButtonProps = {
  text: string
  className?: string
  size?: React.ComponentProps<typeof Button>["size"]
}

function CopyButton({ text, className, size = "lg" }: CopyButtonProps) {
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearStatus = React.useCallback((delayMs: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setStatus("idle")
      timeoutRef.current = null
    }, delayMs)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    if (status !== "idle") return

    try {
      await navigator.clipboard.writeText(text)
      setStatus("success")
      clearStatus(1500)
    } catch {
      setStatus("error")
      clearStatus(1800)
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        type="button"
        onClick={handleCopy}
        size={size}
        disabled={status !== "idle"}
        aria-label={status === "success" ? "Copied" : "Copy text"}
      >
        {status === "success" ? "Copied" : "Copy"}
      </Button>

      <span
        aria-live="polite"
        className={cn(
          "text-xs text-muted-foreground",
          status === "error" ? "visible" : "invisible"
        )}
      >
        Could not copy
      </span>

      <span aria-live="polite" className="sr-only">
        {status === "success"
          ? "Copied"
          : status === "error"
            ? "Could not copy"
            : ""}
      </span>
    </div>
  )
}

export { CopyButton }
export type { CopyButtonProps }
