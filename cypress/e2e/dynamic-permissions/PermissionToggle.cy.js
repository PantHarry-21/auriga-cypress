// cypress/e2e/dynamic-permissions/PermissionToggle.cy.js
//
// Verifies that admin-applied permission changes are immediately reflected
// for the affected role user.
//
// Pattern per scenario:
//   before  → admin changes the permission
//   it      → role user navigates to the module, asserts new access level
//   after   → admin RESTORES the original permission (always runs, even on failure)
//
// ⚠️  These tests mutate live role configuration on dev.ylims.com.
//     Never run in parallel with the static RBAC role spec files or dynamic_rbac.cy.js.

import { adminRolePage } from '../../support/pages/adminPages/AdminRolePage';
import { getPage }        from '../../support/pages';

// ─── Helper: Force a completely fresh session for the role user ──────────────
// After admin changes server-side permissions, the cached session would return
// stale permission data. We clear everything to ensure the next login reflects
// the latest server-side state.
function freshLogin(roleKey) {
  cy.clearAllSessions();
  cy.loginAs(roleKey, 'Arbro - Delhi');
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 1 — GRANT: Give Reception access to Price List (currently forbidden)
// ─────────────────────────────────────────────────────────────────────────────
describe('Dynamic Permissions — Grant access', () => {
  const ROLE_NAME = 'Reception';
  const ROLE_KEY  = 'reception';
  const PARENT    = 'Sample Management';
  const MODULE    = 'Price List';
  const PAGE      = getPage('sample_management_price_list');

  before(() => {
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    adminRolePage.grant(ROLE_NAME, PARENT, MODULE, { view: true });
  });

  after(() => {
    // Always restore — even when the it() block fails.
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    adminRolePage.revoke(ROLE_NAME, PARENT, MODULE);
  });

  it('Reception can now READ Price List after admin grants access', () => {
    freshLogin(ROLE_KEY);
    if (PAGE) {
      PAGE.assertCanRead();
    } else {
      cy.visit('/dashboard/price-list', { failOnStatusCode: false });
      cy.url().should('include', 'price-list');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2 — REVOKE: Remove Mailer CREATE permission from Reception
// (Reception currently has create: true for Mailer)
// ─────────────────────────────────────────────────────────────────────────────
describe('Dynamic Permissions — Revoke a single permission', () => {
  const ROLE_NAME = 'Reception';
  const ROLE_KEY  = 'reception';
  const MODULE    = 'Mailer';
  const PAGE      = getPage('support_mailer');

  before(() => {
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    adminRolePage.updatePermissions(ROLE_NAME, MODULE, { create: false });
  });

  after(() => {
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    adminRolePage.updatePermissions(ROLE_NAME, MODULE, { create: true });
  });

  it('Reception CANNOT CREATE in Mailer after admin revokes create permission', () => {
    freshLogin(ROLE_KEY);
    if (PAGE) PAGE.assertCannotCreate();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 3 — FULL REVOKE: Remove an entire module from a role, then restore
// Uses Analyst role — revoke Ticket access, verify redirect, restore.
// ─────────────────────────────────────────────────────────────────────────────
describe('Dynamic Permissions — Full module revoke then restore', () => {
  const ROLE_NAME = 'Analyst';
  const ROLE_KEY  = 'analyst';
  const PARENT    = 'Support';
  const MODULE    = 'Ticket';
  const PAGE      = getPage('support_ticket');

  before(() => {
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    adminRolePage.revoke(ROLE_NAME, PARENT, MODULE);
  });

  after(() => {
    cy.clearAllSessions();
    cy.loginAs('admin', 'Arbro - Delhi');
    // Restore Analyst's original Ticket permissions: create, read, update (no delete/approve)
    adminRolePage.grant(ROLE_NAME, PARENT, MODULE, {
      view: true, create: true, update: true, delete: false, approve: false,
    });
  });

  it('Analyst CANNOT READ Ticket after admin removes the module', () => {
    freshLogin(ROLE_KEY);
    if (PAGE) PAGE.assertCannotRead();
  });
});
