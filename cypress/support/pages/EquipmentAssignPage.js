// URL: /dashboard/equipment/equipment  — Equipment Management > Equipment Assign
import StandardTablePage from './StandardTablePage';

class EquipmentAssignPage extends StandardTablePage {
  get url()       { return '/dashboard/equipment/equipment'; }
  get moduleKey() { return 'EquipmentAssign'; }
}

export default new EquipmentAssignPage();
