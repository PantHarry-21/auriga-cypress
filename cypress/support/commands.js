// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("getByCy", (value) => cy.get(`[data-cy="${value}"]`));

Cypress.Commands.add("login", (username, password) => {
    cy.visit("http://13.219.156.132:5173/login");
    cy.get('[name="username"]').type("admin");
    cy.get('[name="password"]').type("Password@123");

    cy.get('.inline-flex').click();

    cy.get(':nth-child(1) > .relative > .w-full').click();
    cy.get(':nth-child(4) > .block').click();

    cy.get('.inline-flex').click();

    cy.get('.min-w-0 > .hidden').contains("Dashboard").should("be.visible");
  });