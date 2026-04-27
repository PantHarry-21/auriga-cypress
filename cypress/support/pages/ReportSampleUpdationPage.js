// URL: /dashboard/reports/sample-updation  — Reports & COC > View for Sample Updation
import StandardTablePage from './StandardTablePage';

class ReportSampleUpdationPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/view-sample-updation'; }
  get moduleKey() { return 'ReportSampleUpdation'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Sample updation is applied to existing reports, not created.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportSampleUpdationPage();
