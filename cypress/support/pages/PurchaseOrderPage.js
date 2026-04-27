// URL: /dashboard/purchase/generate-po  — Purchase & Indent > Purchase Order
import StandardTablePage from './StandardTablePage';

class PurchaseOrderPage extends StandardTablePage {
  get url() { return '/dashboard/purchase/generate-po'; }
  get moduleKey() { return 'GeneratePO'; }
}

export default new PurchaseOrderPage();
