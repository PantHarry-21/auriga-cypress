// URL: /dashboard/method/development  — DMS > Method Development (not in active use)
import StandardTablePage from './StandardTablePage';

class MethodDevelopmentPage extends StandardTablePage {
  get url()       { return '/dashboard/method/development'; }
  get moduleKey() { return 'MethodDevelopment'; }
}

export default new MethodDevelopmentPage();
