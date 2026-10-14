import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberFields } from "@/components/app/member-fields";
import { PageTitle } from "@/components/page-title";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-styles";
import { Card } from "@/components/ui/card";
import { updateMemberAction } from "@/lib/actions/members";
import { getMember } from "@/lib/server/members";
import { requireHousehold } from "@/lib/server/session";
import { strings } from "@/lib/strings";

const t = strings.members;

export const metadata: Metadata = { title: t.editTitle };

export default async function EditMemberPage({ params }: PageProps<"/membros/[id]">) {
  const [{ id }, { household }] = await Promise.all([params, requireHousehold()]);
  const member = await getMember(household.id, id);
  if (!member) notFound();

  return (
    <>
      <PageTitle title={t.editTitle} />
      <Card>
        <ActionForm action={updateMemberAction}>
          <input type="hidden" name="id" value={member.id} />
          <MemberFields defaults={member} />
          <div className="flex gap-3">
            <SubmitButton>{t.save}</SubmitButton>
            <Link href="/membros" className={buttonClass("ghost")}>
              {t.back}
            </Link>
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
