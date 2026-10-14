"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/lib/forms";
import { FormStateProvider } from "./form-context";
import { FormMessage } from "./form-message";

export type { FormState };

/**
 * A `<form>` bound to a Server Action through `useActionState`.
 * Fields inside read their error and restored value from the action's returned state; its message is shown on top.
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-4",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className} noValidate>
      <FormStateProvider value={state ?? {}}>
        {state?.message && <FormMessage status={state.status ?? "error"}>{state.message}</FormMessage>}
        {children}
      </FormStateProvider>
    </form>
  );
}
