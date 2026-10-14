import type { ReactNode } from "react";

/** A surface card with an optional heading and description. Renders a `<section>` when it has a title. */
export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const Tag = title ? "section" : "div";
  return (
    <Tag className={`flex flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:p-6 ${className}`}>
      {title && (
        <header className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-medium text-text">{title}</h2>
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </header>
      )}
      {children}
    </Tag>
  );
}

/** A small pill label. `tone` picks the semantic color. */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "info" }) {
  const tones = {
    neutral: "bg-bg text-text-muted",
    positive: "bg-positive-soft text-positive",
    info: "bg-info-soft text-info",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
