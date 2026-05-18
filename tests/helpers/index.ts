// tests/helpers/index.ts
// Centralized exports for all helpers, page objects, and selectors

export {
  AdminRolePage
} from './AdminRolePage';

export {
  DynamicRBACManager,
  type RolePermissions,
  type RoleUser,
} from './DynamicRBACManager';

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
} from './PageObjects';

export {
  ModulePageObject,
  type ModuleConfig,
} from './ModulePageObject';

export {
  RBACPage,
  type RolePermission,
} from './RBACPage';

export {
  getRoleCredentials,
  stubStimulsoft,
  loginAs,
  clearAllSessions,
  freshLoginAs,
  getRolePermissions,
  loadFixture,
} from './commands';

export {
  YLIMS_SELECTORS,
  isChipSelected,
  isPermissionActive,
} from './selectors';
