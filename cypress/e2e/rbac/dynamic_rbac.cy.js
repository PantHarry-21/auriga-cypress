/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Dynamic RBAC — Grant / Verify / Revoke / Verify
// ═══════════════════════════════════════════════════════════════════════════════
//
// Flow per scenario:
//   1. Admin grants a module to the role → saves
//   2. Role user visits /dashboard — verifies the nav link EXISTS
//   3. Admin revokes the module → saves
//   4. Role user visits /dashboard — verifies the nav link DOES NOT EXIST
//
// NOTE: This app enforces RBAC only through sidebar visibility.
// URL-level access is NOT restricted by the app, so URL assertions are not used.
//
// Nav link detection uses `a[href="${moduleUrl}"]` so it works regardless of
// whether the sidebar is in expanded (text) or collapsed (icon-only) mode.
//
// An after() hook per scenario always revokes to keep state clean.
//
// ⚠️ These tests mutate live role config. Never run in parallel with static specs.
// ═══════════════════════════════════════════════════════════════════════════════

import { adminRolePage } from '../../support/pages/adminPages/AdminRolePage';

const fixtureData = require('../../fixtures/dynamic_rbac_data.json');
const location = fixtureData.location || 'Arbro - Delhi';

describe('Dynamic RBAC — Permission Grant & Revoke Verification', () => {

  const freshLogin = (roleKey, loc) => {
    cy.freshLoginAs(roleKey, loc);
  };

  // Check that the sidebar contains a nav link to the given URL.
  // Uses href attribute — works in both collapsed (icon) and expanded (text) sidebar.
  const assertNavHasLink = (moduleUrl) => {
    cy.visit('/dashboard', { timeout: 120000 });
    cy.wait(2000); // allow sidebar to fully render
    cy.get(`a[href="${moduleUrl}"]`, { timeout: 10000 }).should('exist');
    cy.log(`✅ Nav link for ${moduleUrl} exists`);
  };

  // Check that the sidebar does NOT contain a nav link to the given URL.
  const assertNavLacksLink = (moduleUrl) => {
    cy.visit('/dashboard', { timeout: 120000 });
    cy.wait(2000);
    cy.get(`a[href="${moduleUrl}"]`).should('not.exist');
    cy.log(`✅ Nav link for ${moduleUrl} absent`);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  fixtureData.rolesToTest.forEach((role) => {
    describe(`Role: ${role.name} (${role.roleKey})`, () => {

      role.scenarios.forEach((scenario, scenarioIdx) => {

        describe(`Scenario ${scenarioIdx + 1}: ${scenario.description}`, () => {

          // Always revoke after the scenario (pass OR fail) so live state stays clean.
          after(() => {
            cy.log(`🧹 Cleanup: revoking "${scenario.moduleName}" from ${role.name}`);
            freshLogin('admin', location);
            adminRolePage.revoke(role.name, scenario.parentCategory, scenario.moduleName);
          });

          // ─── PHASE 1: GRANT ────────────────────────────────────────────
          it(`[ADMIN] Grant "${scenario.moduleName}" to ${role.name}`, () => {
            freshLogin('admin', location);
            adminRolePage.grant(
              role.name,
              scenario.parentCategory,
              scenario.moduleName,
              scenario.grantPermissions
            );
          });

          // ─── PHASE 2: VERIFY GRANT ─────────────────────────────────────
          it(`[${role.name}] Nav link for "${scenario.moduleName}" exists after grant`, () => {
            freshLogin(role.roleKey, location);
            assertNavHasLink(scenario.moduleUrl);
          });

          // ─── PHASE 3: REVOKE ───────────────────────────────────────────
          it(`[ADMIN] Revoke "${scenario.moduleName}" from ${role.name}`, () => {
            freshLogin('admin', location);
            adminRolePage.revoke(
              role.name,
              scenario.parentCategory,
              scenario.moduleName
            );
          });

          // ─── PHASE 4: VERIFY REVOKE ────────────────────────────────────
          it(`[${role.name}] Nav link for "${scenario.moduleName}" absent after revoke`, () => {
            freshLogin(role.roleKey, location);
            assertNavLacksLink(scenario.moduleUrl);
          });

        }); // end scenario describe
      }); // end scenarios forEach
    }); // end role describe
  }); // end roles forEach
});
