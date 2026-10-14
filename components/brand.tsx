import Link from "next/link";
import { strings } from "@/lib/strings";

/** The Lastro symbol (an "L" resting on a base) and wordmark. */
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-accent">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path d="M11 8v13h11" stroke="var(--surface)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M9 25h14" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
      <span className="font-display text-xl font-semibold">{strings.app.name}</span>
    </Link>
  );
}
