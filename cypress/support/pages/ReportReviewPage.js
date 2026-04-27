// URL: /dashboard/reports/reviewing  — Reports & COC > Reports to be Reviewed
import StandardTablePage from './StandardTablePage';

class ReportReviewPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/to-be-reviewed'; }
  get moduleKey() { return 'ReportReview'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Review queue is populated from compilation — no direct create.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportReviewPage();
