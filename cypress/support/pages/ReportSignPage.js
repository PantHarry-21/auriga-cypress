// URL: /dashboard/reports/signing  — Reports & COC > Reports to be Signed
import StandardTablePage from './StandardTablePage';

class ReportSignPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/to-be-signed'; }
  get moduleKey() { return 'ReportSign'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Signing queue is populated from reviewed reports — no direct create.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new ReportSignPage();
