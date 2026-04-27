// URL: /dashboard/reports/compilation  — Reports & COC > Report to be Compiled
import StandardTablePage from './StandardTablePage';

class ReportCompilationPage extends StandardTablePage {
  get url() { return '/dashboard/reports/to-be-compiled'; }

  // Compilation is not created — it's pushed from upstream approval
  assertCanCreate() {
    cy.log('ℹ️ N/A: Compilation reports are pushed here from the approved results pipeline.');
  }
  assertCannotCreate() {
    cy.log('ℹ️ N/A: No create action on this page.');
  }
}

export default new ReportCompilationPage();
