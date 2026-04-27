// cypress/support/pages/IndentPage.js
//
// Page object for "Purchase & Indent > Indent Manage"
// URL: /dashboard/purchase/indent
//
// OBSERVED 2026-04-22 (testemp/reception role):
//   - Table: table.min-w-full.divide-y.divide-gray-200
//   - Rows: tbody tr  (EMPTY by default during exploration)
//   - Create button: 'New Indent'
//   - 'Columns' button present — column visibility toggle, NOT an Action menu
//   - No Delete Action menu found for reception role
//   - No data-cy attributes

import BasePage from './basePage';

class IndentPage extends BasePage {
  get url() { return '/dashboard/purchase/indent'; }
  get moduleKey() { return 'IndentManage'; }
  get listSelector() { return 'table'; }
  get rowSelector() { return 'tbody tr'; }
  get createButton() { return 'New Indent'; }
  get rowCheckbox() { return "input[type='checkbox']"; }
  get editApproveButton() { return null; }
  get editSaveButton() { return null; }
}


export default new IndentPage();
