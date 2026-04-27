// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Reception  (key: reception)
// Modules covered: 7

import { getPage } from '../../support/pages';

const ROLE_KEY = 'reception';
const PERMISSIONS = [
  {
    "parent_module": "",
    "sub_module": "Dashboard",
    "module_key": "dashboard",
    "url": "/dashboard",
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
    "sub_module": "Reception Receive Sample",
    "module_key": "sample_managemnet_reception_recieve_sample",
    "url": "/dashboard/reception/received-sample",
    "permissions": {
      "create": true,
      "read": true,
      "update": false,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "Sample Management",
    "sub_module": "Received Sample (Barcode)",
    "module_key": "sample_managemnet_received_sample",
    "url": "/dashboard/samples/receipt",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
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

describe('Permissions — Reception', () => {
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
