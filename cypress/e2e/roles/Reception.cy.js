// cypress/e2e/roles/Reception.cy.js
//
// Permissions test suite for the Reception role.
// Verified against the RBAC Matrix (2026-04-22).

import { getPage } from '../../support/pages';

const ROLE_KEY = 'reception';

const ALLOWED_PERMISSIONS = [
  { module: 'Home Page', key: 'dashboard', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Bar Code Generation', key: 'sample_management_barcode_generation', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'TRF Links', key: 'sample_management_trf_master_table', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Reception Received Sample', key: 'sample_managemnet_reception_recieve_sample', rights: { create: true, read: true, update: true, delete: false, approve: true } },
  { module: 'Archive Samples', key: 'sample_management_archive_samples', rights: { create: true, read: true, update: true, delete: false, approve: true } },
  { module: 'Sample Discarded', key: 'sample_management_sample_discarded', rights: { create: true, read: true, update: true, delete: false, approve: true } },
  { module: 'Sample Discard Report', key: 'sample_management_sample_discard_report', rights: { create: true, read: true, update: true, delete: false, approve: true } },
  { module: 'Client Profile', key: 'customer_relation_management_client_profile', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'Mailer', key: 'support_mailer', rights: { create: true, read: true, update: true, delete: true, approve: false } },
  { module: 'Ticket', key: 'support_ticket', rights: { create: true, read: true, update: true, delete: true, approve: false } },
  { module: 'Indent Manage', key: 'purchase_indent_indent', rights: { create: true, read: true, update: true, delete: false, approve: false } }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List', key: 'sample_management_price_list' },
  { module: 'Invoice', key: 'invoice_manage' },
  { module: 'STP Master', key: 'masters_library_stp_master' }
];

describe('Permissions — Reception', () => {
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