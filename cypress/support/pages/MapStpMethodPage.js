// URL: /dashboard/stp-qa  — QDMS > Map STP Method (Quality Personnel)
import StandardTablePage from './StandardTablePage';

class MapStpMethodPage extends StandardTablePage {
  get url()       { return '/dashboard/stp-qa'; }
  get moduleKey() { return 'MapStpMethod'; }
}

export default new MapStpMethodPage();
