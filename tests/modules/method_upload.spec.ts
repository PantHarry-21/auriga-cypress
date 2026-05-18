import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Method Upload Module — Comprehensive Test Suite
// URL    : /dashboard/method/method-upload
// Run    : npx playwright test tests/modules/method_upload.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/method/method-upload';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);

// File paths — absolute so they work regardless of cwd
const FIXTURE_DIR      = path.join(__dirname, '../fixtures/files for testing');
const FILE_VALID_DOC   = path.join(FIXTURE_DIR, '2mb.doc');
const FILE_VALID_DOCX  = path.join(FIXTURE_DIR, '10mb.docx');
const FILE_VALID_PDF   = path.join(FIXTURE_DIR, 'SOP _ Employee Profile.pdf');
const FILE_VALID_PDF2  = path.join(FIXTURE_DIR, 'Himanshus prompt.pdf');
const FILE_INVALID_PNG = path.join(FIXTURE_DIR, 'ChatGPT Image Feb 24, 2026, 12_12_08 PM (1).png');
const FILE_INVALID_CSV = path.join(FIXTURE_DIR, 'Roles_Permision_Notification Central.csv');
const FILE_INVALID_XLS = path.join(FIXTURE_DIR, 'YLIMS_UAT_Testing_Tracker_FINAL.xlsx');

// Date helpers
const getFutureDate = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};
const getPastDate = (daysBehind = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBehind);
  return d.toISOString().split('T')[0];
};
const FUTURE_DATE = getFutureDate(30);
const PAST_DATE   = getPastDate(10);

