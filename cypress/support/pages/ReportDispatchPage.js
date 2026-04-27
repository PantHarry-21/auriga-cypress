// URL: /dashboard/reports/dispatch-list  — Reports & COC > Ready to Dispatch
import StandardTablePage from './StandardTablePage';

class ReportDispatchPage extends StandardTablePage {
  get url()       { return '/dashboard/dispatch/pending'; }
  get moduleKey() { return 'ReportDispatch'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Dispatch queue is populated from signed reports — no direct create.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportDispatchPage();
