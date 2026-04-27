// URL: /dashboard/reports/printing  — Reports & COC > Report to be Printed (Final COA)
import StandardTablePage from './StandardTablePage';

class ReportPrintPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/to-be-printed'; }
  get moduleKey() { return 'ReportPrint'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Print queue is populated from compiled reports.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportPrintPage();
