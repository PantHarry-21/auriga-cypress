// cypress/support/pages/SampleReceptionPage.js
//
// Page object for "Sample Management > Reception Receive Sample"
// URL: /dashboard/reception/received-sample
//
// Inherits click-through logic from BasePage.
// Uses custom assertCanRead due to tab-based layout.

import BasePage from './basePage';

class SampleReceptionPage extends BasePage {
  get url()              { return '/dashboard/reception/received-sample'; }
  get editApproveButton(){ return 'Approve'; }

  // OVERRIDE: page has Pending/Approved/Rejected tabs — check that tab exists
  assertCanRead() {
    this.visit();
    cy.log('📌 STEP: Verify page loaded (Pending tab visible)');
    cy.contains('button', 'Pending', { timeout: 15000 }).should('be.visible');
    cy.log('✅ CAN READ verified');
  }
}

export default new SampleReceptionPage();