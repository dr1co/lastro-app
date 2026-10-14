import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { SubmitButton } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-styles";
import { acceptInviteAction } from "@/lib/actions/invites";
import { findInvite } from "@/lib/server/invites";
import { getSession } from "@/lib/server/session";
import { strings } from "@/lib/strings";

const t = strings.invites;

export const metadata: Metadata = { title: t.title };

export default async function InvitePage({ params }: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const [invite, session] = await Promise.all([findInvite(token), getSession()]);

  if (invite.status !== "pending") {
    return (
      <>
        <PageTitle title={t.unavailable}>{t.status[invite.status]}</PageTitle>
        <Link href="/inicio" className={buttonClass("secondary")}>
          {t.goHome}
        </Link>
      </>
    );
  }

  const next = encodeURIComponent(`/convite/${token}`);
  return (
    <>
      <PageTitle title={t.pageTitle(invite.householdName!)}>{t.pageBody(invite.inviterName!, invite.householdName!)}</PageTitle>
      {session ? (
        <form action={acceptInviteAction.bind(null, token)} className="flex flex-col">
          <SubmitButton>{t.accept}</SubmitButton>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <Link href={`/cadastro?next=${next}`} className={buttonClass("primary")}>
            {t.signUp}
          </Link>
          <Link href={`/entrar?next=${next}`} className={buttonClass("secondary")}>
            {t.signIn}
          </Link>
        </div>
      )}
    </>
  );
}
