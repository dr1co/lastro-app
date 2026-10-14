import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { signIn } from "@/lib/actions/auth";
import { safeNextPath } from "@/lib/domain/auth";
import { param } from "@/lib/forms";
import { googleEnabled } from "@/lib/server/auth";
import { strings } from "@/lib/strings";

const t = strings.auth.signIn;

export const metadata: Metadata = { title: t.title };

export default async function SignInPage({ searchParams }: PageProps<"/entrar">) {
  const query = await searchParams;
  const next = safeNextPath(param(query.next));
  const withNext = (path: string) => (param(query.next) ? `${path}?next=${encodeURIComponent(next)}` : path);

  return (
    <>
      <RedirectIfSignedIn />
      <PageTitle title={t.title} />
      {param(query.redefinida) && <FormMessage status="success">{t.passwordReset}</FormMessage>}
      <Card>
        <ActionForm action={signIn}>
          <input type="hidden" name="next" value={next} />
          <Field label={strings.fields.email} name="email" type="email" autoComplete="email" inputMode="email" />
          <Field label={strings.fields.password} name="password" type="password" autoComplete="current-password" />
          <SubmitButton>{t.submit}</SubmitButton>
        </ActionForm>
        <Link href="/esqueci-a-senha" className="self-start text-sm font-medium text-accent underline-offset-4 hover:underline">
          {t.forgot}
        </Link>
        {googleEnabled && <GoogleButton next={next} />}
      </Card>
      <p className="text-center text-sm text-text-muted">
        {t.noAccount}{" "}
        <Link href={withNext("/cadastro")} className="font-medium text-accent underline-offset-4 hover:underline">
          {t.signUp}
        </Link>
      </p>
    </>
  );
}
