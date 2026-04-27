// URL: /dashboard/oos/answer  — Quality Management > OOS Answer (Analyst / Dept Reviewer / Dept Head)
import StandardTablePage from './StandardTablePage';

class OosAnswerPage extends StandardTablePage {
  get url()       { return '/dashboard/oos/answer'; }
  get moduleKey() { return 'OosAnswer'; }
}

export default new OosAnswerPage();
