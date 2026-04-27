// URL: /dashboard/qdms/stp-qa
// QDMS > Department STP QA  — read-only view for analysts/reviewers; approve for dept heads/analysts
import StandardTablePage from './StandardTablePage';

class DeptStpQaPage extends StandardTablePage {
  get url()       { return '/dashboard/testing/stp-groups'; }
  get moduleKey() { return 'DeptStpQa'; }
}

export default new DeptStpQaPage();
