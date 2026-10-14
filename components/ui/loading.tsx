/** Quiet placeholder shown while a streamed section loads. */
export function Loading({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex flex-col gap-3 ${className}`}>
      <div className="h-8 w-2/3 animate-pulse rounded-field bg-border/60" />
      <div className="h-24 w-full animate-pulse rounded-card bg-border/40" />
    </div>
  );
}
