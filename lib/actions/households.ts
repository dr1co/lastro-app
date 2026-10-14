"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseHouseholdInput } from "@/lib/domain/households";
import { createHousehold, deleteHousehold, isMember, renameHousehold, setLastHousehold } from "@/lib/server/households";
import { failure, formAction, success } from "@/lib/server/form-action";
import { requireHousehold, requireUser } from "@/lib/server/session";
import { strings } from "@/lib/strings";

export const createHouseholdAction = formAction(parseHouseholdInput, async ({ name }) => {
  const user = await requireUser();
  await createHousehold(user, name);
  revalidatePath("/", "layout");
  redirect("/inicio");
});

export async function switchHousehold(formData: FormData) {
  const user = await requireUser();
  const householdId = String(formData.get("householdId") ?? "");
  if (await isMember(user.id, householdId)) await setLastHousehold(user.id, householdId);
  refresh();
}

export const renameHouseholdAction = formAction(parseHouseholdInput, async ({ name }) => {
  const { household, isOwner } = await requireHousehold();
  if (!isOwner) return failure(strings.errors.notAllowed);
  await renameHousehold(household.id, name);
  refresh();
  return success(strings.household.updated);
});

export const deleteHouseholdAction = formAction(
  (values) => ({ success: true, data: { confirm: values.confirm ?? "" } }),
  async ({ confirm }) => {
    const { household, isOwner } = await requireHousehold();
    if (!isOwner) return failure(strings.errors.notAllowed);
    if (confirm.trim() !== household.name) return { status: "error", errors: { confirm: strings.household.deleteMismatch } };
    await deleteHousehold(household.id);
    revalidatePath("/", "layout");
    redirect("/inicio");
  },
);
