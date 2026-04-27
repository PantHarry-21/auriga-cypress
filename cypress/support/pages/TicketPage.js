// cypress/support/pages/TicketPage.js
//
// Page object for "Support > Ticket"
// URL: /dashboard/support/tickets
//
// OBSERVED 2026-04-22 (testemp/reception role):
//   - Table: table.min-w-full.divide-y.divide-gray-200
//   - Rows: tbody tr  (EMPTY by default — requires clicking 'Search' to populate)
//   - Create button: 'Generate Ticket'
//   - Action menu: not observed for reception role
//   - No data-cy attributes
//
// IMPORTANT: Table starts EMPTY. Page has a filter form with a 'Search' button.
// assertCanRead() must trigger Search first to confirm table renders.

import BasePage from './basePage';

class TicketPage extends BasePage {
  get url()              { return '/dashboard/support/tickets'; }
  get moduleKey()        { return 'Ticket'; }
  get listSelector()     { return 'table'; }
  get rowSelector()      { return 'tbody tr'; }
  get createButton()     { return 'Generate Ticket'; }
  get rowCheckbox()      { return "input[type='checkbox']"; }
  get editApproveButton(){ return null; }
  get editSaveButton()   { return null; }

  // OVERRIDE: Read — click Search to populate table, then check table is visible
  assertCanRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    cy.contains('button', 'Search').should('be.visible').click();
    return cy.get('table', { timeout: 15000 }).should('be.visible');
  }

  // OVERRIDE: assertCanCreate — check 'Generate Ticket' button
  assertCanCreate() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.contains('button', 'Generate Ticket').should('be.visible').and('not.be.disabled');
  }

  assertCannotCreate() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.get('body').then($b => {
      expect($b.find("button:contains('Generate Ticket')").length,
        'Generate Ticket button should be absent').to.equal(0);
    });
  }

  // OVERRIDE: Update — table may be empty; requires data to test
  assertCanUpdate() {
    this.assertCanRead();
    cy.get(this.rowSelector).then($rows => {
      if ($rows.length === 0) {
        cy.log('⚠️ SKIPPED: No ticket data available to test update flow.');
        return;
      }
      cy.get(this.rowSelector).first().click();
      cy.get(this.slideOver, { timeout: 10000 }).should('be.visible');
      cy.get(this.slideOver).within(() => {
        cy.contains('button', /save|update/i).should('be.visible').and('not.be.disabled');
      });
    });
  }

  assertCannotUpdate() {
    this.assertCanRead();
    cy.get(this.rowSelector).then($rows => {
      if ($rows.length === 0) {
        cy.log('⚠️ SKIPPED: No ticket data available to test update flow.');
        return;
      }
      cy.get(this.rowSelector).first().click();
      cy.get('body').then($b => {
        const panelAbsent = $b.find(this.slideOver).length === 0;
        const saveAbsent  = $b.find(this.slideOver).find("button:contains('Save')").length === 0;
        expect(panelAbsent || saveAbsent,
          'Save should not appear in slide-over for this role').to.be.true;
      });
    });
  }
}

export default new TicketPage();
