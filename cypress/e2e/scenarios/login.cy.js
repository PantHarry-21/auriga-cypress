describe("Login", () => {
  // beforeEach(() => {
  //   cy.login(Cypress.env("LABTECH_USER"), Cypress.env("LABTECH_PASS"));
  // });

  it("Login", () => {
    cy.visit("https://dev.ylims.com/");
    cy.get('[name="username"]').type("harry2");
    cy.get('[name="password"]').type("Harry@123");
    cy.get(".inline-flex").click();
    cy.url().should("include", "/dashboard");
  });
});