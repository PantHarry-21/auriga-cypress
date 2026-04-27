// URL: /dashboard/purchase/client-po  — CRM > Client PO
import StandardTablePage from './StandardTablePage';

class ClientPOPage extends StandardTablePage {
  get url()       { return '/dashboard/purchase/generate-po'; }
  get moduleKey() { return 'ClientPO'; }
}

export default new ClientPOPage();
