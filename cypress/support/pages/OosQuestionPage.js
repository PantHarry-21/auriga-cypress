// URL: /dashboard/oos/question  — Quality Management > OOS Question (Quality Personnel / Manager)
import StandardTablePage from './StandardTablePage';

class OosQuestionPage extends StandardTablePage {
  get url()       { return '/dashboard/oos/question'; }
  get moduleKey() { return 'OosQuestion'; }
}

export default new OosQuestionPage();
