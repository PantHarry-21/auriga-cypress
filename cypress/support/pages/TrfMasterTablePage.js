// URL: /dashboard/samples/trf-links  — Sample Management > TRF Master Table
import StandardTablePage from './StandardTablePage';

class TrfMasterTablePage extends StandardTablePage {
  get url() { return '/dashboard/samples/trf-links'; }
  get moduleKey() { return 'TrfMasterTable'; }
}

export default new TrfMasterTablePage();
