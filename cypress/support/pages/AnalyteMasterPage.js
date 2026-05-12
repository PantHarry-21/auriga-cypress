// cypress/support/pages/AnalyteMasterPage.js
//
// URL: /dashboard/products/parameters-v2
// Master Library > Parameters (Analyte Master)
// Used by: Master Personal (C/R/U), Master Controller (C/R/U + Approve)

import StandardTablePage from './StandardTablePage';

class AnalyteMasterPage extends StandardTablePage {
  get url() { return '/dashboard/testing/analyt-master-v2'; }
  get moduleKey() { return 'AnalyteMaster'; }
}

export default new AnalyteMasterPage();
