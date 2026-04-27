// URL: /dashboard/invoice/list  — Invoice > Invoice Management
// Covers: Create Invoice, Update Invoice, E-mail Invoice, Draft Invoice
import StandardTablePage from './StandardTablePage';

class InvoicePage extends StandardTablePage {
  get url()       { return '/dashboard/billing/invoice-list'; }
  get moduleKey() { return 'Invoice'; }
}

export default new InvoicePage();
