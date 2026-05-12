/// <reference types="cypress" />
import { adminRolePage } from '../../support/pages/adminPages/AdminRolePage';

describe('Debug Dynamic RBAC - Reception', () => {
  const location = 'Arbro - Delhi';
  const roleName = 'Reception';
  const moduleName = 'Price List';
  const parentCategory = 'Sample Management';
  const moduleUrl = '/dashboard/price-list';
  const grantPermissions = { view: true };

  const freshLogin = (roleKey, loc) => {
    cy.freshLoginAs(roleKey, loc);
  };

  // Uses href attribute — works regardless of sidebar collapse state.
  // The app only enforces RBAC via sidebar visibility, not URL access.
  const assertNavHasLink = (url) => {
    cy.visit('/dashboard', { timeout: 120000 });
    cy.wait(2000);
    cy.get(`a[href="${url}"]`, { timeout: 10000 }).should('exist');
  };

  const assertNavLacksLink = (url) => {
    cy.visit('/dashboard', { timeout: 120000 });
    cy.wait(2000);
    cy.get(`a[href="${url}"]`).should('not.exist');
  };

  it('Full Cycle for Reception', () => {
    // 1. GRANT
    freshLogin('admin', location);
    adminRolePage.grant(roleName, parentCategory, moduleName, grantPermissions);

    // 2. VERIFY
    freshLogin('reception', location);
    assertNavHasLink(moduleUrl);

    // 3. REVOKE
    freshLogin('admin', location);
    adminRolePage.revoke(roleName, parentCategory, moduleName);

    // 4. VERIFY REVOKE
    freshLogin('reception', location);
    assertNavLacksLink(moduleUrl);
  });
});
