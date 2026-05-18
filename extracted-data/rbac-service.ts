/**
 * RBAC Service - Role-Based Access Control
 * Auto-generated from YLIMS UAT
 * Generated: 2026-05-18T14:30:00Z
 */

import {
  ROLES,
  MODULES,
  PERMISSIONS,
  ROLE_DEFINITIONS,
  MODULE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
  ROLE_MODULE_PERMISSIONS,
} from './rbac-config';

/**
 * RBAC Service for permission checking and role management
 */
export class RBACService {
  private cache = new Map<string, CachedPermissions>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user has access to a specific module
   */
  canAccessModule(userId: string, moduleId: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) return false;

    const rolePermissions = ROLE_MODULE_PERMISSIONS[userRole];
    return rolePermissions && moduleId in rolePermissions;
  }

  /**
   * Check if user has a specific permission in a module
   */
  hasPermission(userId: string, moduleId: string, permissionCode: string): boolean {
    const userRole = this.getUserRole(userId);
    if (!userRole) return false;

    const modulePerms = ROLE_MODULE_PERMISSIONS[userRole]?.[moduleId];
    return modulePerms?.includes(permissionCode) ?? false;
  }

  /**
   * Get all modules accessible by a role
   */
  getAllModulesForRole(roleId: string): string[] {
    return Object.keys(ROLE_MODULE_PERMISSIONS[roleId] || {});
  }

  /**
   * Get all permissions for a role in a module
   */
  getPermissionsForModule(roleId: string, moduleId: string): string[] {
    return ROLE_MODULE_PERMISSIONS[roleId]?.[moduleId] || [];
  }

  /**
   * Check if role has all specified permissions in a module
   */
  hasAllPermissions(
    roleId: string,
    moduleId: string,
    requiredPermissions: string[]
  ): boolean {
    const rolePerms = ROLE_MODULE_PERMISSIONS[roleId]?.[moduleId] || [];
    return requiredPermissions.every(p => rolePerms.includes(p));
  }

  /**
   * Check if role has any of the specified permissions in a module
   */
  hasAnyPermission(
    roleId: string,
    moduleId: string,
    permissions: string[]
  ): boolean {
    const rolePerms = ROLE_MODULE_PERMISSIONS[roleId]?.[moduleId] || [];
    return permissions.some(p => rolePerms.includes(p));
  }

  /**
   * Validate complete role permissions
   */
  validateRolePermissions(roleId: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      roleId,
      moduleCount: 0,
      permissionCount: 0,
    };

    if (!ROLE_MODULE_PERMISSIONS[roleId]) {
      result.valid = false;
      result.errors.push(`Role ${roleId} not found in configuration`);
      return result;
    }

    const rolePerms = ROLE_MODULE_PERMISSIONS[roleId];
    result.moduleCount = Object.keys(rolePerms).length;
    result.permissionCount = Object.values(rolePerms).reduce(
      (sum, perms) => sum + perms.length,
      0
    );

    if (result.moduleCount === 0) {
      result.warnings.push(`Role ${roleId} has no modules assigned`);
    }

    return result;
  }

  /**
   * Get all roles that have access to a specific module
   */
  getRolesWithModuleAccess(moduleId: string): string[] {
    const roles: string[] = [];

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      if (moduleId in modules) {
        roles.push(roleId);
      }
    }

    return roles;
  }

  /**
   * Get all roles that have a specific permission in a module
   */
  getRolesWithPermission(moduleId: string, permissionCode: string): string[] {
    const roles: string[] = [];

    for (const [roleId, modules] of Object.entries(ROLE_MODULE_PERMISSIONS)) {
      const modulePerms = modules[moduleId];
      if (modulePerms?.includes(permissionCode)) {
        roles.push(roleId);
      }
    }

    return roles;
  }

  /**
   * Get effective permissions for user (with caching)
   */
  getEffectivePermissions(userId: string): EffectivePermissions {
    const cacheKey = userId;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const userRole = this.getUserRole(userId);
    if (!userRole) {
      return { modules: {}, valid: false };
    }

    const permissions = ROLE_MODULE_PERMISSIONS[userRole] || {};
    const result: EffectivePermissions = {
      modules: permissions,
      valid: true,
      roleId: userRole,
      timestamp: new Date().toISOString(),
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  /**
   * Invalidate cache for user
   */
  invalidateUserCache(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get role definition
   */
  getRoleDefinition(roleId: string): RoleDefinition | null {
    return ROLE_DEFINITIONS[roleId] || null;
  }

  /**
   * Get module definition
   */
  getModuleDefinition(moduleId: string): ModuleDefinition | null {
    return MODULE_DEFINITIONS[moduleId] || null;
  }

  /**
   * Get permission definition
   */
  getPermissionDefinition(permissionId: string): PermissionDefinition | null {
    return PERMISSION_DEFINITIONS[permissionId] || null;
  }

  /**
   * Get all role definitions
   */
  getAllRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS);
  }

  /**
   * Get all module definitions
   */
  getAllModules(): ModuleDefinition[] {
    return Object.values(MODULE_DEFINITIONS);
  }

  /**
   * Get user role - implement based on your auth system
   */
  private getUserRole(userId: string): string | null {
    // This should be implemented to fetch from your auth/user service
    // For now, returning null as placeholder
    // Example implementation:
    // const user = await authService.getUser(userId);
    // return user?.role || null;
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const rbacService = new RBACService();

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
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

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  roleId: string;
  moduleCount: number;
  permissionCount: number;
}

export interface EffectivePermissions {
  modules: Record<string, string[]>;
  valid: boolean;
  roleId?: string;
  timestamp?: string;
}

export interface CachedPermissions {
  data: EffectivePermissions;
  timestamp: number;
}
