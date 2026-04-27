// URL: /dashboard/profile/credit-approval  — CRM > Credit Approval
import StandardTablePage from './StandardTablePage';

class CreditApprovalPage extends StandardTablePage {
  get url() { return '/dashboard/profile/credit-approval'; }
  get moduleKey() { return 'CreditApproval'; }

  assertCanCreate() { cy.log('ℹ️ N/A: Credit approvals are raised by AM — accountant only reviews and approves.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new CreditApprovalPage();
