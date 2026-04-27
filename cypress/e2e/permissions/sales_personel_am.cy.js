// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Sales Personnel AM  (key: sales_personel_am)
// Modules covered: 11

import { getPage } from '../../support/pages';

const ROLE_KEY = 'sales_personel_am';
const PERMISSIONS = [
  {
    "parent_module": "Customer Relation Management",
    "sub_module": "Client Creation",
    "module_key": "customer_relation_management_client_profile",
    "url": "/dashboard/profile/client",
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
    "parent_module": "Masters Library",
    "sub_module": "Generic Master",
    "module_key": "masters_library_generic_master",
    "url": "/dashboard/products/generic-master-v2",
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
    "sub_module": "Product Master",
    "module_key": "sample_management_product_master",
    "url": "/dashboard/products/master-v2",
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
    "parent_module": "Quotation & Pricing",
    "sub_module": "Quotation",
    "module_key": "quotation_pricing_quotation",
    "url": "/dashboard/quotation/client-quotation",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
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

describe('Permissions — Sales Personnel AM', () => {
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
