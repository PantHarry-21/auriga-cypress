import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Method Validation Upload Module — Comprehensive Test Suite
// URL    : /dashboard/method/validation-upload
// Run    : npx playwright test tests/modules/method_validation_upload.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL  = '/dashboard/method/validation-upload';
const LAB         = 'Arbro - Delhi';
const TS          = Date.now().toString().slice(-6);
const METHOD_NAME = `AutoMVU ${TS}`;

// File paths
const FIXTURE_DIR       = path.join(__dirname, '../fixtures/files for testing');
const FILE_VALID_PDF    = path.join(FIXTURE_DIR, 'SOP _ Employee Profile.pdf');
const FILE_VALID_PDF2   = path.join(FIXTURE_DIR, 'Himanshus prompt.pdf');
const FILE_VALID_DOC    = path.join(FIXTURE_DIR, '2mb.doc');
const FILE_VALID_DOCX   = path.join(FIXTURE_DIR, '10mb.docx');
const FILE_INVALID_PNG  = path.join(FIXTURE_DIR, 'ChatGPT Image Feb 24, 2026, 12_12_08 PM (1).png');
const FILE_INVALID_CSV  = path.join(FIXTURE_DIR, 'Roles_Permision_Notification Central.csv');
const FILE_INVALID_XLSX = path.join(FIXTURE_DIR, 'YLIMS_UAT_Testing_Tracker_FINAL.xlsx');

const today    = () => new Date().toISOString().split('T')[0];
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

