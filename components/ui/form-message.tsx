import type { ReactNode } from "react";

/** A success (`role=status`) or error (`role=alert`) message box. */
export function FormMessage({ status, children }: { status: "success" | "error"; children: ReactNode }) {
  const success = status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`rounded-field px-4 py-3 text-sm ${success ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative"}`}
    >
      {children}
    </p>
  );
}
