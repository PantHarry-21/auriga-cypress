/**
 * RBAC Configuration Usage Examples
 * Demonstrates how to use the extracted RBAC configuration in tests
 * Generated: 2026-05-18
 *
 * This file shows practical patterns for leveraging the extracted
 * rbac-config.ts and rbac-service.ts in your test automation.
 */

import { test, expect } from '@playwright/test';
import {
  ROLES,
  MODULES,
  PERMISSIONS,
  ROLE_MODULE_PERMISSIONS,
  ROLE_DEFINITIONS,
  MODULE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
} from '../extracted-data/rbac-config';
import { RBACService } from '../extracted-data/rbac-service';

const rbacService = new RBACService();

// ═══════════════════════════════════════════════════════════════════════════
// BASIC USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Basic Usage', () => {
  test('can access ROLES constants', () => {
    // All 19 roles are available as constants
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.RECEPTION).toBe('reception');
    expect(ROLES.BOOKING_PERSONNEL).toBe('booking_personel');
    expect(ROLES.ANALYST).toBe('analyst');
    expect(ROLES.MASTER_PERSONNEL).toBe('master_personel');
  });

  test('can access MODULE constants', () => {
    // All 3 main modules are available
    expect(MODULES.DASHBOARD).toBe('dashboard');
    expect(MODULES.GENERIC_MASTER).toBe('generic-master');
    expect(MODULES.STP_MASTER).toBe('stp-master');
  });

  test('can access PERMISSION constants', () => {
    // All 6 permission types
    expect(PERMISSIONS.VIEW).toBe('view');
    expect(PERMISSIONS.CREATE).toBe('create');
    expect(PERMISSIONS.EDIT).toBe('edit');
    expect(PERMISSIONS.DELETE).toBe('delete');
    expect(PERMISSIONS.APPROVE).toBe('approve');
    expect(PERMISSIONS.EXPORT).toBe('export');
  });

  test('can access role definitions with metadata', () => {
    const adminRole = ROLE_DEFINITIONS[ROLES.ADMIN];
    expect(adminRole.name).toBe('Administrator');
    expect(adminRole.description).toBe('Full system access with all permissions');
    expect(adminRole.status).toBe('active');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-BASED PERMISSION MAPPING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Permission Mappings', () => {
  test('admin has full access to all modules', () => {
    const adminModules = ROLE_MODULE_PERMISSIONS[ROLES.ADMIN];

    // Admin should have access to all 3 modules
    expect(adminModules).toHaveProperty(MODULES.DASHBOARD);
    expect(adminModules).toHaveProperty(MODULES.GENERIC_MASTER);
    expect(adminModules).toHaveProperty(MODULES.STP_MASTER);
  });

  test('admin has all permission types in dashboard', () => {
    const adminDashboardPerms = ROLE_MODULE_PERMISSIONS[ROLES.ADMIN][MODULES.DASHBOARD];

    expect(adminDashboardPerms).toContain(PERMISSIONS.VIEW);
    expect(adminDashboardPerms).toContain(PERMISSIONS.CREATE);
    expect(adminDashboardPerms).toContain(PERMISSIONS.EDIT);
    expect(adminDashboardPerms).toContain(PERMISSIONS.DELETE);
    expect(adminDashboardPerms).toContain(PERMISSIONS.EXPORT);
  });

  test('reception has view-only dashboard access', () => {
    const receptionModules = ROLE_MODULE_PERMISSIONS[ROLES.RECEPTION];

    // Reception should only have dashboard
    expect(Object.keys(receptionModules)).toEqual([MODULES.DASHBOARD]);

    // Only VIEW permission
    const perms = receptionModules[MODULES.DASHBOARD];
    expect(perms).toEqual([PERMISSIONS.VIEW]);
  });

  test('analyst can view and export dashboard', () => {
    const analystPerms = ROLE_MODULE_PERMISSIONS[ROLES.ANALYST][MODULES.DASHBOARD];

    expect(analystPerms).toContain(PERMISSIONS.VIEW);
    expect(analystPerms).toContain(PERMISSIONS.EXPORT);
    expect(analystPerms).not.toContain(PERMISSIONS.CREATE);
    expect(analystPerms).not.toContain(PERMISSIONS.DELETE);
  });

  test('master_personnel can create, edit, delete in generic-master', () => {
    const masterPerms = ROLE_MODULE_PERMISSIONS[ROLES.MASTER_PERSONNEL];
    const genericMasterPerms = masterPerms[MODULES.GENERIC_MASTER];

    expect(genericMasterPerms).toContain(PERMISSIONS.VIEW);
    expect(genericMasterPerms).toContain(PERMISSIONS.CREATE);
    expect(genericMasterPerms).toContain(PERMISSIONS.EDIT);
    expect(genericMasterPerms).toContain(PERMISSIONS.DELETE);
    expect(genericMasterPerms).not.toContain(PERMISSIONS.APPROVE);
  });

  test('department_head can approve in both master modules', () => {
    const deptHeadPerms = ROLE_MODULE_PERMISSIONS[ROLES.DEPARTMENT_HEAD];

    expect(deptHeadPerms[MODULES.GENERIC_MASTER]).toContain(PERMISSIONS.APPROVE);
    expect(deptHeadPerms[MODULES.STP_MASTER]).toContain(PERMISSIONS.APPROVE);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RBAC SERVICE USAGE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Service - Permission Checking', () => {
  test('service correctly identifies admin as having module access', () => {
    const hasAccess = rbacService.canAccessModule(ROLES.ADMIN, MODULES.DASHBOARD);
    expect(hasAccess).toBe(true);
  });

  test('service correctly identifies reception cannot create', () => {
    const canCreate = rbacService.hasPermission(
      ROLES.RECEPTION,
      MODULES.DASHBOARD,
      PERMISSIONS.CREATE
    );
    expect(canCreate).toBe(false);
  });

  test('service returns all modules for admin', () => {
    const modules = rbacService.getAllModulesForRole(ROLES.ADMIN);
    expect(modules).toHaveLength(3);
    expect(modules).toContain(MODULES.DASHBOARD);
    expect(modules).toContain(MODULES.GENERIC_MASTER);
    expect(modules).toContain(MODULES.STP_MASTER);
  });

  test('service returns only dashboard for reception', () => {
    const modules = rbacService.getAllModulesForRole(ROLES.RECEPTION);
    expect(modules).toEqual([MODULES.DASHBOARD]);
  });

  test('service returns correct permissions for role-module pair', () => {
    const perms = rbacService.getPermissionsForModule(ROLES.MASTER_PERSONNEL, MODULES.GENERIC_MASTER);
    expect(perms).toContain(PERMISSIONS.VIEW);
    expect(perms).toContain(PERMISSIONS.CREATE);
    expect(perms).toContain(PERMISSIONS.EDIT);
    expect(perms).toContain(PERMISSIONS.DELETE);
  });

  test('service validates role configuration', () => {
    const result = rbacService.validateRolePermissions(ROLES.ANALYST);
    expect(result.valid).toBe(true);
    expect(result.moduleCount).toBe(1); // Dashboard only
    expect(result.permissionCount).toBe(2); // VIEW and EXPORT
  });

  test('service detects missing roles', () => {
    const result = rbacService.validateRolePermissions('nonexistent_role');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROLE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Role Analysis', () => {
  test('can list all roles with approve permission in generic-master', () => {
    const rolesWithApprove = rbacService.getRolesWithPermission(
      MODULES.GENERIC_MASTER,
      PERMISSIONS.APPROVE
    );

    // Should include master_controler, department_reviewer, department_head, quality_manger, admin
    expect(rolesWithApprove).toContain(ROLES.ADMIN);
    expect(rolesWithApprove).toContain(ROLES.MASTER_CONTROLLER);
    expect(rolesWithApprove).toContain(ROLES.DEPARTMENT_REVIEWER);
    expect(rolesWithApprove).toContain(ROLES.DEPARTMENT_HEAD);
  });

  test('can list all roles with generic-master access', () => {
    const rolesWithAccess = rbacService.getRolesWithModuleAccess(MODULES.GENERIC_MASTER);

    // Should include most roles except reception, compilation, sales_personel, accountants
    expect(rolesWithAccess).toContain(ROLES.ADMIN);
    expect(rolesWithAccess).toContain(ROLES.BOOKING_PERSONNEL);
    expect(rolesWithAccess).toContain(ROLES.MASTER_PERSONNEL);
    expect(rolesWithAccess).not.toContain(ROLES.RECEPTION);
  });

  test('can find roles with multiple permissions', () => {
    const roles = rbacService.getRolesWithModuleAccess(MODULES.DASHBOARD);

    // Most roles can view dashboard, check them
    expect(roles.length).toBeGreaterThan(5);
    expect(roles).toContain(ROLES.ADMIN);
    expect(roles).toContain(ROLES.ANALYST);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION HIERARCHY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Permission Hierarchy Rules', () => {
  test('all roles that can edit also have view', () => {
    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const [moduleId, perms] of Object.entries(modules)) {
        if (perms.includes(PERMISSIONS.EDIT)) {
          expect(perms).toContain(PERMISSIONS.VIEW);
        }
      }
    }
  });

  test('all roles that can delete also have view', () => {
    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const [moduleId, perms] of Object.entries(modules)) {
        if (perms.includes(PERMISSIONS.DELETE)) {
          expect(perms).toContain(PERMISSIONS.VIEW);
        }
      }
    }
  });

  test('all roles that can approve also have view', () => {
    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const [moduleId, perms] of Object.entries(modules)) {
        if (perms.includes(PERMISSIONS.APPROVE)) {
          expect(perms).toContain(PERMISSIONS.VIEW);
        }
      }
    }
  });

  test('admin has superset of all permissions', () => {
    const adminPerms = ROLE_MODULE_PERMISSIONS[ROLES.ADMIN];

    for (const [roleId, roleModules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      if (roleId === ROLES.ADMIN) continue;

      for (const [moduleId, perms] of Object.entries(roleModules)) {
        const adminModulePerms = adminPerms[moduleId] ?? [];
        for (const perm of perms) {
          expect(adminModulePerms).toContain(perm);
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION MATRIX VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Permission Matrix', () => {
  test('should have no null or undefined in mappings', () => {
    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      expect(modules).toBeDefined();
      expect(modules).not.toBeNull();

      for (const [moduleId, perms] of Object.entries(modules)) {
        expect(perms).toBeDefined();
        expect(perms).not.toBeNull();
        expect(Array.isArray(perms)).toBe(true);

        for (const perm of perms) {
          expect(perm).toBeTruthy();
        }
      }
    }
  });

  test('should have consistent permission identifiers', () => {
    const validPermissions = Object.values(PERMISSIONS);

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const [moduleId, perms] of Object.entries(modules)) {
        for (const perm of perms) {
          expect(validPermissions).toContain(perm);
        }
      }
    }
  });

  test('should have consistent module identifiers', () => {
    const validModules = Object.values(MODULES);

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const moduleId of Object.keys(modules)) {
        expect(validModules).toContain(moduleId);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS AND REPORTING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - Statistics', () => {
  test('can generate role statistics', () => {
    const roleStats = new Map<string, { modules: number; permissions: number }>();

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      const moduleCount = Object.keys(modules).length;
      const permCount = Object.values(modules).reduce((sum, perms) => sum + perms.length, 0);

      roleStats.set(roleId, { modules: moduleCount, permissions: permCount });
    }

    // Admin should have most modules and permissions
    const adminStats = roleStats.get(ROLES.ADMIN);
    expect(adminStats?.modules).toBe(3);
    expect(adminStats?.permissions).toBe(15);

    // Reception should have least
    const receptionStats = roleStats.get(ROLES.RECEPTION);
    expect(receptionStats?.modules).toBe(1);
    expect(receptionStats?.permissions).toBe(1);
  });

  test('can calculate permission distribution', () => {
    let totalPermissions = 0;
    let maxPermissions = 0;
    let minPermissions = Infinity;

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      const permCount = Object.values(modules).reduce((sum, perms) => sum + perms.length, 0);
      totalPermissions += permCount;
      maxPermissions = Math.max(maxPermissions, permCount);
      minPermissions = Math.min(minPermissions, permCount);
    }

    const roleCount = Object.keys(ROLE_MODULE_PERMISSIONS).length;
    const avgPermissions = totalPermissions / roleCount;

    expect(totalPermissions).toBeGreaterThan(0);
    expect(maxPermissions).toBeGreaterThan(avgPermissions);
    expect(minPermissions).toBeLessThan(avgPermissions);
  });

  test('print RBAC summary report', () => {
    console.log('\n=== RBAC Configuration Summary ===\n');

    console.log(`Total Roles: ${Object.keys(ROLE_MODULE_PERMISSIONS).length}`);
    console.log(`Total Modules: ${Object.keys(MODULES).length}`);
    console.log(`Total Permission Types: ${Object.keys(PERMISSIONS).length}`);

    let totalMappings = 0;
    for (const modules of Object.values(ROLE_MODULE_PERMISSIONS)) {
      for (const perms of Object.values(modules)) {
        totalMappings += perms.length;
      }
    }
    console.log(`Total Role-Module-Permission Mappings: ${totalMappings}`);

    console.log('\nTop 5 Most Permissive Roles:');
    const rolePerms = Object.entries(ROLE_MODULE_PERMISSIONS).map(([roleId, modules]) => ({
      roleId,
      permCount: Object.values(modules).reduce((sum, perms) => sum + perms.length, 0),
    }));
    rolePerms.sort((a, b) => b.permCount - a.permCount);
    rolePerms.slice(0, 5).forEach(({ roleId, permCount }) => {
      console.log(`  ${roleId}: ${permCount} permissions`);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PRACTICAL UI TESTING PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('RBAC Config - UI Testing Patterns', () => {
  test.skip('(example) verify UI matches RBAC config for master_personnel', async ({ page }) => {
    // This is a SKIP example showing the pattern
    // In real tests, you would:
    // 1. Login as role
    // 2. Get configured permissions from RBAC config
    // 3. Verify UI buttons match configuration

    const roleId = ROLES.MASTER_PERSONNEL;
    const moduleId = MODULES.GENERIC_MASTER;
    const expectedPerms = rbacService.getPermissionsForModule(roleId, moduleId);

    // Would then check:
    // - CREATE button visible if PERMISSIONS.CREATE in expectedPerms
    // - EDIT button visible if PERMISSIONS.EDIT in expectedPerms
    // - DELETE button visible if PERMISSIONS.DELETE in expectedPerms
    // - APPROVE button NOT visible (master_personnel cannot approve)

    expect(expectedPerms).toContain(PERMISSIONS.CREATE);
    expect(expectedPerms).toContain(PERMISSIONS.EDIT);
    expect(expectedPerms).toContain(PERMISSIONS.DELETE);
    expect(expectedPerms).not.toContain(PERMISSIONS.APPROVE);
  });

  test('can generate test parameters from RBAC config', () => {
    // Create data-driven test parameters
    const testParams: Array<{ role: string; module: string; shouldHaveCreate: boolean }> = [];

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      for (const [moduleId, perms] of Object.entries(modules)) {
        testParams.push({
          role: roleId,
          module: moduleId,
          shouldHaveCreate: perms.includes(PERMISSIONS.CREATE),
        });
      }
    }

    // Should have generated 50+ parameters (one for each role-module-permission mapping)
    expect(testParams.length).toBeGreaterThan(40);
  });
});
