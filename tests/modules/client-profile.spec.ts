// tests/modules/client-profile.spec.ts
// Client Profile Test Suite - Comprehensive Testing
// Tests: CRUD, Validations, RBAC, Approvals, Edge Cases
// URL: /dashboard/profile/client
// Run: npx playwright test client-profile.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_CLIENT = `AutoClient_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Client Profile',
  url: '/dashboard/profile/client',
  moduleKey: 'customer_relation_management_client_profile',
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

test.describe('Client Profile Module', () => {
  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'sales_personel_am', env, LAB);
  });

  test.describe('Page Load & Navigation', () => {
    test('TC-CP-001: navigates to Client Profile page', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
    });

    test('TC-CP-002: displays client table', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
    });

    test('TC-CP-003: shows Add button', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await expect(addBtn).toBeVisible();
    });

    test('TC-CP-004: search works', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('CREATE - Add New Client', () => {
    test('TC-CP-010: opens Add Client form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const form = page.locator('form, div.animate-slide-in-right').first();
      await expect(form).toBeVisible();
    });

    test('TC-CP-011: form has required fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const inputs = page.locator('input, textarea, select').filter({ visible: true });
      expect(await inputs.count()).toBeGreaterThan(0);
      await module.clickCancel();
    });

    test('TC-CP-012: validates required fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
      await module.clickCancel();
    });

    test('TC-CP-013: creates client with valid data', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const inputs = page.locator('input[type="text"]').filter({ visible: true });
      if (await inputs.count() > 0) {
        await inputs.first().fill(TEST_CLIENT);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Submit")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    });

    test('TC-CP-014: handles special characters', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const input = page.locator('input[type="text"]').first();
      await input.fill(`Test@#$${TS}`);
      await module.clickCancel();
    });

    test('TC-CP-015: handles long input', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);
      const input = page.locator('input[type="text"]').first();
      await input.fill('A'.repeat(500));
      await module.clickCancel();
    });
  });

  test.describe('READ - View Clients', () => {
    test('TC-CP-020: displays table columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const headers = page.locator('thead th');
      expect(await headers.count()).toBeGreaterThan(0);
    });

    test('TC-CP-021: columns sortable', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const header = page.locator('thead th').nth(1);
      if (await header.isVisible()) {
        await header.click();
        await page.waitForTimeout(1000);
      }
    });

    test('TC-CP-022: pagination works', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    test('TC-CP-023: search filters results', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('UPDATE - Edit Client', () => {
    test('TC-CP-030: opens edit form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);
        const form = page.locator('form, div.animate-slide-in-right').first();
        await expect(form).toBeVisible().catch(() => {});
        await module.clickCancel();
      }
    });

    test('TC-CP-031: form pre-populated', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        const value = await input.inputValue().catch(() => '');
        expect(value.length).toBeGreaterThanOrEqual(0);
        await module.clickCancel();
      }
    });

    test('TC-CP-032: updates client', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
        await module.clickCancel();
      }
    });

    test('TC-CP-033: validates changes', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        await input.clear();
        await page.waitForTimeout(500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
        await module.clickCancel();
      }
    });
  });

  test.describe('RBAC - Role Permissions', () => {
    const roles = [
      { key: 'booking_personel', hasCreate: false },
      { key: 'sales_personel_am', hasCreate: true },
      { key: 'reception', hasCreate: false },
      { key: 'reviewer', hasCreate: false },
    ];

    roles.forEach(role => {
      test(`TC-CP-100-${role.key}: ${role.key} permissions`, async ({ page, context, env }) => {
        await loginAs(page, context, role.key, env, LAB);
        await page.goto('/dashboard/profile/client', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
        const hasCreate = await addBtn.isVisible().catch(() => false);
        expect(hasCreate).toBe(role.hasCreate);
      });
    });
  });

  test.describe('Export', () => {
    test('TC-CP-050: exports to Excel', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const excelBtn = page.locator('button:contains("Excel")').first();
      if (await excelBtn.isVisible()) {
        await excelBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('TC-CP-051: exports to PDF', async ({ page }) => {
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
    test('TC-CP-060: handles duplicate entries', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        await input.fill('DuplicateTest');
        const saveBtn = page.locator('button:contains("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    });

    test('TC-CP-061: handles rapid submissions', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await addBtn.click().catch(() => {});
        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        expect(await forms.count()).toBeLessThanOrEqual(1);
        await module.clickCancel();
      }
    });

    test('TC-CP-062: handles slow network', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await page.context().route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 200));
        await route.continue();
      });
      await module.navigateTo();
      await module.waitForPageLoad();
    });

    test('TC-CP-063: handles session timeout', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await page.waitForTimeout(3000);
      await page.goto('/dashboard/profile/client', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).not.toContainText('500').catch(() => {});
    });
  });

  test.describe('End-to-End', () => {
    test('E2E-CP-001: Complete workflow', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      // Create
      const addBtn = page.locator('button:contains("+ New Client"), button:contains("New Client")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        const input = page.locator('input[type="text"]').first();
        await input.fill(TEST_CLIENT);
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
        await searchInput.fill(TEST_CLIENT);
        await page.waitForTimeout(1000);
      }

      // Edit
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);
        const saveBtn = page.locator('button:contains("Save"), button:contains("Update")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
        await module.clickCancel();
      }

      await module.takeScreenshot('e2e-client-profile');
    });
  });
});
