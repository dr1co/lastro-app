import { Suspense, type ReactNode } from "react";
import { HouseholdSwitcher } from "@/components/app/household-switcher";
import { MainNav, NavList } from "@/components/app/main-nav";
import { Brand } from "@/components/brand";
import { requireHousehold } from "@/lib/server/session";

async function CurrentHousehold() {
  const { household, households } = await requireHousehold();
  return <HouseholdSwitcher currentId={household.id} households={households} />;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6">
        <Brand href="/inicio" />
        <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-field bg-border/50" />}>
          <CurrentHousehold />
        </Suspense>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <Suspense fallback={<NavList />}>
          <MainNav />
        </Suspense>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pt-6 pb-28 md:px-8 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
