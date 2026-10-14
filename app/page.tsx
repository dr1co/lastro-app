import Link from "next/link";
import { Suspense } from "react";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button-styles";
import { strings } from "@/lib/strings";

export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-16">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <Brand />
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl font-semibold text-text">{strings.app.description}</h1>
        <p className="text-lg text-text-muted">{strings.app.tagline}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Link href="/cadastro" className={buttonClass("primary")}>
          {strings.auth.signUp.title}
        </Link>
        <Link href="/entrar" className={buttonClass("secondary")}>
          {strings.auth.signIn.title}
        </Link>
      </div>
    </main>
  );
}
