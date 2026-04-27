// URL: /dashboard/method/method-upload  — DMS > Method Upload / View Method
import StandardTablePage from './StandardTablePage';

class MethodUploadPage extends StandardTablePage {
  get url()       { return '/dashboard/method/method-upload'; }
  get moduleKey() { return 'MethodUpload'; }
}

export default new MethodUploadPage();
