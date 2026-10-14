import { giovane, rosangela } from "../support/commands";

describe("Households", () => {
  beforeEach(() => {
    cy.resetDb();
    cy.login(giovane);
  });

  it("sends users without a household to onboarding", () => {
    cy.visit("/inicio");
    cy.location("pathname").should("eq", "/bem-vindo");
  });

  it("creates a household with the user as its first member", () => {
    cy.createHousehold("Casa Lipski");
    cy.contains("h1", "Olá, Giovane");
    cy.get('select[aria-label="Casa atual"]').find("option:selected").should("have.text", "Casa Lipski");

    cy.contains("a", "Membros").click();
    cy.location("pathname").should("eq", "/membros");
    cy.contains("li", "Giovane").should("contain", "Você").and("contain", "Com acesso");
  });

  it("switches between households and remembers the choice", () => {
    cy.createHousehold("Casa Lipski");
    cy.visit("/casa");
    cy.findField("Nome da nova casa").type("Escritório");
    cy.contains("button", "Criar casa").click();
    cy.location("pathname").should("eq", "/inicio");
    cy.get('select[aria-label="Casa atual"]').find("option:selected").should("have.text", "Escritório");

    cy.get('select[aria-label="Casa atual"]').select("Casa Lipski");
    cy.get("main").should("contain", "Casa Lipski");
    cy.reload();
    cy.get('select[aria-label="Casa atual"]').find("option:selected").should("have.text", "Casa Lipski");
  });

  it("lets the owner rename and delete the household", () => {
    cy.createHousehold("Casa Lipski");
    cy.visit("/casa");
    cy.findField("Nome da casa").clear().type("Casa Nova");
    cy.contains("button", "Salvar").click();
    cy.contains('[role="status"]', "Casa atualizada.");
    cy.get('select[aria-label="Casa atual"]').find("option:selected").should("have.text", "Casa Nova");

    cy.contains("button", "Excluir casa").click();
    cy.findField("Digite o nome da casa para confirmar").should("have.attr", "aria-invalid", "true");
    cy.findField("Digite o nome da casa para confirmar").type("Casa Nova");
    cy.contains("button", "Excluir casa").click();
    cy.location("pathname").should("eq", "/bem-vindo");
  });

  it("hides owner settings from other members", () => {
    cy.createHousehold("Casa Lipski");
    cy.visit("/membros");
    cy.contains("button", "Criar convite").click();
    cy.get('input[aria-label="Link do convite"]')
      .invoke("val")
      .then((link) => {
        cy.clearCookies();
        cy.login(rosangela);
        cy.visit(String(link));
        cy.contains("button", "Aceitar convite").click();
        cy.location("pathname").should("eq", "/inicio");
        cy.visit("/casa");
        cy.contains("Apenas quem criou a casa pode alterar estas configurações.");
        cy.contains("button", "Excluir casa").should("not.exist");
      });
  });
});
