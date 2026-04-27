// URL: /dashboard/reports/coc-department  — Reports & COC > Form B (Remarks)
import StandardTablePage from './StandardTablePage';

class ReportFormBPage extends StandardTablePage {
  get url()       { return '/dashboard/nabl-form-b'; }
  get moduleKey() { return 'ReportFormB'; }
}

export default new ReportFormBPage();
