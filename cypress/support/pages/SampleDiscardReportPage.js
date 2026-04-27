// URL: /dashboard/samples/discard-report  — Sample Management > Sample Discard Report
import StandardTablePage from './StandardTablePage';

class SampleDiscardReportPage extends StandardTablePage {
  get url()       { return '/dashboard/samples/discard-report'; }
  get moduleKey() { return 'SampleDiscardReport'; }
}

export default new SampleDiscardReportPage();
