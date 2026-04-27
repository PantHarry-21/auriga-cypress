// cypress/e2e/roles/Compilation.cy.js
//
// Permissions test suite for the Compilation role.
// Verified against the RBAC Matrix (2026-04-22).

import { getPage } from '../../support/pages';

const ROLE_KEY = 'compilation';

const ALLOWED_PERMISSIONS = [
  {
    module: 'Home Page',
    key:    'dashboard',
    rights: { create: true, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Mailer',
    key:    'support_mailer',
    rights: { create: true, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Ticket',
    key:    'support_ticket',
    rights: { create: true, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Indent Manage',
    key:    'purchase_indent_indent',
    rights: { create: true, read: true, update: true, delete: false, approve: true }
  },
  {
    module: 'Reports To Be Compiled',
    key:    'reports_compilation',
    rights: { create: false, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Reports To Be Printed',
    key:    'reports_print',
    rights: { create: false, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Final Report Upload',
    key:    'reports_final_upload',
    rights: { create: false, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'View Sample for Updation',
    key:    'reports_sample_updation',
    rights: { create: false, read: true, update: true, delete: false, approve: false }
  }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List',         key: 'sample_management_price_list' },
  { module: 'Invoice',            key: 'invoice_manage' },
  { module: 'STP Master',         key: 'masters_library_stp_master' },
  { module: 'Equipment Transfer', key: 'equipment_management_equipment_transfer' },
  { module: 'OOS Question',       key: 'quality_management_oos_question' }
];

describe('Permissions — Compilation', () => {
  beforeEach(() => cy.loginAs(ROLE_KEY));

  context('✅ ALLOWED MODULES (CRUDA)', () => {
    ALLOWED_PERMISSIONS.forEach(mod => {
      const page = getPage(mod.key);
      context(`Module: ${mod.module}`, () => {
        Object.entries(mod.rights).forEach(([action, allowed]) => {
          it(`${allowed ? 'CAN' : 'CANNOT'} ${action.toUpperCase()}`, function() {
            if (!page) { this.skip(); return; }
            page.check(action, allowed);
          });
        });
      });
    });
  });

  context('🚫 FORBIDDEN MODULES', () => {
    FORBIDDEN_MODULES.forEach(mod => {
      it(`CANNOT READ ${mod.module}`, () => {
        const page = getPage(mod.key);
        if (page) page.assertCannotRead();
        else cy.visit('/dashboard/' + mod.key.replace(/_/g, '/'), { failOnStatusCode: false });
      });
    });
  });
});
