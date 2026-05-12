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

// ── Capture test execution steps for HTML report ─────────────────────────────
// Collects Cypress command-log events during each test and attaches them to the
// Mochawesome JSON context so the report generator can render a step-by-step log.
const _testLogs = [];
const _logMap   = {};   // attrs.id → index in _testLogs (used to update state via log:changed)

// Commands we want to surface as visible "steps" in the report.
// Excludes setup noise (intercept, session, fixture) and internal flow commands.
const _captureNames = new Set([
  'log', 'visit', 'assert',
  'click', 'type', 'select', 'check', 'uncheck', 'clear',
  'screenshot', 'wait',
]);

Cypress.on('log:added', (attrs) => {
  if (!_captureNames.has(attrs.name)) return;
  const entry = {
    name:  attrs.name,
    msg:   String(attrs.message || '').substring(0, 200),
    state: attrs.state || 'pending',
  };
  _testLogs.push(entry);
  if (attrs.id) _logMap[attrs.id] = _testLogs.length - 1;
});

Cypress.on('log:changed', (attrs) => {
  if (attrs.id && _logMap[attrs.id] !== undefined && attrs.state && attrs.state !== 'pending') {
    _testLogs[_logMap[attrs.id]].state = attrs.state;
  }
});

// ── Block heavy Stimulsoft scripts that prevent page load event ──────────────
// The app loads ~30MB of Stimulsoft reporting JS synchronously on every page.
// These are NOT needed for RBAC permission testing and cause cy.visit() to
// timeout (60s) because the browser load event never fires.
beforeEach(() => {
  cy.intercept('**/stimulsoft*.js', { body: '/* stubbed for test performance */' }).as('stubStimulsoft');
  // Reset log buffer for this test (runs after the stimulsoft beforeEach so those
  // intercept setup commands are excluded from the step log).
  _testLogs.length = 0;
  for (const k in _logMap) delete _logMap[k];
});

afterEach(function () {
  // Snapshot the log before cy.addTestContext itself adds entries.
  const snapshot = _testLogs.map(({ name, msg, state }) => ({ name, msg, state }));
  if (snapshot.length > 0) {
    cy.addTestContext({ title: 'test-steps', value: JSON.stringify(snapshot) });
  }
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