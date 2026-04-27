// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Accountant (Admin)  (key: accountant_admin)
// Modules covered: 10

import { getPage } from '../../support/pages';

const ROLE_KEY = 'accountant_admin';
const PERMISSIONS = [
  {
    "parent_module": "Customer Relation Management",
    "sub_module": "Credit Approval",
    "module_key": "crm_credit_approval",
    "url": "/dashboard/profile/credit-approval",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "Sample Management",
    "sub_module": "Price Book",
    "module_key": "sample_management_price_list",
    "url": "/dashboard/price-list",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Sample Management",
    "sub_module": "Parent TRF Dashboard",
    "module_key": "sample_management_trf_master_table",
    "url": "/dashboard/samples/trf-links",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Customer Relation Management",
    "sub_module": "Client Profile",
    "module_key": "customer_relation_management_client_profile",
    "url": "/dashboard/profile/client",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Customer Relation Management",
    "sub_module": "Client PO",
    "module_key": "crm_client_po",
    "url": "/dashboard/purchase/client-po",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "Support (Report Tracking)",
    "module_key": "reports_coc_support_tracking",
    "url": "/dashboard/reports/dispatched",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Invoice",
    "sub_module": "Invoice Management",
    "module_key": "invoice_manage",
    "url": "/dashboard/invoice/list",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Support",
    "sub_module": "Mailer",
    "module_key": "support_mailer",
    "url": "/dashboard/mail/inbox",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Support",
    "sub_module": "Ticket",
    "module_key": "support_ticket",
    "url": "/dashboard/support/tickets",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Purchase & Indent",
    "sub_module": "Indent",
    "module_key": "purchase_indent_indent",
    "url": "/dashboard/purchase/indent",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  }
];

describe('Permissions — Accountant (Admin)', () => {
  before(() => cy.loginAs(ROLE_KEY));

  PERMISSIONS.forEach(mod => {
    const page = getPage(mod.module_key);

    context(`${mod.parent_module} > ${mod.sub_module}`, () => {
      Object.entries(mod.permissions).forEach(([action, allowed]) => {
        const title = `${allowed ? 'CAN' : 'CANNOT'} ${action.toUpperCase()}`;
        it(title, function () {
          if (!page) {
            this.skip();  // module not yet mapped to a page object
          }
          page.check(action, allowed);
        });
      });
    });
  });
});
