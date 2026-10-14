import { giovane } from "../support/commands";

describe("Members", () => {
  beforeEach(() => {
    cy.resetDb();
    cy.login(giovane);
    cy.createHousehold("Casa Lipski");
    cy.visit("/membros");
  });

  it("adds a member without a login", () => {
    cy.findField("Nome").type("Rosangela");
    cy.contains("button", "Adicionar").click();
    cy.contains("li", "Rosangela").should("contain", "Sem acesso");
    cy.findField("Nome").should("have.value", "");
  });

  it("validates the member name", () => {
    cy.contains("button", "Adicionar").click();
    cy.findField("Nome").should("have.attr", "aria-invalid", "true");
  });

  it("edits a member", () => {
    cy.findField("Nome").type("Rosangela");
    cy.contains("button", "Adicionar").click();
    cy.contains("li", "Rosangela").contains("a", "Editar").click();
    cy.location("pathname").should("match", /^\/membros\/.+/);
    cy.contains("h1", "Editar membro");
    cy.findField("Nome").clear().type("Rosângela");
    cy.contains("button", "Salvar").click();
    cy.location("pathname").should("eq", "/membros");
    cy.contains("li", "Rosângela");
  });

  it("archives and restores a member", () => {
    cy.findField("Nome").type("Kid");
    cy.contains("button", "Adicionar").click();
    cy.contains("li", "Kid").contains("button", "Arquivar").click();
    cy.contains("section", "Arquivados").contains("li", "Kid").contains("button", "Restaurar").click();
    cy.contains("section", "Arquivados").should("not.exist");
    cy.contains("li", "Kid").should("contain", "Sem acesso");
  });

  it("does not offer archiving for members with access", () => {
    cy.contains("li", "Giovane").contains("button", "Arquivar").should("not.exist");
  });
});
