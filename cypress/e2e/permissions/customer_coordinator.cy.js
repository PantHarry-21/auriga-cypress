// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Customer Coordinator  (key: customer_coordinator)
// Modules covered: 7

import { getPage } from '../../support/pages';

const ROLE_KEY = 'customer_coordinator';
const PERMISSIONS = [
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
    "parent_module": "Reports & COC",
    "sub_module": "Ready to Dispatch",
    "module_key": "reports_dispatch",
    "url": "/dashboard/reports/dispatch-list",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "DMS",
    "sub_module": "Methods",
    "module_key": "dms_method_upload",
    "url": "/dashboard/method/method-upload",
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
    "sub_module": "Report Tracking",
    "module_key": "reports_tracking",
    "url": "/dashboard/reports/dispatched",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
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

describe('Permissions — Customer Coordinator', () => {
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
