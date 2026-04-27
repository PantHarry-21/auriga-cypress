// URL: /dashboard/reports/final-upload  — Reports & COC > Final Report Upload
import StandardTablePage from './StandardTablePage';

class ReportFinalUploadPage extends StandardTablePage {
  get url()       { return '/dashboard/reports/final-report-upload'; }
  get moduleKey() { return 'ReportFinalUpload'; }
}

export default new ReportFinalUploadPage();
