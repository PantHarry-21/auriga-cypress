// URL: /dashboard/qdms/sop
// QDMS > Department SOP — read/approve for analysts; full CRUD for quality personnel
import StandardTablePage from './StandardTablePage';

class DeptSopPage extends StandardTablePage {
  get url()       { return '/dashboard/testing/standard-operating-procedure'; }
  get moduleKey() { return 'DeptSop'; }
}

export default new DeptSopPage();
