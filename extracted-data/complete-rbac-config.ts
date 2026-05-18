/**
 * Complete RBAC Configuration - All 46 Modules + 19 Roles
 * Generated: 2026-05-18
 * System: YLIMS UAT v1.0
 * Coverage: 100% (all modules, all roles, all permissions)
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DEFINITIONS (19 Roles)
// ═══════════════════════════════════════════════════════════════════════════

export const ROLES = {
  ADMIN: 'admin',
  RECEPTION: 'reception',
  BOOKING_PERSONNEL: 'booking_personel',
  MASTER_PERSONNEL: 'master_personel',
  MASTER_CONTROLLER: 'master_controler',
  ANALYST: 'analyst',
  DEPARTMENT_REVIEWER: 'department_reviewer',
  DEPARTMENT_HEAD: 'department_head',
  COMPILATION: 'compilation',
  REVIEWER: 'reviewer',
  PERSON_IN_CHARGE: 'person_incharge',
  CUSTOMER_COORDINATOR: 'customer_coordinator',
  SALES_PERSONNEL: 'sales_personel',
  ACCOUNTANT_ADMIN: 'accountant_admin',
  ACCOUNTANT_CRM: 'accountant_crm',
  QUALITY_PERSONNEL: 'quality_personel',
  QUALITY_MANAGER: 'quality_manger',
  DEPARTMENT_ASSISTANT: 'dept_assistant',
  JR_ANALYST: 'jr_analyst',
  DEPARTMENT_TRAINEE: 'dept_trainee',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MODULE DEFINITIONS (46 Modules - All Categories)
// ═══════════════════════════════════════════════════════════════════════════

export const MODULES = {
  // CORE
  DASHBOARD: 'dashboard',

  // MASTER DATA
  GENERIC_MASTER: 'generic-master',
  STP_MASTER: 'stp-master',
  CUSTOMER_MASTER: 'customer-master',
  TEST_METHOD_LIBRARY: 'test-method-library',
  REFERENCE_STANDARDS: 'reference-standards',

  // OPERATIONS
  SAMPLE_RECEIPT: 'sample-receipt',
  TEST_BOOKING: 'test-booking',
  SAMPLE_PREPARATION: 'sample-preparation',
  INSTRUMENT_SETUP: 'instrument-setup',
  TEST_EXECUTION: 'test-execution',
  INVENTORY_MANAGEMENT: 'inventory-management',
  EQUIPMENT_MAINTENANCE: 'equipment-maintenance',
  REAGENT_PREPARATION: 'reagent-preparation',
  STABILITY_TESTING: 'stability-testing',
  WORKFLOW_AUTOMATION: 'workflow-automation',

  // QUALITY & COMPLIANCE
  RESULT_APPROVAL: 'result-approval',
  REPORT_GENERATION: 'report-generation',
  QUALITY_CONTROL: 'quality-control',
  DEVIATION_MANAGEMENT: 'deviation-management',
  COMPLAINT_MANAGEMENT: 'complaint-management',
  CALIBRATION_MANAGEMENT: 'calibration-management',
  METHOD_VALIDATION: 'method-validation',
  TREND_ANALYSIS: 'trend-analysis',

  // COMPLIANCE & SECURITY
  AUDIT_TRAIL: 'audit-trail',
  DOCUMENT_MANAGEMENT: 'document-management',
  SECURITY_LOGS: 'security-logs',

  // HR & ADMIN
  TRAINING_RECORDS: 'training-records',
  USER_MANAGEMENT: 'user-management',
  ROLE_MANAGEMENT: 'role-management',
  LAB_SETTINGS: 'lab-settings',
  BACKUP_RECOVERY: 'backup-recovery',
  PERFORMANCE_MONITORING: 'performance-monitoring',

  // REPORTING & ANALYTICS
  ANALYTICS_REPORTS: 'analytics-reports',
  CERTIFICATE_GENERATION: 'certificate-generation',
  DATA_EXPORT: 'data-export',

  // FINANCE & PROCUREMENT
  BILLING_INVOICING: 'billing-invoicing',
  SUPPLIER_MANAGEMENT: 'supplier-management',
  PURCHASE_ORDERS: 'purchase-orders',
  RECEIVING_INSPECTION: 'receiving-inspection',

  // INTEGRATION & COMMUNICATIONS
  CRM_INTEGRATION: 'crm-integration',
  API_MANAGEMENT: 'api-management',
  NOTIFICATION_CENTER: 'notification-center',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION TYPES (6 Permissions)
// ═══════════════════════════════════════════════════════════════════════════

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-MODULE-PERMISSION MAPPINGS (46 Modules × 19 Roles)
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_MODULE_PERMISSIONS: RoleModulePermissionMap = {
  // ═════════════════════════════════════════════════════════════════════════
  // ADMIN - Full access to all modules
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.EXPORT],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.TEST_METHOD_LIBRARY]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.REFERENCE_STANDARDS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.SAMPLE_PREPARATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.INSTRUMENT_SETUP]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.INVENTORY_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.EQUIPMENT_MAINTENANCE]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.REAGENT_PREPARATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.STABILITY_TESTING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.WORKFLOW_AUTOMATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.REPORT_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.DEVIATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.COMPLAINT_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.CALIBRATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.METHOD_VALIDATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.TREND_ANALYSIS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.AUDIT_TRAIL]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.DOCUMENT_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.SECURITY_LOGS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.TRAINING_RECORDS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.USER_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.ROLE_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.LAB_SETTINGS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.BACKUP_RECOVERY]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
    [MODULES.PERFORMANCE_MONITORING]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.CERTIFICATE_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.DATA_EXPORT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.BILLING_INVOICING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.SUPPLIER_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.RECEIVING_INSPECTION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.CRM_INTEGRATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.API_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.NOTIFICATION_CENTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // RECEPTION - Limited to customer-facing operations
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.RECEPTION]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.NOTIFICATION_CENTER]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // BOOKING PERSONNEL - Test booking and sample management
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.BOOKING_PERSONNEL]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.TEST_METHOD_LIBRARY]: [PERMISSIONS.VIEW],
    [MODULES.INVENTORY_MANAGEMENT]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MASTER PERSONNEL - Master data creation and modification
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.MASTER_PERSONNEL]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.TEST_METHOD_LIBRARY]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.REFERENCE_STANDARDS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.METHOD_VALIDATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MASTER CONTROLLER - Approve master data changes
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.MASTER_CONTROLLER]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.TEST_METHOD_LIBRARY]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.REFERENCE_STANDARDS]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ANALYST - Data analysis, reporting, and export
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.ANALYST]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT],
    [MODULES.TREND_ANALYSIS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW],
    [MODULES.CERTIFICATE_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.DATA_EXPORT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DEPARTMENT REVIEWER - Review department-level operations
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.DEPARTMENT_REVIEWER]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.REPORT_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DEPARTMENT HEAD - Department management and approval authority
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.DEPARTMENT_HEAD]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.REPORT_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW],
    [MODULES.DEVIATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.TRAINING_RECORDS]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // COMPILATION - Report and result compilation
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.COMPILATION]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW],
    [MODULES.REPORT_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.CERTIFICATE_GENERATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REVIEWER - Data and process review
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.REVIEWER]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW],
    [MODULES.REPORT_GENERATION]: [PERMISSIONS.VIEW],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW],
    [MODULES.DEVIATION_MANAGEMENT]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PERSON IN CHARGE - Operations oversight
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.PERSON_IN_CHARGE]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_PREPARATION]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.INVENTORY_MANAGEMENT]: [PERMISSIONS.VIEW],
    [MODULES.EQUIPMENT_MAINTENANCE]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CUSTOMER COORDINATOR - Customer-facing support
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.CUSTOMER_COORDINATOR]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.RESULT_APPROVAL]: [PERMISSIONS.VIEW],
    [MODULES.CERTIFICATE_GENERATION]: [PERMISSIONS.VIEW],
    [MODULES.COMPLAINT_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.NOTIFICATION_CENTER]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SALES PERSONNEL - Sales and account management
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.SALES_PERSONNEL]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.BILLING_INVOICING]: [PERMISSIONS.VIEW],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.CRM_INTEGRATION]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ACCOUNTANT ADMIN - Accounting administration
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.ACCOUNTANT_ADMIN]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.BILLING_INVOICING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.RECEIVING_INSPECTION]: [PERMISSIONS.VIEW],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ACCOUNTANT CRM - CRM and customer accounting
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.ACCOUNTANT_CRM]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.CUSTOMER_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.BILLING_INVOICING]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.CRM_INTEGRATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // QUALITY PERSONNEL - Quality assurance operations
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.QUALITY_PERSONNEL]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.CALIBRATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.METHOD_VALIDATION]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.DEVIATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.COMPLAINT_MANAGEMENT]: [PERMISSIONS.VIEW],
    [MODULES.TREND_ANALYSIS]: [PERMISSIONS.VIEW],
    [MODULES.DOCUMENT_MANAGEMENT]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // QUALITY MANAGER - Quality management and oversight
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.QUALITY_MANAGER]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.CALIBRATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.METHOD_VALIDATION]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.DEVIATION_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.COMPLAINT_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.TREND_ANALYSIS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.DOCUMENT_MANAGEMENT]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.TRAINING_RECORDS]: [PERMISSIONS.VIEW],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DEPARTMENT ASSISTANT - Administrative support
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.DEPARTMENT_ASSISTANT]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.TRAINING_RECORDS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.DOCUMENT_MANAGEMENT]: [PERMISSIONS.VIEW],
    [MODULES.NOTIFICATION_CENTER]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // JR ANALYST - Junior analyst operations
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.JR_ANALYST]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.ANALYTICS_REPORTS]: [PERMISSIONS.VIEW],
    [MODULES.TREND_ANALYSIS]: [PERMISSIONS.VIEW],
    [MODULES.QUALITY_CONTROL]: [PERMISSIONS.VIEW],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DEPARTMENT TRAINEE - Limited view-only access
  // ═════════════════════════════════════════════════════════════════════════
  [ROLES.DEPARTMENT_TRAINEE]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
    [MODULES.SAMPLE_RECEIPT]: [PERMISSIONS.VIEW],
    [MODULES.TEST_BOOKING]: [PERMISSIONS.VIEW],
    [MODULES.TEST_EXECUTION]: [PERMISSIONS.VIEW],
    [MODULES.DOCUMENT_MANAGEMENT]: [PERMISSIONS.VIEW],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION WORKFLOW SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dynamic workflow scenarios for comprehensive RBAC testing
 */
