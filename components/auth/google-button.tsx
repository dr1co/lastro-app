"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { strings } from "@/lib/strings";

/** Starts Google sign-in, returning to `next` afterwards. */
export function GoogleButton({ next }: { next: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => authClient.signIn.social({ provider: "google", callbackURL: next })}
    >
      {strings.auth.google}
    </Button>
  );
}
