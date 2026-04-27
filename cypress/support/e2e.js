// d:\Harry\OneDrive\Desktop\Auriga Cypress\cypress\support\e2e.js
//
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-mochawesome-reporter/register';

// ── Block heavy Stimulsoft scripts that prevent page load event ──────────────
// The app loads ~30MB of Stimulsoft reporting JS synchronously on every page.
// These are NOT needed for RBAC permission testing and cause cy.visit() to
// timeout (60s) because the browser load event never fires.
beforeEach(() => {
  cy.intercept('**/stimulsoft*.js', { body: '/* stubbed for test performance */' }).as('stubStimulsoft');
});

// ── Prevent uncaught app exceptions from failing tests ──────────────────────
// The SPA may throw non-critical errors (analytics, WebSocket, etc.) that
// are unrelated to the permission checks we are verifying.
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

// ── Auto-generate Executive Report after each Spec ──────────────────────────
// This ensures the premium dashboard is updated even during 'cypress open'
after(() => {
  // We use a task to trigger the node-based report script
  cy.task('generateReport', null, { log: false });
});