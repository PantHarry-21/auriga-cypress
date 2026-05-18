import { Page, BrowserContext, expect } from '@playwright/test';
import { loginAs, stubStimulsoft, loadFixture } from './commands';

interface PermissionState {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  approve: boolean;
}

export class RBACTestBase {
  page: Page;
  context: BrowserContext;
  env: Record<string, string>;
  labName: string;
  rolesPermissions: any;

  constructor(page: Page, context: BrowserContext, labName: string = 'Arbro - Delhi') {
    this.page = page;
    this.context = context;
    // Use process.env as fallback; will be overridden by test fixtures if available
    this.env = (global as any).__testEnv__ || process.env as Record<string, string>;
    this.labName = labName;
    this.rolesPermissions = loadFixture('roles-permissions.json');
  }

  async setup(roleKey: string = 'admin') {
    await stubStimulsoft(this.context);
    await loginAs(this.page, this.context, roleKey, this.env, this.labName);
  }

  getAllRoles() {
    return this.rolesPermissions.roles.filter((r: any) => r.status === 'active');
  }

  getAllModules() {
    const modulesMap = new Map();
    this.rolesPermissions.roles.forEach((role: any) => {
      role.modules?.forEach((module: any) => {
        if (!modulesMap.has(module.module_key)) {
          modulesMap.set(module.module_key, {
            key: module.module_key,
            name: module.sub_module,
            url: module.url,
            permissions: module.permissions,
          });
        }
      });
    });
    return Array.from(modulesMap.values());
  }

  getRolePermissions(roleKey: string, moduleKey: string): PermissionState | null {
    const role = this.rolesPermissions.roles.find((r: any) => r.role_key === roleKey);
    if (!role) return null;
    const modulePerms = role.modules?.find((m: any) => m.module_key === moduleKey);
    return modulePerms?.permissions || null;
  }

  getAccessibleModulesForRole(roleKey: string): string[] {
    const role = this.rolesPermissions.roles.find((r: any) => r.role_key === roleKey);
    return role?.modules?.map((m: any) => m.module_key) || [];
  }

  async checkSidebarModules(): Promise<string[]> {
    const sidebarLinks = this.page.locator('nav a, aside a, [class*="menu"] a, [class*="nav"] a').filter({ visible: true });
    const count = await sidebarLinks.count();

    const modules = [];
    for (let i = 0; i < Math.min(count, 50); i++) {
      const text = await sidebarLinks.nth(i).textContent().catch(() => '');
      if (text && text.trim()) {
        modules.push(text.trim());
      }
    }
    return modules;
  }

  async isModuleAccessible(moduleUrl: string): Promise<boolean> {
    try {
      await this.page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await this.page.waitForTimeout(300);

      const bodyText = await this.page.locator('body').textContent() || '';
      return !bodyText.includes('403') && bodyText.length > 50;
    } catch {
      return false;
    }
  }

  async getPermissionButtonStates(): Promise<{
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  }> {
    return {
      create: await this.page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first().isVisible().catch(() => false),
      read: (await this.page.locator('body').textContent() || '').length > 50,
      update: await this.page.locator('button:has-text("Edit"), a:has-text("Edit")').first().isVisible().catch(() => false),
      delete: await this.page.locator('button:has-text("Delete"), a:has-text("Delete")').first().isVisible().catch(() => false),
      approve: await this.page.locator('button:has-text("Approve"), button:has-text("Accept")').first().isVisible().catch(() => false),
    };
  }

  async verifyPermissionLogic(roleKey: string): Promise<string[]> {
    const role = this.rolesPermissions.roles.find((r: any) => r.role_key === roleKey);
    if (!role) return ['Role not found'];

    const issues = [];
    const permissions = role.modules || [];

    permissions.forEach((mod: any) => {
      // If UPDATE permission, should have READ permission
      if (mod.permissions?.update && !mod.permissions?.read) {
        issues.push(`${mod.sub_module}: Has UPDATE but no READ`);
      }
      // If DELETE permission, should have READ permission
      if (mod.permissions?.delete && !mod.permissions?.read) {
        issues.push(`${mod.sub_module}: Has DELETE but no READ`);
      }
      // If APPROVE permission, should have READ permission
      if (mod.permissions?.approve && !mod.permissions?.read) {
        issues.push(`${mod.sub_module}: Has APPROVE but no READ`);
      }
    });

    return issues;
  }

  async expectModuleAccessible(moduleUrl: string, shouldBeAccessible: boolean = true) {
    const isAccessible = await this.isModuleAccessible(moduleUrl);
    expect(isAccessible).toBe(shouldBeAccessible);
  }

  async expectButtonVisibility(expectedState: Partial<PermissionState>) {
    const actualState = await this.getPermissionButtonStates();

    if (expectedState.create !== undefined) {
      expect(actualState.create).toBe(expectedState.create);
    }
    if (expectedState.update !== undefined) {
      expect(actualState.update).toBe(expectedState.update);
    }
    if (expectedState.delete !== undefined) {
      expect(actualState.delete).toBe(expectedState.delete);
    }
    if (expectedState.approve !== undefined) {
      expect(actualState.approve).toBe(expectedState.approve);
    }
  }

  async expectPermissionConsistent(roleKey: string) {
    const issues = await this.verifyPermissionLogic(roleKey);
    expect(issues.length).toBe(0);
  }

  async navigateTo(moduleUrl: string, timeout: number = 20000) {
    await this.page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout });
    await this.page.waitForTimeout(300);
  }
}
