// URL: /dashboard/quotation/client-quotation  — Quotation & Pricing > Quotation
import StandardTablePage from './StandardTablePage';

class QuotationPage extends StandardTablePage {
  get url()       { return '/dashboard/quotation/client'; }
  get moduleKey() { return 'Quotation'; }
}

export default new QuotationPage();
