export const INVITE_TTL_DAYS = 7;

export type InviteStatus = "pending" | "used" | "revoked" | "expired";

/** When an invite created at `now` stops working. */
export function inviteExpiresAt(now: Date): Date {
  return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** Whether an invite can still be accepted; used beats revoked beats expired. */
export function inviteStatus(
  invite: { expiresAt: Date; usedAt: Date | null; revokedAt: Date | null },
  now: Date,
): InviteStatus {
  if (invite.usedAt) return "used";
  if (invite.revokedAt) return "revoked";
  if (invite.expiresAt <= now) return "expired";
  return "pending";
}
