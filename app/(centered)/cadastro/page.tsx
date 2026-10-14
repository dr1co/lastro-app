import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { signUp } from "@/lib/actions/auth";
import { safeNextPath } from "@/lib/domain/auth";
import { param } from "@/lib/forms";
import { googleEnabled } from "@/lib/server/auth";
import { strings } from "@/lib/strings";

const t = strings.auth.signUp;

export const metadata: Metadata = { title: t.title };

export default async function SignUpPage({ searchParams }: PageProps<"/cadastro">) {
  const query = await searchParams;
  const next = safeNextPath(param(query.next));
  const signInHref = param(query.next) ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar";

  return (
    <>
      <RedirectIfSignedIn />
      <PageTitle title={t.title}>{strings.app.description}</PageTitle>
      <Card>
        <ActionForm action={signUp}>
          <input type="hidden" name="next" value={next} />
          <Field label={strings.fields.name} name="name" autoComplete="name" />
          <Field label={strings.fields.email} name="email" type="email" autoComplete="email" inputMode="email" />
          <Field label={strings.fields.password} name="password" type="password" autoComplete="new-password" />
          <Field label={strings.fields.confirmPassword} name="confirmPassword" type="password" autoComplete="new-password" />
          <SubmitButton>{t.submit}</SubmitButton>
        </ActionForm>
        {googleEnabled && <GoogleButton next={next} />}
      </Card>
      <p className="text-center text-sm text-text-muted">
        {t.hasAccount}{" "}
        <Link href={signInHref} className="font-medium text-accent underline-offset-4 hover:underline">
          {t.signIn}
        </Link>
      </p>
    </>
  );
}
