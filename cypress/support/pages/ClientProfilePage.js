// cypress/support/pages/ClientProfilePage.js
//
// Page object for "Customer Relation Management > Client Profile"
// URL: /dashboard/profile/client
//
// Inherits click-through logic from BasePage.

import BasePage from './basePage';

class ClientProfilePage extends BasePage {
  get url()              { return '/dashboard/profile/client'; }
  get moduleKey()        { return 'ClientProfile'; }
}

export default new ClientProfilePage();
