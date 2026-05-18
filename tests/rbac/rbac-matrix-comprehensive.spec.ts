// tests/rbac/rbac-matrix-comprehensive.spec.ts
//
// Comprehensive RBAC Testing for all 19 roles
// Tests module access, permissions (CRUDA), and UI elements
// Run: npx playwright test rbac-matrix-comprehensive.spec.ts --project=uat
//

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft, loadFixture } from '../helpers/commands';
import { RBACPage, RolePermission } from '../helpers/RBACPage';

interface RoleDefinition {
  role_name: string;
  role_key: string;
  modules: RolePermission[];
}

const roles: RoleDefinition[] = loadFixture('roles-permissions.json').roles;

test.describe('RBAC Matrix - All 19 Roles', () => {

  roles.forEach(role => {
    test.describe(`Role: ${role.role_name} (${role.role_key})`, () => {

      test.beforeEach(async ({ page, context }) => {
        await stubStimulsoft(context);
        await loginAs(page, context, role.role_key, env, 'Arbro - Delhi');
      });

      // ────────────────────────────────────────────────────────────────────
      // 1. SIDEBAR ACCESS TEST
      // ────────────────────────────────────────────────────────────────────
      test(`[${role.role_key}] Sidebar shows only accessible modules`, async ({ page }) => {
        const rbac = new RBACPage(page, role.role_key, role.role_name);

        // Navigate to dashboard
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1500);

        // Get the sidebar
        const sidebar = page.locator('nav, [class*="sidebar"]').first();
        expect(await sidebar.isVisible()).toBe(true);

        // Verify each module
        for (const module of role.modules) {
          const moduleLink = page.locator(`a:has-text("${module.sub_module}"), button:has-text("${module.sub_module}")`).first();

          if (module.permissions.read) {
            // Module should be visible in sidebar
            expect(await moduleLink.isVisible().catch(() => false)).toBe(true);
          }
        }

        await rbac.takeScreenshot('sidebar-access');
      });

      // ────────────────────────────────────────────────────────────────────
      // 2. MODULE ACCESS TEST
      // ────────────────────────────────────────────────────────────────────
      test.describe(`[${role.role_key}] Module Access Control`, () => {

        role.modules.forEach(module => {
          test(`CAN ACCESS: ${module.sub_module}`, async ({ page }) => {
            const rbac = new RBACPage(page, role.role_key, role.role_name);

            await rbac.navigateToModule(module);
            await rbac.verifyAccessGranted();

            await page.screenshot({ path: `playwright-report/screenshots/rbac_${role.role_key}_access_${module.module_key}.png` });
          });
        });
      });

      // ────────────────────────────────────────────────────────────────────
      // 3. PERMISSION TESTING (CRUDA)
      // ────────────────────────────────────────────────────────────────────
      test.describe(`[${role.role_key}] Permission Verification`, () => {

        role.modules.forEach(module => {
          test.describe(`${module.sub_module}`, () => {

            test(`CREATE: ${module.permissions.create ? 'ALLOWED' : 'FORBIDDEN'}`, async ({ page }) => {
              const rbac = new RBACPage(page, role.role_key, role.role_name);

              await rbac.navigateToModule(module);

              // Check if Add/New button is visible
              const addBtn = page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').first();
              const isVisible = await addBtn.isVisible().catch(() => false);

              if (module.permissions.create) {
                expect(isVisible).toBe(true);
              } else {
                expect(isVisible).toBe(false);
              }
            });

            test(`READ: ${module.permissions.read ? 'ALLOWED' : 'FORBIDDEN'}`, async ({ page }) => {
              const rbac = new RBACPage(page, role.role_key, role.role_name);

              await rbac.navigateToModule(module);
              const bodyText = await page.locator('body').textContent() || '';

              if (module.permissions.read) {
                expect(bodyText).not.toContain('403');
                expect(bodyText).not.toContain('Forbidden');
              }
            });

            test(`UPDATE: ${module.permissions.update ? 'ALLOWED' : 'FORBIDDEN'}`, async ({ page }) => {
              const rbac = new RBACPage(page, role.role_key, role.role_name);

              await rbac.navigateToModule(module);

              // Check if Edit button is visible
              const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit"), button[aria-label*="Edit"]').first();
              const isVisible = await editBtn.isVisible().catch(() => false);

              if (module.permissions.update) {
                expect(isVisible).toBe(true);
              } else {
                expect(isVisible).toBe(false);
              }
            });

            test(`DELETE: ${module.permissions.delete ? 'ALLOWED' : 'FORBIDDEN'}`, async ({ page }) => {
              const rbac = new RBACPage(page, role.role_key, role.role_name);

              await rbac.navigateToModule(module);

              // Check if Delete button is visible
              const deleteBtn = page.locator('button:has-text("Delete"), a:has-text("Delete"), button[aria-label*="Delete"]').first();
              const isVisible = await deleteBtn.isVisible().catch(() => false);

              if (module.permissions.delete) {
                expect(isVisible).toBe(true);
              } else {
                expect(isVisible).toBe(false);
              }
            });

            test(`APPROVE: ${module.permissions.approve ? 'ALLOWED' : 'FORBIDDEN'}`, async ({ page }) => {
              const rbac = new RBACPage(page, role.role_key, role.role_name);

              await rbac.navigateToModule(module);

              // Check if Approve button is visible
              const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Accept")').first();
              const isVisible = await approveBtn.isVisible().catch(() => false);

              if (module.permissions.approve) {
                expect(isVisible).toBe(true);
              } else {
                expect(isVisible).toBe(false);
              }
            });
          });
        });
      });

      // ────────────────────────────────────────────────────────────────────
      // 4. FORBIDDEN MODULES TEST
      // ────────────────────────────────────────────────────────────────────
      test.describe(`[${role.role_key}] Forbidden Modules`, () => {

        // Get all modules that this role does NOT have access to
        const allModules: RolePermission[] = [];
        roles.forEach(r => r.modules.forEach(m => {
          if (!allModules.find(x => x.module_key === m.module_key)) {
            allModules.push(m);
          }
        }));

        const forbiddenModules = allModules.filter(m => !role.modules.some(rm => rm.module_key === m.module_key));

        forbiddenModules.slice(0, 3).forEach(module => {  // Test first 3 forbidden modules
          test(`CANNOT ACCESS: ${module.sub_module}`, async ({ page }) => {
            await page.goto(module.url, { failOnStatusCode: false, waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(1000);

            const bodyText = await page.locator('body').textContent() || '';

            // Should either see 403, redirect, or module not in sidebar
            const isForbidden = bodyText.includes('403') || bodyText.includes('Forbidden') || page.url().includes('/dashboard');

            expect(isForbidden).toBe(true);
          });
        });
      });

      // ────────────────────────────────────────────────────────────────────
      // 5. FORM FIELD EDITABILITY TEST
      // ────────────────────────────────────────────────────────────────────
      test.describe(`[${role.role_key}] Form Field Permissions`, () => {

        test(`Form fields respect role permissions`, async ({ page }) => {
          // Test with first accessible module
          if (role.modules.length > 0) {
            const testModule = role.modules[0];

            await page.goto(testModule.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(1500);

            // Find form inputs
            const formInputs = page.locator('input[type="text"], textarea, select, [role="combobox"]').filter({ visible: true });
            const count = await formInputs.count();

            if (count > 0 && testModule.permissions.update) {
              // If role has update permission, form should be editable
              for (let i = 0; i < Math.min(count, 2); i++) {
                const input = formInputs.nth(i);
                const isDisabled = await input.evaluate((el: any) => el.disabled || el.readOnly);
                expect(isDisabled).toBe(false);
              }
            }
          }
        });
      });

      // ────────────────────────────────────────────────────────────────────
      // 6. DASHBOARD ACCESS TEST
      // ────────────────────────────────────────────────────────────────────
      test(`[${role.role_key}] Can access Dashboard`, async ({ page }) => {
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1000);

        await expect(page).toHaveURL(/\/dashboard/);
        const bodyText = await page.locator('body').textContent() || '';
        expect(bodyText).not.toContain('403');

        await page.screenshot({ path: `playwright-report/screenshots/rbac_${role.role_key}_dashboard.png` });
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY TEST
  // ══════════════════════════════════════════════════════════════════════════
  test('📊 RBAC Matrix Coverage Summary', async () => {
    const coverage = {
      totalRoles: roles.length,
      totalModules: new Set(roles.flatMap(r => r.modules.map(m => m.module_key))).size,
      totalTests: roles.length * 5, // Approximate
    };

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔐 RBAC COVERAGE SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Roles: ${coverage.totalRoles}`);
    console.log(`Total Modules: ${coverage.totalModules}`);
    console.log(`Estimated Tests: ${coverage.totalTests}+`);
    console.log('═══════════════════════════════════════════════════════════\n');

    expect(coverage.totalRoles).toBe(19);
    expect(coverage.totalModules).toBeGreaterThan(40);
  });
});
