import { giovane, rosangela } from "../support/commands";

const inviteLink = () => cy.get('input[aria-label="Link do convite"]').first().invoke("val").then(String);

describe("Invites", () => {
  beforeEach(() => {
    cy.resetDb();
    cy.login(giovane);
    cy.createHousehold("Casa Lipski");
    cy.visit("/membros");
  });

  it("links an existing member profile to a new user who signs up from the invite", () => {
    cy.findField("Nome").type("Rosangela");
    cy.contains("button", "Adicionar").click();
    cy.contains("li", "Rosangela").contains("button", "Convidar").click();
    cy.contains("section", "Convites").should("contain", "Para Rosangela");

    inviteLink().then((link) => {
      cy.clearCookies();
      cy.visit(link);
      cy.contains("h1", "Convite para Casa Lipski");
      cy.contains("Giovane convidou você");
      cy.contains("a", "Criar conta").click();
      cy.location("pathname").should("eq", "/cadastro");

      cy.findField("Nome").type(rosangela.name);
      cy.findField("E-mail").type(rosangela.email);
      cy.findField("Senha").type(rosangela.password);
      cy.findField("Confirmar senha").type(rosangela.password);
      cy.contains("button", "Criar conta").click();
      cy.lastEmail(rosangela.email).then((email) => cy.visit(email.link));

      cy.location("pathname").should("eq", new URL(link).pathname);
      cy.contains("button", "Aceitar convite").click();
      cy.location("pathname").should("eq", "/inicio");
      cy.get('select[aria-label="Casa atual"]').find("option:selected").should("have.text", "Casa Lipski");

      cy.visit("/membros");
      cy.contains("li", "Rosangela").should("contain", "Você").and("contain", "Com acesso");
      cy.get("li").filter(':contains("Rosangela")').should("have.length", 1);
    });
  });

  it("invites a new person by email, who sees it on onboarding", () => {
    cy.findField("E-mail (opcional)").type(rosangela.email);
    cy.contains("button", "Criar convite").click();
    cy.contains("section", "Convites").should("contain", rosangela.email);
    cy.lastEmail(rosangela.email).its("subject").should("eq", "Giovane convidou você para Casa Lipski no Lastro");

    cy.clearCookies();
    cy.login(rosangela);
    cy.visit("/bem-vindo");
    cy.contains("li", "Casa Lipski").contains("button", "Aceitar").click();
    cy.location("pathname").should("eq", "/inicio");
    cy.visit("/membros");
    cy.contains("li", "Rosangela").should("contain", "Você");
  });

  it("revokes an invite", () => {
    cy.contains("button", "Criar convite").click();
    inviteLink().then((link) => {
      cy.contains("section", "Convites").contains("button", "Revogar").click();
      cy.get('input[aria-label="Link do convite"]').should("not.exist");
      cy.visit(link);
      cy.contains("h1", "Convite indisponível");
      cy.contains("Este convite foi revogado.");
    });
  });

  it("does not reuse an invite", () => {
    cy.contains("button", "Criar convite").click();
    inviteLink().then((link) => {
      cy.clearCookies();
      cy.login(rosangela);
      cy.visit(link);
      cy.contains("button", "Aceitar convite").click();
      cy.location("pathname").should("eq", "/inicio");
      cy.visit(link);
      cy.contains("Este convite já foi usado.");
    });
  });

  it("lets the owner remove a member's access, keeping the profile", () => {
    cy.contains("button", "Criar convite").click();
    inviteLink().then((link) => {
      cy.clearCookies();
      cy.login(rosangela);
      cy.visit(link);
      cy.contains("button", "Aceitar convite").click();
      cy.location("pathname").should("eq", "/inicio");

      cy.clearCookies();
      cy.signIn(giovane);
      cy.visit("/membros");
      cy.contains("li", "Rosangela").contains("button", "Remover acesso").click();
      cy.contains("li", "Rosangela").should("contain", "Sem acesso");

      cy.clearCookies();
      cy.signIn(rosangela);
      cy.visit("/inicio");
      cy.location("pathname").should("eq", "/bem-vindo");
    });
  });
});
