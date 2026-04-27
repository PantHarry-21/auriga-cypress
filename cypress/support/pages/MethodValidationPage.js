// URL: /dashboard/method/validation-upload  — DMS > Method Validation Upload (not in active use)
import StandardTablePage from './StandardTablePage';

class MethodValidationPage extends StandardTablePage {
  get url() { return '/dashboard/method/validation-upload'; }
  get createButtonRegex() { return /upload|new|add/i; }
}

export default new MethodValidationPage();
