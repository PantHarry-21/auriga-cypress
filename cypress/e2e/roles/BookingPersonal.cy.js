// cypress/e2e/roles/BookingPersonal.cy.js
//
// Permissions test suite for the Booking Personal role.
// Verified against the RBAC Matrix (2026-04-22).

import { getPage } from '../../support/pages';

const ROLE_KEY = 'booking_personel';

const ALLOWED_PERMISSIONS = [
  {
    module: 'Home Page',
    key:    'dashboard',
    rights: { create: true, read: true, update: true, delete: true, approve: true }
  },
  {
    module: 'Client Profile',
    key:    'customer_relation_management_client_profile',
    rights: { create: false, read: true, update: false, delete: false, approve: false }
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
    rights: { create: true, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Generate PO',
    key:    'purchase_indent_purchase_order',
    rights: { create: true, read: true, update: true, delete: false, approve: false }
  },
  {
    module: 'Client Quotation',
    key:    'quotation_pricing_quotation',
    rights: { create: false, read: true, update: false, delete: false, approve: false }
  },
  {
    module: 'Product Master',
    key:    'sample_management_product_master',
    rights: { create: false, read: true, update: false, delete: false, approve: false }
  }
];

const FORBIDDEN_MODULES = [
  { module: 'Price List',         key: 'sample_management_price_list' },
  { module: 'Invoice',            key: 'invoice_manage' },
  { module: 'STP Master',         key: 'masters_library_stp_master' },
  { module: 'Method Upload',      key: 'dms_method_upload' },
  { module: 'Equipment Transfer', key: 'equipment_management_equipment_transfer' },
  { module: 'OOS Question',       key: 'quality_management_oos_question' }
];

describe('Permissions — Booking Personnel', () => {
  beforeEach(() => cy.loginAs(ROLE_KEY));

  // 1. VERIFY ALLOWED ACCESS & CRUDA
  context('✅ ALLOWED MODULES (CRUDA)', () => {
    ALLOWED_PERMISSIONS.forEach(mod => {
      const page = getPage(mod.key);

      context(`Module: ${mod.module}`, () => {
        Object.entries(mod.rights).forEach(([action, allowed]) => {
          it(`${allowed ? 'CAN' : 'CANNOT'} ${action.toUpperCase()}`, function() {
            if (!page) {
              cy.log(`⚠️ Module "${mod.key}" has no page object — skipping.`);
              this.skip();
              return;
            }
            page.check(action, allowed);
          });
        });
      });
    });
  });

  // 2. VERIFY FORBIDDEN ROUTES
  context('🚫 FORBIDDEN MODULES', () => {
    FORBIDDEN_MODULES.forEach(mod => {
      it(`CANNOT READ ${mod.module}`, () => {
        const page = getPage(mod.key);
        if (page) {
          page.assertCannotRead();
        } else {
          cy.log(`⚠️ No page object for ${mod.key} — verifying URL directly.`);
          cy.visit(mod.key.includes('/') ? mod.key : `/dashboard/${mod.key.replace(/_/g, '/')}`, { failOnStatusCode: false });
          cy.contains(/not authorized|forbidden|403|access denied/i, { timeout: 10000 }).should('be.visible');
        }
      });
    });
  });
});
