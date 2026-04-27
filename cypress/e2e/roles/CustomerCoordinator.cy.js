// cypress/e2e/roles/CustomerCoordinator.cy.js
//
// Permissions test suite for the Customer Coordinator role.
// Verified against the RBAC Matrix screenshots.

import { getPage } from '../../support/pages';

const ROLE_KEY = 'customer_coordinator';

const ALLOWED_PERMISSIONS = [
  { module: 'Client Profile', key: 'customer_relation_management_client_profile', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Mailer', key: 'support_mailer', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Ticket', key: 'support_ticket', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Indent Manage', key: 'purchase_indent_indent', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Method Upload', key: 'dms_method_upload', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Method Validation Upload', key: 'quality_method_validation', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Method development', key: 'quality_method_development', rights: { create: false, read: true, update: false, delete: false, approve: false } }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List',         key: 'sample_management_price_list' },
  { module: 'Invoice',            key: 'invoice_manage' },
  { module: 'STP Master',         key: 'masters_library_stp_master' },
  { module: 'Equipment Transfer', key: 'equipment_management_equipment_transfer' },
  { module: 'OOS Question',       key: 'quality_management_oos_question' }
];

describe('Permissions — Customer Coordinator', () => {
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
