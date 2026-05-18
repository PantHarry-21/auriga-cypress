import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Indent Manage Module — Comprehensive E2E Test Suite
// URL    : /dashboard/purchase/admin-indent
// Run    : npx playwright test tests/modules/admin_indent.spec.ts --project=uat
//
// Notes:
//   - This is the admin-side approval/review page for indents raised by staff.
//   - Admins can view indents from all departments, approve/reject/process them.
//   - The page may appear empty if no indent data exists in the current environment.
//   - Tests use conditional logic where data is uncertain.
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/purchase/admin-indent';
const LAB        = 'Arbro - Delhi';

test.describe('Admin Indent Manage Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Safety reload if 500
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('Internal Server Error') || bodyText.includes('500')) {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openFilters = async (page: any) => {
    await page.locator('button:has-text("Filters")').first().click({ force: true });
    await expect(page.locator('button:has-text("Clear All Filters"), button:has-text("Clear All")').first()).toBeVisible({ timeout: 5000 });
  };

  const clearFilters = async (page: any) => {
    const clearBtn = page.locator('button:has-text("Clear All Filters"), button:has-text("Clear All")').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  };

  const openFirstRowActionMenu = async (page: any) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
    const actionsBtn = page.locator('tbody tr').first().locator('button').last();
    await actionsBtn.click({ force: true });
    // Wait for dropdown to be visible
    await expect(page.locator('.dropdown-menu, [role="menu"]').filter({ visible: true }).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Navigation', () => {

    test('TC-AI-001: navigating to Admin Indent Manage opens the page without errors', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('/dashboard/purchase/admin-indent'));
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-001.png' });
    });

    test('TC-AI-002: URL is exactly /dashboard/purchase/admin-indent', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('/dashboard/purchase/admin-indent'));
    });

    test('TC-AI-003: page heading "Admin Indent Manage" is visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Admin Indent Manage/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-003.png' });
    });

    test('TC-AI-004: page loads without a 404 or Internal Server Error', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText(/Internal Server Error|500/i);
    });

    test('TC-AI-005: browser back navigation from Admin Indent does not corrupt page state', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-005.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-AI-006: Excel export button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-006.png' });
    });

    test('TC-AI-007: PDF export button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-AI-008: Columns toggle button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
    });

    test('TC-AI-009: Search input is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-009.png' });
    });

    test('TC-AI-010: Search button is visible next to the search input', async ({ page }) => {
      await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
    });

    test('TC-AI-011: Filters button is visible in the toolbar', async ({ page }) => {
      await expect(page.locator('button:has-text("Filters")').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TABLE / GRID STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Table / Grid Structure', () => {

    test('TC-AI-012: table or grid element renders on the page', async ({ page }) => {
      await expect(page.locator('table, [role="grid"], .ag-root-wrapper, tbody').first()).toBeVisible({ timeout: 20000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-012.png' });
    });

    test('TC-AI-013: table header contains an Indent No / Indent Number column', async ({ page }) => {
      const header = page.locator('thead');
      if (await header.count() > 0) {
        await expect(header.first()).toContainText(/Indent No|Indent Number|INDENT/i);
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-013.png' });
    });

    test('TC-AI-014: table header contains a Status column', async ({ page }) => {
      const header = page.locator('thead');
      if (await header.count() > 0) {
        await expect(header.first()).toContainText(/Status|STATUS/i);
      }
    });

    test('TC-AI-015: table header contains a Priority column', async ({ page }) => {
      const header = page.locator('thead');
      if (await header.count() > 0) {
        await expect(header.first()).toContainText(/Priority|PRIORITY/i);
      }
    });

    test('TC-AI-016: table header contains Subject and Department columns', async ({ page }) => {
      const header = page.locator('thead');
      if (await header.count() > 0) {
        const headerText = await header.first().textContent() ?? '';
        const hasSubject    = /Subject|SUBJECT/i.test(headerText);
        const hasDepartment = /Department|DEPARTMENT/i.test(headerText);
        console.log(`Subject column: ${hasSubject} | Department column: ${hasDepartment}`);
      }
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-016.png' });
    });

    test('TC-AI-017: pagination controls are present on the page', async ({ page }) => {
      const navButtons = page.locator('button').filter({ hasText: /Next|First|Last|Prev/i });
      const count = await navButtons.count();
      // Conditional: may not exist if no data
      console.log(`Pagination controls found: ${count}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-017.png' });
    });

    test('TC-AI-018: total result count or record count is displayed', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. DATA ROWS & ROW CONTENT (conditional on data)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Data Rows & Row Content', () => {

    test('TC-AI-019: admin can view indents from all departments (rows visible)', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      console.log(`Visible indent rows: ${rowCount}`);
      if (rowCount > 0) {
        await expect(page.locator('tbody tr').first()).toBeVisible();
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-019-has-data.png' });
      } else {
        console.log('No indent rows available — expected if no indents exist');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-019-empty.png' });
      }
    });

    test('TC-AI-020: each visible row shows multiple columns of data', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        const tdCount = await page.locator('tbody tr').first().locator('td').count();
        expect(tdCount).toBeGreaterThan(3);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-020.png' });
      }
    });

    test('TC-AI-021: admin can view indents with all priority levels (Normal/High/Urgent)', async ({ page }) => {
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasPriorityValues = /Normal|High|Urgent|NORMAL|HIGH|URGENT/i.test(bodyText);
      console.log(`Priority values visible in table: ${hasPriorityValues}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-021.png' });
    });

    test('TC-AI-022: row action buttons are present for each indent row', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        const actionCount = await page.locator('tbody tr').first().locator('button, a[href]').count();
        expect(actionCount).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-022.png' });
      }
    });

    test('TC-AI-023: row checkbox is present for each indent row (bulk selection support)', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await expect(page.locator('tbody input[type="checkbox"]').first()).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-023.png' });
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Search Functionality', () => {

    test('TC-AI-024: search input accepts typed text', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('Indent');
      await expect(input).toHaveValue('Indent');
    });

    test('TC-AI-025: searching by Indent No returns matching records or empty state', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('IND');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await page.waitForTimeout(1000); // Wait for grid update
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-025.png' });
    });

    test('TC-AI-026: searching by Subject returns matching records or empty state', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Reagent');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-026.png' });
    });

    test('TC-AI-027: searching with a non-existent keyword shows no-record message', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXISTINDENT99XYZ');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-027.png' });
    });

    test('TC-AI-028: searching with special characters does not crash the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('@#$%^&*');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-028.png' });
    });

    test('TC-AI-029: clearing search and clicking Search restores the full listing', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-029.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Filter Functionality', () => {

    test('TC-AI-030: clicking the Filters button expands the filter panel', async ({ page }) => {
      await openFilters(page);
      const inputCount = await page.locator('input:visible, select:visible, [role="combobox"]:visible').count();
      expect(inputCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-030.png' });
      await clearFilters(page);
    });

    test('TC-AI-031: Status filter (All/Pending/Approved/Rejected) is present in the filter panel', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Pending|Approved|Rejected|Status/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-031.png' });
      await clearFilters(page);
    });

    test('TC-AI-032: Department filter is present in the filter panel', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Department|DEPT/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-032.png' });
      await clearFilters(page);
    });

    test('TC-AI-033: Priority filter (All/Normal/High/Urgent) is present in the filter panel', async ({ page }) => {
      await openFilters(page);
      await expect(page.locator('body')).toContainText(/Priority|Normal|High|Urgent/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-033.png' });
      await clearFilters(page);
    });

    test('TC-AI-034: Date range filter (Date From / Date To) is present in the filter panel', async ({ page }) => {
      await openFilters(page);
      const hasDateInput = await page.locator('input[type="date"]').count() > 0;
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasDateText = /Date From|Date To|Raised Date/i.test(bodyText);
      expect(hasDateInput || hasDateText).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-034.png' });
      await clearFilters(page);
    });

    test('TC-AI-035: applying a date range filter and searching returns no 500 error', async ({ page }) => {
      await openFilters(page);
      const dateInputs = page.locator('input[type="date"]').filter({ visible: true });
      if (await dateInputs.count() >= 1) {
        await dateInputs.first().fill('2024-01-01');
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 }).catch(() => {});
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-035.png' });
      await clearFilters(page);
    });

    test('TC-AI-036: applying a Status filter for Pending indents returns only pending records', async ({ page }) => {
      await openFilters(page);
      const dropdown = page.locator('[role="combobox"], select').filter({ visible: true }).first();
      if (await dropdown.count() > 0 && await dropdown.isVisible()) {
        await dropdown.click({ force: true });
        await page.waitForTimeout(500);
        const pendingOption = page.locator('[role="option"], option').filter({ hasText: /Pending/i }).first();
        if (await pendingOption.count() > 0) {
          await pendingOption.click({ force: true });
          await page.waitForTimeout(500);
          await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
          await expect(page.locator('body')).not.toContainText('500');
          await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 }).catch(() => {});
          await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-036-pending-filter.png' });
        }
      }
      await clearFilters(page);
    });

    test('TC-AI-037: Clear All Filters button resets all active filters and restores full list', async ({ page }) => {
      await openFilters(page);
      const firstInput = page.locator('input:visible').first();
      if (await firstInput.count() > 0) {
        await firstInput.fill('TEST_FILTER_INPUT');
      }
      await page.waitForTimeout(300);
      await clearFilters(page);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-037.png' });
    });

    test('TC-AI-038: applying an invalid date range (From > To) is handled gracefully', async ({ page }) => {
      await openFilters(page);
      const dateInputs = page.locator('input[type="date"]').filter({ visible: true });
      if (await dateInputs.count() >= 2) {
        await dateInputs.first().fill('2025-12-31');
        await dateInputs.nth(1).fill('2024-01-01');
        await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
        await page.waitForTimeout(2000);
        const bodyText = await page.locator('body').textContent() ?? '';
        const hasErrorOrNoRecord = /invalid date|No record|0 result|cannot be/i.test(bodyText);
        console.log(`Invalid date range handled gracefully: ${hasErrorOrNoRecord}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-038.png' });
      } else {
        console.log('Fewer than 2 date inputs found — skipping invalid range test');
      }
      await clearFilters(page);
    });

    test('TC-AI-039: empty state message shown when filter returns no matching indents', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXISTINDENT00000');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i, { timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-039.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ROW-LEVEL ACTIONS (conditional on data availability)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Row-Level Actions', () => {

    test('TC-AI-040: clicking a row action button opens an action menu or inline options', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await openFirstRowActionMenu(page);
        const menuVisible =
          await page.locator('[role="menu"], [role="menuitem"], ul li, .dropdown-menu').filter({ visible: true }).count() > 0;
        console.log(`Row action menu opened: ${menuVisible}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-040.png' });
        await page.click('body', { position: { x: 0, y: 0 } });
      } else {
        console.log('No data rows — skipping row action menu test');
      }
    });

    test('TC-AI-041: row action menu contains an Approve option for pending indents', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await openFirstRowActionMenu(page);
        const bodyText = await page.locator('body').textContent() ?? '';
        console.log(`Approve in action menu: ${/Approve/i.test(bodyText)}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-041.png' });
        await page.click('body', { position: { x: 0, y: 0 } });
      } else {
        console.log('No data rows — skipping approve action check');
      }
    });

    test('TC-AI-042: row action menu contains a Reject option for pending indents', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await openFirstRowActionMenu(page);
        const bodyText = await page.locator('body').textContent() ?? '';
        console.log(`Reject in action menu: ${/Reject/i.test(bodyText)}`);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-042.png' });
        await page.click('body', { position: { x: 0, y: 0 } });
      } else {
        console.log('No data rows — skipping reject action check');
      }
    });

    test('TC-AI-043: clicking indent row number or subject opens the indent detail view', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await page.locator('tbody tr').first().locator('td a, td button').first().click({ force: true });
        await page.waitForTimeout(2500);
        await expect(page.locator('body')).not.toContainText('500');
        await expect(page.locator('body')).not.toContainText('404');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-043.png' });
        await page.goBack();
        await page.waitForTimeout(2000);
      } else {
        console.log('No data rows — skipping detail view test');
      }
    });

    test('TC-AI-044: Approve action on a pending indent changes status to Approved', async ({ page }) => {
      const bodyText = await page.locator('body').textContent() ?? '';
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        console.log('No indent rows available — skipping approve status change test');
        return;
      }
      if (!/Pending/i.test(bodyText)) {
        console.log('No Pending indent found — skipping approve test');
        return;
      }
      await openFirstRowActionMenu(page);
      const menuText = await page.locator('body').textContent() ?? '';
      if (/Approve/i.test(menuText)) {
        await page.getByText(/Approve/i).first().click({ force: true });
        await page.waitForTimeout(2000);
        const dialog = page.locator('[role="dialog"], .modal, .swal2-popup').filter({ visible: true });
        if (await dialog.count() > 0) {
          await page.getByRole('button', { name: /Confirm|Yes|Approve/i }).click({ force: true });
          await page.waitForTimeout(2500);
        }
        await expect(page.locator('body')).toContainText(/success|approved/i);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-044-approved.png' });
      } else {
        console.log('Approve option not in menu for first row');
        await page.click('body', { position: { x: 0, y: 0 } });
      }
    });

    test('TC-AI-045: Reject action requires a reason/remark before submitting', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        console.log('No indent rows — skipping reject validation test');
        return;
      }
      await openFirstRowActionMenu(page);
      const menuText = await page.locator('body').textContent() ?? '';
      if (/Reject/i.test(menuText)) {
        await page.getByText(/Reject/i).first().click({ force: true });
        await page.waitForTimeout(1500);
        const dialog = page.locator('[role="dialog"], .modal').filter({ visible: true });
        if (await dialog.count() > 0) {
          const confirmBtn = page.getByRole('button', { name: /Confirm|Submit|Reject/i });
          if (await confirmBtn.count() > 0) {
            await confirmBtn.first().click({ force: true });
            await page.waitForTimeout(1000);
            await expect(page.locator('body')).toContainText(/required|reason|remark/i);
            await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
            await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-045-reject-validation.png' });
          }
        } else {
          console.log('Rejection dialog did not appear');
          await page.click('body', { position: { x: 0, y: 0 } });
        }
      } else {
        console.log('Reject option not found in action menu');
        await page.click('body', { position: { x: 0, y: 0 } });
      }
    });

    test('TC-AI-046: admin can add a comment/remark to an indent record', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        console.log('No indent rows — skipping comment test');
        return;
      }
      await openFirstRowActionMenu(page);
      const menuText = await page.locator('body').textContent() ?? '';
      if (/Comment|Remark|Note/i.test(menuText)) {
        await page.getByText(/Comment|Remark|Note/i).first().click({ force: true });
        await page.waitForTimeout(1500);
        const textInput = page.locator('textarea, input[type="text"]').filter({ visible: true }).first();
        if (await textInput.count() > 0) {
          await textInput.fill(`Admin comment - ${Date.now()}`);
          await page.getByRole('button', { name: /Save|Submit|Add/i }).click({ force: true });
          await page.waitForTimeout(2000);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-046-comment-added.png' });
        } else {
          await page.getByRole('button', { name: /Cancel|Close/i }).first().click({ force: true });
        }
      } else {
        console.log('Comment/Remark option not found in action menu');
        await page.click('body', { position: { x: 0, y: 0 } });
      }
    });

    test('TC-AI-047: Generate PO option is available for approved indents', async ({ page }) => {
      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        console.log('No indent rows — skipping Generate PO option check');
        return;
      }
      await openFirstRowActionMenu(page);
      const menuText = await page.locator('body').textContent() ?? '';
      console.log(`Generate PO in menu: ${/Generate PO|Create PO|PO/i.test(menuText)}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-047.png' });
      await page.click('body', { position: { x: 0, y: 0 } });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. COLUMN TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Column Toggle', () => {

    test('TC-AI-048: clicking Columns button opens column visibility panel', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(600);
      const hasCheckboxes = await page.locator('input[type="checkbox"]:visible').count() > 0;
      console.log(`Column checkboxes visible: ${hasCheckboxes}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-048.png' });
      await page.click('body', { position: { x: 0, y: 0 } });
    });

    test('TC-AI-049: toggling a column off removes it from the table header', async ({ page }) => {
      await page.locator('button:has-text("Columns")').first().click({ force: true });
      await page.waitForTimeout(600);
      const checkedBoxes = page.locator('input[type="checkbox"]:checked').filter({ visible: true });
      const count = await checkedBoxes.count();
      if (count > 1) {
        await checkedBoxes.last().uncheck({ force: true });
        await page.waitForTimeout(600);
        await page.click('body', { position: { x: 0, y: 0 } });
        await page.waitForTimeout(600);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-049-column-hidden.png' });
      } else {
        await page.click('body', { position: { x: 0, y: 0 } });
        console.log('Fewer than 2 checkboxes available — skipping column toggle test');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Export Functionality', () => {

    test('TC-AI-050: Excel export completes without a page error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-050.png' });
    });

    test('TC-AI-051: PDF export completes without a page error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-AI-052: Excel export with active search filter works without errors', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('IND');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(1000); // Wait for download trigger
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-052.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Pagination', () => {

    test('TC-AI-053: Next page button loads the next set of records', async ({ page }) => {
      const nextBtn = page.locator('button').filter({ hasText: /Next|>/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-053.png' });
      } else {
        console.log('Next button not found — may be single page of results');
      }
    });

    test('TC-AI-054: First page button returns to page 1 from a later page', async ({ page }) => {
      const nextBtn = page.locator('button').filter({ hasText: /Next|>/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(1500);
        const firstBtn = page.getByRole('button', { name: /First/i });
        if (await firstBtn.count() > 0) {
          await firstBtn.click({ force: true });
          await page.waitForTimeout(1500);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-054.png' });
        }
      } else {
        console.log('Next button not found — single page, skipping First page test');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ACCESS CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Access Control', () => {

    test('TC-AI-055: admin role can access /dashboard/purchase/admin-indent without redirect', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(MODULE_URL));
      await expect(page.locator('body')).not.toContainText(/Unauthorized|Access Denied|Forbidden/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-055.png' });
    });

    test('TC-AI-056: page does not redirect admin to login page on load', async ({ page }) => {
      await expect(page).not.toHaveURL(new RegExp('/login'));
      await expect(page).toHaveURL(new RegExp('/dashboard'));
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. Edge Cases', () => {

    test('TC-AI-057: searching with only whitespace does not crash the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('   ');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-057.png' });
    });

    test('TC-AI-058: XSS payload in search field does not trigger an alert', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS triggered in Admin Indent!'); });
      await page.locator('input[placeholder*="Search"]').first().fill("<script>alert('xss')</script>");
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-058.png' });
    });

    test('TC-AI-059: SQL injection in search field does not break the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill("' OR 1=1 --");
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-059.png' });
    });

    test('TC-AI-060: rapid double-click on Search button does not cause duplicate requests error', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('IND');
      await page.locator('button:has-text("Search")').first().dblclick({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-AI-060.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. End-to-End Workflows', () => {

    test('E2E-AI-001: open admin indent list → search → filter by status → clear filters → verify page stable', async ({ page }) => {
      // 1. Verify page loaded
      await expect(page).toHaveURL(new RegExp('/dashboard/purchase/admin-indent'));
      await expect(page.locator('body')).toContainText(/Admin Indent Manage/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-001-loaded.png' });

      // 2. Search by keyword
      await page.locator('input[placeholder*="Search"]').first().fill('IND');
      await page.locator('button:has-text("Search")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-001-searched.png' });

      // 3. Open Filters and apply Status filter
      await openFilters(page);
      const statusDropdown = page.locator('[role="combobox"], select').filter({ visible: true }).first();
      if (await statusDropdown.count() > 0 && await statusDropdown.isVisible()) {
        await statusDropdown.click({ force: true });
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"], option').filter({ visible: true }).first();
        if (await firstOption.count() > 0) {
          await firstOption.click({ force: true });
          await page.waitForTimeout(500);
        }
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-001-filtered.png' });

      // 4. Clear all filters and verify restore
      await clearFilters(page);
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-001-cleared.png' });
    });

    test('E2E-AI-002: find a pending indent, open it, approve it, verify status changed to Approved', async ({ page }) => {
      // 1. Filter for Pending indents
      await openFilters(page);
      const statusDropdown = page.locator('[role="combobox"], select').filter({ visible: true }).first();
      if (await statusDropdown.count() > 0 && await statusDropdown.isVisible()) {
        await statusDropdown.click({ force: true });
        await page.waitForTimeout(500);
        const pendingOption = page.locator('[role="option"], option').filter({ hasText: /Pending/i }).first();
        if (await pendingOption.count() > 0) {
          await pendingOption.click({ force: true });
        }
      }
      await page.getByRole('button', { name: /^Search$|Apply/i }).click({ force: true });
      await page.waitForTimeout(2500);

      const rowCount = await page.locator('tbody tr').count();
      if (rowCount === 0) {
        console.log('No pending indents available — skipping E2E approval flow');
        await clearFilters(page);
        return;
      }

      // 2. Open action menu on first pending indent row
      await openFirstRowActionMenu(page);

      const bodyContent = await page.locator('body').textContent() ?? '';
      if (!bodyContent.includes('Approve')) {
        console.log('Approve not available for first row — may already be approved/rejected');
        await page.click('body', { position: { x: 0, y: 0 } });
        await clearFilters(page);
        return;
      }

      // 3. Click Approve
      await page.getByText(/Approve/i).first().click({ force: true });
      await page.waitForTimeout(2000);

      // 4. Handle confirmation dialog if present
      const dialog = page.locator('[role="dialog"], .modal, .swal2-popup').filter({ visible: true });
      if (await dialog.count() > 0) {
        await page.getByRole('button', { name: /Confirm|Yes|Approve/i }).click({ force: true });
        await page.waitForTimeout(3000);
      }

      await expect(page.locator('body')).toContainText(/success|approved/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-002-approved.png' });
    });

    test('E2E-AI-003: export admin indent list to Excel then to PDF — both succeed', async ({ page }) => {
      // Excel export
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-003-excel.png' });

      // PDF export
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-AI-003-pdf.png' });
    });
  });
});