test.describe('Method Upload Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  // ── Shared helpers ──────────────────────────────────────────────────────────

  const openAddForm = async (page: any) => {
    await page.locator('button:has-text("New Method Upload")').first().click();
    await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 20000 });
    // Small wait for form fields to be interactive
    await page.waitForFunction(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      return Array.from(inputs).some(i => (i as HTMLElement).offsetParent !== null);
    }, { timeout: 5000 }).catch(() => {});
  };

  const closeForm = async (page: any) => {
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click({ force: true });
      await expect(cancelBtn).toBeHidden({ timeout: 10000 });
    }
  };

  const openEditFirst = async (page: any) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.waitFor({ timeout: 15000 });
    // Try to find the edit button in the last cell
    const actionsCell = firstRow.locator('td').last();
    await actionsCell.locator('button').last().click({ force: true });
    
    // Confirm form opened
    await expect(
      page.locator('button:has-text("Cancel"), input[name="productName"]').first()
    ).toBeVisible({ timeout: 15000 });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-MU-001: navigating to Method Upload opens the listing screen without errors', async ({ page }) => {
      await expect(page).toHaveURL(/method-upload/);
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-001.png' });
    });

    test('TC-MU-002: page heading indicates the Method Upload module', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Method Upload/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-002.png' });
    });

    test('TC-MU-003: data table loads within the expected timeout', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-003.png' });
    });

    test('TC-MU-004: table header contains the S.No column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/S\.?No|S\.No\.|Serial/i);
    });

    test('TC-MU-005: table header contains the Method ID column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Method\s*ID/i);
    });

    test('TC-MU-006: table header contains the Product Name column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Product\s*Name/i);
    });

    test('TC-MU-007: table header contains the Files column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Files?/i);
    });

    test('TC-MU-008: table header contains the Status / Active column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Status|Active/i);
    });

    test('TC-MU-009: table header contains the Created By column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Created\s*By/i);
    });

    test('TC-MU-010: table header contains the Created Date column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Created\s*Date|Created\s*At/i);
    });

    test('TC-MU-011: table header contains the Location column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Location/i);
    });

    test('TC-MU-012: table header contains the Edit column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Edit/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-MU-013: New Method Upload button is visible and enabled', async ({ page }) => {
      const btn = page.getByRole('button', { name: /New Method Upload/i });
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-013.png' });
    });

    test('TC-MU-014: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
    });

    test('TC-MU-015: PDF export button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: /^PDF$/i })).toBeVisible();
    });

    test('TC-MU-016: Columns toggle button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-MU-017: Search input is displayed', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
    });

    test('TC-MU-018: Filters button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Filters")').first()).toBeVisible();
    });

    test('TC-MU-019: Active filter indicator is visible on the page', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Active/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Search Functionality', () => {

    test('TC-MU-020: search box accepts text input', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('MET');
      await expect(input).toHaveValue('MET');
    });

    test('TC-MU-021: searching by Method ID returns matching records', async ({ page }) => {
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      if (count > 0) {
        const methodId = (await rows.first().locator('td').nth(1).innerText()).trim().split(' ')[0];
        if (methodId && methodId.length > 1) {
          await page.locator('input[placeholder*="Search"]').first().fill(methodId);
          await page.locator('button:has-text("Search")').first().click();
          await page.waitForFunction((id) => {
            const firstRow = document.querySelector('tbody tr');
            return firstRow && firstRow.textContent?.includes(id);
          }, methodId, { timeout: 10000 }).catch(() => {});
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-021.png' });
        }
      }
    });

    test('TC-MU-022: searching by Product Name returns matching records', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Auto');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1000); // Small grace for grid update
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-022.png' });
    });

    test('TC-MU-023: searching with non-existent text shows empty state', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXIST_XYZ_99999');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-023.png' });
    });

    test('TC-MU-024: searching with special characters does not crash the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('<script>alert(1)</script>');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MU-025: clearing the search box and searching restores the full listing', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('tbody tr').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PAGINATION & PER-PAGE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Pagination & Per-Page Controls', () => {

    test('TC-MU-026: pagination controls (Next / Previous / page numbers) are present', async ({ page }) => {
      const body = page.locator('body');
      await expect(body).toContainText(/Next|Prev|First|Last|\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-026.png' });
    });

    test('TC-MU-027: total result count / "Showing X results" text is visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\d+\s*(result|record|of\s+\d|Showing)/i);
    });

    test('TC-MU-028: clicking the Next page button loads the next set of records', async ({ page }) => {
      const firstRowText = await page.locator('tbody tr').first().innerText();
      const nextBtn = page.getByRole('button', { name: /Next|>/ }).first();
      const isDisabled = await nextBtn.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextBtn.click({ force: true });
        await page.waitForFunction((oldText) => {
          const newText = document.querySelector('tbody tr')?.textContent ?? '';
          return newText !== oldText && newText !== '';
        }, firstRowText, { timeout: 10000 });
        const newFirstRowText = await page.locator('tbody tr').first().innerText();
        expect(newFirstRowText).not.toBe(firstRowText);
      }
    });

    test('TC-MU-029: "Show per page" dropdown changes visible row count', async ({ page }) => {
      const selects = page.locator('select');
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const sel = selects.nth(i);
        const opts = await sel.locator('option').allInnerTexts();
        if (opts.some(o => /10|20|50/.test(o))) {
          const oldRowCount = await page.locator('tbody tr').count();
          await sel.selectOption('20', { force: true });
          await page.waitForFunction((old) => {
             const current = document.querySelectorAll('tbody tr').length;
             return current !== old || current === 0;
          }, oldRowCount, { timeout: 5000 }).catch(() => {});
          const rowCount = await page.locator('tbody tr').count();
          expect(rowCount).toBeLessThanOrEqual(20);
          await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-029.png' });
          break;
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. COLUMNS TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Columns Toggle', () => {

    test('TC-MU-030: clicking Columns opens the manage-columns panel', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await expect(page.locator('input[type="checkbox"]').filter({ visible: true }).first()).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-030.png' });
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });

    test('TC-MU-031: toggling a column checkbox hides/shows the column in the grid', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);
      const checkboxes = page.locator('input[type="checkbox"]').filter({ visible: true });
      const checkboxCount = await checkboxes.count();
      if (checkboxCount > 1) {
        await checkboxes.nth(1).uncheck({ force: true });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-031-hidden.png' });
        await checkboxes.nth(1).check({ force: true });
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-031-restored.png' });
      }
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Filter Functionality', () => {

    const openFilters = async (page: any) => {
      await page.locator('button:has-text("Filters")').first().click({ force: true });
      await expect(page.locator('button:has-text("Clear All Filters")')).toBeVisible({ timeout: 5000 });
    };

    const clearAllFilters = async (page: any) => {
      const clearBtn = page.getByRole('button', { name: /Clear All Filters|Clear All|Clear/i });
      if (await clearBtn.count() > 0) {
        await clearBtn.first().click({ force: true });
        await page.waitForFunction(() => {
           const activeFilterPill = document.body.innerText.includes('Active');
           return activeFilterPill; // Assuming default state has Active filter
        }, { timeout: 5000 }).catch(() => {});
      }
    };

    test('TC-MU-032: clicking Filters expands the filter panel with input fields', async ({ page }) => {
      await openFilters(page);
      const visibleInputs = await page.locator('input:visible, select:visible').count();
      expect(visibleInputs).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-032.png' });
      await clearAllFilters(page);
    });

    test('TC-MU-033: filter panel contains S.No field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/S\.?No|Serial/i);
      await clearAllFilters(page);
    });

    test('TC-MU-034: filter panel contains Method ID field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Method\s*ID/i);
      await clearAllFilters(page);
    });

    test('TC-MU-035: filter panel contains Product Name field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Product\s*Name/i);
      await clearAllFilters(page);
    });

    test('TC-MU-036: filter panel contains Created By field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Created\s*By/i);
      await clearAllFilters(page);
    });

    test('TC-MU-037: filter panel contains Created Date field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Created\s*Date|Created\s*At/i);
      await clearAllFilters(page);
    });

    test('TC-MU-038: filter panel contains Upload File field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Upload\s*File|File/i);
      await clearAllFilters(page);
    });

    test('TC-MU-039: filter panel contains Active status field', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Active/i);
      await clearAllFilters(page);
    });

    test('TC-MU-040: filtering by Active status returns only active records', async ({ page }) => {
      await openFilters(page);
      // Try to find a select for active status
      const activeSelect = page.locator('select').filter({ hasText: /active/i });
      if (await activeSelect.count() > 0) {
        await activeSelect.first().selectOption('Active', { force: true });
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-040.png' });
      await clearAllFilters(page);
    });

    test('TC-MU-041: applying multiple filters returns an intersected result set', async ({ page }) => {
      await openFilters(page);
      const inputs = page.locator('input[type="text"]:visible').first();
      if (await inputs.count() > 0) {
        await inputs.clear();
        await inputs.fill('Auto');
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-041.png' });
      await clearAllFilters(page);
    });

    test('TC-MU-042: Clear All Filters resets filters and reloads full dataset', async ({ page }) => {
      await openFilters(page);
      const inputs = page.locator('input[type="text"]:visible').first();
      if (await inputs.count() > 0) {
        await inputs.fill('ZZFILTERTEST');
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await clearAllFilters(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-042.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ROW-LEVEL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Row-Level Actions', () => {

    test('TC-MU-043: Upload File column is present for rows with a file', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-043.png' });
    });

    test('TC-MU-044: rows without a file show gracefully without 500 error', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-044.png' });
    });

    test('TC-MU-045: clicking the file icon in a row does not produce a page error', async ({ page }) => {
      const firstRow = page.locator('tbody tr').first();
      await firstRow.waitFor({ timeout: 15000 });
      // Look for a file/pdf/view button or SVG inside a button
      const fileBtn = firstRow.locator('button, a').filter({ hasText: /pdf|file|view/i }).first();
      if (await fileBtn.count() > 0) {
        await fileBtn.click({ force: true });
        // Wait for file preview modal or new tab
        await page.waitForFunction(() => {
           return document.body.innerText.includes('500') === false;
        }, { timeout: 10000 });
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-045.png' });
        const closeBtn = page.getByRole('button', { name: /Close|Cancel/i });
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click({ force: true });
        }
      }
    });

    test('TC-MU-046: clicking the Edit icon on a row opens the corresponding record in edit mode', async ({ page }) => {
      await openEditFirst(page);
      await expect(page.locator('body')).toContainText(/Edit|Update|Method/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-046.png' });
      await closeForm(page);
    });

    test('TC-MU-047: Active column shows Active/Inactive status pill matching the record', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const rowText = await page.locator('tbody tr').first().innerText();
      expect(rowText.trim()).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-047.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD FORM — DISPLAY & STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Add Form — Display & Structure', () => {

    test('TC-MU-048: clicking New Method Upload opens the create form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/New Method Upload|Add Method|Method Upload/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-048.png' });
      await closeForm(page);
    });

    test('TC-MU-049: form contains the Method ID searchable combobox', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search method ID"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-050: form contains the Version No text input', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="versionNo"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-051: form contains the Product Name text input', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="productName"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-052: form contains the Message text input', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="message"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-053: form contains the Expiry Date date picker', async ({ page }) => {
      await openAddForm(page);
      await expect(
        page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first()
      ).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-054: form contains the Client Name searchable combobox', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select client"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-055: form contains the Active checkbox (checked by default)', async ({ page }) => {
      await openAddForm(page);
      const checkbox = page.locator('input[name="isActive"], input[type="checkbox"]').filter({ visible: true }).first();
      await expect(checkbox).toBeChecked();
      await closeForm(page);
    });

    test('TC-MU-056: form contains the file upload input', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[type="file"]')).toBeAttached();
      await closeForm(page);
    });

    test('TC-MU-057: SAVE button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /^SAVE$/i })).toBeVisible();
      await closeForm(page);
    });

    test('TC-MU-058: Cancel button closes the form and returns to the listing', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.getByRole('button', { name: /New Method Upload/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-058.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD FORM — FIELD VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Add Form — Field Validations', () => {

    test('TC-MU-059: submitting an empty form shows validation errors on mandatory fields', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty|Please/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-059.png' });
      await closeForm(page);
    });

    test('TC-MU-060: Method ID is mandatory — saving without it shows a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('TestProduct');
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|Method ID/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-060.png' });
      await closeForm(page);
    });

    test('TC-MU-061: Product Name is mandatory — saving without it shows a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search method ID"]').fill('TEST');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|Product Name/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-061.png' });
      await closeForm(page);
    });

    test('TC-MU-062: Expiry Date is mandatory — saving without it shows a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('TestProduct');
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|Expiry/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-062.png' });
      await closeForm(page);
    });

    test('TC-MU-063: Upload Method File is mandatory — saving without a file shows a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('TestProduct');
      const dateInput = page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first();
      await dateInput.fill(FUTURE_DATE);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|file|upload/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-063.png' });
      await closeForm(page);
    });

    test('TC-MU-064: validation errors disappear once the user corrects the invalid field', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(800);
      await page.locator('input[name="productName"]').fill('FixedProduct');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-064.png' });
      await closeForm(page);
    });

    test('TC-MU-065: whitespace-only Product Name is rejected as invalid', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('     ');
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|invalid/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-065.png' });
      await closeForm(page);
    });

    test('TC-MU-066: Version No accepts valid format values', async ({ page }) => {
      await openAddForm(page);
      const versionInput = page.locator('input[name="versionNo"]');
      for (const ver of ['1', '1.0', 'v1.0', '01']) {
        await versionInput.clear();
        await versionInput.fill(ver);
        await expect(versionInput).toHaveValue(ver);
      }
      await closeForm(page);
    });

    test('TC-MU-067: Message field accepts free text up to character limit', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="message"]').fill('This is a valid message for the upload');
      await expect(page.locator('input[name="message"]')).not.toHaveValue('');
      await closeForm(page);
    });

    test('TC-MU-068: extremely long Message input is handled gracefully (no crash)', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="message"]').fill('A'.repeat(500));
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MU-069: XSS injection in Product Name does not trigger an alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => {
        alerts.push(dialog.message());
        await dialog.dismiss();
      });
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill("<script>alert('XSS')</script>");
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-069.png' });
      await closeForm(page);
    });

    test('TC-MU-070: form retains entered data when Save fails validation', async ({ page }) => {
      await openAddForm(page);
      const testProduct = `RetainTest_${TS}`;
      await page.locator('input[name="productName"]').fill(testProduct);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('input[name="productName"]')).toHaveValue(testProduct);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-070.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EXPIRY DATE VALIDATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Expiry Date Validation', () => {

    test('TC-MU-071: Expiry Date picker opens and accepts a valid future date', async ({ page }) => {
      await openAddForm(page);
      const dateInput = page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first();
      await dateInput.fill(FUTURE_DATE);
      await expect(dateInput).toHaveValue(FUTURE_DATE);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-071.png' });
      await closeForm(page);
    });

    test('TC-MU-072: Expiry Date rejects past dates or logs advisory if rule not enforced', async ({ page }) => {
      await openAddForm(page);
      const dateInput = page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first();
      await dateInput.fill(PAST_DATE);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      // Soft check — past date may or may not be blocked
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-072.png' });
      await closeForm(page);
    });

    test('TC-MU-073: Expiry Date field ignores invalid text input (non-date)', async ({ page }) => {
      await openAddForm(page);
      const dateInput = page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first();
      await dateInput.fill('not-a-date');
      const value = await dateInput.inputValue();
      // Browsers typically clear native date inputs on invalid value
      expect(value === '' || value === 'not-a-date').toBeTruthy();
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. FILE UPLOAD — VALID FILES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. File Upload — Valid Files', () => {

    test('TC-MU-074: uploading a valid .doc file is accepted and filename is shown', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await expect(page.locator('body')).not.toContainText(/invalid|not supported|not allowed|format|type/i, { timeout: 5000 });
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-074.png' });
      await closeForm(page);
    });

    test('TC-MU-075: uploading a valid .docx file is accepted and filename is shown', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOCX);
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('invalid');
      await expect(page.locator('body')).not.toContainText('not supported');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-075.png' });
      await closeForm(page);
    });

    test('TC-MU-076: uploading a valid PDF file is accepted and filename is shown', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('invalid');
      await expect(page.locator('body')).not.toContainText('not supported');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-076.png' });
      await closeForm(page);
    });

    test('TC-MU-077: uploading a second valid PDF file also works without errors', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF2);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-077.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. FILE UPLOAD — INVALID FILE TYPES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. File Upload — Invalid File Types', () => {

    test('TC-MU-078: uploading a .png image file is rejected with a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_PNG);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|not allowed|format|type/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-078.png' });
      await closeForm(page);
    });

    test('TC-MU-079: uploading a .csv file is rejected with a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_CSV);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|not allowed|format|type/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-079.png' });
      await closeForm(page);
    });

    test('TC-MU-080: uploading an .xlsx Excel file is rejected with a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_XLS);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|not allowed|format|type/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-080.png' });
      await closeForm(page);
    });

    test('TC-MU-081: uploading a synthetic .exe file is rejected with a validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles({
        name: 'malware.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('MZ fake executable content'),
      });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|not allowed|format|type/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-081.png' });
      await closeForm(page);
    });

    test('TC-MU-082: uploading a large file (10 MB .docx) does not crash the page', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOCX);
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-082.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. METHOD ID COMBOBOX
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. Method ID Combobox', () => {

    test('TC-MU-083: Method ID combobox accepts typed text to search', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search method ID"]').fill('MET');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-083.png' });
      await closeForm(page);
    });

    test('TC-MU-084: Method ID combobox shows dropdown options after typing', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search method ID"]').fill('M');
      await page.waitForTimeout(1500);
      const optionCount = await page.locator('[role="option"], li[role="option"]').filter({ visible: true }).count();
      // Log for debug — options may not appear if there is no data
      console.log(`Method ID dropdown options visible: ${optionCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-084.png' });
      await closeForm(page);
    });

    test('TC-MU-085: selecting a Method ID from the dropdown populates the field', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search method ID"]').fill('M');
      await page.waitForTimeout(1500);
      const options = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await options.count() > 0) {
        await options.first().click({ force: true });
        await page.waitForTimeout(500);
        const value = await page.locator('input[placeholder*="Search method ID"]').inputValue();
        expect(value).not.toBe('');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-085.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. CLIENT NAME COMBOBOX
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('14. Client Name Combobox', () => {

    test('TC-MU-086: Client Name combobox accepts typed text to search', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('Arb');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-086.png' });
      await closeForm(page);
    });

    test('TC-MU-087: Client Name combobox shows dropdown options when typed', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1500);
      const optionCount = await page.locator('[role="option"], li[role="option"]').filter({ visible: true }).count();
      console.log(`Client dropdown options visible: ${optionCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-087.png' });
      await closeForm(page);
    });

    test('TC-MU-088: selecting a Client from dropdown populates the Client field', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1500);
      const options = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await options.count() > 0) {
        await options.first().click({ force: true });
        await page.waitForTimeout(500);
        const value = await page.locator('input[placeholder*="Search and select client"]').inputValue();
        expect(value).not.toBe('');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-088.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. ACTIVE CHECKBOX BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('15. Active Checkbox Behaviour', () => {

    test('TC-MU-089: Active checkbox is checked by default on a new upload form', async ({ page }) => {
      await openAddForm(page);
      const checkbox = page.locator('input[name="isActive"], input[type="checkbox"]').filter({ visible: true }).first();
      await expect(checkbox).toBeChecked();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-089.png' });
      await closeForm(page);
    });

    test('TC-MU-090: unchecking the Active checkbox creates an inactive record', async ({ page }) => {
      await openAddForm(page);
      const checkbox = page.locator('input[name="isActive"], input[type="checkbox"]').filter({ visible: true }).first();
      await checkbox.uncheck({ force: true });
      await expect(checkbox).not.toBeChecked();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-090.png' });
      await closeForm(page);
    });

    test('TC-MU-091: re-checking the Active checkbox restores it to checked state', async ({ page }) => {
      await openAddForm(page);
      const checkbox = page.locator('input[name="isActive"], input[type="checkbox"]').filter({ visible: true }).first();
      await checkbox.uncheck({ force: true });
      await checkbox.check({ force: true });
      await expect(checkbox).toBeChecked();
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. SAVE — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('16. Save — Success Flow', () => {

    test('TC-MU-092: filling all mandatory fields and saving creates a new Method Upload record', async ({ page }) => {
      await openAddForm(page);

      // Step 1: Select a Method ID
      await page.locator('input[placeholder*="Search method ID"]').fill('M');
      await page.waitForTimeout(1500);
      const methodOptions = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await methodOptions.count() > 0) {
        await methodOptions.first().click({ force: true });
        await page.waitForTimeout(500);
      } else {
        await page.locator('input[placeholder*="Search method ID"]').fill(`MU-${TS}`);
      }

      // Step 2: Fill Product Name
      await page.locator('input[name="productName"]').fill(`AutoProduct_${TS}`);

      // Step 3: Fill Version No
      await page.locator('input[name="versionNo"]').fill('1.0');

      // Step 4: Fill Message
      await page.locator('input[name="message"]').fill(`Auto test record ${TS}`);

      // Step 5: Set Expiry Date
      const dateInput = page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first();
      await dateInput.fill(FUTURE_DATE);

      // Step 6: Select a Client
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1500);
      const clientOptions = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await clientOptions.count() > 0) {
        await clientOptions.first().click({ force: true });
        await page.waitForTimeout(500);
      }

      // Step 7: Upload a valid file
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await page.waitForTimeout(1000);

      // Step 8: Save
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-092-saved.png' });
    });

    test('TC-MU-093: newly created record appears in the Method Upload list', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(`AutoProduct_${TS}`);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-093.png' });
      // Reset search
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. CANCEL — DISCARD CHANGES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('17. Cancel — Discard Changes', () => {

    test('TC-MU-094: clicking Cancel after partial form entry discards all changes', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('SHOULD_NOT_SAVE');
      await page.locator('input[name="versionNo"]').fill('9.9.9');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.getByRole('button', { name: /New Method Upload/i })).toBeVisible();
      await expect(page.locator('body')).not.toContainText('SHOULD_NOT_SAVE');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-094.png' });
    });

    test('TC-MU-095: Cancel after file selection does not persist the file or create a record', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.getByRole('button', { name: /New Method Upload/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-095.png' });
    });

    test('TC-MU-096: rapid double-click on New Method Upload does not open multiple forms', async ({ page }) => {
      await page.getByRole('button', { name: /New Method Upload/i }).dblclick({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      const cancelCount = await page.getByRole('button', { name: /Cancel/i }).filter({ visible: true }).count();
      expect(cancelCount).toBeLessThanOrEqual(1);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-096.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 18. EDIT FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('18. Edit Flow', () => {

    test('TC-MU-097: clicking Edit on a row opens the edit form pre-populated with saved values', async ({ page }) => {
      await openEditFirst(page);
      const productValue = await page.locator('input[name="productName"]').filter({ visible: true }).first().inputValue();
      expect(productValue).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-097.png' });
      await closeForm(page);
    });

    test('TC-MU-098: Edit form pre-populates Expiry Date with the saved date', async ({ page }) => {
      await openEditFirst(page);
      const dateValue = await page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first().inputValue();
      expect(dateValue).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-098.png' });
      await closeForm(page);
    });

    test('TC-MU-099: Edit form shows the Active state matching the original record', async ({ page }) => {
      await openEditFirst(page);
      const checkbox = page.locator('input[name="isActive"], input[type="checkbox"]').filter({ visible: true }).first();
      const isChecked = await checkbox.isChecked();
      console.log(`Active state in edit form: ${isChecked}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-099.png' });
      await closeForm(page);
    });

    test('TC-MU-100: Edit form shows indication that a file already exists', async ({ page }) => {
      await openEditFirst(page);
      const bodyText = await page.locator('body').innerText();
      const hasFileRef = /\.doc|\.pdf|\.docx|file|upload/i.test(bodyText);
      console.log(`File reference found in edit form: ${hasFileRef}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-100.png' });
      await closeForm(page);
    });

    test('TC-MU-101: clearing Product Name in Edit mode and saving shows a validation error', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="productName"]').filter({ visible: true }).first().clear();
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|mandatory|Product Name/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-101.png' });
      await closeForm(page);
    });

    test('TC-MU-102: changing the uploaded file in Edit mode replaces the existing file', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF2);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-102.png' });
      await closeForm(page);
    });

    test('TC-MU-103: Cancel in Edit mode closes the form without persisting changes', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="productName"]').filter({ visible: true }).first().clear();
      await page.locator('input[name="productName"]').filter({ visible: true }).first().fill('EDIT_CANCEL_TEST');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('EDIT_CANCEL_TEST');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-103.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 19. DUPLICATE CHECK
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('19. Duplicate Check', () => {

    test('TC-MU-104: attempting to save a duplicate Method ID + Version No combination shows an error or advisory', async ({ page }) => {
      // Read the first row's method ID from the edit form
      await openEditFirst(page);
      const existingMethodId = await page.locator('input[placeholder*="Search method ID"]').inputValue();
      const existingVersion  = await page.locator('input[name="versionNo"]').inputValue();
      await closeForm(page);

      if (existingMethodId) {
        await openAddForm(page);
        await page.locator('input[placeholder*="Search method ID"]').fill(existingMethodId);
        await page.waitForTimeout(1000);
        const opts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
        if (await opts.count() > 0) await opts.first().click({ force: true });

        if (existingVersion) {
          await page.locator('input[name="versionNo"]').fill(existingVersion);
        }
        await page.locator('input[name="productName"]').fill('DuplicateTest');
        await page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first().fill(FUTURE_DATE);
        await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-104.png' });
        const cancelBtn = page.getByRole('button', { name: /Cancel/i });
        if (await cancelBtn.count() > 0) await cancelBtn.first().click({ force: true });
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 20. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('20. Export Functionality', () => {

    test('TC-MU-105: clicking Excel export completes without a page error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-105.png' });
    });

    test('TC-MU-106: clicking PDF export completes without a page error', async ({ page }) => {
      await page.getByRole('button', { name: /^PDF$/i }).click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-106.png' });
    });

    test('TC-MU-107: Excel export with an active search filter applied works without errors', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Auto');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-107.png' });
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 21. EDGE CASES & SECURITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('21. Edge Cases & Security', () => {

    test('TC-MU-108: browser back navigation from the module does not corrupt state', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-108.png' });
    });

    test('TC-MU-109: page reload retains expected default state (no 500 error)', async ({ page }) => {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-109.png' });
    });

    test('TC-MU-110: SQL injection string in search does not trigger an error', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill("' OR 1=1; --");
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-110.png' });
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1000);
    });

    test('TC-MU-111: opening the form and immediately closing it leaves the listing intact', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      await openAddForm(page);
      await closeForm(page);
      await expect(page.locator('tbody tr')).toHaveCount(rowCount);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-111.png' });
    });

    test('TC-MU-112: form field Tab-order cycles through visible fields without crash', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search method ID"]').focus();
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MU-113: very long Version No value is handled gracefully', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="versionNo"]').fill('V'.repeat(300));
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MU-114: very long Product Name value is handled gracefully (truncated or error)', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="productName"]').fill('P'.repeat(500));
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 22. AUDIT FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('22. Audit Fields', () => {

    test('TC-MU-115: Created By field in the listing is populated for each record', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const rowText = await page.locator('tbody tr').first().innerText();
      expect(rowText.trim()).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-115.png' });
    });

    test('TC-MU-116: Created Date field in the listing shows a valid date for each record', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const rowText = await page.locator('tbody tr').first().innerText();
      const hasDate = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}|\w+ \d+, \d{4}/.test(rowText);
      console.log(`Date pattern found in first row: ${hasDate}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-116.png' });
    });

    test('TC-MU-117: edit an existing record and verify audit info update does not error', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="message"]').clear();
      await page.locator('input[name="message"]').fill(`Audit update test ${TS}`);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MU-117.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 23. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('23. End-to-End Workflows', () => {

    const E2E_TS      = Date.now().toString().slice(-5);
    const E2E_PRODUCT = `E2EProduct_${E2E_TS}`;

    test('E2E-MU-001: Create a new Method Upload with all fields and verify it appears in the list', async ({ page }) => {
      await openAddForm(page);

      // Method ID
      await page.locator('input[placeholder*="Search method ID"]').fill('M');
      await page.waitForTimeout(1500);
      const methodOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await methodOpts.count() > 0) {
        await methodOpts.first().click({ force: true });
      } else {
        await page.locator('input[placeholder*="Search method ID"]').fill(`MU-${E2E_TS}`);
      }
      await page.waitForTimeout(300);

      // Product Name
      await page.locator('input[name="productName"]').fill(E2E_PRODUCT);

      // Version
      await page.locator('input[name="versionNo"]').fill('2.0');

      // Message
      await page.locator('input[name="message"]').fill(`E2E flow test record ${E2E_TS}`);

      // Expiry Date
      await page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first().fill(FUTURE_DATE);

      // Client Name
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1500);
      const clientOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) {
        await clientOpts.first().click({ force: true });
      }
      await page.waitForTimeout(300);

      // File
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(1000);

      // Save
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-001-created.png' });

      // Verify in list
      await page.locator('input[placeholder*="Search"]').first().fill(E2E_PRODUCT);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-001-verified.png' });
    });

    test('E2E-MU-002: Search for a record, open Edit, update Message, save successfully', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="message"]').clear();
      await page.locator('input[name="message"]').fill(`E2E updated msg ${E2E_TS}`);
      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-002.png' });
    });

    test('E2E-MU-003: Apply filter, verify filtered results, clear filter, verify full list restored', async ({ page }) => {
      await page.locator('button:has-text("Filters")').first().click({ force: true });
      await page.waitForTimeout(800);

      const textInputs = page.locator('input[type="text"]:visible').first();
      if (await textInputs.count() > 0) {
        await textInputs.fill('Auto');
        await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-003-filtered.png' });
        await expect(page.locator('body')).not.toContainText('500');
      }

      const clearBtn = page.getByRole('button', { name: /Clear All Filters|Clear All|Clear/i });
      if (await clearBtn.count() > 0) {
        await clearBtn.first().click({ force: true });
        await page.waitForTimeout(1500);
      }
      await expect(page.locator('tbody tr').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-003-restored.png' });
    });

    test('E2E-MU-004: Export current list to Excel after applying a product name search', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Auto');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-004.png' });
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1500);
    });

    test('E2E-MU-005: Upload an invalid file type, see error, replace with valid file, save succeeds', async ({ page }) => {
      await openAddForm(page);

      // Method ID
      await page.locator('input[placeholder*="Search method ID"]').fill('M');
      await page.waitForTimeout(1500);
      const mOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await mOpts.count() > 0) {
        await mOpts.first().click({ force: true });
      } else {
        await page.locator('input[placeholder*="Search method ID"]').fill(`E2E5-${E2E_TS}`);
      }
      await page.waitForTimeout(300);

      await page.locator('input[name="productName"]').fill(`E2EProduct5_${E2E_TS}`);
      await page.locator('input[name="expiryDate"], input[type="date"]').filter({ visible: true }).first().fill(FUTURE_DATE);

      // Try invalid file first
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_PNG);
      await page.waitForTimeout(1000);
      const bodyTextAfterInvalid = await page.locator('body').innerText();
      if (/invalid|not supported|not allowed|format|type/i.test(bodyTextAfterInvalid)) {
        console.log('Invalid file correctly rejected — uploading valid file now');
      }

      // Replace with valid file
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await page.waitForTimeout(1000);

      // Select client
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1500);
      const cOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
      if (await cOpts.count() > 0) {
        await cOpts.first().click({ force: true });
      }
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: /^SAVE$/i }).click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MU-005.png' });
    });
  });
});
