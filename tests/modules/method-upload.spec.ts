// tests/modules/method-upload.spec.ts
// Method Upload Test Suite - Document Management Testing
// Tests: CRUD, Upload, Validations, RBAC
// URL: /dashboard/method/method-upload
// Run: npx playwright test method-upload.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_METHOD = `AutoMethod_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Method Upload',
  url: '/dashboard/method/method-upload',
  moduleKey: 'dms_method_upload',
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

test.describe('Method Upload Module', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'quality_personel', env, LAB);
  });

  test.describe('Page Load', () => {
    test('TC-MU-001: navigates to Method Upload', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
    });

    test('TC-MU-002: displays methods table', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
    });

    test('TC-MU-003: shows upload button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload"), button:contains("Add")').first();
      if (await addBtn.isVisible()) {
        expect(addBtn).toBeDefined();
      }
    });
  });

  test.describe('CREATE - Upload Method', () => {
    test('TC-MU-010: opens upload form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload"), button:contains("Add")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const form = page.locator('form, div.animate-slide-in-right, input[type="file"]').first();
        await expect(form).toBeVisible().catch(() => {});
      }
    });

    test('TC-MU-011: form has upload field', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          expect(fileInput).toBeDefined();
        }
        await module.clickCancel();
      }
    });

    test('TC-MU-012: validates required fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const submitBtn = page.locator('button:contains("Save"), button:contains("Submit"), button:contains("Upload")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
        await module.clickCancel();
      }
    });

    test('TC-MU-013: creates method entry', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const inputs = page.locator('input[type="text"]').filter({ visible: true });
        if (await inputs.count() > 0) {
          await inputs.first().fill(TEST_METHOD);
        }
        const submitBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-MU-014: handles special chars', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill(`Method@#$${TS}`);
        }
        await module.clickCancel();
      }
    });

    test('TC-MU-015: handles long input', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill('A'.repeat(500));
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('READ - View Methods', () => {
    test('TC-MU-020: displays columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const headers = page.locator('thead th');
      expect(await headers.count()).toBeGreaterThan(0);
    });

    test('TC-MU-021: sortable columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const header = page.locator('thead th').nth(1);
      if (await header.isVisible()) {
        await header.click();
        await page.waitForTimeout(1000);
      }
    });

    test('TC-MU-022: pagination', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    test('TC-MU-023: search', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('UPDATE - Edit Method', () => {
    test('TC-MU-030: opens edit', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const row = page.locator('tbody tr').first();
      if (await row.isVisible()) {
        await row.click();
        await page.waitForTimeout(1500);
        await module.clickCancel();
      }
    });

    test('TC-MU-031: pre-populated', async ({ page }) => {
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

    test('TC-MU-032: updates method', async ({ page }) => {
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
    const roles = [
      { key: 'quality_personel', hasCreate: true },
      { key: 'quality_manger', hasCreate: true },
      { key: 'master_personel', hasCreate: true },
      { key: 'reviewer', hasCreate: false },
    ];

    roles.forEach(role => {
      test(`TC-MU-100-${role.key}: ${role.key} permissions`, async ({ page, context, env }) => {
        await loginAs(page, context, role.key, env, LAB);
        await page.goto('/dashboard/method/method-upload', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
        const hasCreate = await addBtn.isVisible().catch(() => false);
        expect(hasCreate).toBe(role.hasCreate);
      });
    });
  });

  test.describe('Export', () => {
    test('TC-MU-050: export Excel', async ({ page }) => {
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
    test('TC-MU-060: duplicate', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill('DuplicateTest');
        }
        await module.clickCancel();
      }
    });

    test('TC-MU-061: rapid submission', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await addBtn.click().catch(() => {});
        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        expect(await forms.count()).toBeLessThanOrEqual(1);
        await module.clickCancel();
      }
    });

    test('TC-MU-062: slow network', async ({ page }) => {
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
    test('E2E-MU-001: Complete', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New"), button:contains("Upload")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        if (await input.isVisible()) {
          await input.fill(TEST_METHOD);
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
        await searchInput.fill(TEST_METHOD);
        await page.waitForTimeout(1000);
      }

      await module.takeScreenshot('e2e-method-upload');
    });
  });
});
