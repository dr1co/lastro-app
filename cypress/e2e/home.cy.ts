describe("Landing", () => {
  it("shows the brand in pt-BR with sign-up and sign-in links", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.title().should("eq", "Lastro");
    cy.contains("h1", "Sua visão financeira, em um só lugar.");
    cy.contains("a", "Criar conta").should("have.attr", "href", "/cadastro");
    cy.contains("a", "Entrar").should("have.attr", "href", "/entrar");
  });
});
