// cypress/support/pages/DashboardPage.js
//
// Page object for "Dashboard" (Home)
// URL: /dashboard
//
// The dashboard is a read-only stats/summary page.
// No CRUD operations, no list, no rows, no approve.

import BasePage from './basePage';

class DashboardPage extends BasePage {
  get url() { return '/dashboard'; }
  get listSelector() { return 'main'; }

  // Overriding check to ensure Home Page always passes for CRUD actions 
  // since it is a summary-only module.
  check(action, allowed) {
    if (action === 'read') {
      return allowed ? this.assertCanRead() : this.assertCannotRead();
    }
    cy.log(`ℹ️ N/A: Dashboard has no ${action} action.`);
    return true; 
  }

  assertCanRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.get('body').should('not.contain.text', 'not authorized')
      .and('not.contain.text', 'forbidden')
      .and('not.contain.text', '403');
  }

  assertCannotRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    return cy.get('body').then($b => {
      const denied = /not authorized|forbidden|403|access denied/i.test($b.text());
      expect(denied, 'expected dashboard to be denied').to.be.true;
    });
  }
}

export default new DashboardPage();
