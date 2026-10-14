"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { parseMemberInput } from "@/lib/domain/households";
import { formAction, success } from "@/lib/server/form-action";
import { addMember, getMember, removeMemberAccess, setMemberArchived, updateMember } from "@/lib/server/members";
import { requireHousehold } from "@/lib/server/session";
import { strings } from "@/lib/strings";

export const addMemberAction = formAction(parseMemberInput, async (data) => {
  const { household } = await requireHousehold();
  await addMember(household.id, data);
  refresh();
  return success(strings.members.added);
});

export const updateMemberAction = formAction(parseMemberInput, async (data, values) => {
  const { household } = await requireHousehold();
  await updateMember(household.id, values.id, data);
  redirect("/membros");
});

export async function archiveMember(id: string) {
  const { household } = await requireHousehold();
  await setMemberArchived(household.id, id, true);
  refresh();
}

export async function restoreMember(id: string) {
  const { household } = await requireHousehold();
  await setMemberArchived(household.id, id, false);
  refresh();
}

/** Owner-only: unlinks another member's login. */
export async function removeAccess(id: string) {
  const { household, isOwner } = await requireHousehold();
  const member = await getMember(household.id, id);
  if (!isOwner || !member || member.userId === household.ownerUserId) return;
  await removeMemberAccess(household.id, id);
  refresh();
}
