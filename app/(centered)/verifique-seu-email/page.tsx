import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { buttonClass } from "@/components/ui/button-styles";
import { param } from "@/lib/forms";
import { strings } from "@/lib/strings";

const t = strings.auth.verify;

export const metadata: Metadata = { title: t.title };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verifique-seu-email">) {
  const email = param((await searchParams).email) ?? "";
  return (
    <>
      <PageTitle title={t.title}>{t.body(email)}</PageTitle>
      <Link href="/entrar" className={buttonClass("secondary")}>
        {t.back}
      </Link>
    </>
  );
}
