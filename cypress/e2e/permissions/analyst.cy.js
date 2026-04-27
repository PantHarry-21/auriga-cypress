// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Analyst  (key: analyst)
// Modules covered: 12

import { getPage } from '../../support/pages';

const ROLE_KEY = 'analyst';
const PERMISSIONS = [
  {
    "parent_module": "Reports & COC",
    "sub_module": "My Pending Test",
    "module_key": "reports_coc_my_pending_test",
    "url": "/dashboard/reports/coc",
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
    "sub_module": "My Complete Test",
    "module_key": "reports_coc_my_complete_test",
    "url": "/dashboard/reports/my-complete-test",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Quality Management Communication",
    "sub_module": "OOS Answer",
    "module_key": "quality_management_oos_answer",
    "url": "/dashboard/oos/answer",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Equipment Management",
    "sub_module": "Equipment PM",
    "module_key": "equipment_management_equipment_pm",
    "url": "/dashboard/equipment/pm",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Equipment Management",
    "sub_module": "Equipment On/Off",
    "module_key": "equipment_management_equipment_on_off",
    "url": "/dashboard/equipment/on-off",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
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
      "approve": true
    }
  },
  {
    "parent_module": "QDMS",
    "sub_module": "Department SOP",
    "module_key": "qdms_department_sop",
    "url": "/dashboard/qdms/sop",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": true
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

describe('Permissions — Analyst', () => {
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
