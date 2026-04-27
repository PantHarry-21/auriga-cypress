// URL: /dashboard/equipment/on-off  — Equipment Management > Equipment On/Off
import StandardTablePage from './StandardTablePage';

class EquipmentOnOffPage extends StandardTablePage {
  get url()       { return '/dashboard/equipment/on-off'; }
  get moduleKey() { return 'EquipmentOnOff'; }

  // On/Off toggle is update-only — create is marking equipment status
  assertCanCreate() {
    cy.visit(this.url, { failOnStatusCode: false });
    cy.get('body').then($b => {
      const btn = [...$b.find('button')].find(el => /on|off|toggle|status/i.test(el.textContent.trim()));
      expect(btn, 'An on/off toggle button should be present').to.exist;
    });
  }

  assertCannotCreate() {
    cy.log('ℹ️ N/A: Equipment On/Off has no create concept — status is toggled on existing records.');
  }
}

export default new EquipmentOnOffPage();
