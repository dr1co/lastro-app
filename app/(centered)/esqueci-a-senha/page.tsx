import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { requestPasswordReset } from "@/lib/actions/auth";
import { strings } from "@/lib/strings";

const t = strings.auth.forgot;

export const metadata: Metadata = { title: t.title };

export default function ForgotPasswordPage() {
  return (
    <>
      <PageTitle title={t.title}>{t.body}</PageTitle>
      <Card>
        <ActionForm action={requestPasswordReset}>
          <Field label={strings.fields.email} name="email" type="email" autoComplete="email" inputMode="email" />
          <SubmitButton>{t.submit}</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
