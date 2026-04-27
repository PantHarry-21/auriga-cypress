// URL: /dashboard/samples/barcode  — Sample Management > Bar Code Generation
// Read-only for most roles. Barcode generation page for received samples.
import StandardTablePage from './StandardTablePage';

class BarCodeGenerationPage extends StandardTablePage {
  get url()       { return '/dashboard/samples/receipt'; }
  get moduleKey() { return 'BarCodeGeneration'; }

  // Barcode generation is typically read-only — no standard create button
  assertCanCreate() { cy.log('ℹ️ N/A: Barcode generation has no standard create action.'); }
  assertCannotCreate() { cy.log('ℹ️ N/A: No create action on this page.'); }
}

export default new BarCodeGenerationPage();
