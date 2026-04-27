// URL: /dashboard/price-list  — Sample Management > Price List / Price Book
import StandardTablePage from './StandardTablePage';

class PriceListPage extends StandardTablePage {
  get url() { return '/dashboard/price-list'; }
  get moduleKey() { return 'PriceList'; }
}

export default new PriceListPage();
