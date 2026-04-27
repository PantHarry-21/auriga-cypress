// URL: /dashboard/reports/coc  — Reports & COC > My Pending Test
import StandardTablePage from './StandardTablePage';

class MyPendingTestPage extends StandardTablePage {
  get url()       { return '/dashboard/analyst'; }
  get moduleKey() { return 'MyPendingTest'; }

  assertCanRead() {
    cy.visit(this.url, { failOnStatusCode: false });
    cy.get('body').should('not.contain.text', 'not authorized').and('not.contain.text', '403');
    return cy.get(this.listSelector, { timeout: 15000 }).should('exist');
  }

  assertCanCreate() {
    cy.log('ℹ️ N/A: My Pending Test has no create action — tests are assigned by dept head.');
  }

  assertCannotCreate() {
    cy.log('ℹ️ N/A: My Pending Test has no create action.');
  }
}

export default new MyPendingTestPage();
