// URL: /dashboard/equipment/transfer  — Equipment Management > Equipment Transfer
import StandardTablePage from './StandardTablePage';

class EquipmentTransferPage extends StandardTablePage {
  get url()       { return '/dashboard/equipment/transfer'; }
  get moduleKey() { return 'EquipmentTransfer'; }
}

export default new EquipmentTransferPage();
