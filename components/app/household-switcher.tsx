"use client";

import { switchHousehold } from "@/lib/actions/households";
import { strings } from "@/lib/strings";

/** A select that opens another household as soon as it changes. */
export function HouseholdSwitcher({
  currentId,
  households,
}: {
  currentId: string;
  households: { householdId: string; name: string }[];
}) {
  return (
    <form action={switchHousehold}>
      <select
        key={currentId}
        name="householdId"
        aria-label={strings.nav.currentHousehold}
        defaultValue={currentId}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-10 max-w-48 truncate rounded-field border border-border bg-surface px-3 text-sm font-medium text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {households.map((household) => (
          <option key={household.householdId} value={household.householdId}>
            {household.name}
          </option>
        ))}
      </select>
    </form>
  );
}
