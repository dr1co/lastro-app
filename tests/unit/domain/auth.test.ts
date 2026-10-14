import {
  authErrorMessage,
  parseNewPassword,
  parseSignIn,
  parseSignUp,
  safeNextPath,
} from "@/lib/domain/auth";

describe("parseSignUp", () => {
  const valid = { name: "Giovane", email: " Gio@Example.com ", password: "segredo123", confirmPassword: "segredo123" };

  it("normalizes the email and trims the name", () => {
    const result = parseSignUp({ ...valid, name: "  Giovane " });
    expect(result).toEqual({
      success: true,
      data: { name: "Giovane", email: "gio@example.com", password: "segredo123", confirmPassword: "segredo123" },
    });
  });

  it("requires a name, a valid email and a password of 8+ characters", () => {
    const result = parseSignUp({ name: "", email: "nope", password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(result.errors).sort()).toEqual(["email", "name", "password"]);
  });

  it("requires matching passwords", () => {
    const result = parseSignUp({ ...valid, confirmPassword: "outra-senha" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toHaveProperty("confirmPassword");
  });
});

describe("parseSignIn", () => {
  it("accepts an email and a password", () => {
    expect(parseSignIn({ email: "GIO@example.com", password: "x" })).toEqual({
      success: true,
      data: { email: "gio@example.com", password: "x" },
    });
  });

  it("rejects missing fields", () => {
    expect(parseSignIn({ email: "", password: "" }).success).toBe(false);
  });
});

describe("parseNewPassword", () => {
  it("requires a token and matching passwords", () => {
    expect(parseNewPassword({ token: "t", password: "segredo123", confirmPassword: "segredo123" }).success).toBe(true);
    expect(parseNewPassword({ token: "", password: "segredo123", confirmPassword: "segredo123" }).success).toBe(false);
    expect(parseNewPassword({ token: "t", password: "segredo123", confirmPassword: "x" }).success).toBe(false);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/convite/abc", "/convite/abc"],
    ["/membros?x=1", "/membros?x=1"],
    [null, "/inicio"],
    ["", "/inicio"],
    ["https://evil.com", "/inicio"],
    ["//evil.com", "/inicio"],
    ["/\\evil.com", "/inicio"],
    ["javascript:alert(1)", "/inicio"],
  ])("maps %p to %p", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("authErrorMessage", () => {
  it("translates known Better Auth codes", () => {
    expect(authErrorMessage("INVALID_EMAIL_OR_PASSWORD")).toBe("E-mail ou senha incorretos.");
    expect(authErrorMessage("EMAIL_NOT_VERIFIED")).toMatch(/confirme seu e-mail/i);
  });

  it("falls back to a generic message", () => {
    expect(authErrorMessage("SOMETHING_ELSE")).toBe("Algo deu errado. Tente novamente.");
    expect(authErrorMessage(undefined)).toBe("Algo deu errado. Tente novamente.");
  });
});
