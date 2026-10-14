import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { createHouseholdAction } from "@/lib/actions/households";
import { acceptInviteAction } from "@/lib/actions/invites";
import { listMemberships } from "@/lib/server/households";
import { listInvitesForEmail } from "@/lib/server/invites";
import { requireUser } from "@/lib/server/session";
import { strings } from "@/lib/strings";

const t = strings.onboarding;

export const metadata: Metadata = { title: t.title };

export default async function WelcomePage() {
  const user = await requireUser();
  const [memberships, invites] = await Promise.all([listMemberships(user.id), listInvitesForEmail(user.email)]);
  if (memberships.length > 0) redirect("/inicio");

  return (
    <>
      <PageTitle title={t.title}>{t.body}</PageTitle>
      {invites.length > 0 && (
        <Card title={t.invitesTitle}>
          <ul className="flex flex-col gap-3">
            {invites.map((invite) => (
              <li key={invite.token} className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-text">{invite.householdName}</span>
                  <span className="text-sm text-text-muted">{t.invitedBy(invite.inviterName)}</span>
                </div>
                <form action={acceptInviteAction.bind(null, invite.token)}>
                  <SubmitButton size="sm">{t.accept}</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card title={t.createTitle}>
        <ActionForm action={createHouseholdAction}>
          <Field label={strings.fields.householdName} name="name" placeholder="Casa Lipski" />
          <SubmitButton>{t.create}</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
