import type { ReactNode } from "react";
import { Brand } from "@/components/brand";

export default function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
      <Brand />
      <main className="flex flex-col gap-6">{children}</main>
    </div>
  );
}
