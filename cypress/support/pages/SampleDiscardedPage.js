// URL: /dashboard/samples/discard  — Sample Management > Sample Discard
import StandardTablePage from './StandardTablePage';

class SampleDiscardedPage extends StandardTablePage {
  get url()       { return '/dashboard/samples/discarded'; }
  get moduleKey() { return 'SampleDiscarded'; }
}

export default new SampleDiscardedPage();
