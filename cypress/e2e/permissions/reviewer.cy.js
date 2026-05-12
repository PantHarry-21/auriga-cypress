// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Reviewer  (key: reviewer)
// Modules covered: 13

import { getPage } from '../../support/pages';

const ROLE_KEY = 'reviewer';
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
    "parent_module": "Master Library",
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
    "parent_module": "Sample Management",
    "sub_module": "TRF Master Table",
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
    "parent_module": "Master Library",
    "sub_module": "STP Master",
    "module_key": "masters_library_stp_master",
    "url": "/dashboard/testing/stp",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "QDMS",
    "sub_module": "NABL",
    "module_key": "qdms_nabl",
    "url": "/dashboard/qdms/nabl-scope",
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
    "sub_module": "Method Upload",
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
    "sub_module": "Reports to be Reviewed",
    "module_key": "reports_review",
    "url": "/dashboard/reports/reviewing",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "QDMS",
    "sub_module": "Department STP QA",
    "module_key": "qdms_department_stp_qa",
    "url": "/dashboard/qdms/stp-qa",
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

describe('Permissions — Reviewer', () => {
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
