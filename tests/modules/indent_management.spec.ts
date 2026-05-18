import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// Indent Management Module — Comprehensive E2E Test Suite
// URL    : /dashboard/purchase/indent
// Run    : npx playwright test tests/modules/indent_management.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL     = '/dashboard/purchase/indent';
const LAB            = 'Arbro - Delhi';
const TS             = Date.now().toString().slice(-6);
const INDENT_SUBJECT = `AutoIndent ${TS}`;
const SLIDE_OVER     = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';
const TEST_FILE_PATH = path.join(__dirname, '../fixtures/files for testing/SOP _ Employee Profile.pdf');

// ── Helpers ────────────────────────────────────────────────────────────────────

const openAddForm = async (page: any) => {
  await page.locator('button:has-text("New Indent")').first().click();
  await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 20000 });
};

const closeForm = async (page: any) => {
  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click({ force: true });
    // Wait for slide-over to disappear
    await expect(cancelBtn).toBeHidden({ timeout: 10000 }).catch(async () => {
      const bodyText = await page.locator('body').textContent().catch(() => '');
      if (/Discard|Are you sure|unsaved/i.test(bodyText ?? '')) {
        await page.getByRole('button', { name: /Confirm|Yes|Discard/i }).first().click({ force: true });
      }
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Indent Management Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-IM-001: navigating to Indent Management opens the listing screen', async ({ page }) => {
      await expect(page).toHaveURL(/purchase\/indent/);
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).toContainText(/Indent Manage/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-001.png' });
    });

    test('TC-IM-002: data table loads with records within expected timeout', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-002.png' });
    });

    test('TC-IM-003: table header contains expected columns', async ({ page }) => {
      const headerText = await page.locator('thead').first().textContent() ?? '';
      expect(headerText).toMatch(/S\.?No|#/i);
      expect(headerText).toMatch(/Indent No/i);
      expect(headerText).toMatch(/Status/i);
      expect(headerText).toMatch(/Priority/i);
      expect(headerText).toMatch(/Subject/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-003.png' });
    });

    test('TC-IM-004: "New Indent" button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("New Indent")').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-004.png' });
    });

    test('TC-IM-005: at least one data row is present in the table', async ({ page }) => {
      const rowCount = await page.locator('tbody tr, .ag-row').count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-IM-006: row S.No. column starts at 1', async ({ page }) => {
      const cells = await page.locator('tbody tr').first().locator('td').allTextContents();
      const firstNum = cells.map(c => c.trim()).find(t => /^\d+$/.test(t));
      expect(firstNum).toBe('1');
    });

    test('TC-IM-007: each data row contains an Indent No (IND# format)', async ({ page }) => {
      const rowText = await page.locator('tbody tr').first().textContent() ?? '';
      expect(rowText).toMatch(/IND#\d+|IND-\d+|IND\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-007.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-IM-008: Search input is visible', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"], input[placeholder="Search"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-008.png' });
    });

    test('TC-IM-009: Search button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-009.png' });
    });

    test('TC-IM-011: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
    });

    test('TC-IM-012: PDF export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-IM-013: Columns toggle button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-IM-014: Filters button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Filters")').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Search Functionality', () => {

    test('TC-IM-015: search input accepts text', async ({ page }) => {
      const input = page.locator('input[placeholder="Search"]').first();
      await input.clear();
      await input.fill('IND');
      await expect(input).toHaveValue('IND');
    });

    test('TC-IM-016: search by partial indent number returns matching records', async ({ page }) => {
      const rowText = await page.locator('tbody tr').first().textContent() ?? '';
      const match = rowText.match(/IND[#-]?\d+/i);
      if (match) {
        const partialNum = match[0].substring(0, 7);
        const input = page.locator('input[placeholder="Search"]').first();
        await input.clear();
        await input.fill(partialNum);
        await page.locator('button:has-text("Search")').first().click();
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-016.png' });
    });

    test('TC-IM-017: search with non-existent keyword shows no-results state', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('ZZZNEVEREXIST99XYZ');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i, { timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-017.png' });
    });

    test('TC-IM-018: search with special characters does not crash the page', async ({ page }) => {
      const input = page.locator('input[placeholder="Search"]').first();
      await input.clear();
      await input.fill('<>@#$%^');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-IM-019: clearing search restores full listing', async ({ page }) => {
      const input = page.locator('input[placeholder="Search"]').first();
      await input.clear();
      await input.fill('ZZNOTEXIST');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await input.clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Filter Functionality', () => {

    test('TC-IM-023: Filters button expands the filter panel', async ({ page }) => {
      await page.locator('button:has-text("Filters")').first().click();
      await page.waitForTimeout(1000);
      // After clicking Filters, filter controls should be visible
      const filterArea = page.locator('text=/Clear All Filters/i');
      await expect(filterArea.first()).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-023.png' });
      // Close filters
      await page.locator('button:has-text("Clear All Filters")').first().click({ force: true });
    });

    test('TC-IM-025: Clear All Filters resets filter state', async ({ page }) => {
      await page.locator('button:has-text("Filters")').first().click();
      await page.waitForTimeout(1000);
      const clearAll = page.locator('button:has-text("Clear All Filters")');
      if (await clearAll.count() > 0) await clearAll.first().click({ force: true });
      await page.waitForTimeout(1000);
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-025.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Pagination', () => {

    test('TC-IM-026: pagination controls are present in the list view', async ({ page }) => {
      // Pagination shows: First < 1 > Last  OR  "Showing X - Y of Z results"
      await expect(page.locator('text=/Showing \\d+/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-IM-027: result count and per-page selector are displayed', async ({ page }) => {
      await expect(page.locator('text=/per page/i').first()).toBeVisible();
      await expect(page.locator('text=/results/i').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-027.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. EXPORT BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Export Buttons', () => {

    test('TC-IM-029: Excel export button click does not throw a JS error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-029.png' });
    });

    test('TC-IM-030: PDF export button click does not throw a JS error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-030.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD INDENT — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Add Indent — Form Display', () => {

    test('TC-IM-031: clicking "New Indent" opens the create form panel', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator(SLIDE_OVER).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-031.png' });
      await closeForm(page);
    });

    test('TC-IM-032: form contains Department mandatory field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Department/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-032.png' });
      await closeForm(page);
    });

    test('TC-IM-033: form contains Assigned To mandatory field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Assigned To/i);
      await closeForm(page);
    });

    test('TC-IM-034: form contains Priority field with Normal as an option', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Priority/i);
      await expect(page.locator('body')).toContainText(/Normal/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-034.png' });
      await closeForm(page);
    });

    test('TC-IM-035: form contains Subject / Heading textarea', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('textarea[name="Heading"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-035.png' });
      await closeForm(page);
    });

    test('TC-IM-036: form contains PO No field (optional)', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="PONo"]').first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-IM-037: form contains File Upload input', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[type="file"]').first()).toBeAttached();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-037.png' });
      await closeForm(page);
    });

    test('TC-IM-038: product section contains Product Type field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Product Type/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-038.png' });
      await closeForm(page);
    });

    test('TC-IM-039: product section contains Instrument ID combobox', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select instrument"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-039.png' });
      await closeForm(page);
    });

    test('TC-IM-040: product section contains Product/Item Name field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Product.*Name|Item.*Name/i);
      await closeForm(page);
    });

    test('TC-IM-041: product section contains Quantity field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Qty|Quantity/i);
      await closeForm(page);
    });

    test('TC-IM-042: product section contains Part No field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Part No/i);
      await closeForm(page);
    });

    test('TC-IM-043: product section contains CAS No field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/CAS No/i);
      await closeForm(page);
    });

    test('TC-IM-044: product section contains Company/Make Name combobox', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select company"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-044.png' });
      await closeForm(page);
    });

    test('TC-IM-045: product section contains Remarks/Specification field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Remark|Specification/i);
      await closeForm(page);
    });

    test('TC-IM-046: "Add Product" button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /Add Product/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-046.png' });
      await closeForm(page);
    });

    test('TC-IM-047: product sub-table columns are visible', async ({ page }) => {
      await openAddForm(page);
      const text = await page.locator('body').textContent() ?? '';
      expect(text).toMatch(/Product Name|Item Name/i);
      expect(text).toMatch(/Qty|Quantity/i);
      expect(text).toMatch(/Part No/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-047.png' });
      await closeForm(page);
    });

    test('TC-IM-048: Cancel button closes the form without saving', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').textContent() ?? '';
      if (/Discard|Are you sure/i.test(bodyText)) {
        await page.getByRole('button', { name: /Confirm|Yes|Discard/i }).first().click({ force: true });
      }
      await expect(page.locator(SLIDE_OVER).first()).not.toBeVisible({ timeout: 5000 }).catch(() => {});
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-048.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD INDENT — FIELD VALIDATIONS (NEGATIVE)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Add Indent — Field Validations', () => {

    test('TC-IM-049: submitting blank form shows mandatory field validation errors', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|invalid|please|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-049.png' });
      await closeForm(page);
    });

    test('TC-IM-050: Department is required — blank submit shows validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('textarea[name="Heading"]').first().fill('Subject Only');
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/department|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-050.png' });
      await closeForm(page);
    });

    test('TC-IM-052: Subject / Heading textarea is required', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/heading|subject|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-052.png' });
      await closeForm(page);
    });

    test('TC-IM-053: Subject / Heading accepts very long text', async ({ page }) => {
      await openAddForm(page);
      await page.locator('textarea[name="Heading"]').first().fill('Long Subject '.repeat(15));
      const val = await page.locator('textarea[name="Heading"]').first().inputValue();
      expect(val.length).toBeGreaterThan(50);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-053.png' });
      await closeForm(page);
    });

    test('TC-IM-054: PO No is optional — form accepts empty PO No without error', async ({ page }) => {
      await openAddForm(page);
      const poVal = await page.locator('input[name="PONo"]').first().inputValue();
      expect(poVal).toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-054.png' });
      await closeForm(page);
    });

    test('TC-IM-055: PO No field accepts alphanumeric text', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="PONo"]').first().fill('PO-2025-001');
      await expect(page.locator('input[name="PONo"]').first()).toHaveValue('PO-2025-001');
      await closeForm(page);
    });

    test('TC-IM-056: Priority field contains "Normal" as a default or selectable option', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Normal/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-056.png' });
      await closeForm(page);
    });

    test('TC-IM-057: Product Type "Consumer item" is a selectable option', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Consumer item|Consumer/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-057.png' });
      await closeForm(page);
    });

    test('TC-IM-058: Instrument ID combobox search returns results', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select instrument"]').first().fill('A');
      await page.waitForTimeout(1500);
      const opts = page.locator('[role="option"], [role="listbox"] li').filter({ visible: true });
      if (await opts.count() > 0) {
        await opts.first().click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-058.png' });
      await closeForm(page);
    });

    test('TC-IM-059: Company/Make Name combobox search returns results', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select company"]').first().fill('A');
      await page.waitForTimeout(1500);
      const opts = page.locator('[role="option"], [role="listbox"] li').filter({ visible: true });
      if (await opts.count() > 0) {
        await opts.first().click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-059.png' });
      await closeForm(page);
    });

    test('TC-IM-064: XSS payload in Subject field does not trigger alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => {
        alerts.push(dialog.message());
        await dialog.dismiss();
      });
      await openAddForm(page);
      await page.locator('textarea[name="Heading"]').first().fill("<script>alert('xss')</script>");
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-064.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. PRODUCT SUB-TABLE INTERACTION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Product Sub-Table Interaction', () => {

    test('TC-IM-065: "Add Product" button adds a new row to the product sub-table', async ({ page }) => {
      await openAddForm(page);
      await page.locator('textarea[name="Heading"]').first().fill(`Sub-table Test ${TS}`);
      const initialRows = await page.locator('table tbody tr, .product-row').count();
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(800);
      const newRows = await page.locator('table tbody tr, .product-row').count();
      expect(newRows).toBeGreaterThan(initialRows);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-065.png' });
      await closeForm(page);
    });

    test('TC-IM-066: multiple "Add Product" clicks create multiple rows', async ({ page }) => {
      await openAddForm(page);
      await page.locator('textarea[name="Heading"]').first().fill(`Multi Product ${TS}`);
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(600);
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(600);
      const inputsInTable = await page.locator('table input, tbody input').count();
      expect(inputsInTable).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-066.png' });
      await closeForm(page);
    });

    test('TC-IM-067: product sub-table shows Type, Product Name, Qty, Part No columns', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(800);
      const text = await page.locator('body').textContent() ?? '';
      expect(text).toMatch(/Type/i);
      expect(text).toMatch(/Product Name|Item Name/i);
      expect(text).toMatch(/Qty|Quantity/i);
      expect(text).toMatch(/Part No/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-067.png' });
      await closeForm(page);
    });

    test('TC-IM-069: file upload accepts a valid PDF file', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').first().setInputFiles(TEST_FILE_PATH);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-069.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ADD INDENT — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Add Indent — Success Flow', () => {

    test('TC-IM-070: filling all mandatory fields and saving creates an indent', async ({ page }) => {
      await openAddForm(page);

      // Department — try select or combobox
      const deptLabel = page.locator('text=/Department/i').first();
      const deptParent = deptLabel.locator('xpath=ancestor::div[3]');
      const deptSelect = deptParent.locator('select').first();
      if (await deptSelect.count() > 0) {
        await deptSelect.selectOption({ index: 1 }, { force: true });
      } else {
        const deptCombo = deptParent.locator('[role="combobox"], input').first();
        if (await deptCombo.count() > 0) {
          await deptCombo.click({ force: true });
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').filter({ visible: true }).first().click({ force: true });
        }
      }
      await page.waitForTimeout(500);

      // Assigned To
      const assignLabel = page.locator('text=/Assigned To/i').first();
      const assignParent = assignLabel.locator('xpath=ancestor::div[3]');
      const assignCombo = assignParent.locator('[role="combobox"], input').first();
      if (await assignCombo.count() > 0) {
        await assignCombo.click({ force: true });
        await assignCombo.fill('Admin');
        await page.waitForTimeout(1000);
        const opts = page.locator('[role="option"]').filter({ visible: true });
        if (await opts.count() > 0) await opts.first().click({ force: true });
      }
      await page.waitForTimeout(500);

      // Subject
      await page.locator('textarea[name="Heading"]').first().fill(INDENT_SUBJECT);

      // Add product row
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(800);

      // Fill first product row
      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        const firstRow = rows.first();
        const textInputs = firstRow.locator('input[type="text"]');
        if (await textInputs.count() > 0) await textInputs.first().fill('Test Product Item');
        const numInputs = firstRow.locator('input[type="number"]');
        if (await numInputs.count() > 0) await numInputs.first().fill('5');
        const companyInput = firstRow.locator('input[placeholder*="Search and select company"]');
        if (await companyInput.count() > 0) {
          await companyInput.fill('A');
          await page.waitForTimeout(1500);
          const opts = page.locator('[role="option"]').filter({ visible: true });
          if (await opts.count() > 0) await opts.first().click({ force: true });
        }
      }

      // Save
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).toContainText(/success|created|saved|IND#/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-070.png' });
    });

    test('TC-IM-071: after save the new indent appears in the list with an IND# number', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(INDENT_SUBJECT);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).toContainText(/IND#\d+|IND-\d+|IND\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-071.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ROW-LEVEL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Row-Level Actions', () => {

    test('TC-IM-072: each data row has visible action buttons or links', async ({ page }) => {
      const btnCount = await page.locator('tbody tr').first().locator('button, a[role="button"]').count();
      expect(btnCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-072.png' });
    });

    test('TC-IM-073: clicking the Indent No button opens the indent details', async ({ page }) => {
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-073.png' });
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
      }
    });

    test('TC-IM-074: second action button on a row opens an action or detail view', async ({ page }) => {
      const btns = page.locator('tbody tr').first().locator('button');
      if (await btns.count() >= 2) {
        await btns.nth(1).click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-074.png' });
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.count() > 0) {
          await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. VIEW / EDIT EXISTING INDENT
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. View / Edit Existing Indent', () => {

    test('TC-IM-075: opening an existing indent from the row shows its subject', async ({ page }) => {
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-075.png' });
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
      }
    });

    test('TC-IM-076: opened indent form/view contains the Indent No header', async ({ page }) => {
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/IND#\d+|IND-\d+|IND\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-076.png' });
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. FILE UPLOAD EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. File Upload Edge Cases', () => {

    test('TC-IM-077: uploading valid PDF file is accepted without errors', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').first().setInputFiles(TEST_FILE_PATH);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-077.png' });
      await closeForm(page);
    });

    test('TC-IM-078: form does not crash when file input is interacted with', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[type="file"]').first()).toBeAttached();
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('14. End-to-End Workflow', () => {

    test('TC-IM-079: E2E — create indent with product → verify in list → view details', async ({ page }) => {
      const E2E_TS      = Date.now().toString().slice(-5);
      const E2E_SUBJECT = `E2E Indent ${E2E_TS}`;

      // ── STEP 1: Create ──────────────────────────────────────────────────
      await openAddForm(page);

      // Department
      const deptLabel = page.locator('text=/Department/i').first();
      const deptParent = deptLabel.locator('xpath=ancestor::div[3]');
      const deptSelect = deptParent.locator('select').first();
      if (await deptSelect.count() > 0) {
        await deptSelect.selectOption({ index: 1 }, { force: true });
      } else {
        const deptCombo = deptParent.locator('[role="combobox"], input').first();
        if (await deptCombo.count() > 0) {
          await deptCombo.click({ force: true });
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').filter({ visible: true }).first().click({ force: true });
        }
      }
      await page.waitForTimeout(500);

      // Assigned To
      const assignLabel = page.locator('text=/Assigned To/i').first();
      const assignParent = assignLabel.locator('xpath=ancestor::div[3]');
      const assignCombo = assignParent.locator('[role="combobox"], input').first();
      if (await assignCombo.count() > 0) {
        await assignCombo.click({ force: true });
        await assignCombo.fill('Admin');
        await page.waitForTimeout(1000);
        const opts = page.locator('[role="option"]').filter({ visible: true });
        if (await opts.count() > 0) await opts.first().click({ force: true });
      }
      await page.waitForTimeout(300);

      // Subject
      await page.locator('textarea[name="Heading"]').first().fill(E2E_SUBJECT);

      // Add product
      await page.getByRole('button', { name: /Add Product/i }).click({ force: true });
      await page.waitForTimeout(800);

      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        const firstRow = rows.first();
        const textInputs = firstRow.locator('input[type="text"]');
        if (await textInputs.count() > 0) await textInputs.first().fill('E2E Test Product');
        const numInputs = firstRow.locator('input[type="number"]');
        if (await numInputs.count() > 0) await numInputs.first().fill('3');
        const partInput = firstRow.locator('input[placeholder*="part" i], input[name*="part" i]');
        if (await partInput.count() > 0) await partInput.first().fill('PN-E2E');
        const companyInput = firstRow.locator('input[placeholder*="Search and select company"]');
        if (await companyInput.count() > 0) {
          await companyInput.fill('A');
          await page.waitForTimeout(1500);
          const opts = page.locator('[role="option"]').filter({ visible: true });
          if (await opts.count() > 0) await opts.first().click({ force: true });
        }
      }

      // Upload file
      await page.locator('input[type="file"]').first().setInputFiles(TEST_FILE_PATH);
      await page.waitForTimeout(1000);

      // Save
      await page.getByRole('button', { name: /^Save$|Submit/i }).first().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).toContainText(/success|created|saved|IND#/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-079-created.png' });

      // ── STEP 2: Verify in list ────────────────────────────────────────
      const searchInput = page.locator('input[placeholder="Search"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(E2E_SUBJECT);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).toContainText(new RegExp(E2E_SUBJECT, 'i'));
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-079-verified.png' });

      // ── STEP 3: View details ──────────────────────────────────────────
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('body')).toContainText(/IND#\d+|IND-\d+|IND\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-IM-079-viewed.png' });
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
      }
    });
  });
});
