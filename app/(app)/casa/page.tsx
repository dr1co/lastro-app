import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { ActionButton } from "@/components/ui/action-button";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { signOut } from "@/lib/actions/auth";
import {
  createHouseholdAction,
  deleteHouseholdAction,
  renameHouseholdAction,
  switchHousehold,
} from "@/lib/actions/households";
import { requireHousehold } from "@/lib/server/session";
import { strings } from "@/lib/strings";

const t = strings.household;

export const metadata: Metadata = { title: t.title };

export default async function HouseholdPage() {
  const { household, households, isOwner, user } = await requireHousehold();

  return (
    <>
      <PageTitle title={t.title}>{household.name}</PageTitle>

      <Card title={t.settings}>
        {isOwner ? (
          <ActionForm action={renameHouseholdAction}>
            <Field label={strings.fields.householdName} name="name" defaultValue={household.name} />
            <SubmitButton className="self-start">{t.save}</SubmitButton>
          </ActionForm>
        ) : (
          <p className="text-text-muted">{t.ownerOnly}</p>
        )}
      </Card>

      <Card title={t.yours}>
        <ul className="flex flex-col divide-y divide-border">
          {households.map((h) => (
            <li key={h.householdId} className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <span className="font-medium text-text">{h.name}</span>
              {h.householdId === household.id ? (
                <Badge tone="positive">{t.current}</Badge>
              ) : (
                <form action={switchHousehold}>
                  <input type="hidden" name="householdId" value={h.householdId} />
                  <SubmitButton variant="ghost" size="sm">
                    {t.switchTo}
                  </SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
        <h3 className="font-medium text-text">{t.createAnother}</h3>
        <ActionForm action={createHouseholdAction}>
          <Field label={strings.fields.newHouseholdName} name="name" />
          <SubmitButton variant="secondary" className="self-start">
            {t.create}
          </SubmitButton>
        </ActionForm>
      </Card>

      {isOwner && (
        <Card title={t.dangerTitle} description={t.dangerBody}>
          <ActionForm action={deleteHouseholdAction}>
            <Field label={strings.fields.deleteConfirm} name="confirm" autoComplete="off" />
            <SubmitButton variant="danger" className="self-start">
              {t.delete}
            </SubmitButton>
          </ActionForm>
        </Card>
      )}

      <Card title={t.account} description={user.email}>
        <ActionButton action={signOut} label={strings.auth.signOut} size="md" />
      </Card>
    </>
  );
}
