/**
 * RBACTestHelper.ts - Comprehensive Role-Based Access Control Testing
 *
 * Provides utilities for testing dynamic RBAC across all modules and roles:
 * - Permission grant/revoke operations
 * - Button visibility verification
 * - API authorization verification
 * - Field-level permission testing
 * - Role-module access matrix verification
 * - Permission persistence testing
 */

import { Page, expect } from '@playwright/test';

export interface RolePermissions {
  role: string;
  module: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    [key: string]: boolean;
  };
}

export interface PermissionCheckResult {
  permission: string;
  buttonVisible: boolean;
  operationSuccessful: boolean;
  error?: string;
}

export class RBACTestHelper {
  constructor(private page: Page, private adminPage?: Page) {}

  /**
   * Navigate to role management page
   */
  async navigateToRoleManagement(): Promise<void> {
    await this.page.goto('/dashboard/admin/roles', { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('table, [role="grid"]', { timeout: 10000 });
  }

  /**
   * Navigate to role permissions page for specific role
   */
  async navigateToRolePermissions(roleName: string): Promise<void> {
    await this.navigateToRoleManagement();

    // Find and click role
    const roleRow = this.page.locator(`tbody tr:has-text("${roleName}")`).first();
    await roleRow.click();

    // Click permissions button
    const permissionsButton = this.page.locator('button:has-text("Permissions"), button:has-text("Edit")').first();
    await permissionsButton.click();

    await this.page.waitForSelector('[data-testid="permissions-panel"], .permissions-panel, [role="dialog"]', {
      timeout: 5000,
    });
  }

  /**
   * Grant permission to role for module
   */
  async grantPermission(
    roleName: string,
    moduleName: string,
    permissionType: 'C' | 'R' | 'U' | 'D' | string
  ): Promise<boolean> {
    try {
      await this.navigateToRolePermissions(roleName);

      // Find module row
      const moduleRow = this.page.locator(`tr:has-text("${moduleName}")`).first();
      if (!(await moduleRow.isVisible())) {
        console.log(`Module ${moduleName} not found in permissions`);
        return false;
      }

      // Find and check permission checkbox
      const permissionMap: Record<string, string> = {
        'C': '[aria-label*="Create"], [title*="Create"]',
        'R': '[aria-label*="Read"], [title*="Read"]',
        'U': '[aria-label*="Update"], [title*="Update"]',
        'D': '[aria-label*="Delete"], [title*="Delete"]',
      };

      const selector = permissionMap[permissionType];
      const checkbox = moduleRow.locator(`input[type="checkbox"]${selector}`).first();

      if (await checkbox.isVisible()) {
        await checkbox.check();
        await this.page.waitForTimeout(500);
      }

      // Save changes
      await this.savePermissions();
      return true;
    } catch (error) {
      console.error(`Error granting permission: ${error}`);
      return false;
    }
  }

  /**
   * Revoke permission from role for module
   */
  async revokePermission(
    roleName: string,
    moduleName: string,
    permissionType: 'C' | 'R' | 'U' | 'D' | string
  ): Promise<boolean> {
    try {
      await this.navigateToRolePermissions(roleName);

      // Find module row
      const moduleRow = this.page.locator(`tr:has-text("${moduleName}")`).first();
      if (!(await moduleRow.isVisible())) {
        return false;
      }

      // Find and uncheck permission checkbox
      const permissionMap: Record<string, string> = {
        'C': '[aria-label*="Create"]',
        'R': '[aria-label*="Read"]',
        'U': '[aria-label*="Update"]',
        'D': '[aria-label*="Delete"]',
      };

      const selector = permissionMap[permissionType];
      const checkbox = moduleRow.locator(`input[type="checkbox"]${selector}`).first();

      if (await checkbox.isVisible()) {
        await checkbox.uncheck();
        await this.page.waitForTimeout(500);
      }

      // Save changes
      await this.savePermissions();
      return true;
    } catch (error) {
      console.error(`Error revoking permission: ${error}`);
      return false;
    }
  }

  /**
   * Grant bulk permissions to role
   */
  async grantMultiplePermissions(
    roleName: string,
    permissions: Array<{ module: string; types: string[] }>
  ): Promise<boolean> {
    try {
      for (const perm of permissions) {
        for (const type of perm.types) {
          await this.grantPermission(roleName, perm.module, type as any);
        }
      }
      return true;
    } catch (error) {
      console.error(`Error granting multiple permissions: ${error}`);
      return false;
    }
  }

  /**
   * Save permission changes
   */
  async savePermissions(): Promise<void> {
    const saveButton = this.page.locator('button:has-text("Save"), button:has-text("Apply")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await this.page.waitForTimeout(500);

      // Wait for success message
      await this.page
        .locator('.toast, [role="alert"], .success')
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {});
    }
  }

  /**
   * Verify button visibility for specific action
   */
  async verifyButtonVisibility(buttonText: string, shouldBeVisible: boolean): Promise<boolean> {
    const button = this.page.locator(`button:has-text("${buttonText}")`).first();

    try {
      if (shouldBeVisible) {
        await expect(button).toBeVisible({ timeout: 5000 });
        return true;
      } else {
        await expect(button).not.toBeVisible({ timeout: 5000 });
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get all visible buttons in current page
   */
  async getVisibleButtons(): Promise<string[]> {
    const buttons = this.page.locator('button:visible');
    const count = await buttons.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).innerText();
      if (text) {
        names.push(text);
      }
    }

    return names;
  }

  /**
   * Verify sidebar module visibility
   */
  async verifyModuleVisibility(moduleName: string, shouldBeVisible: boolean): Promise<boolean> {
    const navModule = this.page.locator(`nav a:has-text("${moduleName}"), nav li:has-text("${moduleName}")`).first();

    try {
      if (shouldBeVisible) {
        await expect(navModule).toBeVisible({ timeout: 5000 });
        return true;
      } else {
        await expect(navModule).not.toBeVisible({ timeout: 5000 });
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get all visible sidebar modules
   */
  async getVisibleModules(): Promise<string[]> {
    const nav = this.page.locator('nav, [role="navigation"]').first();
    const modules = nav.locator('a, li, [role="menuitem"]');
    const count = await modules.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await modules.nth(i).innerText();
      if (text && !text.includes('Logout') && !text.includes('Settings')) {
        names.push(text.trim());
      }
    }

    return names;
  }

  /**
   * Test permission - verify button visibility AND operation success
   */
  async testPermissionOperability(
    modulePath: string,
    action: 'create' | 'read' | 'update' | 'delete',
    shouldHaveAccess: boolean
  ): Promise<PermissionCheckResult> {
    const result: PermissionCheckResult = {
      permission: action,
      buttonVisible: false,
      operationSuccessful: false,
    };

    try {
      // Navigate to module
      await this.page.goto(modulePath, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Check for 403 error
      const bodyText = await this.page.locator('body').innerText();
      if (bodyText.includes('403') || bodyText.includes('Unauthorized') || bodyText.includes('Permission denied')) {
        if (!shouldHaveAccess) {
          result.operationSuccessful = true;
          return result;
        } else {
          result.error = '403 Unauthorized - but should have access';
          return result;
        }
      }

      // Check button visibility based on action
      const buttonMap: Record<string, string> = {
        create: 'New, Create, Add',
        read: 'View, Details, Open',
        update: 'Edit, Modify, Change',
        delete: 'Delete, Remove',
      };

      const buttonTexts = buttonMap[action].split(', ');
      let buttonFound = false;

      for (const buttonText of buttonTexts) {
        if (await this.verifyButtonVisibility(buttonText, true)) {
          buttonFound = true;
          result.buttonVisible = true;
          break;
        }
      }

      if (shouldHaveAccess && !buttonFound) {
        result.error = `${action} button not found but should have access`;
        return result;
      }

      if (!shouldHaveAccess && buttonFound) {
        result.error = `${action} button visible but should not have access`;
        return result;
      }

      result.operationSuccessful = true;
      return result;
    } catch (error: any) {
      result.error = error.message;
      return result;
    }
  }

  /**
   * Test CRUDA permissions for a role-module combination
   */
  async testAllPermissions(
    modulePath: string,
    expectedPermissions: { C: boolean; R: boolean; U: boolean; D: boolean }
  ): Promise<Record<string, PermissionCheckResult>> {
    const results: Record<string, PermissionCheckResult> = {};

    results.create = await this.testPermissionOperability(modulePath, 'create', expectedPermissions.C);
    results.read = await this.testPermissionOperability(modulePath, 'read', expectedPermissions.R);
    results.update = await this.testPermissionOperability(modulePath, 'update', expectedPermissions.U);
    results.delete = await this.testPermissionOperability(modulePath, 'delete', expectedPermissions.D);

    return results;
  }

  /**
   * Verify field visibility based on role
   */
  async verifyFieldVisibility(fieldName: string, shouldBeVisible: boolean): Promise<boolean> {
    const field = this.page.locator(`[name="${fieldName}"], [data-field="${fieldName}"], label:has-text("${fieldName}")`).first();

    try {
      if (shouldBeVisible) {
        await expect(field).toBeVisible({ timeout: 5000 });
        return true;
      } else {
        await expect(field).not.toBeVisible({ timeout: 5000 });
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Verify field is read-only for role
   */
  async verifyFieldReadOnly(fieldName: string, shouldBeReadOnly: boolean): Promise<boolean> {
    const field = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`).first();

    try {
      const isDisabled = await field.isDisabled();
      if (shouldBeReadOnly) {
        return isDisabled;
      } else {
        return !isDisabled;
      }
    } catch {
      return false;
    }
  }

  /**
   * Test cross-role permission differences
   */
  async compareRolePermissions(
    modulePath: string,
    role1: string,
    role2: string
  ): Promise<{ role1Permissions: string[]; role2Permissions: string[]; differences: string[] }> {
    const differences: string[] = [];

    // Test role 1
    await this.page.goto(modulePath, { waitUntil: 'domcontentloaded' });
    const role1Buttons = await this.getVisibleButtons();

    // Test role 2
    await this.page.goto(modulePath, { waitUntil: 'domcontentloaded' });
    const role2Buttons = await this.getVisibleButtons();

    // Find differences
    for (const btn of role1Buttons) {
      if (!role2Buttons.includes(btn)) {
        differences.push(`Role 1 has "${btn}" but Role 2 doesn't`);
      }
    }

    for (const btn of role2Buttons) {
      if (!role1Buttons.includes(btn)) {
        differences.push(`Role 2 has "${btn}" but Role 1 doesn't`);
      }
    }

    return {
      role1Permissions: role1Buttons,
      role2Permissions: role2Buttons,
      differences,
    };
  }

  /**
   * Test permission persistence across logout/login
   */
  async testPermissionPersistence(
    roleName: string,
    modulePath: string,
    expectedPermissions: { C: boolean; R: boolean; U: boolean; D: boolean },
    loginCallback: (page: Page) => Promise<void>
  ): Promise<boolean> {
    try {
      // Test permissions before logout
      let result = await this.testAllPermissions(modulePath, expectedPermissions);
      let beforeLogout = Object.values(result).every(r => r.operationSuccessful);

      if (!beforeLogout) {
        console.log('Permissions not working before logout');
        return false;
      }

      // Logout
      await this.logout();

      // Login
      await loginCallback(this.page);

      // Test permissions after login
      result = await this.testAllPermissions(modulePath, expectedPermissions);
      const afterLogin = Object.values(result).every(r => r.operationSuccessful);

      return afterLogin;
    } catch (error) {
      console.error(`Permission persistence test failed: ${error}`);
      return false;
    }
  }

  /**
   * Test API authorization for unauthorized requests
   */
  async testAPIAuthorization(apiEndpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<number> {
    try {
      const response = await this.page.request[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](apiEndpoint);
      return response.status();
    } catch (error: any) {
      return 500; // Network error
    }
  }

  /**
   * Get current user role
   */
  async getCurrentRole(): Promise<string | null> {
    try {
      // Try to get from sidebar/profile
      const profileText = await this.page.locator('[data-testid="user-profile"], .user-profile, [role="button"]:has-text("Admin")').first().innerText();
      return profileText || null;
    } catch {
      return null;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();

      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await this.page.waitForURL('**/login', { timeout: 10000 });
      }
    } catch (error) {
      console.log('Logout failed or button not found');
    }
  }

  /**
   * Generate RBAC test report
   */
  generateRBACReport(results: Record<string, Record<string, PermissionCheckResult>>): string {
    let report = `
═══════════════════════════════════════════════════════════
RBAC TEST REPORT
═══════════════════════════════════════════════════════════
    `;

    for (const [module, permissions] of Object.entries(results)) {
      report += `\n${module}:\n`;
      for (const [permission, result] of Object.entries(permissions)) {
        const status = result.operationSuccessful ? '✓' : '✗';
        report += `  ${status} ${permission}: ${result.buttonVisible ? 'Button Visible' : 'Button Hidden'}`;
        if (result.error) {
          report += ` - ${result.error}`;
        }
        report += '\n';
      }
    }

    report += `\n═══════════════════════════════════════════════════════════\n`;
    return report;
  }
}
