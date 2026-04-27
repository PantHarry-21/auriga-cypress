// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Compilation  (key: compilation)
// Modules covered: 10

import { getPage } from '../../support/pages';

const ROLE_KEY = 'compilation';
const PERMISSIONS = [
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
    "parent_module": "Reports & COC",
    "sub_module": "Report to be Compiled",
    "module_key": "reports_compilation",
    "url": "/dashboard/reports/compilation",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "Report to be Printed (Final COA)",
    "module_key": "reports_print",
    "url": "/dashboard/reports/printing",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "Final Report Upload",
    "module_key": "reports_final_upload",
    "url": "/dashboard/reports/final-upload",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "Form B",
    "module_key": "reports_form_b",
    "url": "/dashboard/reports/coc-department",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "View for Sample Updation",
    "module_key": "reports_sample_updation",
    "url": "/dashboard/reports/sample-updation",
    "permissions": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "approve": true
    }
  },
  {
    "parent_module": "Reports & COC",
    "sub_module": "Tracking Report",
    "module_key": "reports_tracking",
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
      "approve": true
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
      "approve": true
    }
  }
];

describe('Permissions — Compilation', () => {
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
