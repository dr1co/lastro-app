import type { Metadata } from "next";
import Link from "next/link";
import { MemberDot, MemberFields } from "@/components/app/member-fields";
import { PageTitle } from "@/components/page-title";
import { ActionButton } from "@/components/ui/action-button";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-styles";
import { Badge, Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Field } from "@/components/ui/field";
import { createInviteAction, inviteMember, revokeInviteAction } from "@/lib/actions/invites";
import { addMemberAction, archiveMember, removeAccess, restoreMember } from "@/lib/actions/members";
import { formatDate, todayISO } from "@/lib/domain/dates";
import { inviteUrl, listPendingInvites } from "@/lib/server/invites";
import { listMembers, type Member } from "@/lib/server/members";
import { requireHousehold } from "@/lib/server/session";
import { strings } from "@/lib/strings";

const t = strings.members;

export const metadata: Metadata = { title: t.title };

export default async function MembersPage() {
  const { household, user, isOwner } = await requireHousehold();
  const [members, invites] = await Promise.all([listMembers(household.id), listPendingInvites(household.id)]);
  const active = members.filter((m) => !m.archivedAt);
  const archived = members.filter((m) => m.archivedAt);

  const actionsFor = (member: Member) => {
    if (member.archivedAt) return <ActionButton action={restoreMember.bind(null, member.id)} label={t.restore} />;
    return (
      <>
        <Link href={`/membros/${member.id}`} className={buttonClass("ghost", "sm")}>
          {t.edit}
        </Link>
        {!member.userId && <ActionButton action={inviteMember.bind(null, member.id)} label={t.invite} />}
        {!member.userId && <ActionButton action={archiveMember.bind(null, member.id)} label={t.archive} />}
        {member.userId && isOwner && member.userId !== household.ownerUserId && (
          <ActionButton action={removeAccess.bind(null, member.id)} label={t.removeAccess} variant="danger" />
        )}
      </>
    );
  };

  const row = (member: Member) => (
    <li key={member.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <MemberDot color={member.color} />
        <span className="font-medium text-text">{member.name}</span>
        {member.userId === user.id && <Badge tone="info">{t.you}</Badge>}
        {member.userId === household.ownerUserId && <Badge>{t.owner}</Badge>}
        <Badge tone={member.userId ? "positive" : "neutral"}>{member.userId ? t.withAccess : t.withoutAccess}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">{actionsFor(member)}</div>
    </li>
  );

  return (
    <>
      <PageTitle title={t.title}>{household.name}</PageTitle>
      <Card>
        <ul className="flex flex-col divide-y divide-border">{active.map(row)}</ul>
      </Card>

      <Card title={t.addTitle} description={t.addHint}>
        <ActionForm action={addMemberAction}>
          <MemberFields />
          <SubmitButton>{t.add}</SubmitButton>
        </ActionForm>
      </Card>

      <Card title={strings.invites.title}>
        {invites.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {invites.map((invite) => {
              const link = inviteUrl(invite.token);
              const target = invite.memberName
                ? strings.invites.forMember(invite.memberName)
                : invite.email
                  ? strings.invites.forEmail(invite.email)
                  : strings.invites.forAnyone;
              return (
                <li key={invite.id} className="flex flex-col gap-2 py-4 first:pt-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-text">{target}</span>
                    <span className="text-xs text-text-muted">
                      {strings.invites.expires(formatDate(todayISO(invite.expiresAt)))}
                    </span>
                  </div>
                  <input
                    readOnly
                    value={link}
                    aria-label={strings.invites.link}
                    className="h-10 w-full truncate rounded-field border border-border bg-bg px-3 text-sm text-text-muted"
                  />
                  <div className="flex gap-2">
                    <CopyButton value={link} />
                    <ActionButton action={revokeInviteAction.bind(null, invite.id)} label={strings.invites.revoke} variant="danger" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-text">{strings.invites.newTitle}</h3>
          <p className="text-sm text-text-muted">{strings.invites.newHint}</p>
        </div>
        <ActionForm action={createInviteAction}>
          <Field label={strings.fields.emailOptional} name="email" type="email" inputMode="email" />
          <SubmitButton variant="secondary">{strings.invites.create}</SubmitButton>
        </ActionForm>
      </Card>

      {archived.length > 0 && (
        <Card title={t.archived}>
          <ul className="flex flex-col divide-y divide-border">{archived.map(row)}</ul>
        </Card>
      )}
    </>
  );
}
