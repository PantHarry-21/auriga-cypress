// cypress/support/pages/SampleReceiptPage.js
//
// Page object for "Sample Management > Received Sample" (Barcode / Receipt page)
// module_key: sample_managemnet_received_sample
// URL: /dashboard/samples/receipt
//
// This is DIFFERENT from SampleReceptionPage (/dashboard/reception/received-sample).
// This page is for barcode generation / sample receipt management.
//
// OBSERVED 2026-04-22 (testemp/reception):
//   - URL: /dashboard/samples/receipt  (confirmed in reception.json)
//   - Table: standard table layout observed
//   - Create button: 'Create Test Request'
//   - Reception has create:true, read:true, update:true, delete:false, approve:false
//   - Row click → slide-over panel
//   - No data-cy attributes

import BasePage from './basePage';

class SampleReceiptPage extends BasePage {
  get url()              { return '/dashboard/samples/receipt'; }
  get moduleKey()        { return 'SampleReceipt'; }
  get listSelector()     { return 'table'; }
  get rowSelector()      { return 'tbody tr'; }
  get createButton()     { return 'Create Test Request'; }
  get rowCheckbox()      { return "input[type='checkbox']"; }
  get editApproveButton(){ return null; }   // reception: approve=false
  get editSaveButton()   { return 'Save'; } // reception: update=true
}


export default new SampleReceiptPage();
