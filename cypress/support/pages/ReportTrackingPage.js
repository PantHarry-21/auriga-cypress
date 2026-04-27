// URL: /dashboard/reports/dispatched
// Reports & COC > Support (Report Tracking) / Tracking Report / Report Tracking
import StandardTablePage from './StandardTablePage';

class ReportTrackingPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/to-be-compiled'; }
  get moduleKey() { return 'ReportTracking'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Report tracking is a read/query view — no create action.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportTrackingPage();
