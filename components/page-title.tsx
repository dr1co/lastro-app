import type { ReactNode } from "react";

/** The page's `<h1>` with an optional supporting line. */
export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-display text-3xl font-semibold text-text">{title}</h1>
      {children && <div className="text-text-muted">{children}</div>}
    </header>
  );
}
