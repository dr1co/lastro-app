import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { members } from "@/lib/db/schema";

export type Member = typeof members.$inferSelect;

const scoped = (householdId: string, id: string) => and(eq(members.householdId, householdId), eq(members.id, id));

/** Every member of the household, archived ones included, oldest first. */
export function listMembers(householdId: string): Promise<Member[]> {
  return db.select().from(members).where(eq(members.householdId, householdId)).orderBy(asc(members.createdAt));
}

export async function getMember(householdId: string, id: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(scoped(householdId, id));
  return member;
}

export async function addMember(householdId: string, data: { name: string; color: string | null }) {
  await db.insert(members).values({ householdId, ...data });
}

export async function updateMember(householdId: string, id: string, data: { name: string; color: string | null }) {
  await db.update(members).set(data).where(scoped(householdId, id));
}

/** Archives or restores a member; members linked to a login cannot be archived. */
export async function setMemberArchived(householdId: string, id: string, archived: boolean) {
  await db
    .update(members)
    .set({ archivedAt: archived ? new Date() : null })
    .where(and(scoped(householdId, id), isNull(members.userId)));
}

/** Unlinks the member's login so they lose access; the profile and its history stay. */
export async function removeMemberAccess(householdId: string, id: string) {
  await db.update(members).set({ userId: null }).where(scoped(householdId, id));
}
