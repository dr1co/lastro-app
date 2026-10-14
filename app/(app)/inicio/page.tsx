import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { Card } from "@/components/ui/card";
import { requireHousehold } from "@/lib/server/session";
import { strings } from "@/lib/strings";

export const metadata: Metadata = { title: strings.nav.home };

export default async function HomePage() {
  const { member, household } = await requireHousehold();
  const firstName = member.name.split(" ")[0];
  return (
    <>
      <PageTitle title={strings.home.greeting(firstName)}>{household.name}</PageTitle>
      <Card>
        <p className="text-text-muted">{strings.home.empty}</p>
      </Card>
    </>
  );
}
