// cypress/support/pages/MailerPage.js
//
// Page object for "Support > Mailer"
// URL: /dashboard/mail/inbox
//
// OBSERVED 2026-04-22 (testemp/reception role):
//   - Layout: Email-client style — NO TABLE. This is completely different from
//     all other modules. Has Inbox/Drafts/Sent/Important sidebar.
//   - Create button: 'Compose' (sidebar button)
//   - No Action menu, no row checkboxes
//   - Delete: not observed (no data in inbox during exploration)
//   - No data-cy attributes
//
// This module requires a FULL OVERRIDE of all BasePage methods because it
// has no table and no row-click slide-over pattern.

import BasePage from './basePage';

class MailerPage extends BasePage {
  get url()              { return '/dashboard/mail/inbox'; }
  get moduleKey()        { return 'Mailer'; }
  get listSelector()     { return '.email-list, [class*="inbox"], [class*="mail"]'; }
  get createButton()     { return 'Compose'; }
  get rowSelector()      { return null; }
  get rowCheckbox()      { return null; }
  get editSaveButton()   { return null; }
  get editApproveButton(){ return null; }

  // FULL OVERRIDE: Read — check that the Compose button is visible
  // (proves the mailer module loaded, even if inbox is empty)
  assertCanRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.contains('button', 'Compose').should('be.visible');
  }

  assertCannotRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.get('body').then($b => {
      const denied =
        $b.find("button:contains('Compose')").length === 0 ||
        /not authorized|forbidden|403|access denied/i.test($b.text());
      expect(denied, 'expected mailer to be inaccessible').to.be.true;
    });
  }

  // FULL OVERRIDE: Create — Compose button visible and enabled
  assertCanCreate() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.contains('button', 'Compose').should('be.visible').and('not.be.disabled');
  }

  assertCannotCreate() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.get('body').then($b => {
      expect($b.find("button:contains('Compose')").length,
        'Compose button should be absent').to.equal(0);
    });
  }

  // FULL OVERRIDE: Update — not testable without email data
  assertCanUpdate() {
    cy.log('⚠️ SKIPPED: Mailer update check requires inbox data. Compose=create only.');
    // If inbox has data, a mail open → reply is the update flow.
    // Skip until test data is available.
  }
  assertCannotUpdate() { cy.log('⚠️ SKIPPED: Mailer update check requires inbox data.'); }

  // FULL OVERRIDE: Delete — not applicable (no approve concept in mailer)
  assertCanDelete() { cy.log('⚠️ SKIPPED: Mailer delete check requires inbox data.'); }
  assertCannotDelete() { cy.log('⚠️ SKIPPED: Mailer delete requires inbox data.'); }

  // FULL OVERRIDE: Approve — mailer has no approval concept
  assertCanApprove()    { cy.log('ℹ️ N/A: Mailer has no approval concept.'); }
  assertCannotApprove() { cy.log('ℹ️ N/A: Mailer has no approval concept.'); }
}

export default new MailerPage();
