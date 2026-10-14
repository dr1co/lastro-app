import { parseHouseholdInput, parseInviteInput, parseMemberInput, pickCurrentHousehold } from "@/lib/domain/households";

describe("pickCurrentHousehold", () => {
  it("keeps the last household when the user still belongs to it", () => {
    expect(pickCurrentHousehold(["a", "b"], "b")).toBe("b");
  });

  it("falls back to the first household", () => {
    expect(pickCurrentHousehold(["a", "b"], "gone")).toBe("a");
    expect(pickCurrentHousehold(["a", "b"], null)).toBe("a");
  });

  it("returns null without households", () => {
    expect(pickCurrentHousehold([], "a")).toBeNull();
  });
});

describe("parseHouseholdInput", () => {
  it("trims and requires a name up to 60 characters", () => {
    expect(parseHouseholdInput({ name: "  Casa Lipski " })).toEqual({ success: true, data: { name: "Casa Lipski" } });
    expect(parseHouseholdInput({ name: " " }).success).toBe(false);
    expect(parseHouseholdInput({ name: "x".repeat(61) }).success).toBe(false);
  });
});

describe("parseMemberInput", () => {
  it("requires a name and accepts an optional hex color", () => {
    expect(parseMemberInput({ name: "Rosangela", color: "#8DB8A5" })).toEqual({
      success: true,
      data: { name: "Rosangela", color: "#8DB8A5" },
    });
    expect(parseMemberInput({ name: "Rosangela", color: "" })).toEqual({
      success: true,
      data: { name: "Rosangela", color: null },
    });
    expect(parseMemberInput({ name: "", color: "#8DB8A5" }).success).toBe(false);
    expect(parseMemberInput({ name: "Rosangela", color: "red" }).success).toBe(false);
  });
});

describe("parseInviteInput", () => {
  it("accepts an optional email and an optional member", () => {
    expect(parseInviteInput({ email: " Ro@Example.com ", memberId: "" })).toEqual({
      success: true,
      data: { email: "ro@example.com", memberId: null },
    });
    expect(parseInviteInput({ email: "", memberId: "m1" })).toEqual({
      success: true,
      data: { email: null, memberId: "m1" },
    });
    expect(parseInviteInput({ email: "not-an-email" }).success).toBe(false);
  });
});
