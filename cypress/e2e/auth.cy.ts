import { giovane } from "../support/commands";

describe("Authentication", () => {
  beforeEach(() => cy.resetDb());

  it("signs up, verifies the email and lands on onboarding", () => {
    cy.visit("/cadastro");
    cy.findField("Nome").type(giovane.name);
    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type(giovane.password);
    cy.findField("Confirmar senha").type(giovane.password);
    cy.contains("button", "Criar conta").click();

    cy.location("pathname").should("eq", "/verifique-seu-email");
    cy.contains("h1", "Confirme seu e-mail");
    cy.contains(giovane.email);

    cy.lastEmail(giovane.email).then((email) => {
      expect(email.subject).to.eq("Confirme seu e-mail no Lastro");
      cy.visit(email.link);
    });
    cy.location("pathname").should("eq", "/bem-vindo");
    cy.contains("h1", "Bem-vindo ao Lastro");
  });

  it("validates the sign-up form", () => {
    cy.visit("/cadastro");
    cy.findField("Nome").type(giovane.name);
    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type("curta");
    cy.findField("Confirmar senha").type("outra");
    cy.contains("button", "Criar conta").click();
    cy.findField("Senha").should("have.attr", "aria-invalid", "true");
    cy.findField("Nome").should("have.value", giovane.name);
  });

  it("blocks sign-in until the email is verified", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/sign-up/email",
      headers: { Origin: Cypress.config("baseUrl")! },
      body: giovane,
    });
    cy.visit("/entrar");
    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type(giovane.password);
    cy.contains("button", "Entrar").click();
    cy.contains('[role="alert"]', "Confirme seu e-mail");
  });

  it("rejects a wrong password", () => {
    cy.createUser(giovane);
    cy.visit("/entrar");
    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type("senha-errada");
    cy.contains("button", "Entrar").click();
    cy.contains('[role="alert"]', "E-mail ou senha incorretos.");
  });

  it("signs in, follows `next`, and signs out", () => {
    cy.createUser(giovane);
    cy.visit("/membros");
    cy.location("pathname").should("eq", "/entrar");
    cy.location("search").should("contain", "next=%2Fmembros");

    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type(giovane.password);
    cy.contains("button", "Entrar").click();
    cy.location("pathname").should("eq", "/bem-vindo");

    cy.createHousehold("Casa Lipski");
    cy.visit("/entrar");
    cy.location("pathname").should("eq", "/inicio");

    cy.visit("/casa");
    cy.contains("button", "Sair").click();
    cy.location("pathname").should("eq", "/entrar");
    cy.visit("/inicio");
    cy.location("pathname").should("eq", "/entrar");
  });

  it("resets a forgotten password", () => {
    cy.createUser(giovane);
    cy.visit("/entrar");
    cy.contains("a", "Esqueci minha senha").click();
    cy.location("pathname").should("eq", "/esqueci-a-senha");
    cy.findField("E-mail").type(giovane.email);
    cy.contains("button", "Enviar link").click();
    cy.contains('[role="status"]', "enviamos um link");

    cy.lastEmail(giovane.email).then((email) => {
      expect(email.subject).to.eq("Redefina sua senha no Lastro");
      cy.visit(email.link);
    });
    cy.location("pathname").should("eq", "/redefinir-senha");
    cy.findField("Nova senha").type("nova-senha-123");
    cy.findField("Confirmar senha").type("nova-senha-123");
    cy.contains("button", "Salvar nova senha").click();

    cy.location("pathname").should("eq", "/entrar");
    cy.contains("Senha alterada");
    cy.findField("E-mail").type(giovane.email);
    cy.findField("Senha").type("nova-senha-123");
    cy.contains("button", "Entrar").click();
    cy.location("pathname").should("eq", "/bem-vindo");
  });
});
