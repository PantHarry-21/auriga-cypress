// cypress/support/commands.js

const ROLE_CREDENTIALS = {
  reception:           { username: Cypress.env('RECEPTION_USERNAME'),          password: Cypress.env('RECEPTION_PASSWORD') },
  booking_personel:    { username: Cypress.env('BOOKING_PERSONEL_USERNAME'),   password: Cypress.env('BOOKING_PERSONEL_PASSWORD') },
  master_personel:     { username: Cypress.env('MASTER_PERSONEL_USERNAME'),    password: Cypress.env('MASTER_PERSONEL_PASSWORD') },
  master_controler:    { username: Cypress.env('MASTER_CONTROLER_USERNAME'),   password: Cypress.env('MASTER_CONTROLER_PASSWORD') },
  analyst:             { username: Cypress.env('ANALYST_USERNAME'),            password: Cypress.env('ANALYST_PASSWORD') },
  department_reviewer: { username: Cypress.env('DEPARTMENT_REVIEWER_USERNAME'),password: Cypress.env('DEPARTMENT_REVIEWER_PASSWORD') },
  department_head:     { username: Cypress.env('DEPARTMENT_HEAD_USERNAME'),    password: Cypress.env('DEPARTMENT_HEAD_PASSWORD') },
  compilation:         { username: Cypress.env('COMPILATION_USERNAME'),        password: Cypress.env('COMPILATION_PASSWORD') },
  reviewer:            { username: Cypress.env('REVIEWER_USERNAME'),           password: Cypress.env('REVIEWER_PASSWORD') },
  person_incharge:     { username: Cypress.env('PERSON_INCHARGE_USERNAME'),    password: Cypress.env('PERSON_INCHARGE_PASSWORD') },
  customer_coordinator:{ username: Cypress.env('CUSTOMER_COORDINATOR_USERNAME'),password: Cypress.env('CUSTOMER_COORDINATOR_PASSWORD') },
  sales_personel_am:   { username: Cypress.env('SALES_PERSONEL_AM_USERNAME'),  password: Cypress.env('SALES_PERSONEL_AM_PASSWORD') },
  accountant_admin:    { username: Cypress.env('ACCOUNTANT_ADMIN_USERNAME'),   password: Cypress.env('ACCOUNTANT_ADMIN_PASSWORD') },
  accountant_crm:      { username: Cypress.env('ACCOUNTANT_CRM_USERNAME'),     password: Cypress.env('ACCOUNTANT_CRM_PASSWORD') },
  quality_personel:    { username: Cypress.env('QUALITY_PERSONEL_USERNAME'),   password: Cypress.env('QUALITY_PERSONEL_PASSWORD') },
  quality_manger:      { username: Cypress.env('QUALITY_MANGER_USERNAME'),     password: Cypress.env('QUALITY_MANGER_PASSWORD') },
};

Cypress.Commands.add('loginAs', (roleKey) => {
  const creds = ROLE_CREDENTIALS[roleKey];
  if (!creds) throw new Error(`No credentials configured for role_key=${roleKey}`);

  cy.session(roleKey, () => {
    // Block Stimulsoft inside session too (session has its own intercept scope)
    cy.intercept('**/stimulsoft*.js', { body: '/* stubbed */' });

    cy.visit('/login', { timeout: 120000 });

    // Wait for the login form to actually render (React hydration)
    cy.get('[name="username"]', { timeout: 30000 }).should('be.visible').clear().type(creds.username);
    cy.get('[name="password"]').should('be.visible').clear().type(creds.password);
    cy.get('.inline-flex').click(); // Login button

    // Wait for redirect away from login — allow extra time for post-login load
    cy.url({ timeout: 60000 }).should('not.include', '/login');
  });
});

Cypress.Commands.add('getRolePermissions', (roleKey) => {
  return cy.fixture('roles-permissions.json').then(fx => {
    return fx.roles.find(r => r.role_key === roleKey);
  });
});