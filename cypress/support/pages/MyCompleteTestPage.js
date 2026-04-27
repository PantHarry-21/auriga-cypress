// URL: /dashboard/reports/my-complete-test  — Reports & COC > My Complete Test
import StandardTablePage from './StandardTablePage';

class MyCompleteTestPage extends StandardTablePage {
  get url()       { return '/dashboard/analyst/my-complete-test'; }
  get moduleKey() { return 'MyCompleteTest'; }

  assertCanCreate() {
    cy.log('ℹ️ N/A: My Complete Test has no create action — results are entered against assigned tests.');
  }

  assertCannotCreate() {
    cy.log('ℹ️ N/A: My Complete Test has no create action.');
  }
}

export default new MyCompleteTestPage();
