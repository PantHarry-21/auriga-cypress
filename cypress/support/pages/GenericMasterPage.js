// URL: /dashboard/products/generic-master-v2  — Masters Library > Generic Master
import StandardTablePage from './StandardTablePage';

class GenericMasterPage extends StandardTablePage {
  get url()       { return '/dashboard/products/generic-master-v2'; }
  get moduleKey() { return 'GenericMaster'; }
}

export default new GenericMasterPage();
