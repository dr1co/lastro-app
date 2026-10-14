import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { households, members, user } from "@/lib/db/schema";

export type Membership = { householdId: string; name: string; ownerUserId: string; memberId: string; memberName: string };

/** Households the user can open, with the member profile linked to them, sorted by name. */
export function listMemberships(userId: string): Promise<Membership[]> {
  return db
    .select({
      householdId: households.id,
      name: households.name,
      ownerUserId: households.ownerUserId,
      memberId: members.id,
      memberName: members.name,
    })
    .from(members)
    .innerJoin(households, eq(members.householdId, households.id))
    .where(eq(members.userId, userId))
    .orderBy(asc(households.name));
}

/** Creates a household owned by the user, links them as its first member and opens it. */
export async function createHousehold(owner: { id: string; name: string }, name: string): Promise<string> {
  return db.transaction(async (tx) => {
    const [household] = await tx.insert(households).values({ name, ownerUserId: owner.id }).returning();
    await tx.insert(members).values({ householdId: household.id, userId: owner.id, name: owner.name });
    await tx.update(user).set({ lastHouseholdId: household.id }).where(eq(user.id, owner.id));
    return household.id;
  });
}

/** Remembers the household the user is working in. */
export async function setLastHousehold(userId: string, householdId: string) {
  await db.update(user).set({ lastHouseholdId: householdId }).where(eq(user.id, userId));
}

export async function renameHousehold(householdId: string, name: string) {
  await db.update(households).set({ name }).where(eq(households.id, householdId));
}

/** Deletes the household and, by cascade, all of its data. */
export async function deleteHousehold(householdId: string) {
  await db.delete(households).where(eq(households.id, householdId));
}

/** True when the user has a member profile in the household. */
export async function isMember(userId: string, householdId: string): Promise<boolean> {
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.userId, userId), eq(members.householdId, householdId)))
    .limit(1);
  return rows.length > 0;
}
