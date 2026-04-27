// StandardTablePage — extends BasePage.
// Inherits full click-through assertions (Create/Read/Update/Delete/Approve) from BasePage.
// Standardizes button labels for common modules.

import BasePage from './basePage';

export default class StandardTablePage extends BasePage {
  get editSaveButton()    { return 'Save'; }
  get editApproveButton() { return 'Approve'; }

  // Note: assertCanCreate and others are now inherited from BasePage
  // and use the universal .border-b-0 > .flex > .sm\:px-4 selector.
}
