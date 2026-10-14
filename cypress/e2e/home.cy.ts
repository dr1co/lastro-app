describe("Home", () => {
  it("shows the brand in pt-BR", () => {
    cy.visit("/");
    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.title().should("eq", "Lastro");
    cy.contains("h1", "Lastro");
    cy.contains("Sua visão financeira, em um só lugar.");
  });
});
