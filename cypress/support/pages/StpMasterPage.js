// URL: /dashboard/testing/stp  — Masters Library > STP Master
import StandardTablePage from './StandardTablePage';

class StpMasterPage extends StandardTablePage {
  get url()       { return '/dashboard/testing/stp-master-v2'; }
  get moduleKey() { return 'StpMaster'; }
}

export default new StpMasterPage();
