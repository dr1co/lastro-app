"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { strings } from "@/lib/strings";

const ITEMS = [
  { href: "/inicio", label: strings.nav.home, icon: "M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" },
  {
    href: "/membros",
    label: strings.nav.members,
    icon: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.87M15.5 4.13a3 3 0 0 1 0 5.74",
  },
  { href: "/casa", label: strings.nav.household, icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4m-8.6 8.6-1.4 1.4" },
];

/** App navigation for the current path. Render inside `<Suspense fallback={<NavList />}>` (it reads the URL). */
export function MainNav() {
  return <NavList pathname={usePathname()} />;
}

/** The navigation itself: a bottom tab bar on phones, a sidebar from `md` up. */
export function NavList({ pathname }: { pathname?: string }) {
  return (
    <nav
      aria-label={strings.nav.main}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface md:static md:w-56 md:border-t-0 md:border-r md:bg-transparent"
    >
      <ul className="mx-auto flex max-w-md justify-around md:max-w-none md:flex-col md:gap-1 md:p-4">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors md:flex-row md:gap-3 md:rounded-field md:px-3 md:text-sm ${
                  active ? "text-accent md:bg-accent-soft" : "text-text-muted hover:text-text"
                }`}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
