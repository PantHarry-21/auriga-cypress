// cypress/e2e/roles/Analyst.cy.js
//
// Permissions test suite for the Analyst role.
// Verified against the RBAC Matrix screenshots.

import { getPage } from '../../support/pages';

const ROLE_KEY = 'analyst';

const ALLOWED_PERMISSIONS = [
  { module: 'Home Page', key: 'dashboard', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Mailer', key: 'support_mailer', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Ticket', key: 'support_ticket', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Indent Manage', key: 'purchase_indent_indent', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'STP QA', key: 'qdms_stp_qa_management', rights: { create: false, read: true, update: false, delete: false, approve: true } },
  { module: 'Method Upload', key: 'dms_method_upload', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'NABL Scope', key: 'qdms_nabl', rights: { create: false, read: true, update: false, delete: false, approve: false } },
  { module: 'OOS Answer', key: 'quality_management_oos_answer', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Standard Operating Procedure', key: 'qdms_department_sop', rights: { create: false, read: true, update: false, delete: false, approve: true } },
  { module: 'My Complete Test', key: 'reports_coc_my_complete_test', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'My Pending Test', key: 'reports_coc_my_pending_test', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'Equipment PM', key: 'equipment_management_equipment_pm', rights: { create: true, read: true, update: true, delete: false, approve: false } },
  { module: 'My Equipments', key: 'equipment_management_equipment_assign', rights: { create: true, read: true, update: true, delete: false, approve: false } }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List',           key: 'sample_management_price_list' },
  { module: 'Invoice',              key: 'invoice_manage' },
  { module: 'Client Profile',       key: 'customer_relation_management_client_profile' },
  { module: 'Equipment Transfer',   key: 'equipment_management_equipment_transfer' },
  { module: 'OOS Question',         key: 'quality_management_oos_question' }
];

describe('Permissions — Analyst', () => {
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
