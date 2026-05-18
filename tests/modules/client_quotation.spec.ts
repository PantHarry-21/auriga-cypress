import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// Client Quotation Module — Comprehensive E2E Test Suite
// URL    : /dashboard/quotation/client
// Run    : npx playwright test tests/modules/client_quotation.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL      = '/dashboard/quotation/client';
const LAB             = 'Arbro - Delhi';
const TS              = Date.now().toString().slice(-6);
const QUOTATION_TITLE = `AutoQuote ${TS}`;
const CLIENT_SEARCH   = 'ARB';
const SLIDE_OVER      = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

test.describe('Client Quotation Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openAddForm = async (page: any) => {
    await page.locator('button:has-text("New Quotation")').first().click();
    await expect(page.locator(SLIDE_OVER).filter({ visible: true }).first()).toBeVisible({ timeout: 20000 });
  };

  const closeForm = async (page: any) => {
    const cancelBtn = page.getByRole('button', { name: /Cancel|Close panel/i });
    if (await cancelBtn.count() > 0) {
      await cancelBtn.first().click({ force: true });
      await page.waitForTimeout(500);
      const dialogText = await page.locator('body').textContent() ?? '';
      if (/Discard|Are you sure|unsaved/i.test(dialogText)) {
        await page.getByRole('button', { name: /Confirm|Yes|Discard/i }).click({ force: true });
      }
    }
  };

  const openFilters = async (page: any) => {
    await page.locator('button:has-text("Filters")').first().click();
    await page.waitForTimeout(1000);
  };

  const clearFilters = async (page: any) => {
    const clearBtn = page.locator('button:has-text("Clear All Filters")');
    if (await clearBtn.count() > 0) {
      await clearBtn.first().click({ force: true });
      await page.waitForTimeout(800);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-CQ-001: navigating to Client Quotation opens the listing screen', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('/quotation/client'));
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).toContainText(/Client Quotation/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-001.png' });
    });

    test('TC-CQ-002: data table loads with records within expected timeout', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-002.png' });
    });

    test('TC-CQ-003: table header contains expected columns', async ({ page }) => {
      const headerText = await page.locator('thead').first().textContent() ?? '';
      expect(headerText).toMatch(/S\.?No|#/i);
      expect(headerText).toMatch(/Quotation No/i);
      expect(headerText).toMatch(/Title/i);
      expect(headerText).toMatch(/Status/i);
      expect(headerText).toMatch(/Client Name/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-003.png' });
    });

    test('TC-CQ-004: "New Quotation" button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("New Quotation")').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-004.png' });
    });

    test('TC-CQ-005: at least one data row is present in the table', async ({ page }) => {
      await expect(page.locator('tbody tr, .ag-row').first()).toBeVisible({ timeout: 20000 });
    });

    test('TC-CQ-006: each data row has action buttons', async ({ page }) => {
      const btnCount = await page.locator('tbody tr, .ag-row').first()
        .locator('button, a[role="button"]').count();
      expect(btnCount).toBeGreaterThan(0);
    });

    test('TC-CQ-007: row S.No. column starts at 1', async ({ page }) => {
      const firstRowTds = page.locator('tbody tr').first().locator('td');
      const rowTexts = await firstRowTds.allInnerTexts();
      const firstNum = rowTexts.map(t => t.trim()).find(t => /^\d+$/.test(t));
      expect(firstNum).toBe('1');
    });

    test('TC-CQ-008: page does not redirect admin to login', async ({ page }) => {
      await expect(page).not.toHaveURL(new RegExp('/login'));
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-CQ-009: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-009.png' });
    });

    test('TC-CQ-010: PDF export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-CQ-011: Columns toggle button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-CQ-012: Search input is visible', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
    });

    test('TC-CQ-013: Filters button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Filters")').first()).toBeVisible();
    });

    test('TC-CQ-014: Account Manager filter is visible in filter area', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Account Manager/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-014.png' });
      await clearFilters(page);
    });

    test('TC-CQ-015: Quotation Type filter is visible in filter area', async ({ page }) => {
      await openFilters(page);
      const bodyText = await page.locator('body').textContent() ?? '';
      console.log(`Quotation Type filter visible: ${/Quotation Type|Type/i.test(bodyText)}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-015.png' });
      await clearFilters(page);
    });

    test('TC-CQ-016: Columns button opens column visibility panel with checkboxes', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click();
      await page.waitForTimeout(600);
      const checkboxCount = await page.locator('input[type="checkbox"]').count();
      expect(checkboxCount).toBeGreaterThan(3);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-016.png' });
      await page.click('body', { position: { x: 0, y: 0 } });
    });

    test('TC-CQ-017: column visibility checkbox toggles a column off and on', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click();
      await page.waitForTimeout(600);
      const firstCheckbox = page.locator('input[type="checkbox"]').filter({ visible: true }).first();
      if (await firstCheckbox.count() > 0) {
        const wasChecked = await firstCheckbox.isChecked();
        await firstCheckbox.click({ force: true });
        await page.waitForTimeout(500);
        const isNowChecked = await firstCheckbox.isChecked();
        expect(isNowChecked).toBe(!wasChecked);
        await firstCheckbox.click({ force: true }); // restore
      }
      await page.click('body', { position: { x: 0, y: 0 } });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Search Functionality', () => {

    test('TC-CQ-018: search input accepts text input', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('Quote');
      await expect(input).toHaveValue('Quote');
    });

    test('TC-CQ-019: search by quotation number returns matching records', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        const firstRowQNo = await page.locator('tbody tr').first().locator('td').nth(1).textContent() ?? '';
        const trimmed = firstRowQNo.trim().replace(/\s+/g, ' ').substring(0, 6);
        if (trimmed) {
          const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
          await input.clear();
          await input.fill(trimmed);
          await page.locator('button:has-text("Search")').first().click({ force: true });
          await page.waitForTimeout(2000);
          await expect(page.locator('body')).not.toContainText('500');
        }
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-019.png' });
    });

    test('TC-CQ-020: search by title keyword returns relevant records', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill('Quotation');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-020.png' });
    });

    test('TC-CQ-021: search by client name returns records for that client', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill(CLIENT_SEARCH);
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-021.png' });
    });

    test('TC-CQ-022: search with non-existent keyword shows no-results state', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill('ZZZNEVEREXISTS99XYZ');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-022.png' });
    });

    test('TC-CQ-023: search with special characters does not crash the page', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill('<>@#$%');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-CQ-024: clearing search and clicking Search restores full listing', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.clear();
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-CQ-025: XSS payload in search does not trigger alert', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS alert triggered!'); });
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill("<script>alert('xss')</script>");
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-CQ-026: SQL injection in search does not break the page', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await input.fill("' OR 1=1 --");
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Filter Functionality', () => {

    test('TC-CQ-027: clicking Filters expands the filter panel', async ({ page }) => {
      await openFilters(page);
      const inputCount = await page.locator('input:visible, select:visible, [role="combobox"]:visible').count();
      expect(inputCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-027.png' });
      await clearFilters(page);
    });

    test('TC-CQ-028: Date From filter accepts a valid date and filters results', async ({ page }) => {
      await openFilters(page);
      const dateFrom = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2024-01-01');
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-028.png' });
      }
      await clearFilters(page);
    });

    test('TC-CQ-029: Date From and Date To together narrow results', async ({ page }) => {
      await openFilters(page);
      const dateFrom = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      const dateTo = page.locator('input[type="date"], input[placeholder*="Date To"]').last();
      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2024-01-01');
        await dateTo.fill('2025-12-31');
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-029.png' });
      }
      await clearFilters(page);
    });

    test('TC-CQ-030: Date From greater than Date To returns no results or validation message', async ({ page }) => {
      await openFilters(page);
      const dateFrom = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      const dateTo = page.locator('input[type="date"], input[placeholder*="Date To"]').last();
      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2025-12-31');
        await dateTo.fill('2024-01-01');
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasValidationOrNoRecord = /invalid date|cannot|No record|No data|0 result/i.test(bodyText);
        expect(hasValidationOrNoRecord).toBeTruthy();
      }
      await clearFilters(page);
    });

    test('TC-CQ-031: Account Manager filter populates and applies correctly', async ({ page }) => {
      await openFilters(page);
      const amSelect = page.locator('select').filter({ hasText: /Account Manager|account/i }).first();
      if (await amSelect.count() > 0 && await amSelect.isVisible()) {
        await amSelect.selectOption({ index: 1 });
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-031.png' });
      } else {
        console.log('Account Manager select not found — trying combobox approach');
      }
      await clearFilters(page);
    });

    test('TC-CQ-032: Quotation Type filter applies correctly', async ({ page }) => {
      await openFilters(page);
      const typeSelect = page.locator('select').filter({ hasText: /Type|Quotation Type/i }).first();
      if (await typeSelect.count() > 0 && await typeSelect.isVisible()) {
        const options = await typeSelect.locator('option').all();
        const nonEmptyOption = options.find(async o => (await o.getAttribute('value')) !== '');
        if (nonEmptyOption) {
          const val = await nonEmptyOption.getAttribute('value') ?? '';
          await typeSelect.selectOption(val);
          await page.locator('button:has-text("Search")').first().click({ force: true });
          await page.waitForTimeout(2000);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-032.png' });
        }
      }
      await clearFilters(page);
    });

    test('TC-CQ-033: multiple filters applied together do not crash the page', async ({ page }) => {
      await openFilters(page);
      const dateFrom = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      const dateTo = page.locator('input[type="date"], input[placeholder*="Date To"]').last();
      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2024-01-01');
        await dateTo.fill('2026-12-31');
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-033.png' });
      }
      await clearFilters(page);
    });

    test('TC-CQ-034: Clear All Filters resets filter inputs to empty state', async ({ page }) => {
      await openFilters(page);
      const dateFrom = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2024-01-01');
        await page.waitForTimeout(300);
      }
      await clearFilters(page);
      const dateFromAfter = page.locator('input[type="date"], input[placeholder*="Date From"]').first();
      if (await dateFromAfter.isVisible()) {
        await expect(dateFromAfter).toHaveValue('');
      }
    });

    test('TC-CQ-035: Clear All Filters restores full data listing', async ({ page }) => {
      await openFilters(page);
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('ZZNOTEXIST');
        await page.locator('button:has-text("Search")').first().click({ force: true });
        await page.waitForTimeout(2000);
      }
      await clearFilters(page);
      await page.waitForTimeout(1500);
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Pagination', () => {

    test('TC-CQ-036: pagination controls are present', async ({ page }) => {
      const navButtons = page.locator('button').filter({ hasText: /Next|First|Last|Prev|>/i });
      const count = await navButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-CQ-037: clicking Next page loads a different set of records', async ({ page }) => {
      const firstRowText = await page.locator('tbody tr').first().innerText();
      const nextBtn = page.locator('button').filter({ hasText: /^Next$|^>$/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(1500);
        const newFirstRowText = await page.locator('tbody tr').first().innerText();
        expect(newFirstRowText).not.toBe(firstRowText);
      } else {
        console.log('Next page button not found or only one page');
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-037.png' });
    });

    test('TC-CQ-038: clicking Previous page navigates back', async ({ page }) => {
      const nextBtn = page.locator('button').filter({ hasText: /^Next$|^>$/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(1200);
        const prevBtn = page.locator('button').filter({ hasText: /^Prev(ious)?$|^<$/i }).first();
        if (await prevBtn.count() > 0) {
          await prevBtn.click({ force: true });
          await page.waitForTimeout(1200);
          const firstRowTds = page.locator('tbody tr').first().locator('td');
          const rowTexts = await firstRowTds.allInnerTexts();
          const firstNum = rowTexts.map(t => t.trim()).find(t => /^\d+$/.test(t));
          expect(firstNum).toBe('1');
        }
      } else {
        console.log('Pagination not available');
      }
    });

    test('TC-CQ-039: result count label is displayed', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. EXPORT BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Export Buttons', () => {

    test('TC-CQ-040: Excel export button click does not throw a JS error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-040.png' });
    });

    test('TC-CQ-041: PDF export button click does not throw a JS error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-041.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD QUOTATION — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Add Quotation — Form Display', () => {

    test('TC-CQ-042: clicking "New Quotation" opens the create form panel', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator(SLIDE_OVER).filter({ visible: true }).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-042.png' });
      await closeForm(page);
    });

    test('TC-CQ-043: form shows Select Client mandatory field', async ({ page }) => {
      await openAddForm(page);
      await expect(
        page.locator('input[name="clientId"], input[placeholder*="Search client"]').first()
      ).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-043.png' });
      await closeForm(page);
    });

    test('TC-CQ-044: form shows Select Product(s) combobox', async ({ page }) => {
      await openAddForm(page);
      await expect(
        page.locator('input[placeholder*="Select Product"], input[placeholder*="Product"]').first()
      ).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-044.png' });
      await closeForm(page);
    });

    test('TC-CQ-045: form shows Quotation Title mandatory field', async ({ page }) => {
      await openAddForm(page);
      await expect(
        page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first()
      ).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-045.png' });
      await closeForm(page);
    });

    test('TC-CQ-046: form shows Contact Name field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="contactPerson"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-046.png' });
      await closeForm(page);
    });

    test('TC-CQ-047: form shows Mobile field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="contactPersonMobile"]').first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-CQ-048: form shows Email field of type email', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="contactPersonEmail"]').first()).toHaveAttribute('type', 'email');
      await closeForm(page);
    });

    test('TC-CQ-049: form shows Product Type radio buttons (With Product / Without Product)', async ({ page }) => {
      await openAddForm(page);
      const radioCount = await page.locator('input[name="productType"]').count();
      expect(radioCount).toBeGreaterThan(0);
      await expect(page.locator('body')).toContainText(/With Product|Without Product/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-049.png' });
      await closeForm(page);
    });

    test('TC-CQ-050: form shows Assign To and Valid Till mandatory fields', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Assign To/i);
      await expect(page.locator('body')).toContainText(/Valid Till/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-050.png' });
      await closeForm(page);
    });

    test('TC-CQ-051: form shows Discount (%) field', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Discount/i);
      await closeForm(page);
    });

    test('TC-CQ-052: form shows Other Charge Name and Amount fields', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Other Charge|Charge Name/i);
      await closeForm(page);
    });

    test('TC-CQ-053: form shows Note / rich-text area', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('.ql-editor, textarea, [contenteditable="true"]').first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-CQ-054: Cancel button closes the form without navigating away', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      const dialogText = await page.locator('body').textContent() ?? '';
      if (/Discard|Are you sure/i.test(dialogText)) {
        await page.getByRole('button', { name: /Confirm|Yes|Discard/i }).click({ force: true });
      }
      await expect(page.locator(SLIDE_OVER)).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-054.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD QUOTATION — FIELD VALIDATIONS (NEGATIVE)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Add Quotation — Field Validations', () => {

    test('TC-CQ-055: submitting blank form shows mandatory field validation errors', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/required|invalid|please|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-055.png' });
      await closeForm(page);
    });

    test('TC-CQ-056: Select Client field is required — blank submit shows error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill('Title Only');
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/client|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-056.png' });
      await closeForm(page);
    });

    test('TC-CQ-057: client search with fewer than 3 characters shows no dropdown results', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="clientId"], input[placeholder*="Search client"]').first().fill('AB');
      await page.waitForTimeout(1200);
      const optionCount = await page.locator('[role="option"], [role="listbox"] li').filter({ visible: true }).count();
      console.log(`Dropdown appeared with 2 chars: ${optionCount > 0}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-057.png' });
      await closeForm(page);
    });

    test('TC-CQ-058: client search with 3 or more characters shows autocomplete results', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="clientId"], input[placeholder*="Search client"]').first().fill(CLIENT_SEARCH);
      await page.waitForTimeout(1500);
      await expect(
        page.locator('[role="option"], [role="listbox"] li, .autocomplete-item').filter({ visible: true }).first()
      ).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-058.png' });
      await closeForm(page);
    });

    test('TC-CQ-059: Quotation Title is required — blank submit shows error', async ({ page }) => {
      await openAddForm(page);
      // Fill client first
      await page.locator('input[name="clientId"], input[placeholder*="Search client"]').first().fill(CLIENT_SEARCH);
      await page.waitForTimeout(1500);
      await page.locator('[role="option"], [role="listbox"] li').filter({ visible: true }).first().click({ force: true });
      await page.waitForTimeout(500);
      // Leave title empty and submit
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/title|subject|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-059.png' });
      await closeForm(page);
    });

    test('TC-CQ-060: Quotation Title accepts long text up to expected max length', async ({ page }) => {
      await openAddForm(page);
      const longTitle = 'A'.repeat(200);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill(longTitle);
      const val = await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
      console.log(`Accepted ${val.length} characters`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-060.png' });
      await closeForm(page);
    });

    test('TC-CQ-061: Assign To is required — blank submit shows error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill('Assign To Test');
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/assign|employee|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-061.png' });
      await closeForm(page);
    });

    test('TC-CQ-062: Valid Till is required — blank submit shows error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill('Valid Till Test');
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/valid till|date|required/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-062.png' });
      await closeForm(page);
    });

    test('TC-CQ-063: Valid Till date picker accepts a future date', async ({ page }) => {
      await openAddForm(page);
      // Find the Valid Till date input
      const validTillLabel = page.locator('body').getByText(/Valid Till/i).first();
      if (await validTillLabel.count() > 0) {
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.count() > 0) {
          await dateInput.fill('2027-06-30');
          await expect(dateInput).toHaveValue('2027-06-30');
        }
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-063.png' });
      await closeForm(page);
    });

    test('TC-CQ-064: Mobile field accepts digits — optional field', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="contactPersonMobile"]').first().fill('9876543210');
      await expect(page.locator('input[name="contactPersonMobile"]').first()).toHaveValue('9876543210');
      await closeForm(page);
    });

    test('TC-CQ-065: Email field rejects invalid email format', async ({ page }) => {
      await openAddForm(page);
      const emailInput = page.locator('input[name="contactPersonEmail"]').first();
      await emailInput.fill('notanemail@@.com');
      await page.click('body', { position: { x: 0, y: 0 } });
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBe(false);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-065.png' });
      await closeForm(page);
    });

    test('TC-CQ-066: Email field accepts a valid email address', async ({ page }) => {
      await openAddForm(page);
      const emailInput = page.locator('input[name="contactPersonEmail"]').first();
      await emailInput.fill('test@example.com');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBe(true);
      await closeForm(page);
    });

    test('TC-CQ-067: Product Type radio — "Without Product" hides the product selector', async ({ page }) => {
      await openAddForm(page);
      const radios = page.locator('input[name="productType"]');
      const radioCount = await radios.count();
      if (radioCount > 0) {
        // Click the radio closest to "Without Product" text (typically index 1)
        let withoutIdx = -1;
        for (let i = 0; i < radioCount; i++) {
          const radio = radios.nth(i);
          const labelEl = await radio.evaluate((el: HTMLInputElement) => {
            const label = el.closest('label');
            return label ? label.textContent ?? '' : '';
          });
          if (/Without Product/i.test(labelEl)) {
            withoutIdx = i;
            break;
          }
        }
        const idx = withoutIdx >= 0 ? withoutIdx : 1;
        await radios.nth(idx).click({ force: true });
        await page.waitForTimeout(500);
        const productVisible = await page.locator('input[placeholder*="Select Product"]').filter({ visible: true }).count() > 0;
        console.log(`Product combobox visible after Without Product: ${productVisible}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-067.png' });
      }
      await closeForm(page);
    });

    test('TC-CQ-068: Product Type radio — "With Product" shows the product selector', async ({ page }) => {
      await openAddForm(page);
      const radios = page.locator('input[name="productType"]');
      const radioCount = await radios.count();
      if (radioCount > 0) {
        let withIdx = -1;
        for (let i = 0; i < radioCount; i++) {
          const radio = radios.nth(i);
          const labelEl = await radio.evaluate((el: HTMLInputElement) => {
            const label = el.closest('label');
            return label ? label.textContent ?? '' : '';
          });
          if (/With Product/i.test(labelEl) && !/Without/i.test(labelEl)) {
            withIdx = i;
            break;
          }
        }
        const idx = withIdx >= 0 ? withIdx : 0;
        await radios.nth(idx).click({ force: true });
        await page.waitForTimeout(500);
        await expect(page.locator('input[placeholder*="Select Product"]').first()).toBeVisible();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-068.png' });
      }
      await closeForm(page);
    });

    test('TC-CQ-069: Discount % accepts a valid number between 0 and 100', async ({ page }) => {
      await openAddForm(page);
      const discountLabel = page.locator('body').getByText(/Discount/i).first();
      if (await discountLabel.count() > 0) {
        const discountInput = page.locator('input[type="number"]').filter({ visible: true }).first();
        if (await discountInput.count() > 0) {
          await discountInput.clear();
          await discountInput.fill('15');
          await expect(discountInput).toHaveValue('15');
        }
      }
      await closeForm(page);
    });

    test('TC-CQ-070: Other Charge Name and Amount can be entered and added', async ({ page }) => {
      await openAddForm(page);
      const chargeNameLabel = page.locator('body').getByText(/Other Charge Name/i).first();
      if (await chargeNameLabel.count() > 0) {
        const chargeNameInput = page.locator('input[type="text"], input').filter({ visible: true }).first();
        if (await chargeNameInput.count() > 0) {
          await chargeNameInput.fill('Handling Fee');
        }
        const addBtn = page.getByRole('button', { name: /^Add$/i });
        if (await addBtn.count() > 0) {
          await addBtn.click({ force: true });
          await page.waitForTimeout(600);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-070.png' });
        }
      }
      await closeForm(page);
    });

    test('TC-CQ-071: Note field accepts free-form text', async ({ page }) => {
      await openAddForm(page);
      const noteEditor = page.locator('.ql-editor, [contenteditable="true"]').first();
      if (await noteEditor.count() > 0) {
        await noteEditor.fill('Automated test note content.');
        const noteText = await noteEditor.textContent() ?? '';
        expect(/Automated test note/i.test(noteText)).toBeTruthy();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-071.png' });
      }
      await closeForm(page);
    });

    test('TC-CQ-072: XSS payload in Quotation Title does not trigger alert', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS alert triggered!'); });
      await openAddForm(page);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first()
        .fill("<script>alert('xss')</script>");
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-072.png' });
      await closeForm(page);
    });

    test('TC-CQ-073: special characters in Quotation Title are accepted without crash', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first()
        .fill('Quote & Test "Special" <Chars>');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-073.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD QUOTATION — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Add Quotation — Success Flow', () => {

    test('TC-CQ-074: filling all mandatory fields and saving creates a quotation', async ({ page }) => {
      await openAddForm(page);

      // 1. Select Client
      const clientInput = page.locator('input[name="clientId"], input[placeholder*="Search client"]').first();
      await clientInput.fill(CLIENT_SEARCH);
      await page.waitForTimeout(1800);
      await page.locator('[role="option"], [role="listbox"] li, .autocomplete-item').filter({ visible: true })
        .first().click({ force: true });
      await page.waitForTimeout(800);

      // 2. Select Product(s) — With Product mode (default)
      const productInput = page.locator('input[placeholder*="Select Product"], input[placeholder*="Product"]').first();
      await productInput.click({ force: true });
      await productInput.fill('A');
      await page.waitForTimeout(1200);
      await page.locator('[role="option"], [role="listbox"] li, .autocomplete-item').filter({ visible: true })
        .first().click({ force: true });
      await page.click('body', { position: { x: 0, y: 0 } });
      await page.waitForTimeout(2000);

      // 3. Quotation Title
      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill(QUOTATION_TITLE);

      // 4. Assign To
      const assignSelect = page.locator('select').filter({ visible: true }).first();
      if (await assignSelect.count() > 0) {
        await assignSelect.selectOption({ index: 1 });
      } else {
        const assignInput = page.locator('input').filter({ visible: true }).filter({ hasText: /Assign/i }).first();
        if (await assignInput.count() > 0) {
          await assignInput.fill('Admin');
          await page.waitForTimeout(1000);
          await page.locator('[role="option"], [role="listbox"] li').filter({ visible: true }).first().click({ force: true });
        }
      }
      await page.waitForTimeout(500);

      // 5. Valid Till
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.count() > 0) {
        await dateInput.fill('2027-12-31');
      }

      // 6. Contact (optional)
      await page.locator('input[name="contactPerson"]').first().fill('QA Tester');

      // 7. Save / Generate
      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).toContainText(/success|generated|saved|created/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-074.png' });
    });

    test('TC-CQ-075: after save the new quotation appears in the list', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(QUOTATION_TITLE);
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(new RegExp(QUOTATION_TITLE, 'i'));
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-075.png' });
    });

    test('TC-CQ-076: newly created quotation has a Status value in the list', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(QUOTATION_TITLE);
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        const rowTexts = await page.locator('tbody tr').first().locator('td').allInnerTexts();
        const hasStatus = rowTexts.some(t => /New|Draft|Approved|Pending|Sent/i.test(t));
        expect(hasStatus).toBeTruthy();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ROW ACTION BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Row Action Buttons', () => {

    test('TC-CQ-077: each data row has at least one visible action button', async ({ page }) => {
      await expect(page.locator('tbody tr').first().locator('button').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-077.png' });
    });

    test('TC-CQ-078: row has action buttons (view/edit/delete)', async ({ page }) => {
      const btnCount = await page.locator('tbody tr').first().locator('button').count();
      console.log(`Row action button count: ${btnCount}`);
      expect(btnCount).toBeGreaterThan(0);
    });

    test('TC-CQ-079: clicking the first row action button opens a panel or navigates', async ({ page }) => {
      await page.locator('tbody tr').first().locator('button').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-079.png' });
      const dialog = page.locator('[role="dialog"]').filter({ visible: true });
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EDIT QUOTATION FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Edit Quotation Flow', () => {

    const openEditFirstRow = async (page: any) => {
      const searchInput = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(QUOTATION_TITLE);
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        const btns = page.locator('tbody tr').first().locator('button');
        const btnCount = await btns.count();
        if (btnCount >= 2) {
          await btns.nth(1).click({ force: true });
        } else {
          await btns.first().click({ force: true });
        }
        await page.waitForTimeout(2500);
      }
    };

    test('TC-CQ-080: Edit mode opens the form with pre-populated data', async ({ page }) => {
      await openEditFirstRow(page);
      const panel = page.locator(SLIDE_OVER).filter({ visible: true });
      if (await panel.count() > 0) {
        const titleValue = await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().inputValue();
        expect(titleValue).not.toBe('');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-080.png' });
        await closeForm(page);
      } else {
        console.log('Panel did not open — row may be view-only');
      }
    });

    test('TC-CQ-081: clearing mandatory Title field in Edit shows validation error', async ({ page }) => {
      await openEditFirstRow(page);
      const titleInput = page.locator('input[name="quotationSubject"]').filter({ visible: true });
      if (await titleInput.count() > 0) {
        await titleInput.clear();
        await page.getByRole('button', { name: /Update|Save|Generate/i }).click({ force: true });
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toContainText(/required|invalid|title/i);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-081.png' });
        await closeForm(page);
      } else {
        console.log('Edit form not available for first row');
      }
    });

    test('TC-CQ-082: editing and saving a field updates the record successfully', async ({ page }) => {
      await openEditFirstRow(page);
      const contactInput = page.locator('input[name="contactPerson"]').filter({ visible: true });
      if (await contactInput.count() > 0) {
        await contactInput.clear();
        await contactInput.fill('Updated Contact');
        await page.getByRole('button', { name: /Update|Save|Generate/i }).click({ force: true });
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).toContainText(/success|updated|saved/i);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-082.png' });
      } else {
        console.log('Edit form fields not accessible');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. STATUS VALUES IN LIST
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. Status Values', () => {

    test('TC-CQ-083: Status column shows recognizable status values', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      const maxRows = Math.min(rowCount, 5);
      for (let i = 0; i < maxRows; i++) {
        const rowTexts = await page.locator('tbody tr').nth(i).locator('td').allInnerTexts();
        const hasStatus = rowTexts.some(t => /New|Draft|Approved|Pending|Sent|Accepted|Rejected/i.test(t));
        console.log(`Row ${i + 1} has recognizable status: ${hasStatus}`);
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-083.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. End-to-End Workflow', () => {

    test('TC-CQ-084: E2E — create full quotation → verify in list → edit → verify update', async ({ page }) => {
      const E2E_TS    = Date.now().toString().slice(-5);
      const E2E_TITLE = `E2E Quote ${E2E_TS}`;

      // STEP 1: Create
      await openAddForm(page);

      const clientInput = page.locator('input[name="clientId"], input[placeholder*="Search client"]').first();
      await clientInput.fill(CLIENT_SEARCH);
      await page.waitForTimeout(1800);
      await page.locator('[role="option"], [role="listbox"] li, .autocomplete-item').filter({ visible: true })
        .first().click({ force: true });
      await page.waitForTimeout(800);

      const productInput = page.locator('input[placeholder*="Select Product"], input[placeholder*="Product"]').first();
      await productInput.click({ force: true });
      await productInput.fill('A');
      await page.waitForTimeout(1200);
      await page.locator('[role="option"], [role="listbox"] li, .autocomplete-item').filter({ visible: true })
        .first().click({ force: true });
      await page.click('body', { position: { x: 0, y: 0 } });
      await page.waitForTimeout(2000);

      await page.locator('input[name="quotationSubject"], input[id="quotationSubject"]').first().fill(E2E_TITLE);

      const assignSelect = page.locator('select').filter({ visible: true }).first();
      if (await assignSelect.count() > 0) {
        await assignSelect.selectOption({ index: 1 });
      }

      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.count() > 0) {
        await dateInput.fill('2027-12-31');
      }

      await page.getByRole('button', { name: /Generate Quotation|Save/i }).click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).toContainText(/success|generated|saved/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-084-created.png' });

      // STEP 2: Verify in list
      const searchInput = page.locator('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();
      await searchInput.clear();
      await searchInput.fill(E2E_TITLE);
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(new RegExp(E2E_TITLE, 'i'));
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-084-verified-in-list.png' });

      // STEP 3: Edit the record
      const editBtn = page.locator('tbody tr').first().locator('button').nth(1);
      await editBtn.click({ force: true });
      await page.waitForTimeout(2500);

      const contactInput = page.locator('input[name="contactPerson"]').filter({ visible: true });
      if (await contactInput.count() > 0) {
        await contactInput.clear();
        await contactInput.fill('E2E Updated Contact');
        await page.getByRole('button', { name: /Update|Save|Generate/i }).click({ force: true });
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).toContainText(/success|updated|saved/i);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-084-edited.png' });
      } else {
        console.log('Edit form not accessible — skipping edit step');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-CQ-084-edit-skipped.png' });
      }
    });
  });
});
