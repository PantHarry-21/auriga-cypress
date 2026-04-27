// cypress/e2e/roles/Reviewer.cy.js
//
// Permissions test suite for the Reviewer role.
// Verified against the RBAC Matrix screenshots.

import { getPage } from '../../support/pages';

const ROLE_KEY = 'reviewer';

const ALLOWED_PERMISSIONS = [
  { module: 'Reception Received Sample', key: 'sample_managemnet_reception_recieve_sample', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Archive Samples', key: 'sample_management_archive_samples', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Sample Discarded', key: 'sample_management_sample_discarded', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Sample Discard Report', key: 'sample_management_sample_discard_report', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Client Profile', key: 'customer_relation_management_client_profile', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Mailer', key: 'support_mailer', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Ticket', key: 'support_ticket', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Indent Manage', key: 'purchase_indent_indent', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Generic Master', key: 'masters_library_generic_master', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Product Master', key: 'sample_management_product_master', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'STP Master', key: 'masters_library_stp_master', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Method Upload', key: 'dms_method_upload', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'NABL Scope', key: 'qdms_nabl', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Reports To Be Reviewed', key: 'reports_review', rights: { create: false, read: true, update: false, delete: false, approve: true } }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List',         key: 'sample_management_price_list' },
  { module: 'Invoice',            key: 'invoice_manage' },
  { module: 'Equipment Transfer', key: 'equipment_management_equipment_transfer' },
  { module: 'OOS Question',       key: 'quality_management_oos_question' },
  { module: 'Credit Approval',    key: 'crm_credit_approval' }
];

describe('Permissions — Reviewer', () => {
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
