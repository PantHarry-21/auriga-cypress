// tests/helpers/index.ts
// Centralized exports for all helpers

export {
  getRoleCredentials,
  stubStimulsoft,
  loginAs,
  clearAllSessions,
  clearRoleSession,
  freshLoginAs,
  getRolePermissions,
  loadFixture,
  captureLocalStorage,
  restoreLocalStorage,
} from './commands';

export {
  YLIMS_SELECTORS,
  isChipSelected,
  isPermissionActive,
} from './selectors';

export {
  BasePage,
  GenericMasterPage,
  ProductMasterPage,
  ParameterMasterPage,
  StpMasterPage,
  StpGroupPage,
  EmployeeProfilePage,
  MethodDevelopmentPage,
  MethodUploadPage,
  MethodValidationUploadPage,
  IndentManagementPage,
  AdminIndentPage,
  ClientQuotationPage,
  ClientProductPricingPage,
  SegmentationServicesPage,
} from './PageObjects';
