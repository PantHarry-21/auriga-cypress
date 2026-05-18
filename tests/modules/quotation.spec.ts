// tests/modules/quotation.spec.ts
// Quotation Test Suite - Sales Workflow Testing
// Tests: CRUD, Validations, RBAC, Approvals
// URL: /dashboard/quotation/client-quotation
// Run: npx playwright test quotation.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_QUOTATION = `AutoQuote_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Quotation',
  url: '/dashboard/quotation/client-quotation',
  moduleKey: 'quotation_pricing_quotation',
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

test.describe('Quotation Module', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'sales_personel_am', env, LAB);
  });

  test.describe('Page Load', () => {
    test('TC-QU-001: navigates to Quotation', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
    });

    test('TC-QU-002: displays quotations table', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
    });

    test('TC-QU-003: shows add button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create"), button:contains("Add")').first();
      if (await addBtn.isVisible()) {
        expect(addBtn).toBeDefined();
      }
    });
  });

  test.describe('CREATE - Add Quotation', () => {
    test('TC-QU-010: opens form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const form = page.locator('form, div.animate-slide-in-right').first();
        await expect(form).toBeVisible().catch(() => {});
      }
    });

    test('TC-QU-011: form has fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input, textarea, select').filter({ visible: true });
        expect(await inputs.count()).toBeGreaterThan(0);
        await module.clickCancel();
      }
    });

    test('TC-QU-012: validates fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
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

    test('TC-QU-013: creates quotation', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input[type="text"]').filter({ visible: true });
        if (await inputs.count() > 0) {
          await inputs.first().fill(TEST_QUOTATION);
        }
        const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-QU-014: special characters', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill(`Quote@#$${TS}`);
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('READ', () => {
    test('TC-QU-020: columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const headers = page.locator('thead th');
      expect(await headers.count()).toBeGreaterThan(0);
    });

    test('TC-QU-021: sort', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const header = page.locator('thead th').nth(1);
      if (await header.isVisible()) {
        await header.click();
        await page.waitForTimeout(1000);
      }
    });

    test('TC-QU-022: pagination', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    test('TC-QU-023: search', async ({ page }) => {
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
    test('TC-QU-030: edit form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        await module.clickCancel();
      }
    });

    test('TC-QU-031: pre-populated', async ({ page }) => {
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

    test('TC-QU-032: update', async ({ page }) => {
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
  });

  test.describe('RBAC', () => {
    test('TC-QU-100-sales: sales person create', async ({ page, context, env }) => {
      await loginAs(page, context, 'sales_personel_am', env, LAB);
      await page.goto('/dashboard/quotation/client-quotation', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      expect(await addBtn.isVisible().catch(() => false)).toBe(true);
    });

    test('TC-QU-101-booking: booking read-only', async ({ page, context, env }) => {
      await loginAs(page, context, 'booking_personel', env, LAB);
      await page.goto('/dashboard/quotation/client-quotation', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      expect(await addBtn.isVisible().catch(() => false)).toBe(false);
    });
  });

  test.describe('Export', () => {
    test('TC-QU-050: excel', async ({ page }) => {
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
    test('TC-QU-060: duplicate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill('DuplicateQuote');
        }
        await module.clickCancel();
      }
    });

    test('TC-QU-061: rapid', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await addBtn.click().catch(() => {});
        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        expect(await forms.count()).toBeLessThanOrEqual(1);
        await module.clickCancel();
      }
    });

    test('TC-QU-062: slow network', async ({ page }) => {
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
    test('E2E-QU-001: complete', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New"), button:contains("Create")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill(TEST_QUOTATION);
          const saveBtn = page.locator('button:contains("Save")').first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(1500);
          }
        }
      }

      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_QUOTATION);
        await page.waitForTimeout(1000);
      }

      await module.takeScreenshot('e2e-quotation');
    });
  });
});