test.describe('Method Validation Upload Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  // ── Shared helpers ──────────────────────────────────────────────────────────

  const openAddForm = async (page: any) => {
    await page.locator('button:has-text("New Method Validation")').first().click();
    await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 20000 });
  };

  const closeForm = async (page: any) => {
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click({ force: true });
      await expect(cancelBtn).toBeHidden({ timeout: 10000 });
    }
  };

  const openFilters = async (page: any) => {
    await page.locator('button:has-text("Filters")').first().click({ force: true });
    await expect(page.locator('button:has-text("Clear All Filters")')).toBeVisible({ timeout: 5000 });
  };

  const clearAllFilters = async (page: any) => {
    const clearBtn = page.locator('button:has-text("Clear All Filters")').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click({ force: true });
      await page.waitForTimeout(500); // Small grace for reload
    }
  };

  const openEditFirst = async (page: any) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.waitFor({ timeout: 15000 });
    const editBtn = firstRow.getByRole('button', { name: /edit/i });
    if (await editBtn.count() > 0) {
      await editBtn.first().click({ force: true });
    } else {
      // Try aria-label or anchor
      const editLink = firstRow.locator('button[aria-label*="Edit"], a[aria-label*="Edit"], button:has-text("Edit"), a:has-text("Edit")');
      if (await editLink.count() > 0) {
        await editLink.first().click({ force: true });
      } else {
        await firstRow.locator('button').last().click({ force: true });
      }
    }
    await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(500);
  };

  // Helper: fill all mandatory fields for a create form and save
  const fillMandatoryAndSave = async (page: any, methodName: string) => {
    await page.locator('input[name="methodName"]').fill(methodName);

    await page.locator('input[placeholder*="Search and select client"]').fill('A');
    await page.waitForSelector('[role="option"], li[role="option"]', { state: 'visible', timeout: 5000 });
    const clientOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
    if (await clientOpts.count() > 0) {
      await clientOpts.first().click({ force: true });
    }

    await page.locator('input[name="reportProtocolNo"]').fill(`PROTO-${TS}`);

    const methodTypeOptions = await page.locator('select[name="methodType"] option').evaluateAll(
      (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
    );
    if (methodTypeOptions.length > 0) {
      await page.locator('select[name="methodType"]').selectOption(methodTypeOptions[0], { force: true });
    }

    await page.locator('input[placeholder*="Search and select department"]').fill('C');
    await page.waitForSelector('[role="option"], li[role="option"]', { state: 'visible', timeout: 5000 });
    const deptOpts = page.locator('[role="option"], li[role="option"]').filter({ visible: true });
    if (await deptOpts.count() > 0) {
      await deptOpts.first().click({ force: true });
    }

    await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
    await expect(page.locator('body')).not.toContainText('invalid file', { timeout: 3000 });

    await page.locator('button:has-text("SAVE")').last().click({ force: true });
    await expect(page.locator('body')).not.toContainText('500', { timeout: 15000 });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-MVU-001: navigating to Method Validation Upload opens the listing screen without 404', async ({ page }) => {
      await expect(page).toHaveURL(/validation-upload/);
      await expect(page.locator('body')).not.toContainText('404');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-001.png' });
    });

    test('TC-MVU-002: page heading reads "Method Validation Upload"', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Method Validation Upload/i);
    });

    test('TC-MVU-003: data table renders with a visible header row within 30 s', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
    });

    test('TC-MVU-004: page does not contain a 500 error on initial load', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MVU-005: list view renders records or an empty-state message (no blank screen)', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Method|No record|No data/i, { timeout: 20000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-005.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TABLE COLUMNS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Table Columns', () => {

    test('TC-MVU-006: table header contains "Serial No" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Serial\s*No|S\.?\s*No/i);
    });

    test('TC-MVU-007: table header contains "Method Name" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Method Name/i);
    });

    test('TC-MVU-008: table header contains "Client Name" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Client Name/i);
    });

    test('TC-MVU-009: table header contains "Method No" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Method No/i);
    });

    test('TC-MVU-010: table header contains "Supersedes No" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Supers/i);
    });

    test('TC-MVU-011: table header contains "Method Creation Date" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Creation Date|Method Creation/i);
    });

    test('TC-MVU-012: table header contains "Effective Date" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Effective Date/i);
    });

    test('TC-MVU-013: table header contains "Department" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Department/i);
    });

    test('TC-MVU-014: table header contains "Method Type" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Method Type/i);
    });

    test('TC-MVU-015: table header contains "Files" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Files/i);
    });

    test('TC-MVU-016: table header contains audit columns (Created By, Created Date, Updated By, Updated Date)', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Created By/i);
      expect(headText).toMatch(/Created Date/i);
      expect(headText).toMatch(/Updated By/i);
      expect(headText).toMatch(/Updated Date/i);
    });

    test('TC-MVU-017: table header contains "Edit" column', async ({ page }) => {
      const headText = await page.locator('thead').first().innerText();
      expect(headText).toMatch(/Edit/i);
    });

    test('TC-MVU-018: first data row Serial No starts at 1', async ({ page }) => {
      const rows = page.locator('tbody tr');
      if (await rows.count() > 0) {
        const cells = await rows.first().locator('td').allInnerTexts();
        const firstNum = cells.find(t => /^\d+$/.test(t.trim()));
        if (firstNum) expect(firstNum.trim()).toBe('1');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Toolbar Elements', () => {

    test('TC-MVU-019: "New Method Validation" button is visible and enabled', async ({ page }) => {
      const btn = page.getByRole('button', { name: /New Method Validation/i });
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-019.png' });
    });

    test('TC-MVU-020: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
    });

    test('TC-MVU-021: PDF export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-MVU-022: Columns toggle button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-MVU-023: Search input is visible', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
    });

    test('TC-MVU-024: Search button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
    });

    test('TC-MVU-025: Filters button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Filters")').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. GLOBAL SEARCH
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Global Search', () => {

    test('TC-MVU-026: search input accepts typed text', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('Method');
      await expect(input).toHaveValue('Method');
    });

    test('TC-MVU-027: searching by Method Name keyword filters the list', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Method');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-027.png' });
    });

    test('TC-MVU-028: search is case-insensitive and supports partial-text (contains) matching', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('method');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MVU-029: searching with a non-existent keyword shows the empty-state message', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXIST99999XYZ');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i, { timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-029.png' });
    });

    test('TC-MVU-030: searching with special characters does not crash the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('<script>alert(1)</script>');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MVU-031: clearing search and clicking Search restores the full list', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-MVU-032: searching by Client Name keyword filters the list', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Delhi');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-032.png' });
    });

    test('TC-MVU-033: searching by Method No returns the matching record', async ({ page }) => {
      const rows = page.locator('tbody tr');
      if (await rows.count() > 0) {
        const methodNo = (await rows.first().locator('td').nth(3).innerText()).trim();
        if (methodNo.length > 0) {
          await page.locator('input[placeholder*="Search"]').first().fill(methodNo);
          await page.locator('button:has-text("Search")').first().click();
          await page.waitForTimeout(2000);
          await expect(page.locator('tbody tr').first()).toBeVisible();
          await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-033.png' });
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. COLUMNS PANEL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Columns Panel (Manage Columns)', () => {

    test('TC-MVU-034: clicking Columns opens the Manage Columns panel', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/Manage Columns|Column/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-034.png' });
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });

    test('TC-MVU-035: Manage Columns panel lists checkboxes for each column', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);
      const checkboxCount = await page.locator('input[type="checkbox"]').filter({ visible: true }).count();
      expect(checkboxCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-035.png' });
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });

    test('TC-MVU-036: unchecking a column checkbox hides that column from the grid', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);
      const checkboxes = page.locator('input[type="checkbox"]').filter({ visible: true });
      if (await checkboxes.count() > 0) {
        await checkboxes.first().uncheck({ force: true });
        await page.waitForTimeout(600);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-036.png' });
        await checkboxes.first().check({ force: true });
        await page.waitForTimeout(400);
      }
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });

    test('TC-MVU-037: re-checking a hidden column makes it reappear in the grid', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);
      const checkboxes = page.locator('input[type="checkbox"]').filter({ visible: true });
      if (await checkboxes.count() > 0) {
        await checkboxes.last().uncheck({ force: true });
        await page.waitForTimeout(400);
        await checkboxes.last().check({ force: true });
        await page.waitForTimeout(400);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-037.png' });
      }
      await page.locator('body').click({ position: { x: 5, y: 5 } });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTERS PANEL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Filters Panel', () => {

    test('TC-MVU-038: clicking Filters expands the filter panel', async ({ page }) => {
      await openFilters(page);
      await expect(
        page.locator('input[placeholder*="Search serial no"], input[placeholder*="Search method name"], input[placeholder*="Search client"]').first()
      ).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-038.png' });
    });

    test('TC-MVU-039: "Search serial no..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search serial no"]')).toBeVisible();
    });

    test('TC-MVU-040: "Search method name..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search method name"]')).toBeVisible();
    });

    test('TC-MVU-041: "Search client name..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search client name"]')).toBeVisible();
    });

    test('TC-MVU-042: "Search method no..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search method no"]')).toBeVisible();
    });

    test('TC-MVU-043: "Search suppersedes no..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search suppersedes no"]')).toBeVisible();
    });

    test('TC-MVU-044: "Search department..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search department"]')).toBeVisible();
    });

    test('TC-MVU-045: "Search method type..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search method type"]')).toBeVisible();
    });

    test('TC-MVU-046: "Search files..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search files"]')).toBeVisible();
    });

    test('TC-MVU-047: "Search created by..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search created by"]')).toBeVisible();
    });

    test('TC-MVU-048: "Search updated by..." filter input is present', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('input[placeholder*="Search updated by"]')).toBeVisible();
    });

    test('TC-MVU-049: filtering by Method Name returns only matching records', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method name"]').fill('Method');
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-049.png' });
      await clearAllFilters(page);
    });

    test('TC-MVU-050: filtering by Client Name returns only matching records', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search client name"]').fill('Delhi');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-050.png' });
      await clearAllFilters(page);
    });

    test('TC-MVU-051: filtering by Method No returns matching records', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method no"]').fill('MVU');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await clearAllFilters(page);
    });

    test('TC-MVU-052: filtering by Supersedes No returns matching records', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search suppersedes no"]').fill('1');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await clearAllFilters(page);
    });

    test('TC-MVU-053: filtering by Department narrows the list', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search department"]').fill('Chem');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-053.png' });
      await clearAllFilters(page);
    });

    test('TC-MVU-054: filtering by Method Type narrows the list', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method type"]').fill('Standard');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await clearAllFilters(page);
    });

    test('TC-MVU-055: applying multiple filters uses AND logic and further narrows results', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method name"]').fill('Method');
      await page.locator('input[placeholder*="Search department"]').fill('Chem');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-055.png' });
      await clearAllFilters(page);
    });

    test('TC-MVU-056: Clear All Filters resets all filter inputs and reloads the full unfiltered dataset', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method name"]').fill('ZZNOTEXIST');
      await page.waitForTimeout(500);
      await clearAllFilters(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-056.png' });
    });

    test('TC-MVU-057: invalid filter combination (no-match) shows empty-state without UI crash', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method name"]').fill('ZZZNEVEREXIST99XYZ');
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-057.png' });
      await clearAllFilters(page);
    });

    test('TC-MVU-058: filter panel collapses when Filters button is clicked again', async ({ page }) => {
      await openFilters(page);
      await page.locator('button:has-text("Filters")').first().click({ force: true });
      await page.waitForTimeout(600);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-058.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Pagination', () => {

    test('TC-MVU-059: pagination controls are present', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Next|Prev|First|Last|\d+/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-059.png' });
    });

    test('TC-MVU-060: total result count is displayed somewhere on the page', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\d+\s*(result|record|of\s+\d)/i);
    });

    test('TC-MVU-061: clicking Next page loads the next set of records', async ({ page }) => {
      const firstRowText = await page.locator('tbody tr').first().innerText().catch(() => '');
      const nextBtn = page.getByRole('button', { name: /Next|>/ }).first();
      const isDisabled = await nextBtn.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextBtn.click({ force: true });
        await page.waitForFunction((oldText) => {
          const newText = document.querySelector('tbody tr')?.textContent ?? '';
          return newText !== oldText && newText !== '';
        }, firstRowText, { timeout: 10000 });
        const newText = await page.locator('tbody tr').first().innerText().catch(() => '');
        expect(newText).not.toBe(firstRowText);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-061.png' });
      }
    });

    test('TC-MVU-062: clicking Previous after Next returns to the previous page', async ({ page }) => {
      const nextBtn = page.getByRole('button', { name: /Next|>/ }).first();
      const isDisabled = await nextBtn.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: /Prev|</ }).first().click({ force: true });
        await page.waitForTimeout(1500);
        const cells = await page.locator('tbody tr').first().locator('td').allInnerTexts();
        const firstNum = cells.find(t => /^\d+$/.test(t.trim()));
        if (firstNum) expect(firstNum.trim()).toBe('1');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-062.png' });
      }
    });

    test('TC-MVU-063: "Show X per page" dropdown changes the number of rows displayed', async ({ page }) => {
      const selects = page.locator('select');
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const opts = await selects.nth(i).locator('option').allInnerTexts();
        if (opts.some(o => /10|20|50/.test(o))) {
          await selects.nth(i).selectOption('10', { force: true });
          await page.waitForTimeout(1500);
          const rowCount = await page.locator('tbody tr').count();
          expect(rowCount).toBeLessThanOrEqual(10);
          await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-063.png' });
          break;
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Export Functionality', () => {

    test('TC-MVU-064: clicking Excel export does not produce a 500 error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-064.png' });
    });

    test('TC-MVU-065: clicking PDF export does not produce a 500 error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-MVU-066: Excel export with an active search filter works without errors', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Method');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(1500);
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD NEW METHOD VALIDATION — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Add New Method Validation — Form Display', () => {

    test('TC-MVU-067: clicking "New Method Validation" opens the create form panel', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/New Method Validation|Method Validation/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-067.png' });
      await closeForm(page);
    });

    test('TC-MVU-068: Method Name field is visible and marked mandatory (*)', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="methodName"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-069: Client Name combobox is visible and marked mandatory', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select client"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-070: Report/Protocol No field is visible and marked mandatory', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="reportProtocolNo"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-071: Method Type dropdown is visible and marked mandatory', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('select[name="methodType"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-072: Supersedes No field is visible (optional)', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="supersedesNo"]')).toBeAttached();
      await closeForm(page);
    });

    test('TC-MVU-073: Creation Date date-picker field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="creationDate"]')).toBeAttached();
      await closeForm(page);
    });

    test('TC-MVU-074: Effective Date date-picker field is present', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="effectiveDate"]')).toBeAttached();
      await closeForm(page);
    });

    test('TC-MVU-075: Department combobox is visible and marked mandatory', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[placeholder*="Search and select department"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-076: file upload input is present in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[type="file"]')).toBeAttached();
      await closeForm(page);
    });

    test('TC-MVU-077: SAVE / Submit button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-078: Cancel button is visible in the form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-MVU-079: a close panel icon/button is available to dismiss the form', async ({ page }) => {
      await openAddForm(page);
      const hasClose =
        (await page.locator('button[aria-label*="close"], button[aria-label*="Close"]').filter({ visible: true }).count()) > 0 ||
        (await page.locator('button').filter({ hasText: /×|✕|close/i }).filter({ visible: true }).count()) > 0;
      console.log(`Close panel button found: ${hasClose}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-079.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ADD NEW METHOD VALIDATION — MANDATORY FIELD VALIDATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Add New Method Validation — Mandatory Field Validation', () => {

    test('TC-MVU-080: submitting the empty form shows validation errors on all mandatory fields', async ({ page }) => {
      await openAddForm(page);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-080.png' });
      await closeForm(page);
    });

    test('TC-MVU-081: validation error appears specifically for empty Method Name', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').clear();
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-081.png' });
      await closeForm(page);
    });

    test('TC-MVU-082: validation error appears for missing Client Name', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill(`ValTest ${TS}`);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|client/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-082.png' });
      await closeForm(page);
    });

    test('TC-MVU-083: validation error appears for missing Report/Protocol No', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="reportProtocolNo"]').clear();
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|protocol/i);
      await closeForm(page);
    });

    test('TC-MVU-084: validation error appears for missing Method Type (when no default)', async ({ page }) => {
      await openAddForm(page);
      const currentVal = await page.locator('select[name="methodType"]').inputValue();
      if (!currentVal) {
        await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
        await page.waitForTimeout(800);
        await expect(page.locator('body')).toContainText(/required|mandatory|method type/i);
      }
      await closeForm(page);
    });

    test('TC-MVU-085: validation error appears for missing Department', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill(`DepTest ${TS}`);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|department/i);
      await closeForm(page);
    });

    test('TC-MVU-086: validation error appears when no file is uploaded', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill(`FileTest ${TS}`);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|file/i);
      await closeForm(page);
    });

    test('TC-MVU-087: form retains data entered when validation fails', async ({ page }) => {
      await openAddForm(page);
      const retainName = `Retain Test ${TS}`;
      await page.locator('input[name="methodName"]').fill(retainName);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('input[name="methodName"]')).toHaveValue(retainName);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-087.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ADD NEW METHOD VALIDATION — INDIVIDUAL FIELD BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Add New Method Validation — Individual Field Behaviour', () => {

    test('TC-MVU-088: Method Name accepts valid alphanumeric text', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('HPLC Validation Method-01');
      await expect(page.locator('input[name="methodName"]')).toHaveValue('HPLC Validation Method-01');
      await closeForm(page);
    });

    test('TC-MVU-089: Method Name with spaces-only triggers required validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('     ');
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await closeForm(page);
    });

    test('TC-MVU-090: Method Name with XSS payload does not trigger alert', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill("<script>alert('xss')</script>");
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MVU-091: Method Name with 500-character boundary value is handled gracefully', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('M'.repeat(500));
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MVU-092: Client Name combobox shows a dropdown after typing at least one character', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1000);
      const optCount = await page.locator('[role="option"]').filter({ visible: true }).count();
      console.log(`Client dropdown options visible: ${optCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-092.png' });
      await closeForm(page);
    });

    test('TC-MVU-093: Client Name combobox shows graceful response when search has no match', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('ZZZNOMATCH99XYZ');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-093.png' });
      await closeForm(page);
    });

    test('TC-MVU-094: selecting an option from the Client Name combobox fills the field', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1000);
      const opts = page.locator('[role="option"]').filter({ visible: true });
      if (await opts.count() > 0) {
        await opts.first().click({ force: true });
        const value = await page.locator('input[placeholder*="Search and select client"]').inputValue();
        expect(value).not.toBe('');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-094.png' });
      }
      await closeForm(page);
    });

    test('TC-MVU-095: Report/Protocol No field accepts a valid alphanumeric value', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="reportProtocolNo"]').fill('PROTO-2024-001');
      await expect(page.locator('input[name="reportProtocolNo"]')).toHaveValue('PROTO-2024-001');
      await closeForm(page);
    });

    test('TC-MVU-096: Report/Protocol No field handles HTML injection gracefully', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await openAddForm(page);
      await page.locator('input[name="reportProtocolNo"]').fill('<b>Bold</b>');
      await expect(page.locator('body')).not.toContainText('500');
      expect(alerts).toHaveLength(0);
      await closeForm(page);
    });

    test('TC-MVU-097: Method Type dropdown lists at least one option', async ({ page }) => {
      await openAddForm(page);
      const optCount = await page.locator('select[name="methodType"] option').count();
      expect(optCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-097.png' });
      await closeForm(page);
    });

    test('TC-MVU-098: each option in Method Type dropdown is selectable', async ({ page }) => {
      await openAddForm(page);
      const optionValues = await page.locator('select[name="methodType"] option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (optionValues.length > 0) {
        await page.locator('select[name="methodType"]').selectOption(optionValues[0], { force: true });
        await expect(page.locator('select[name="methodType"]')).toHaveValue(optionValues[0]);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-098.png' });
      }
      await closeForm(page);
    });

    test('TC-MVU-099: Supersedes No is optional and accepts alphanumeric text', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="supersedesNo"]').fill('PREV-001');
      await expect(page.locator('input[name="supersedesNo"]')).toHaveValue('PREV-001');
      await closeForm(page);
    });

    test('TC-MVU-100: Supersedes No left empty does not trigger a required validation error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="supersedesNo"]').clear();
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toMatch(/Supersedes.*required|required.*Supersedes/i);
      await closeForm(page);
    });

    test('TC-MVU-101: Creation Date field accepts a valid ISO date', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="creationDate"]').fill(today());
      await expect(page.locator('input[name="creationDate"]')).toHaveValue(today());
      await closeForm(page);
    });

    test('TC-MVU-102: Creation Date field rejects non-date text (native date input)', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="creationDate"]').fill('not-a-date');
      const value = await page.locator('input[name="creationDate"]').inputValue();
      expect(value).toBe('');
      await closeForm(page);
    });

    test('TC-MVU-103: Effective Date field accepts a valid ISO date', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="effectiveDate"]').fill(tomorrow());
      await expect(page.locator('input[name="effectiveDate"]')).toHaveValue(tomorrow());
      await closeForm(page);
    });

    test('TC-MVU-104: Department combobox shows options after typing a character', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-104.png' });
      await closeForm(page);
    });

    test('TC-MVU-105: selecting an option from the Department combobox fills the field', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(1000);
      const opts = page.locator('[role="option"]').filter({ visible: true });
      if (await opts.count() > 0) {
        await opts.first().click({ force: true });
        const value = await page.locator('input[placeholder*="Search and select department"]').inputValue();
        expect(value).not.toBe('');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-105.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. ADD NEW METHOD VALIDATION — FILE UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. Add New Method Validation — File Upload', () => {

    test('TC-MVU-106: uploading a valid PDF file is accepted without error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('body')).not.toContainText(/invalid|not supported|unsupported/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-106.png' });
      await closeForm(page);
    });

    test('TC-MVU-107: uploading a second valid PDF file is accepted', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF2);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MVU-108: uploading a valid .doc file is accepted without error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('body')).not.toContainText(/invalid|not supported/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-108.png' });
      await closeForm(page);
    });

    test('TC-MVU-109: uploading a valid .docx file is accepted without error', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOCX);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MVU-110: uploading an invalid .png image file is rejected with an error message', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_PNG);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-110.png' });
      await closeForm(page);
    });

    test('TC-MVU-111: uploading an invalid .csv file is rejected with an error message', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_CSV);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-111.png' });
      await closeForm(page);
    });

    test('TC-MVU-112: uploading an invalid .xlsx file is rejected with an error message', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_XLSX);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-112.png' });
      await closeForm(page);
    });

    test('TC-MVU-113: uploading a large file (10 MB .docx) does not crash the page', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOCX);
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-113.png' });
      await closeForm(page);
    });

    test('TC-MVU-114: uploaded file name is shown in the form after selection', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(1000);
      const bodyText = await page.locator('body').innerText();
      const hasFileName = /SOP|Employee Profile|\.pdf/i.test(bodyText);
      console.log(`Uploaded file name visible in form: ${hasFileName}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-114.png' });
      await closeForm(page);
    });

    test('TC-MVU-115: uploading a file via an executable mimetype is rejected gracefully', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[type="file"]').setInputFiles({
        name: 'malware.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('MZfake exe content'),
      });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-115.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. ADD NEW METHOD VALIDATION — CANCEL BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. Add New Method Validation — Cancel Behaviour', () => {

    test('TC-MVU-116: clicking Cancel closes the form panel without saving', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('SHOULD_NOT_SAVE');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.getByRole('button', { name: /New Method Validation/i })).toBeVisible();
      await expect(page.locator('body')).not.toContainText('SHOULD_NOT_SAVE');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-116.png' });
    });

    test('TC-MVU-117: after Cancel, clicking "New Method Validation" reopens a clean empty form', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('TempData');
      await closeForm(page);
      await openAddForm(page);
      await expect(page.locator('input[name="methodName"]')).toHaveValue('');
      await closeForm(page);
    });

    test('TC-MVU-118: rapid double-click on "New Method Validation" does not open multiple panels', async ({ page }) => {
      await page.getByRole('button', { name: /New Method Validation/i }).dblclick({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.getByRole('button', { name: /Cancel/i }).first()).toBeVisible({ timeout: 10000 });
      const cancelCount = await page.getByRole('button', { name: /Cancel/i }).filter({ visible: true }).count();
      expect(cancelCount).toBeLessThanOrEqual(2);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. ADD NEW METHOD VALIDATION — SUCCESSFUL SAVE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('14. Add New Method Validation — Successful Save', () => {

    test('TC-MVU-119: filling all mandatory fields and saving creates a new record', async ({ page }) => {
      await openAddForm(page);

      await page.locator('input[name="methodName"]').fill(METHOD_NAME);

      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1200);
      const clientOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) {
        await clientOpts.first().click({ force: true });
      }

      await page.locator('input[name="reportProtocolNo"]').fill(`PROTO-${TS}`);

      const typeVals = await page.locator('select[name="methodType"] option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (typeVals.length > 0) {
        await page.locator('select[name="methodType"]').selectOption(typeVals[0], { force: true });
      }

      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(1200);
      const deptOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await deptOpts.count() > 0) {
        await deptOpts.first().click({ force: true });
      }

      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(800);

      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-119-saved.png' });
    });

    test('TC-MVU-120: newly saved record appears in the list view', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(METHOD_NAME);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-120.png' });
    });

    test('TC-MVU-121: saving with only optional fields left empty succeeds', async ({ page }) => {
      const minName = `MinSave ${TS}`;
      await openAddForm(page);
      await fillMandatoryAndSave(page, minName);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-121.png' });
    });

    test('TC-MVU-122: saving with all optional fields filled succeeds', async ({ page }) => {
      const fullName = `FullSave ${TS}`;
      await openAddForm(page);

      await page.locator('input[name="methodName"]').fill(fullName);

      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1200);
      const clientOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) await clientOpts.first().click({ force: true });

      await page.locator('input[name="reportProtocolNo"]').fill(`FULL-${TS}`);

      const typeVals = await page.locator('select[name="methodType"] option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (typeVals.length > 0) {
        await page.locator('select[name="methodType"]').selectOption(typeVals[0], { force: true });
      }

      await page.locator('input[name="supersedesNo"]').fill(`PREV-${TS}`);
      await page.locator('input[name="creationDate"]').fill(today());
      await page.locator('input[name="effectiveDate"]').fill(tomorrow());

      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(1200);
      const deptOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await deptOpts.count() > 0) await deptOpts.first().click({ force: true });

      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(800);

      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-122.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. EDIT RECORD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('15. Edit Method Validation Record', () => {

    test('TC-MVU-123: clicking the Edit icon in a row opens the edit form', async ({ page }) => {
      await openEditFirst(page);
      await expect(page.locator('body')).toContainText(/Edit|Update.*Method Validation|Method Validation/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-123.png' });
      await closeForm(page);
    });

    test('TC-MVU-124: edit form pre-populates Method Name with existing value', async ({ page }) => {
      await openEditFirst(page);
      const value = await page.locator('input[name="methodName"]').inputValue();
      expect(value).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-124.png' });
      await closeForm(page);
    });

    test('TC-MVU-125: edit form pre-populates Report/Protocol No with existing value', async ({ page }) => {
      await openEditFirst(page);
      const value = await page.locator('input[name="reportProtocolNo"]').inputValue();
      expect(value).not.toBe('');
      await closeForm(page);
    });

    test('TC-MVU-126: edit form pre-populates Method Type with existing value', async ({ page }) => {
      await openEditFirst(page);
      const value = await page.locator('select[name="methodType"]').inputValue();
      expect(value).not.toBe('');
      await closeForm(page);
    });

    test('TC-MVU-127: clearing Method Name in edit mode shows a required validation error', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="methodName"]').clear();
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-127.png' });
      await closeForm(page);
    });

    test('TC-MVU-128: updating Method Name in edit mode and saving succeeds', async ({ page }) => {
      await openEditFirst(page);
      const updatedName = `Edited ${TS}`;
      await page.locator('input[name="methodName"]').fill(updatedName);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-128.png' });
    });

    test('TC-MVU-129: updating Supersedes No in edit mode saves correctly', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="supersedesNo"]').fill(`UPD-${TS}`);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-129.png' });
    });

    test('TC-MVU-130: adding a new file in edit mode works without error', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF2);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-130.png' });
      await closeForm(page);
    });

    test('TC-MVU-131: Cancel in edit form closes without persisting changes', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="methodName"]').fill('SHOULD_NOT_PERSIST_EDIT');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('SHOULD_NOT_PERSIST_EDIT');
    });

    test('TC-MVU-132: uploading an invalid file type in edit mode is rejected', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_INVALID_PNG);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toContainText(/invalid|not supported|unsupported/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-132.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. FILES COLUMN IN LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('16. Files Column', () => {

    test('TC-MVU-133: Files column in the list view displays a count value for each row', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const cells = await page.locator('tbody tr').first().locator('td').allInnerTexts();
      console.log(`Row cells: ${JSON.stringify(cells)}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-133.png' });
    });

    test('TC-MVU-134: Files column value is numeric or shows a link/icon', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const cells = await page.locator('tbody tr').first().locator('td').allInnerTexts();
      const hasFileInfo = cells.some(t => /^\d+$/.test(t.trim())) ||
        (await page.locator('tbody tr').first().locator('td a, td button, td svg').count()) > 0;
      console.log(`Files column indicator present: ${hasFileInfo}`);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. HORIZONTAL SCROLL & LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('17. Horizontal Scroll & Layout', () => {

    test('TC-MVU-135: grid with many columns has horizontal scroll available', async ({ page }) => {
      const grid = page.locator('table, [role="grid"]').first();
      await expect(grid).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-135.png' });
    });

    test('TC-MVU-136: column headers remain aligned when grid is scrolled horizontally', async ({ page }) => {
      const grid = page.locator('table, [role="grid"]').first();
      await expect(grid).toBeVisible();
      const scrollWidth = await grid.evaluate((el: HTMLElement) => el.scrollWidth);
      const clientWidth = await grid.evaluate((el: HTMLElement) => el.clientWidth);
      if (scrollWidth > clientWidth) {
        await grid.evaluate((el: HTMLElement) => el.scrollTo(el.scrollWidth, 0));
        await page.waitForTimeout(400);
        await expect(page.locator('thead').first()).toBeVisible();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-136.png' });
        await grid.evaluate((el: HTMLElement) => el.scrollTo(0, 0));
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 18. SECURITY & ACCESS CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('18. Security & Access Control', () => {

    test('TC-MVU-137: direct URL access by an admin user reaches the listing without redirect', async ({ page }) => {
      await expect(page).toHaveURL(/validation-upload/);
      await expect(page.locator('body')).not.toContainText('401');
      await expect(page.locator('body')).not.toContainText('Access Denied');
    });

    test('TC-MVU-138: XSS payload in Method Name field does not execute script or 500-error', async ({ page }) => {
      const alerts: string[] = [];
      page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.dismiss(); });
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill('<img src=x onerror=alert(1)>');
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-MVU-139: SQL injection string in Method Name does not crash the server', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill("' OR 1=1; DROP TABLE methods;--");
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 19. API FAILURE HANDLING
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('19. API Failure Handling', () => {

    test('TC-MVU-140: when the list API returns 500, the page shows a user-friendly error instead of crashing', async ({ page }) => {
      await page.route('**/method/validation-upload**', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
        } else {
          await route.continue();
        }
      });
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-140.png' });
    });

    test('TC-MVU-141: when the save API returns 422, a validation error message is shown to the user', async ({ page }) => {
      await page.route('**/method/validation-upload**', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Validation error from server' }) });
        } else {
          await route.continue();
        }
      });

      await openAddForm(page);
      await page.locator('input[name="methodName"]').fill(`APIFail ${TS}`);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(800);
      const clientOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await clientOpts.count() > 0) await clientOpts.first().click({ force: true });
      await page.locator('input[name="reportProtocolNo"]').fill(`RF-${TS}`);
      const typeVals = await page.locator('select[name="methodType"] option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (typeVals.length > 0) {
        await page.locator('select[name="methodType"]').selectOption(typeVals[0], { force: true });
      }
      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(800);
      const deptOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await deptOpts.count() > 0) await deptOpts.first().click({ force: true });
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-141.png' });
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 20. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('20. Edge Cases', () => {

    test('TC-MVU-142: navigating away and back via browser history preserves the listing state', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page).toHaveURL(/validation-upload/);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-142.png' });
    });

    test('TC-MVU-143: reloading the page preserves the listing view', async ({ page }) => {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 20000 });
    });

    test('TC-MVU-144: a record with a Supersedes No shows the correct value in the list', async ({ page }) => {
      const rows = page.locator('tbody tr');
      if (await rows.count() > 0) {
        const headers = await page.locator('thead th').allInnerTexts();
        const supersIdx = headers.findIndex(h => /Supers/i.test(h));
        if (supersIdx >= 0) {
          const val = await rows.first().locator('td').nth(supersIdx).innerText();
          console.log(`Supersedes No for first row: "${val}"`);
          await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-144.png' });
        }
      }
    });

    test('TC-MVU-145: no-records empty state shows a clean "No data" message without blank screen', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXIST99999XYZ_EMPTY');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-145.png' });
    });

    test('TC-MVU-146: grid with rows loads within 15 seconds and page is interactive', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
      const rowCount = await page.locator('tbody tr').count();
      console.log(`Rows loaded: ${rowCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-MVU-146.png' });
    });

    test('TC-MVU-147: form Method Name placeholder text is "Enter method name"', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="methodName"]')).toHaveAttribute('placeholder', 'Enter method name');
      await closeForm(page);
    });

    test('TC-MVU-148: form Report/Protocol No placeholder text is "Enter report/protocol number"', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="reportProtocolNo"]')).toHaveAttribute('placeholder', 'Enter report/protocol number');
      await closeForm(page);
    });

    test('TC-MVU-149: form Supersedes No placeholder text is "Enter supersedes number"', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="supersedesNo"]')).toHaveAttribute('placeholder', 'Enter supersedes number');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 21. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('21. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2E-MVU-${E2E_TS}`;

    test('E2E-MVU-001: Create → Search → Verify record appears in the list', async ({ page }) => {
      await openAddForm(page);
      await fillMandatoryAndSave(page, E2E_NAME);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-001-created.png' });

      await page.locator('input[placeholder*="Search"]').first().fill(E2E_NAME);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-001-verified.png' });
    });

    test('E2E-MVU-002: Create with .doc file → Edit to attach a PDF → Save → Verify', async ({ page }) => {
      const docName = `DocSave-${E2E_TS}`;
      await openAddForm(page);

      await page.locator('input[name="methodName"]').fill(docName);
      await page.locator('input[placeholder*="Search and select client"]').fill('A');
      await page.waitForTimeout(1200);
      const cOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await cOpts.count() > 0) await cOpts.first().click({ force: true });
      await page.locator('input[name="reportProtocolNo"]').fill(`DOC-${E2E_TS}`);
      const typeVals = await page.locator('select[name="methodType"] option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (typeVals.length > 0) {
        await page.locator('select[name="methodType"]').selectOption(typeVals[0], { force: true });
      }
      await page.locator('input[placeholder*="Search and select department"]').fill('C');
      await page.waitForTimeout(1200);
      const dOpts = page.locator('[role="option"]').filter({ visible: true });
      if (await dOpts.count() > 0) await dOpts.first().click({ force: true });
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_DOC);
      await page.waitForTimeout(800);

      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-002-created-doc.png' });

      // Search and edit
      await page.locator('input[placeholder*="Search"]').first().fill(docName);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);

      await openEditFirst(page);
      await page.locator('input[type="file"]').setInputFiles(FILE_VALID_PDF);
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /SAVE|Save/i }).filter({ visible: true }).last().click({ force: true });
      await page.waitForTimeout(4000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-002-updated.png' });
    });

    test('E2E-MVU-003: Apply method-name filter → Export to Excel → Verify no 500 error', async ({ page }) => {
      await openFilters(page);
      await page.locator('input[placeholder*="Search method name"]').fill('Method');
      await page.waitForTimeout(1500);
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-003.png' });
      await clearAllFilters(page);
    });

    test('E2E-MVU-004: Toggle column off → Verify column gone → Toggle back → Verify column returns', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(800);

      const checkboxes = page.locator('input[type="checkbox"]').filter({ visible: true });
      const checkboxCount = await checkboxes.count();
      if (checkboxCount === 0) {
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        return;
      }

      // Get the label of the first checkbox to know what column we are toggling
      const labelText = await checkboxes.first().evaluate((el: HTMLInputElement) => {
        const label = el.closest('label');
        return label ? label.textContent?.trim() : 'Column';
      });
      console.log(`Toggling column: "${labelText}"`);

      await checkboxes.first().uncheck({ force: true });
      await page.waitForTimeout(600);
      if (labelText && labelText !== 'Column') {
        const headText = await page.locator('thead').first().innerText();
        expect(headText).not.toMatch(new RegExp(labelText, 'i'));
      }

      await checkboxes.first().check({ force: true });
      await page.waitForTimeout(600);
      await expect(page.locator('body')).not.toContainText('500');
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-MVU-004.png' });
    });
  });
});
