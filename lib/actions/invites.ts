"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseInviteInput } from "@/lib/domain/households";
import { failure, formAction, success } from "@/lib/server/form-action";
import { acceptInvite, createInvite, revokeInvite } from "@/lib/server/invites";
import { requireHousehold, requireUser } from "@/lib/server/session";
import { strings } from "@/lib/strings";

async function create(memberId: string | null, email: string | null) {
  const { household, user } = await requireHousehold();
  return createInvite({ householdId: household.id, householdName: household.name, createdBy: user, memberId, email });
}

export const createInviteAction = formAction(parseInviteInput, async ({ email }) => {
  const result = await create(null, email);
  if (!result.ok) return failure(result.message);
  refresh();
  return success(strings.invites.created);
});

/** Creates an invite link that hands the given member profile to whoever accepts it. */
export async function inviteMember(memberId: string) {
  await create(memberId, null);
  refresh();
}

export async function revokeInviteAction(id: string) {
  const { household } = await requireHousehold();
  await revokeInvite(household.id, id);
  refresh();
}

export async function acceptInviteAction(token: string) {
  const user = await requireUser();
  const result = await acceptInvite(token, user);
  if (result.ok) revalidatePath("/", "layout");
  redirect(result.ok ? "/inicio" : `/convite/${token}`);
}
