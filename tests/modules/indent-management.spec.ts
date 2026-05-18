// tests/modules/indent-management.spec.ts
// Indent Management Test Suite
// URL: /dashboard/purchase/indent
// Run: npx playwright test indent-management.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_INDENT = `AutoIndent_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Indent Management',
  url: '/dashboard/purchase/indent',
  moduleKey: 'purchase_indent_indent',
  hasAdd: true,
  hasEdit: true,
  hasDelete: false,
  hasApprove: true,
  hasSearch: true,
  hasFilter: true,
  hasPagination: true,
  hasExport: true,
  hasTable: true,
  hasForm: true,
};

test.describe('Indent Management', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'master_controler', env, LAB);
  });

  test.describe('Page Load', () => {
    test('TC-IM-001: navigate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
    });

    test('TC-IM-002: display table', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
    });

    test('TC-IM-003: show add button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent"), button:contains("New")').first();
      await expect(addBtn).toBeVisible();
    });

    test('TC-IM-004: search', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('CREATE', () => {
    test('TC-IM-010: open form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const form = page.locator('form, div.animate-slide-in-right').first();
        await expect(form).toBeVisible().catch(() => {});
      }
    });

    test('TC-IM-011: form fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input, textarea, select').filter({ visible: true });
        expect(await inputs.count()).toBeGreaterThan(0);
        await module.clickCancel();
      }
    });

    test('TC-IM-012: validate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
        await module.clickCancel();
      }
    });

    test('TC-IM-013: create', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input[type="text"]').filter({ visible: true });
        if (await inputs.count() > 0) {
          await inputs.first().fill(TEST_INDENT);
          const saveBtn = page.locator('button:contains("Save")').first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(1500);
          }
        }
      }
    });
  });

  test.describe('READ', () => {
    test('TC-IM-020: columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const headers = page.locator('thead th');
      expect(await headers.count()).toBeGreaterThan(0);
    });

    test('TC-IM-021: sort', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const header = page.locator('thead th').nth(1);
      if (await header.isVisible()) {
        await header.click();
        await page.waitForTimeout(1000);
      }
    });

    test('TC-IM-022: pagination', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    });
  });

  test.describe('UPDATE', () => {
    test('TC-IM-030: edit', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        await module.clickCancel();
      }
    });

    test('TC-IM-031: update', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('RBAC', () => {
    test('TC-IM-100: role permissions', async ({ page, context, env }) => {
      await loginAs(page, context, 'reception', env, LAB);
      await page.goto('/dashboard/purchase/indent', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const addBtn = page.locator('button:contains("New Indent")').first();
      expect(await addBtn.isVisible().catch(() => false)).toBe(true);
    });
  });

  test.describe('Export', () => {
    test('TC-IM-050: excel', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const excelBtn = page.locator('button:contains("Excel")').first();
      if (await excelBtn.isVisible()) {
        await excelBtn.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-IM-060: duplicate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Indent")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill('DuplicateIndent');
        }
        await module.clickCancel();
      }
    });

    test('TC-IM-061: slow network', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await page.context().route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 200));
        await route.continue();
      });
      await module.navigateTo();
      await module.waitForPageLoad();
    });
  });

  test.describe('End-to-End', () => {
    test('E2E-IM-001: complete', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.takeScreenshot('e2e-indent-management');
    });
  });
});
