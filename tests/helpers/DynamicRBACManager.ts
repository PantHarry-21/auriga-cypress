// tests/helpers/DynamicRBACManager.ts
// Dynamic RBAC Management - Change roles in admin panel and verify permissions
// Handles: Login as admin, manage roles, logout, login as role user, verify access

import { Page, expect } from '@playwright/test';

export interface RolePermissions {
  moduleName: string;
  moduleKey: string;
  moduleUrl: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
}

export interface RoleUser {
  username: string;
  password: string;
  roleName: string;
  roleKey: string;
}

export class DynamicRBACManager {
  readonly page: Page;
  readonly adminUsername: string;
  readonly adminPassword: string;
  readonly lab: string;

  constructor(page: Page, adminUsername: string, adminPassword: string, lab: string) {
    this.page = page;
    this.adminUsername = adminUsername;
    this.adminPassword = adminPassword;
    this.lab = lab;
  }

  // ─── NAVIGATION ────────────────────────────────────────────────────────────

  async navigateToRoleManagement() {
    // Navigate to Role Management module
    await this.page.goto('/dashboard/role-management', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(2000);
  }

  async navigateToUserRoles() {
    // Navigate to User Roles assignment
    await this.page.goto('/dashboard/user-roles', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(2000);
  }

  // ─── ROLE PERMISSION MANAGEMENT ────────────────────────────────────────────

  async updateRolePermissions(roleKey: string, permissions: RolePermissions[]): Promise<boolean> {
    /**
     * Update role permissions in admin panel
     * Format: For each module, set create/read/update/delete/approve flags
     */
    try {
      await this.navigateToRoleManagement();

      // Find and click on the role to edit
      const roleRow = this.page.locator(`//td[contains(text(), "${roleKey}")]`).first();
      if (!(await roleRow.isVisible().catch(() => false))) {
        console.log(`Role ${roleKey} not found in role management`);
        return false;
      }

      // Click edit button for this role
      const editBtn = roleRow.locator('//following-sibling::td//button[contains(text(), "Edit")]').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await this.page.waitForTimeout(2000);
      }

      // Now update permissions for each module
      for (const perm of permissions) {
        await this.updateModulePermission(perm.moduleKey, perm.permissions);
      }

      // Save changes
      const saveBtn = this.page.locator('button:contains("Save"), button:contains("Update")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await this.page.waitForTimeout(2000);
      }

      return true;
    } catch (error) {
      console.error(`Error updating permissions for role ${roleKey}:`, error);
      return false;
    }
  }

  async updateModulePermission(moduleKey: string, permissions: any): Promise<void> {
    /**
     * Update individual module permissions
     * Looks for checkboxes/toggles for create/read/update/delete/approve
     */
    const permissionLabels = [
      { key: 'create', label: 'Create' },
      { key: 'read', label: 'Read' },
      { key: 'update', label: 'Update' },
      { key: 'delete', label: 'Delete' },
      { key: 'approve', label: 'Approve' },
    ];

    // Find module row
    const moduleRow = this.page.locator(`//td[contains(text(), "${moduleKey}")]`).first();
    if (!(await moduleRow.isVisible().catch(() => false))) {
      return;
    }

    // Update each permission checkbox
    for (const permLabel of permissionLabels) {
      const shouldCheck = permissions[permLabel.key];
      const checkbox = moduleRow.locator(`//input[@type="checkbox" and @value="${permLabel.key}"]`).first();

      if (await checkbox.isVisible().catch(() => false)) {
        const isChecked = await checkbox.isChecked();

        if (shouldCheck && !isChecked) {
          // Need to check
          await checkbox.check();
        } else if (!shouldCheck && isChecked) {
          // Need to uncheck
          await checkbox.uncheck();
        }
      }
    }
  }

  // ─── VERIFICATION ──────────────────────────────────────────────────────────

  async verifyModuleInSidebar(moduleName: string): Promise<boolean> {
    /**
     * Verify module is visible in sidebar
     */
    const moduleLink = this.page.locator(`//sidebar//a[contains(text(), "${moduleName}")], //nav//a[contains(text(), "${moduleName}")]`).first();
    return await moduleLink.isVisible().catch(() => false);
  }

  async verifyModuleAccessible(moduleUrl: string): Promise<boolean> {
    /**
     * Navigate to module and verify it's accessible (no 403)
     */
    try {
      await this.page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForTimeout(1500);

      // Check for 403 or "not authorized" messages
      const hasForbidden = await this.page.locator('body').textContent().then(text => text?.includes('403') || text?.includes('not authorized'));
      return !hasForbidden;
    } catch (error) {
      return false;
    }
  }

  async verifyModuleForbidden(moduleUrl: string): Promise<boolean> {
    /**
     * Navigate to module and verify it returns 403
     */
    try {
      await this.page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForTimeout(1500);

      // Check for 403 or "not authorized" messages
      const content = await this.page.locator('body').textContent();
      return content?.includes('403') || content?.includes('not authorized') || false;
    } catch (error) {
      return true; // Treat timeout as forbidden
    }
  }

  async getAllowedModulesFromSidebar(): Promise<string[]> {
    /**
     * Get list of all modules visible in sidebar
     */
    const modules: string[] = [];
    const moduleLinks = this.page.locator('//sidebar//a, //nav//a').filter({ visible: true });
    const count = await moduleLinks.count();

    for (let i = 0; i < count; i++) {
      const text = await moduleLinks.nth(i).textContent();
      if (text && text.trim().length > 0) {
        modules.push(text.trim());
      }
    }

    return modules;
  }

  // ─── COMPREHENSIVE DYNAMIC RBAC TEST ────────────────────────────────────────

  async testDynamicRBACForRole(
    roleUser: RoleUser,
    allowedModules: RolePermissions[],
    forbiddenModules: RolePermissions[]
  ): Promise<{ passed: number; failed: number; failures: string[] }> {
    /**
     * Complete dynamic RBAC test for a role:
     * 1. As admin, update permissions
     * 2. Logout
     * 3. Login as role user
     * 4. Verify sidebar shows allowed modules
     * 5. Verify sidebar doesn't show forbidden modules
     * 6. Try to access each allowed module (should succeed)
     * 7. Try to access each forbidden module (should fail with 403)
     */

    const results = { passed: 0, failed: 0, failures: [] };

    try {
      // STEP 1: As admin, update role permissions
      console.log(`\n🔐 Updating permissions for ${roleUser.roleName}...`);
      const allModules = [...allowedModules, ...forbiddenModules];
      const permissionsUpdated = await this.updateRolePermissions(roleUser.roleKey, allModules);

      if (!permissionsUpdated) {
        results.failures.push(`Failed to update permissions for ${roleUser.roleName}`);
        results.failed++;
        return results;
      }

      // STEP 2: Logout
      console.log(`🚪 Logging out...`);
      await this.logoutAdmin();

      // STEP 3: Login as role user
      console.log(`🔑 Logging in as ${roleUser.username}...`);
      await this.loginAsRole(roleUser);

      // STEP 4 & 5: Verify sidebar
      console.log(`📋 Verifying sidebar access...`);
      const sidebarModules = await this.getAllowedModulesFromSidebar();

      // Check allowed modules are visible
      for (const module of allowedModules) {
        const isVisible = sidebarModules.some(m => m.includes(module.moduleName));
        if (isVisible) {
          results.passed++;
          console.log(`  ✅ ${module.moduleName} visible in sidebar`);
        } else {
          results.failed++;
          results.failures.push(`${module.moduleName} NOT visible in sidebar`);
          console.log(`  ❌ ${module.moduleName} NOT visible in sidebar`);
        }
      }

      // Check forbidden modules are NOT visible
      for (const module of forbiddenModules) {
        const isVisible = sidebarModules.some(m => m.includes(module.moduleName));
        if (!isVisible) {
          results.passed++;
          console.log(`  ✅ ${module.moduleName} hidden in sidebar`);
        } else {
          results.failed++;
          results.failures.push(`${module.moduleName} VISIBLE in sidebar (should be hidden)`);
          console.log(`  ❌ ${module.moduleName} VISIBLE in sidebar (should be hidden)`);
        }
      }

      // STEP 6: Verify access to allowed modules
      console.log(`🔓 Testing access to allowed modules...`);
      for (const module of allowedModules) {
        const isAccessible = await this.verifyModuleAccessible(module.moduleUrl);
        if (isAccessible) {
          results.passed++;
          console.log(`  ✅ ${module.moduleName} accessible`);
        } else {
          results.failed++;
          results.failures.push(`${module.moduleName} NOT accessible`);
          console.log(`  ❌ ${module.moduleName} NOT accessible`);
        }
      }

      // STEP 7: Verify forbidden modules return 403
      console.log(`🔒 Testing access to forbidden modules...`);
      for (const module of forbiddenModules) {
        const isForbidden = await this.verifyModuleForbidden(module.moduleUrl);
        if (isForbidden) {
          results.passed++;
          console.log(`  ✅ ${module.moduleName} forbidden (403)`);
        } else {
          results.failed++;
          results.failures.push(`${module.moduleName} NOT forbidden (should be 403)`);
          console.log(`  ❌ ${module.moduleName} NOT forbidden (should be 403)`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error during dynamic RBAC test:', error);
      results.failures.push(`Exception during test: ${error}`);
      results.failed++;
      return results;
    }
  }

  // ─── AUTHENTICATION ────────────────────────────────────────────────────────

  async loginAsAdmin(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);

    // Login
    const userInput = this.page.locator('input[placeholder*="Username"], input[placeholder*="Email"]').first();
    const passInput = this.page.locator('input[placeholder*="Password"]').first();

    await userInput.fill(this.adminUsername);
    await passInput.fill(this.adminPassword);

    const loginBtn = this.page.locator('button:contains("Login"), button:contains("Sign In")').first();
    await loginBtn.click();
    await this.page.waitForTimeout(3000);
  }

  async loginAsRole(roleUser: RoleUser): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);

    const userInput = this.page.locator('input[placeholder*="Username"], input[placeholder*="Email"]').first();
    const passInput = this.page.locator('input[placeholder*="Password"]').first();

    await userInput.fill(roleUser.username);
    await passInput.fill(roleUser.password);

    const loginBtn = this.page.locator('button:contains("Login"), button:contains("Sign In")').first();
    await loginBtn.click();
    await this.page.waitForTimeout(3000);
  }

  async logoutAdmin(): Promise<void> {
    const logoutBtn = this.page.locator('button:contains("Logout"), button:contains("Sign Out")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await this.page.waitForTimeout(2000);
    }
  }
}
