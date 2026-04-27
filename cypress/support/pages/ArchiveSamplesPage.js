// URL: /dashboard/samples/archive  — Sample Management > Archive Samples
import StandardTablePage from './StandardTablePage';

class ArchiveSamplesPage extends StandardTablePage {
  get url()       { return '/dashboard/samples/archive'; }
  get moduleKey() { return 'ArchiveSamples'; }
}

export default new ArchiveSamplesPage();
