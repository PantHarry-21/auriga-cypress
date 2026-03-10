describe("Login", () => {
  beforeEach(() => {
    cy.login(Cypress.env("LABTECH_USER"), Cypress.env("LABTECH_PASS"));
  });
});