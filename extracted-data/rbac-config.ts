/**
 * RBAC Configuration - Auto-generated from YLIMS UAT
 * Generated: 2026-05-18T14:30:00Z
 * DO NOT EDIT MANUALLY - Use extraction script to update
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

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  [ROLES.ADMIN]: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    status: 'active',
  },
  [ROLES.RECEPTION]: {
    id: 'reception',
    name: 'Reception',
    description: 'Reception desk operations',
    status: 'active',
  },
  [ROLES.BOOKING_PERSONNEL]: {
    id: 'booking_personel',
    name: 'Booking Personnel',
    description: 'Booking and test request management',
    status: 'active',
  },
  [ROLES.MASTER_PERSONNEL]: {
    id: 'master_personel',
    name: 'Master Personnel',
    description: 'Master data management operations',
    status: 'active',
  },
  [ROLES.MASTER_CONTROLLER]: {
    id: 'master_controler',
    name: 'Master Controller',
    description: 'Master data approval and control',
    status: 'active',
  },
  [ROLES.ANALYST]: {
    id: 'analyst',
    name: 'Analyst',
    description: 'Data analysis and reporting',
    status: 'active',
  },
  [ROLES.DEPARTMENT_REVIEWER]: {
    id: 'department_reviewer',
    name: 'Department Reviewer',
    description: 'Department level review and approval',
    status: 'active',
  },
  [ROLES.DEPARTMENT_HEAD]: {
    id: 'department_head',
    name: 'Department Head',
    description: 'Department head management and oversight',
    status: 'active',
  },
  [ROLES.COMPILATION]: {
    id: 'compilation',
    name: 'Compilation',
    description: 'Report compilation and generation',
    status: 'active',
  },
  [ROLES.REVIEWER]: {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Data and process review',
    status: 'active',
  },
  [ROLES.PERSON_IN_CHARGE]: {
    id: 'person_incharge',
    name: 'Person In Charge',
    description: 'Person in charge operations',
    status: 'active',
  },
  [ROLES.CUSTOMER_COORDINATOR]: {
    id: 'customer_coordinator',
    name: 'Customer Coordinator',
    description: 'Customer coordination and support',
    status: 'active',
  },
  [ROLES.SALES_PERSONNEL]: {
    id: 'sales_personel',
    name: 'Sales Personnel (AM)',
    description: 'Sales and account management',
    status: 'active',
  },
  [ROLES.ACCOUNTANT_ADMIN]: {
    id: 'accountant_admin',
    name: 'Accountant (Admin)',
    description: 'Accounting administration',
    status: 'active',
  },
  [ROLES.ACCOUNTANT_CRM]: {
    id: 'accountant_crm',
    name: 'Accountant (CRM)',
    description: 'CRM accounting operations',
    status: 'active',
  },
  [ROLES.QUALITY_PERSONNEL]: {
    id: 'quality_personel',
    name: 'Quality Personnel',
    description: 'Quality assurance operations',
    status: 'active',
  },
  [ROLES.QUALITY_MANAGER]: {
    id: 'quality_manger',
    name: 'Quality Manager',
    description: 'Quality management and oversight',
    status: 'active',
  },
  [ROLES.DEPARTMENT_ASSISTANT]: {
    id: 'dept_assistant',
    name: 'Department Assistant',
    description: 'Department administrative support',
    status: 'active',
  },
  [ROLES.JR_ANALYST]: {
    id: 'jr_analyst',
    name: 'Jr. Analyst',
    description: 'Junior analyst operations',
    status: 'active',
  },
  [ROLES.DEPARTMENT_TRAINEE]: {
    id: 'dept_trainee',
    name: 'Department Trainee',
    description: 'Department trainee program',
    status: 'active',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE DEFINITIONS (3 Main Modules + more)
// ═══════════════════════════════════════════════════════════════════════════

export const MODULES = {
  DASHBOARD: 'dashboard',
  GENERIC_MASTER: 'generic-master',
  STP_MASTER: 'stp-master',
} as const;

export const MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  [MODULES.DASHBOARD]: {
    id: 'dashboard',
    name: 'Dashboard',
    code: 'DASH',
    description: 'System dashboard and analytics',
    category: 'core',
  },
  [MODULES.GENERIC_MASTER]: {
    id: 'generic-master',
    name: 'Generic Master',
    code: 'GENM',
    description: 'Generic master data management',
    category: 'master',
  },
  [MODULES.STP_MASTER]: {
    id: 'stp-master',
    name: 'STP Master',
    code: 'STP',
    description: 'Standard test procedure master',
    category: 'master',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION TYPES (5 Types)
// ═══════════════════════════════════════════════════════════════════════════

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
} as const;

export const PERMISSION_DEFINITIONS: Record<string, PermissionDefinition> = {
  [PERMISSIONS.VIEW]: {
    id: 'view',
    name: 'View',
    code: 'VIEW',
    description: 'View module and data',
  },
  [PERMISSIONS.CREATE]: {
    id: 'create',
    name: 'Create',
    code: 'CREATE',
    description: 'Create new records',
  },
  [PERMISSIONS.EDIT]: {
    id: 'edit',
    name: 'Edit',
    code: 'EDIT',
    description: 'Edit existing records',
  },
  [PERMISSIONS.DELETE]: {
    id: 'delete',
    name: 'Delete',
    code: 'DELETE',
    description: 'Delete records',
  },
  [PERMISSIONS.APPROVE]: {
    id: 'approve',
    name: 'Approve',
    code: 'APPROVE',
    description: 'Approve changes and submissions',
  },
  [PERMISSIONS.EXPORT]: {
    id: 'export',
    name: 'Export',
    code: 'EXPORT',
    description: 'Export data to external formats',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-MODULE-PERMISSION MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_MODULE_PERMISSIONS: RoleModulePermissionMap = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.EXPORT],
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
  },
  [ROLES.RECEPTION]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.BOOKING_PERSONNEL]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
  },
  [ROLES.MASTER_PERSONNEL]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
  },
  [ROLES.MASTER_CONTROLLER]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
  },
  [ROLES.ANALYST]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
  },
  [ROLES.DEPARTMENT_REVIEWER]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
  },
  [ROLES.DEPARTMENT_HEAD]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
    [MODULES.STP_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
  },
  [ROLES.COMPILATION]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.REVIEWER]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
  },
  [ROLES.PERSON_IN_CHARGE]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
  },
  [ROLES.CUSTOMER_COORDINATOR]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.SALES_PERSONNEL]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.ACCOUNTANT_ADMIN]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.ACCOUNTANT_CRM]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
  [ROLES.QUALITY_PERSONNEL]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
  },
  [ROLES.QUALITY_MANAGER]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW, PERMISSIONS.APPROVE],
  },
  [ROLES.DEPARTMENT_ASSISTANT]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
  },
  [ROLES.JR_ANALYST]: {
    [MODULES.GENERIC_MASTER]: [PERMISSIONS.VIEW],
  },
  [ROLES.DEPARTMENT_TRAINEE]: {
    [MODULES.DASHBOARD]: [PERMISSIONS.VIEW],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UI SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const SELECTORS = {
  pages: {
    roleManagement: {
      roleListContainer: 'table tbody, [role="grid"]',
      roleRowPattern: 'tr[data-role-id="{roleId}"], div[data-role-id="{roleId}"]',
      editButtonPattern: 'button[data-role-id="{roleId}"][data-action="edit"]',
      deleteButtonPattern: 'button[data-role-id="{roleId}"][data-action="delete"]',
      addRoleButton: 'button:has-text("Add Role"), button[data-action="create"]',
    },
    editRole: {
      modalContainer: 'div[role="dialog"], .modal, [class*="modal"]',
      roleNameInput: 'input#role-name, input[name="role_name"]',
      moduleListContainer: 'div.modules-list, [class*="permissions"]',
      moduleItemPattern: 'div.module-item[data-module-id="{moduleId}"]',
      permissionCheckboxPattern: 'input[data-module="{moduleId}"][data-permission="{permissionCode}"]',
      selectAllPattern: 'input[aria-label="Select all"], button:has-text("Select All")',
      saveButton: 'button.btn-save, button:has-text("Save")',
      cancelButton: 'button.btn-cancel, button:has-text("Cancel")',
    },
  },
  patterns: {
    permissionCheckbox: 'input[data-module="{moduleId}"][data-permission="{permissionCode}"]',
    moduleContainer: 'div.module[data-module-id="{moduleId}"]',
    roleRow: 'tr[data-role-id="{roleId}"], div[data-role-id="{roleId}"]',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface PermissionDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
}

export type RoleModulePermissionMap = Record<string, Record<string, string[]>>;

export const ROLE_KEYS = Object.values(ROLES);
export const MODULE_KEYS = Object.values(MODULES);
export const PERMISSION_KEYS = Object.values(PERMISSIONS);
