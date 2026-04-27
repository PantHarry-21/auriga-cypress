// URL: /dashboard/equipment/pm  — Equipment Management > Equipment PM
import StandardTablePage from './StandardTablePage';

class EquipmentPmPage extends StandardTablePage {
  get url()       { return '/dashboard/equipment/pm'; }
  get moduleKey() { return 'EquipmentPm'; }
}

export default new EquipmentPmPage();
