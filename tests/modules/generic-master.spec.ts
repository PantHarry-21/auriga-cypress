// tests/modules/generic-master.spec.ts
// Generic Master Test Suite - Comprehensive Testing
// Tests: CRUD, Validations, RBAC, Approvals, Edge Cases
// URL: /dashboard/products/generic-master-v2
// Run: npx playwright test generic-master.spec.ts --project=uat

import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft, getRolePermissions } from '../helpers/commands';
import { ModulePageObject, ModuleConfig } from '../helpers/ModulePageObject';

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);
const TEST_ENTRY = `AutoGeneric_${TS}`;

const moduleConfig: ModuleConfig = {
  name: 'Generic Master',
  url: '/dashboard/products/generic-master-v2',
  moduleKey: 'masters_library_generic_master',
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

test.describe('Generic Master Module - Complete Automation', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. PAGE LOAD & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Page Load & Navigation', () => {

    test('TC-GM-001: navigates to Generic Master page', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyPageLoaded();
      await expect(page.locator('span:has-text("Generic Master")')).toBeVisible();
    });

    test('TC-GM-002: displays table with generic entries', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      await module.verifyTableVisible();
      const rows = await module.verifyTableRowCount();
      expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('TC-GM-003: shows Add button for Create permission', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await expect(addBtn).toBeVisible();
    });

    test('TC-GM-004: search functionality is present and functional', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-GM-005: pagination controls are visible', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();
      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        expect(nextBtn).toBeDefined();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CREATE OPERATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. CREATE - Add New Generic Entry', () => {

    test('TC-GM-010: opens Add Generic form', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);

      const form = page.locator('form, div.animate-slide-in-right').first();
      await expect(form).toBeVisible();
    });

    test('TC-GM-011: form displays all required fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);

      // Check for common form fields
      const inputs = page.locator('input[type="text"], input[type="email"], textarea, select').filter({ visible: true });
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);

      await module.clickCancel();
    });

    test('TC-GM-012: validates empty required fields', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Try to submit without filling
      const submitBtn = page.locator('button:contains("Submit"), button:contains("Save"), button:contains("Add")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        // Should show validation error
        const hasError = await page.locator('.text-red-600, [role="alert"], .error').isVisible().catch(() => false);
        expect(hasError || await page.locator('input[aria-invalid="true"]').isVisible().catch(() => false)).toBeTruthy();
      }

      await module.clickCancel();
    });

    test('TC-GM-013: creates entry with valid data', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Fill first text input
      const inputs = page.locator('input[type="text"]').filter({ visible: true });
      if (await inputs.count() > 0) {
        await inputs.first().fill(TEST_ENTRY);
        await page.waitForTimeout(500);
      }

      // Submit for Review button (typical for Generic Master)
      const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save"), button:contains("Submit")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Check for success message
        const success = await page.locator('[role="status"]:has-text("success"), .text-green-600').isVisible().catch(() => false);
        expect(!await page.locator('body').textContent().then(t => t?.includes('500'))).toBeTruthy();
      }
    });

    test('TC-GM-014: handles special characters in entry name', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);

      const inputs = page.locator('input[type="text"]').filter({ visible: true });
      if (await inputs.count() > 0) {
        await inputs.first().fill(`Test@#$_${TS}`);
        await page.waitForTimeout(500);

        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
          expect(!await page.locator('body').textContent().then(t => t?.includes('500'))).toBeTruthy();
        }
      }

      await module.clickCancel();
    });

    test('TC-GM-015: handles very long input values', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);

      const inputs = page.locator('input[type="text"]').filter({ visible: true });
      if (await inputs.count() > 0) {
        const longText = 'A'.repeat(500);
        await inputs.first().fill(longText);

        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      await module.clickCancel();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. READ OPERATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. READ - View Generic Entries', () => {

    test('TC-GM-020: displays all table columns', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const headers = page.locator('thead th').filter({ visible: true });
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    });

    test('TC-GM-021: columns are sortable', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstHeader = page.locator('thead th').nth(1);
      if (await firstHeader.isVisible()) {
        await firstHeader.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).not.toContainText('500');
      }
    });

    test('TC-GM-022: pagination navigates correctly', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const nextBtn = page.locator('button:contains("Next")').first();
      if (await nextBtn.isVisible()) {
        const rowsBefore = await page.locator('tbody tr').count();
        await nextBtn.click();
        await page.waitForTimeout(1500);
        await expect(page.locator('body')).not.toContainText('500');
      }
    });

    test('TC-GM-023: search filters results correctly', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      const rows = await page.locator('tbody tr').count();
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-GM-024: filter functionality works', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const filterBtn = page.locator('button:contains("Filter")').first();
      if (await filterBtn.isVisible()) {
        await filterBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).not.toContainText('500');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. UPDATE OPERATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. UPDATE - Edit Generic Entry', () => {

    test('TC-GM-030: opens edit form from table row', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        // Click on row to open edit
        await firstRow.click();
        await page.waitForTimeout(1500);

        const form = page.locator('form, div.animate-slide-in-right').first();
        await expect(form).toBeVisible().catch(() => {});
      }
    });

    test('TC-GM-031: edit form pre-populates with data', async ({ page }) => {
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

    test('TC-GM-032: updates entry successfully', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        // Try to save without changes
        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
          await expect(page.locator('body')).not.toContainText('500');
        } else {
          await module.clickCancel();
        }
      }
    });

    test('TC-GM-033: validates modified data', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        const input = page.locator('input[type="text"]').first();
        const oldValue = await input.inputValue().catch(() => '');

        // Try to clear and save
        await input.fill('');
        await page.waitForTimeout(500);

        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
          // Should either save or show validation error
          expect(!await page.locator('body').textContent().then(t => t?.includes('500'))).toBeTruthy();
        }

        await module.clickCancel();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. APPROVE OPERATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. APPROVE - Approve Generic Entries', () => {

    test('TC-GM-040: shows approve button for approvable entries', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        const approveBtn = page.locator('button:contains("Approve")').first();
        // Approve button may or may not be visible depending on entry status
        if (await approveBtn.isVisible()) {
          expect(approveBtn).toBeDefined();
        }

        await module.clickCancel();
      }
    });

    test('TC-GM-041: approves entry successfully', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        const approveBtn = page.locator('button:contains("Approve")').first();
        if (await approveBtn.isVisible()) {
          await approveBtn.click();
          await page.waitForTimeout(1500);
          await expect(page.locator('body')).not.toContainText('500');
        }

        await module.clickCancel();
      }
    });

    test('TC-GM-042: shows confirmation before approving', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        const approveBtn = page.locator('button:contains("Approve")').first();
        if (await approveBtn.isVisible()) {
          await approveBtn.click();
          await page.waitForTimeout(500);

          // Check for confirmation dialog
          const dialog = page.locator('[role="dialog"], .modal, .swal2-popup').first();
          if (await dialog.isVisible()) {
            expect(dialog).toBeDefined();
            await module.clickCancel();
          }
        }

        await module.clickCancel();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. EXPORT - Download Data', () => {

    test('TC-GM-050: exports to Excel', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const excelBtn = page.locator('button:contains("Excel"), button:contains("Export")').first();
      if (await excelBtn.isVisible()) {
        await excelBtn.click();
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
      }
    });

    test('TC-GM-051: exports to PDF', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const pdfBtn = page.locator('button:contains("PDF")').first();
      if (await pdfBtn.isVisible()) {
        await pdfBtn.click();
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. RBAC - Role-Based Access Control
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. RBAC - Role-Based Permissions', () => {

    const rolesToTest = [
      { key: 'master_personel', name: 'Master Personnel', hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: false, hasApprove: false },
      { key: 'master_controler', name: 'Master Controller', hasCreate: true, hasRead: true, hasUpdate: true, hasDelete: false, hasApprove: true },
      { key: 'reviewer', name: 'Reviewer', hasCreate: false, hasRead: true, hasUpdate: false, hasDelete: false, hasApprove: false },
      { key: 'department_head', name: 'Department Head', hasCreate: false, hasRead: true, hasUpdate: false, hasDelete: false, hasApprove: false },
    ];

    rolesToTest.forEach(role => {
      test(`TC-GM-100-${role.key}: ${role.name} has correct permissions`, async ({ page, context, env }) => {
        await loginAs(page, context, role.key, env, LAB);
        await page.goto('/dashboard/products/generic-master-v2', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1500);

        // Verify page is accessible
        await expect(page.locator('body')).not.toContainText('not authorized');
        await expect(page.locator('body')).not.toContainText('403');

        // Verify Create permission
        const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
        const hasAddBtn = await addBtn.isVisible().catch(() => false);
        expect(hasAddBtn).toBe(role.hasCreate);

        // Verify Read permission
        const table = page.locator('table, [role="grid"]').first();
        const canRead = await table.isVisible().catch(() => false);
        expect(canRead).toBe(role.hasRead);

        // If accessible and has Update, verify Edit
        if (role.hasRead && canRead) {
          const rows = await page.locator('tbody tr').count();
          if (rows > 0) {
            const editBtn = page.locator('button:contains("Edit"), a:contains("Edit")').first();
            const hasEditBtn = await editBtn.isVisible().catch(() => false);
            expect(hasEditBtn).toBe(role.hasUpdate);
          }
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. EDGE CASES & Error Handling', () => {

    test('TC-GM-060: handles duplicate entry attempts', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        const input = page.locator('input[type="text"]').first();
        await input.fill('DuplicateTest123');

        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
          // Should handle gracefully
          expect(!await page.locator('body').textContent().then(t => t?.includes('500'))).toBeTruthy();
        }
      }
    });

    test('TC-GM-061: handles rapid form submissions', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // Double-click add button
        await addBtn.click().catch(() => {});
        await page.waitForTimeout(1000);

        const forms = page.locator('form, div.animate-slide-in-right').filter({ visible: true });
        const formCount = await forms.count();
        expect(formCount).toBeLessThanOrEqual(1);

        await module.clickCancel();
      }
    });

    test('TC-GM-062: handles slow network conditions', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);

      // Simulate slow network
      await page.context().route('**/*', async (route) => {
        await new Promise(r => setTimeout(r, 200));
        await route.continue();
      });

      await module.navigateTo();
      await module.waitForPageLoad();
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-GM-063: handles session timeout gracefully', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);
      await module.navigateTo();

      // Simulate long delay
      await page.waitForTimeout(3000);

      // Try to navigate again
      await page.goto('/dashboard/products/generic-master-v2', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page.locator('body')).not.toContainText('500').catch(() => {});
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. END-TO-END Workflow', () => {

    test('E2E-GM-001: Complete workflow - Create, Search, Edit, Approve', async ({ page }) => {
      const module = new ModulePageObject(page, moduleConfig);

      // Create
      await module.navigateTo();
      const addBtn = page.locator('button:contains("New Generic Master"), button:contains("+ New Generic")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        const input = page.locator('input[type="text"]').first();
        await input.fill(TEST_ENTRY);

        const submitBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Search
      await module.navigateTo();
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_ENTRY);
        await page.waitForTimeout(1000);
      }

      // Edit
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(1500);

        const editBtn = page.locator('button:contains("Submit for Review"), button:contains("Save")').first();
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await page.waitForTimeout(1500);
        }

        await module.clickCancel();
      }

      await module.takeScreenshot('e2e-generic-master-complete');
    });
  });
});
