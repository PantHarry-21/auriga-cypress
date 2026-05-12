// cypress/support/pages/adminPages/AdminRolePage.js
//
// Page object for Role Management → Edit Role.
// UI lives at: /dashboard/roles (list) → /dashboard/roles/edit/:id
//
// Three-step edit form:
//   Step 2 — Module Access: parent category checkboxes + sub-module chip toggles
//   Step 3 — Set Permissions: rows with VIEW/CREATE/UPDATE/DELETE/APPROVE buttons

import { YLIMS_SELECTORS, isChipSelected, isPermissionActive } from '../../ylims_selectors';

const SEL = YLIMS_SELECTORS.roleEdit;
const PERM_IDX = SEL.permissionIndices;

export default class AdminRolePage {

  // ── Navigation ────────────────────────────────────────────────────────────

  navigateToEdit(roleName) {
    cy.visit('/dashboard/roles', { timeout: 120000 });

    // Use search input if present — avoids pagination issues
    cy.get('body', { timeout: 15000 }).then($body => {
      const $search = $body.find('input[placeholder*="earch"], input[type="search"]');
      if ($search.length > 0) {
        cy.wrap($search.first()).clear().type(roleName);
        cy.wait(600);
      }
    });

    // Find the matching role card and click its first (edit) button
    cy.contains(roleName, { timeout: 15000 })
      .closest('div.p-6, div.bg-white')
      .within(() => {
        cy.get('button').first().click({ force: true });
      });

    cy.url({ timeout: 20000 }).should('include', '/dashboard/roles/edit/');
    cy.wait(1500); // allow edit form to fully render before interacting
  }

  // ── Step 2: Module Access ─────────────────────────────────────────────────

  _ensureParentCategoryEnabled(parentGroup) {
    cy.log(`📂 Ensuring parent category "${parentGroup}" is enabled`);

    cy.get(SEL.parentCategoryLabel(parentGroup))
      .first()
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.get('div.w-5.h-5').then($checkbox => {
          const classStr = $checkbox.attr('class') || '';
          // Tailwind arbitrary class check — jQuery hasClass can mishandle brackets
          const isChecked = classStr.includes('bg-[#00a6fb]') || classStr.includes('bg-blue');
          if (!isChecked) {
            cy.wrap($checkbox).click({ force: true });
            cy.wait(800); // allow sub-module chips to render
          }
        });
      });
  }

  toggleSubModule(parentGroup, subModule, enable) {
    cy.log(`🔄 Toggle sub-module "${subModule}" → ${enable ? 'ON' : 'OFF'}`);

    this._ensureParentCategoryEnabled(parentGroup);

    cy.get(SEL.moduleChip(subModule), { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible')
      .then($btn => {
        const selected = isChipSelected($btn);

        if (enable && !selected) {
          cy.wrap($btn).click({ force: true });
          cy.log(`✅ Enabled chip "${subModule}"`);
        } else if (!enable && selected) {
          cy.wrap($btn).click({ force: true });
          cy.log(`✅ Disabled chip "${subModule}"`);
        } else {
          cy.log(`ℹ️ Chip "${subModule}" already ${enable ? 'enabled' : 'disabled'} — no action`);
        }
      });

    cy.wait(1000); // allow permission grid to update
  }

  // ── Step 3: Set Permissions ──────────────────────────────────────────────

  setPermissions(subModule, permissions) {
    cy.log(`🔑 Setting permissions for "${subModule}"`);

    cy.get(SEL.permissionRow(subModule))
      .should('have.length.at.least', 1)
      .first()
      .scrollIntoView()
      .within(() => {
        Object.entries(permissions).forEach(([perm, enable]) => {
          const idx = PERM_IDX[perm.toLowerCase()];
          if (idx === undefined) return;

          cy.get(SEL.permissionButton(idx)).then($btn => {
            const active = isPermissionActive($btn);
            if ((enable && !active) || (!enable && active)) {
              cy.wrap($btn).click({ force: true });
              cy.log(`  ${enable ? '☑' : '☐'} ${perm.toUpperCase()}`);
            }
          });
        });
      });
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  save() {
    cy.log('💾 Saving role changes...');

    // If no actual change was made the button stays disabled — that's fine, skip silently.
    cy.contains('button', 'Update Role').scrollIntoView().then($btn => {
      if ($btn.is(':disabled')) {
        cy.log('ℹ️ No changes detected — Update Role button is disabled, skipping save.');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.url({ timeout: 30000 }).should('include', '/dashboard/roles');
        cy.log('✅ Role saved successfully');
      }
    });
  }

  // ── Combined convenience methods ─────────────────────────────────────────

  grant(roleName, parentGroup, subModule, permissions = { view: true }) {
    cy.log(`🟢 GRANT: "${subModule}" to role "${roleName}"`);
    this.navigateToEdit(roleName);
    this.toggleSubModule(parentGroup, subModule, true);
    this.setPermissions(subModule, permissions);
    this.save();
  }

  revoke(roleName, parentGroup, subModule) {
    cy.log(`🔴 REVOKE: "${subModule}" from role "${roleName}"`);
    this.navigateToEdit(roleName);
    this.toggleSubModule(parentGroup, subModule, false);
    this.save();
  }

  updatePermissions(roleName, subModule, permissions) {
    cy.log(`🔧 UPDATE PERMS: "${subModule}" for role "${roleName}"`);
    this.navigateToEdit(roleName);
    this.setPermissions(subModule, permissions);
    this.save();
  }
}

export const adminRolePage = new AdminRolePage();
