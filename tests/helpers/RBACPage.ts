// tests/helpers/RBACPage.ts
//
// RBAC (Role-Based Access Control) Page Object
// Tests role permissions, module access, and feature visibility
//

import { expect, Page } from '@playwright/test';

export interface RolePermission {
  parent_module: string;
  sub_module: string;
  module_key: string;
  url: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
}

export class RBACPage {
  readonly page: Page;
  readonly roleKey: string;
  readonly roleName: string;

  constructor(page: Page, roleKey: string, roleName: string) {
    this.page = page;
    this.roleKey = roleKey;
    this.roleName = roleName;
  }

  // ─── Module Access ─────────────────────────────────────────────────────────

  async testModuleAccess(module: RolePermission) {
    // Test if role can access the module
    await this.page.goto(module.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(1000);

    const has403 = await this.page.locator('body').textContent().then(t => t?.includes('403') || false);
    const has404 = await this.page.locator('body').textContent().then(t => t?.includes('404') || false);

    // If module is readable, should not have 403/404
    if (module.permissions.read) {
      expect(has403).toBe(false);
      expect(has404).toBe(false);
    }
  }

  // ─── Permission Testing ────────────────────────────────────────────────────

  async testCreatePermission(module: RolePermission): Promise<boolean> {
    // Check if Create button/Add button is visible
    const addBtn = this.page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
    const isVisible = await addBtn.isVisible().catch(() => false);

    if (module.permissions.create) {
      expect(isVisible).toBe(true);
    } else {
      expect(isVisible).toBe(false);
    }

    return isVisible;
  }

  async testReadPermission(module: RolePermission): Promise<boolean> {
    // Check if content is readable (not 403/404)
    const bodyText = await this.page.locator('body').textContent() || '';
    const canRead = !bodyText.includes('403') && !bodyText.includes('404');

    if (module.permissions.read) {
      expect(canRead).toBe(true);
    } else {
      expect(canRead).toBe(false);
    }

    return canRead;
  }

  async testUpdatePermission(module: RolePermission): Promise<boolean> {
    // Check if Edit button is visible
    const editBtn = this.page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    const isVisible = await editBtn.isVisible().catch(() => false);

    if (module.permissions.update) {
      expect(isVisible).toBe(true);
    } else {
      expect(isVisible).toBe(false);
    }

    return isVisible;
  }

  async testDeletePermission(module: RolePermission): Promise<boolean> {
    // Check if Delete button is visible
    const deleteBtn = this.page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    const isVisible = await deleteBtn.isVisible().catch(() => false);

    if (module.permissions.delete) {
      expect(isVisible).toBe(true);
    } else {
      expect(isVisible).toBe(false);
    }

    return isVisible;
  }

  async testApprovePermission(module: RolePermission): Promise<boolean> {
    // Check if Approve button is visible
    const approveBtn = this.page.locator('button:has-text("Approve")').first();
    const isVisible = await approveBtn.isVisible().catch(() => false);

    if (module.permissions.approve) {
      expect(isVisible).toBe(true);
    } else {
      expect(isVisible).toBe(false);
    }

    return isVisible;
  }

  // ─── Sidebar Access ────────────────────────────────────────────────────────

  async testSidebarAccess(modules: RolePermission[]) {
    // Navigate to dashboard
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(1500);

    // Get all visible modules in sidebar
    const visibleModules = modules.filter(m => m.permissions.read);

    for (const module of visibleModules) {
      // Check if module link is visible in sidebar
      const moduleLink = this.page.locator(`a:has-text("${module.sub_module}")`).first();
      const isVisible = await moduleLink.isVisible().catch(() => false);

      if (module.permissions.read) {
        expect(isVisible).toBe(true);
      }
    }
  }

  // ─── Form Field Permissions ────────────────────────────────────────────────

  async testFormFieldsEditable(shouldBeEditable: boolean) {
    // Check if form fields are editable or disabled
    const formInputs = this.page.locator('input[type="text"], textarea, select, [role="combobox"]').filter({ visible: true });
    const count = await formInputs.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const input = formInputs.nth(i);
      const isDisabled = await input.evaluate((el: any) => el.disabled || el.readOnly);

      if (shouldBeEditable) {
        expect(isDisabled).toBe(false);
      } else {
        expect(isDisabled).toBe(true);
      }
    }
  }

  // ─── Comprehensive RBAC Test ───────────────────────────────────────────────

  async testModulePermissions(modules: RolePermission[]) {
    const results = [];

    for (const module of modules) {
      try {
        await this.testModuleAccess(module);

        const canCreate = await this.testCreatePermission(module);
        const canRead = await this.testReadPermission(module);
        const canUpdate = await this.testUpdatePermission(module);
        const canDelete = await this.testDeletePermission(module);
        const canApprove = await this.testApprovePermission(module);

        results.push({
          module: module.sub_module,
          moduleKey: module.module_key,
          expected: module.permissions,
          actual: {
            create: canCreate,
            read: canRead,
            update: canUpdate,
            delete: canDelete,
            approve: canApprove,
          },
          passed:
            canCreate === module.permissions.create &&
            canRead === module.permissions.read &&
            canUpdate === module.permissions.update &&
            canDelete === module.permissions.delete &&
            canApprove === module.permissions.approve,
        });
      } catch (error) {
        results.push({
          module: module.sub_module,
          moduleKey: module.module_key,
          error: (error as Error).message,
          passed: false,
        });
      }
    }

    return results;
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  async navigateToModule(module: RolePermission) {
    await this.page.goto(module.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(1500);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `playwright-report/screenshots/rbac_${this.roleKey}_${name}.png` });
  }

  async verifyForbiddenAccess() {
    await expect(this.page.locator('body')).toContainText(/403|Forbidden|Access Denied/i);
  }

  async verifyAccessGranted() {
    const bodyText = await this.page.locator('body').textContent() || '';
    expect(bodyText).not.toContain('403');
    expect(bodyText).not.toContain('Forbidden');
  }
}
