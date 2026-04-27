// URL: /dashboard/samples/booking  — Sample Management > Book Sample (TRF)
import StandardTablePage from './StandardTablePage';

class BookSamplePage extends StandardTablePage {
  get url()       { return '/dashboard/samples/booking'; }
  get moduleKey() { return 'BookSample'; }
}

export default new BookSamplePage();
