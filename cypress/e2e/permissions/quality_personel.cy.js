// AUTO-GENERATED from roles-permissions.json — do not edit by hand.
// Regenerate:  node scripts/generate-role-specs.js
//
// Role: Quality Personnel  (key: quality_personel)
// Modules covered: 13

import { getPage } from '../../support/pages';

const ROLE_KEY = 'quality_personel';
const PERMISSIONS = [
  {
    "parent_module": "DMS",
    "sub_module": "Method Upload",
    "module_key": "dms_method_upload",
    "url": "/dashboard/method/method-upload",
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
    "sub_module": "SOP Management",
    "module_key": "qdms_sop_management",
    "url": "/dashboard/qdms/sop",
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
    "sub_module": "Equipment Transfer",
    "module_key": "equipment_management_equipment_transfer",
    "url": "/dashboard/equipment/transfer",
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
    "sub_module": "STP QA Management",
    "module_key": "qdms_stp_qa_management",
    "url": "/dashboard/qdms/stp-qa",
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
    "sub_module": "Map STP Method",
    "module_key": "quality_map_stp_method",
    "url": "/dashboard/stp-qa",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
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
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "DMS",
    "sub_module": "Method Validation Upload",
    "module_key": "quality_method_validation",
    "url": "/dashboard/method/validation-upload",
    "permissions": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "Quality Management",
    "sub_module": "OOS Management",
    "module_key": "quality_management_oos_question",
    "url": "/dashboard/oos/question",
    "permissions": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false,
      "approve": false
    }
  },
  {
    "parent_module": "DMS",
    "sub_module": "Method Development",
    "module_key": "quality_method_development",
    "url": "/dashboard/method/development",
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
      "create": true,
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

describe('Permissions — Quality Personnel', () => {
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