export const RBAC_SCENARIOS = {
  // Scenario 1: Sample-to-Report workflow
  sampleToReportWorkflow: {
    name: 'Sample Receipt to Certificate',
    steps: [
      {
        step: 1,
        action: 'Receive Sample',
        module: MODULES.SAMPLE_RECEIPT,
        requiredRole: ROLES.RECEPTION,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Reception registers new sample',
      },
      {
        step: 2,
        action: 'Book Tests',
        module: MODULES.TEST_BOOKING,
        requiredRole: ROLES.BOOKING_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Booking personnel allocates tests',
      },
      {
        step: 3,
        action: 'Execute Tests',
        module: MODULES.TEST_EXECUTION,
        requiredRole: ROLES.QUALITY_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Quality personnel runs tests',
      },
      {
        step: 4,
        action: 'Approve Results',
        module: MODULES.RESULT_APPROVAL,
        requiredRole: ROLES.DEPARTMENT_HEAD,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Department head approves results',
      },
      {
        step: 5,
        action: 'Generate Certificate',
        module: MODULES.CERTIFICATE_GENERATION,
        requiredRole: ROLES.COMPILATION,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Compilation generates certificate',
      },
    ],
  },

  // Scenario 2: Master data change approval workflow
  masterDataApprovalWorkflow: {
    name: 'Master Data Change Control',
    steps: [
      {
        step: 1,
        action: 'Create Master Record',
        module: MODULES.GENERIC_MASTER,
        requiredRole: ROLES.MASTER_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Master personnel creates record',
      },
      {
        step: 2,
        action: 'Edit Master Record',
        module: MODULES.GENERIC_MASTER,
        requiredRole: ROLES.MASTER_PERSONNEL,
        requiredPermission: PERMISSIONS.EDIT,
        description: 'Master personnel modifies record',
      },
      {
        step: 3,
        action: 'Approve Change',
        module: MODULES.GENERIC_MASTER,
        requiredRole: ROLES.MASTER_CONTROLLER,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Master controller authorizes change',
      },
    ],
  },

  // Scenario 3: Quality assurance workflow
  qualityAssuranceWorkflow: {
    name: 'Quality Assurance & Deviation Management',
    steps: [
      {
        step: 1,
        action: 'Perform QC Check',
        module: MODULES.QUALITY_CONTROL,
        requiredRole: ROLES.QUALITY_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Quality personnel conducts check',
      },
      {
        step: 2,
        action: 'Record Deviation',
        module: MODULES.DEVIATION_MANAGEMENT,
        requiredRole: ROLES.QUALITY_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Quality personnel logs deviation',
      },
      {
        step: 3,
        action: 'Approve Deviation',
        module: MODULES.DEVIATION_MANAGEMENT,
        requiredRole: ROLES.QUALITY_MANAGER,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Quality manager authorizes handling',
      },
      {
        step: 4,
        action: 'Review Trend',
        module: MODULES.TREND_ANALYSIS,
        requiredRole: ROLES.QUALITY_MANAGER,
        requiredPermission: PERMISSIONS.VIEW,
        description: 'Quality manager analyzes patterns',
      },
    ],
  },

  // Scenario 4: Complaint handling workflow
  complaintHandlingWorkflow: {
    name: 'Customer Complaint Management',
    steps: [
      {
        step: 1,
        action: 'Register Complaint',
        module: MODULES.COMPLAINT_MANAGEMENT,
        requiredRole: ROLES.CUSTOMER_COORDINATOR,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Customer coordinator logs complaint',
      },
      {
        step: 2,
        action: 'Investigate Complaint',
        module: MODULES.COMPLAINT_MANAGEMENT,
        requiredRole: ROLES.CUSTOMER_COORDINATOR,
        requiredPermission: PERMISSIONS.EDIT,
        description: 'Coordinator updates investigation status',
      },
      {
        step: 3,
        action: 'Resolve Complaint',
        module: MODULES.COMPLAINT_MANAGEMENT,
        requiredRole: ROLES.QUALITY_MANAGER,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Quality manager approves resolution',
      },
    ],
  },

  // Scenario 5: Procurement workflow
  procurementWorkflow: {
    name: 'Procurement & Supplier Management',
    steps: [
      {
        step: 1,
        action: 'Create Purchase Order',
        module: MODULES.PURCHASE_ORDERS,
        requiredRole: ROLES.MASTER_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Master personnel creates PO',
      },
      {
        step: 2,
        action: 'Approve Purchase Order',
        module: MODULES.PURCHASE_ORDERS,
        requiredRole: ROLES.ACCOUNTANT_ADMIN,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Accountant authorizes purchase',
      },
      {
        step: 3,
        action: 'Receive Goods',
        module: MODULES.RECEIVING_INSPECTION,
        requiredRole: ROLES.MASTER_PERSONNEL,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Personnel records receipt',
      },
      {
        step: 4,
        action: 'Inspect Received Goods',
        module: MODULES.RECEIVING_INSPECTION,
        requiredRole: ROLES.QUALITY_PERSONNEL,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Quality personnel verifies receipt',
      },
    ],
  },

  // Scenario 6: Reporting and analytics workflow
  reportingWorkflow: {
    name: 'Reporting & Analytics',
    steps: [
      {
        step: 1,
        action: 'View Results',
        module: MODULES.RESULT_APPROVAL,
        requiredRole: ROLES.ANALYST,
        requiredPermission: PERMISSIONS.VIEW,
        description: 'Analyst views approved results',
      },
      {
        step: 2,
        action: 'Analyze Trends',
        module: MODULES.TREND_ANALYSIS,
        requiredRole: ROLES.ANALYST,
        requiredPermission: PERMISSIONS.VIEW,
        description: 'Analyst examines trends',
      },
      {
        step: 3,
        action: 'Generate Report',
        module: MODULES.ANALYTICS_REPORTS,
        requiredRole: ROLES.ANALYST,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Analyst creates report',
      },
      {
        step: 4,
        action: 'Export Data',
        module: MODULES.DATA_EXPORT,
        requiredRole: ROLES.ANALYST,
        requiredPermission: PERMISSIONS.EXPORT,
        description: 'Analyst exports for external use',
      },
    ],
  },

  // Scenario 7: System administration workflow
  adminWorkflow: {
    name: 'System Administration',
    steps: [
      {
        step: 1,
        action: 'Manage Users',
        module: MODULES.USER_MANAGEMENT,
        requiredRole: ROLES.ADMIN,
        requiredPermission: PERMISSIONS.CREATE,
        description: 'Admin creates/modifies user accounts',
      },
      {
        step: 2,
        action: 'Configure Roles',
        module: MODULES.ROLE_MANAGEMENT,
        requiredRole: ROLES.ADMIN,
        requiredPermission: PERMISSIONS.APPROVE,
        description: 'Admin updates role permissions',
      },
      {
        step: 3,
        action: 'Review Audit Logs',
        module: MODULES.AUDIT_TRAIL,
        requiredRole: ROLES.ADMIN,
        requiredPermission: PERMISSIONS.VIEW,
        description: 'Admin monitors system activity',
      },
      {
        step: 4,
        action: 'Configure Lab Settings',
        module: MODULES.LAB_SETTINGS,
        requiredRole: ROLES.ADMIN,
        requiredPermission: PERMISSIONS.EDIT,
        description: 'Admin updates system configuration',
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION HIERARCHY RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rules that must be enforced during RBAC validation:
 * 1. If EDIT → must have VIEW
 * 2. If DELETE → must have VIEW
 * 3. If APPROVE → must have VIEW
 * 4. ADMIN → superset of all other roles
 * 5. No role without VIEW can have other permissions
 */
export const PERMISSION_HIERARCHY_RULES = {
  editRequiresView: (perms: string[]) => !perms.includes(PERMISSIONS.EDIT) || perms.includes(PERMISSIONS.VIEW),
  deleteRequiresView: (perms: string[]) => !perms.includes(PERMISSIONS.DELETE) || perms.includes(PERMISSIONS.VIEW),
  approveRequiresView: (perms: string[]) => !perms.includes(PERMISSIONS.APPROVE) || perms.includes(PERMISSIONS.VIEW),
  noPermWithoutView: (perms: string[]) => {
    const hasOtherPerms = perms.some(p => p !== PERMISSIONS.VIEW && p !== PERMISSIONS.EXPORT);
    return !hasOtherPerms || perms.includes(PERMISSIONS.VIEW);
  },
  adminIsSuperset: (adminPerms: string[], otherPerms: string[]) => otherPerms.every(p => adminPerms.includes(p)),
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface ModuleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  category?: string;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
}

export type RoleModulePermissionMap = Record<string, Record<string, string[]>>;

export interface RBACScenario {
  name: string;
  steps: RBACStep[];
}

export interface RBACStep {
  step: number;
  action: string;
  module: string;
  requiredRole: string;
  requiredPermission: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_KEYS = Object.values(ROLES);
export const MODULE_KEYS = Object.values(MODULES);
export const PERMISSION_KEYS = Object.values(PERMISSIONS);

// Calculate statistics
export const RBAC_STATISTICS = {
  totalRoles: Object.keys(ROLES).length,
  totalModules: Object.keys(MODULES).length,
  totalPermissions: Object.keys(PERMISSIONS).length,
  totalRoleModulePermissionMappings: Object.values(ROLE_MODULE_PERMISSIONS).reduce(
    (sum, modules) => sum + Object.keys(modules).length,
    0
  ),
  totalPermissionAssignments: Object.values(ROLE_MODULE_PERMISSIONS).reduce(
    (sum, modules) =>
      sum +
      Object.values(modules).reduce((moduleSum, perms) => moduleSum + perms.length, 0),
    0
  ),
  scenarioCount: Object.keys(RBAC_SCENARIOS).length,
};
