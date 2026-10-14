import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { pickCurrentHousehold } from "@/lib/domain/households";
import { auth } from "./auth";
import { listMemberships, type Membership } from "./households";

/** The Better Auth session for this request, or `null`. Deduplicated per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** The signed-in user; redirects to sign-in otherwise. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  return session.user;
}

export type HouseholdContext = {
  user: Awaited<ReturnType<typeof requireUser>>;
  household: { id: string; name: string; ownerUserId: string };
  member: { id: string; name: string };
  isOwner: boolean;
  households: Membership[];
};

/**
 * The signed-in user and the household they are working in (last used, else first).
 * Redirects to onboarding when the user belongs to no household. Deduplicated per request.
 */
export const requireHousehold = cache(async (): Promise<HouseholdContext> => {
  const user = await requireUser();
  const memberships = await listMemberships(user.id);
  const currentId = pickCurrentHousehold(
    memberships.map((m) => m.householdId),
    user.lastHouseholdId ?? null,
  );
  const current = memberships.find((m) => m.householdId === currentId);
  if (!current) redirect("/bem-vindo");
  return {
    user,
    household: { id: current.householdId, name: current.name, ownerUserId: current.ownerUserId },
    member: { id: current.memberId, name: current.memberName },
    isOwner: current.ownerUserId === user.id,
    households: memberships,
  };
});
