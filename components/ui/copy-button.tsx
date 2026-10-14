"use client";

import { useState } from "react";
import { strings } from "@/lib/strings";
import { Button } from "./button";

/** Copies `value` to the clipboard and confirms briefly. */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      <span aria-live="polite">{copied ? strings.invites.copied : strings.invites.copy}</span>
    </Button>
  );
}
