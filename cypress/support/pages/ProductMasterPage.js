// URL: /dashboard/products/master-v2  — Sample Management > Product Master
import StandardTablePage from './StandardTablePage';

class ProductMasterPage extends StandardTablePage {
  get url() { return '/dashboard/products/master-v2'; }
  get moduleKey() { return 'ProductMaster'; }
}

export default new ProductMasterPage();
