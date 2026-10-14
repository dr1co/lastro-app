import { INVITE_TTL_DAYS, inviteExpiresAt, inviteStatus } from "@/lib/domain/invites";

const now = new Date("2026-10-14T12:00:00Z");

describe("inviteExpiresAt", () => {
  it("expires invites after 7 days", () => {
    expect(INVITE_TTL_DAYS).toBe(7);
    expect(inviteExpiresAt(now)).toEqual(new Date("2026-10-21T12:00:00Z"));
  });
});

describe("inviteStatus", () => {
  const pending = { expiresAt: new Date("2026-10-20T00:00:00Z"), usedAt: null, revokedAt: null };

  it("is pending while unused, unrevoked and not expired", () => {
    expect(inviteStatus(pending, now)).toBe("pending");
  });

  it("is used, revoked or expired otherwise, in that priority", () => {
    expect(inviteStatus({ ...pending, usedAt: now, revokedAt: now }, now)).toBe("used");
    expect(inviteStatus({ ...pending, revokedAt: now }, now)).toBe("revoked");
    expect(inviteStatus({ ...pending, expiresAt: new Date("2026-10-14T11:59:59Z") }, now)).toBe("expired");
  });
});
