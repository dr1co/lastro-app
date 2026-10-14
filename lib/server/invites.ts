import "server-only";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db/client";
import { households, invites, members, user } from "@/lib/db/schema";
import { inviteExpiresAt, inviteStatus, type InviteStatus } from "@/lib/domain/invites";
import { strings } from "@/lib/strings";
import { appUrl, sendEmail } from "./mailer";

export const inviteUrl = (token: string) => appUrl(`/convite/${token}`);

const pending = (now: Date) => and(isNull(invites.usedAt), isNull(invites.revokedAt), gt(invites.expiresAt, now));

/**
 * Creates an invite link. With `memberId`, the person who accepts takes over that (unlinked, active) profile.
 * With `email`, the invite is also sent by email.
 */
export async function createInvite(params: {
  householdId: string;
  createdBy: { id: string; name: string };
  householdName: string;
  memberId: string | null;
  email: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (params.memberId) {
    const [member] = await db
      .select()
      .from(members)
      .where(and(eq(members.id, params.memberId), eq(members.householdId, params.householdId)));
    if (!member || member.archivedAt) return { ok: false, message: strings.errors.notFound };
    if (member.userId) return { ok: false, message: strings.members.alreadyLinked };
  }

  const token = randomBytes(24).toString("base64url");
  await db.insert(invites).values({
    householdId: params.householdId,
    token,
    email: params.email,
    memberId: params.memberId,
    createdByUserId: params.createdBy.id,
    expiresAt: inviteExpiresAt(new Date()),
  });

  if (params.email) {
    const { invite } = strings.emails;
    await sendEmail({
      to: params.email,
      subject: invite.subject(params.createdBy.name, params.householdName),
      text: invite.body(params.createdBy.name, params.householdName, inviteUrl(token)),
    });
  }
  return { ok: true };
}

/** Invites of the household that can still be accepted, with the target member's name. */
export function listPendingInvites(householdId: string) {
  return db
    .select({
      id: invites.id,
      token: invites.token,
      email: invites.email,
      memberName: members.name,
      expiresAt: invites.expiresAt,
    })
    .from(invites)
    .leftJoin(members, eq(invites.memberId, members.id))
    .where(and(eq(invites.householdId, householdId), pending(new Date())))
    .orderBy(asc(invites.createdAt));
}

/** Pending invites addressed to an email, for the onboarding page. */
export function listInvitesForEmail(email: string) {
  return db
    .select({ token: invites.token, householdName: households.name, inviterName: user.name })
    .from(invites)
    .innerJoin(households, eq(invites.householdId, households.id))
    .innerJoin(user, eq(invites.createdByUserId, user.id))
    .where(and(eq(invites.email, email), pending(new Date())))
    .orderBy(asc(invites.createdAt));
}

export async function revokeInvite(householdId: string, id: string) {
  await db
    .update(invites)
    .set({ revokedAt: new Date() })
    .where(and(eq(invites.id, id), eq(invites.householdId, householdId)));
}

/** What the invite page shows: household, inviter and whether it can be accepted (`missing` when unknown). */
export async function findInvite(
  token: string,
): Promise<{ status: InviteStatus | "missing"; householdName?: string; inviterName?: string }> {
  const [row] = await db
    .select({ invite: invites, householdName: households.name, inviterName: user.name })
    .from(invites)
    .innerJoin(households, eq(invites.householdId, households.id))
    .innerJoin(user, eq(invites.createdByUserId, user.id))
    .where(eq(invites.token, token));
  if (!row) return { status: "missing" };
  return { status: inviteStatus(row.invite, new Date()), householdName: row.householdName, inviterName: row.inviterName };
}

/**
 * Accepts an invite for the user: links the invited member profile (or creates one), marks the invite used
 * and opens the household. Users already in the household just switch to it, leaving the invite unused.
 */
export async function acceptInvite(
  token: string,
  acceptor: { id: string; name: string },
): Promise<{ ok: true } | { ok: false }> {
  return db.transaction(async (tx) => {
    const [invite] = await tx.select().from(invites).where(eq(invites.token, token)).for("update");
    if (!invite || inviteStatus(invite, new Date()) !== "pending") return { ok: false };

    const [existing] = await tx
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.householdId, invite.householdId), eq(members.userId, acceptor.id)));

    if (!existing) {
      if (invite.memberId) {
        const linked = await tx
          .update(members)
          .set({ userId: acceptor.id, archivedAt: null })
          .where(and(eq(members.id, invite.memberId), isNull(members.userId)))
          .returning({ id: members.id });
        if (linked.length === 0) return { ok: false };
      } else {
        await tx.insert(members).values({ householdId: invite.householdId, userId: acceptor.id, name: acceptor.name });
      }
      await tx.update(invites).set({ usedAt: new Date() }).where(eq(invites.id, invite.id));
    }

    await tx.update(user).set({ lastHouseholdId: invite.householdId }).where(eq(user.id, acceptor.id));
    return { ok: true };
  });
}
