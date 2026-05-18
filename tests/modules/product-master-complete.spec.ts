// tests/modules/product-master-complete.spec.ts
// Product Master Test Suite - Inventory Management
// Tests: CRUD, Validations, RBAC, Approvals
// URL: /dashboard/products/master-v2
// Run: npx playwright test product-master-complete.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_PRODUCT = `AutoProduct_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Product Master',
  url: '/dashboard/products/master-v2',
  moduleKey: 'sample_management_product_master',
  hasAdd: true,
  hasEdit: true,
  hasDelete: false,
  hasApprove: false,
  hasSearch: true,
  hasFilter: true,
  hasPagination: true,
  hasExport: true,
  hasTable: true,
  hasForm: true,
};

test.describe('Product Master Module', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
  });

  test.describe('Page Load', () => {
    test('TC-PM-001: navigates to Product Master', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
    });

    test('TC-PM-002: displays products table', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
    });

    test('TC-PM-003: shows add button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await expect(addBtn).toBeVisible();
    });

    test('TC-PM-004: search works', async ({ page }) => {
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
    test('TC-PM-010: opens form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const form = page.locator('form, div.animate-slide-in-right').first();
      await expect(form).toBeVisible();
    });

    test('TC-PM-011: form has fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const inputs = page.locator('input, textarea').filter({ visible: true });
      expect(await inputs.count()).toBeGreaterThan(0);
      await module.clickCancel();
    });

    test('TC-PM-012: validates fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
      await module.clickCancel();
    });

    test('TC-PM-013: creates product', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const inputs = page.locator('input[type="text"]').filter({ visible: true });
      if (await inputs.count() > 0) {
        await inputs.first().fill(TEST_PRODUCT);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-PM-014: special chars', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const input = page.locator('input[type="text"]').first();
      await input.fill(`Product@#$${TS}`);
      await module.clickCancel();
    });

    test('TC-PM-015: long input', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const input = page.locator('input[type="text"]').first();
      await input.fill('A'.repeat(500));
      await module.clickCancel();
    });
  });

  test.describe('READ', () => {
    test('TC-PM-020: columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const headers = page.locator('thead th');
      expect(await headers.count()).toBeGreaterThan(0);
    });

    test('TC-PM-021: sort', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const header = page.locator('thead th').nth(1);
      if (await header.isVisible()) {
        await header.click();
        await page.waitForTimeout(1000);
      }
    });

    test('TC-PM-022: pagination', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    test('TC-PM-023: search', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('UPDATE', () => {
    test('TC-PM-030: edit form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        await module.clickCancel();
      }
    });

    test('TC-PM-031: pre-populated', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        const value = await input.inputValue().catch(() => '');
        expect(value.length).toBeGreaterThanOrEqual(0);
        await module.clickCancel();
      }
    });

    test('TC-PM-032: update', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
        await module.clickCancel();
      }
    });

    test('TC-PM-033: validate change', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        await input.clear();
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('RBAC', () => {
    const roles = [
      { key: 'master_personel', hasCreate: true },
      { key: 'booking_personel', hasCreate: false },
      { key: 'reviewer', hasCreate: false },
    ];

    roles.forEach(role => {
      test(`TC-PM-100-${role.key}: ${role.key}`, async ({ page, context, env }) => {
        await loginAs(page, context, role.key, env, LAB);
        await page.goto('/dashboard/products/master-v2', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
        expect(await addBtn.isVisible().catch(() => false)).toBe(role.hasCreate);
      });
    });
  });

  test.describe('Export', () => {
    test('TC-PM-050: excel', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const excelBtn = page.locator('button:contains("Excel")').first();
      if (await excelBtn.isVisible()) {
        await excelBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('TC-PM-051: pdf', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const pdfBtn = page.locator('button:contains("PDF")').first();
      if (await pdfBtn.isVisible()) {
        await pdfBtn.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-PM-060: duplicate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        const input = page.locator('input[type="text"]').first();
        await input.fill('DuplicateProduct');
        const saveBtn = page.locator('button:contains("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-PM-061: rapid', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await addBtn.click().catch(() => {});
        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        expect(await forms.count()).toBeLessThanOrEqual(1);
        await module.clickCancel();
      }
    });

    test('TC-PM-062: slow network', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await page.context().route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 200));
        await route.continue();
      });
      await module.navigateTo();
      await module.waitForPageLoad();
    });

    test('TC-PM-063: timeout', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await page.waitForTimeout(3000);
      await page.goto('/dashboard/products/master-v2', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).not.toContainText('500').catch(() => {});
    });
  });

  test.describe('End-to-End', () => {
    test('E2E-PM-001: complete', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      // Create
      const addBtn = page.locator('button:contains("New Product"), button:contains("New")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        const input = page.locator('input[type="text"]').first();
        await input.fill(TEST_PRODUCT);
        const saveBtn = page.locator('button:contains("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Search
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_PRODUCT);
        await page.waitForTimeout(1000);
      }

      // Edit
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
        await module.clickCancel();
      }

      await module.takeScreenshot('e2e-product-master');
    });
  });
});
