// URL: /dashboard/qdms/nabl-scope  — QDMS > NABL
import StandardTablePage from './StandardTablePage';

class NablPage extends StandardTablePage {
  get url()       { return '/dashboard/nabl-scope'; }
  get moduleKey() { return 'Nabl'; }
}

export default new NablPage();
