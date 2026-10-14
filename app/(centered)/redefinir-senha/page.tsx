import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { resetPassword } from "@/lib/actions/auth";
import { param } from "@/lib/forms";
import { strings } from "@/lib/strings";

const t = strings.auth.reset;

export const metadata: Metadata = { title: t.title };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/redefinir-senha">) {
  const token = param((await searchParams).token);
  return (
    <>
      <PageTitle title={t.title} />
      {token ? (
        <Card>
          <ActionForm action={resetPassword}>
            <input type="hidden" name="token" value={token} />
            <Field label={strings.fields.newPassword} name="password" type="password" autoComplete="new-password" />
            <Field label={strings.fields.confirmPassword} name="confirmPassword" type="password" autoComplete="new-password" />
            <SubmitButton>{t.submit}</SubmitButton>
          </ActionForm>
        </Card>
      ) : (
        <FormMessage status="error">{t.missingToken}</FormMessage>
      )}
    </>
  );
}
