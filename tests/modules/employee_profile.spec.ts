import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Employee Profile Module — Comprehensive Test Suite
// URL    : /dashboard/profile/employee
// Run    : npx playwright test tests/modules/employee_profile.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/profile/employee';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const EMP_NAME   = `AutoEmp ${TS}`;
const EMP_CODE   = `AUT${TS}`;
const EMP_USER   = `autouser${TS}`;
const EMP_PASS   = 'AutoTest@123';

test.describe('Employee Profile Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 15000 });
  });

  const openAddForm = async (page: any) => {
    await page.locator('button:has-text("New Employee"), button:has-text("Add Employee")').first().click();
    await expect(page.locator('input[placeholder*="Name"]').first()).toBeVisible({ timeout: 25000 });
  };

  const closeForm = async (page: any) => {
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click({ force: true });
      await expect(cancelBtn).toBeHidden({ timeout: 10000 });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {
    test('TC-EP-001: navigating to Employee Profile opens the listing screen', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('/profile/employee'));
      await expect(page.locator('body')).not.toContainText('404');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-EP-001.png' });
    });

    test('TC-EP-002: page heading "Employee Profile" is displayed', async ({ page }) => {
      await expect(page.getByText('Employee Profile')).toBeVisible();
    });

    test('TC-EP-003: Toolbar Elements (Excel, PDF, Columns, Actions)', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
      await expect(page.locator('button:has-text("Columns")').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Actions|Action/i })).toBeVisible();
    });

    test('TC-EP-004: Grid Elements (Checkboxes, Status)', async ({ page }) => {
      await expect(page.locator('thead input[type="checkbox"]')).toBeVisible();
      await expect(page.locator('tbody input[type="checkbox"]').first()).toBeVisible();
      await expect(page.locator('body')).toContainText(/Active|Inactive/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. ROW SELECTION & BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Row Selection & Bulk Actions', () => {
    test('TC-EP-005: clicking a row checkbox enables bulk actions', async ({ page }) => {
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.getByRole('button', { name: /Actions|Action/i }).click({ force: true });
      await expect(page.locator('body')).toContainText(/Reset Password/i);
      await expect(page.locator('body')).toContainText(/Delete/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH & FILTER
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Search & Filter', () => {
    test('TC-EP-023: searching by Employee Name returns matching records', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      await searchInput.fill('admin');
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-EP-023.png' });
    });

    test('TC-EP-038: filtering by Employee Id returns matching results', async ({ page }) => {
      await page.locator('button:has-text("Filters")').first().click();
      await expect(page.locator('input[placeholder*="Employee Id"]')).toBeVisible({ timeout: 5000 });
      await page.locator('input[placeholder*="Employee Id"], input[placeholder*="Id"]').filter({ visible: true }).first().fill('EMP');
      await page.getByRole('button', { name: /Apply|^Search$/i }).click({ force: true });
      await expect(page.locator('body')).not.toContainText('500');
      await expect(page.locator('tbody tr')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-EP-038.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. END-TO-END WORKFLOWS (CRUD)
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('17. End-to-End Workflows (CRUD)', () => {

    test('E2E: Create → Search → Edit → Delete Employee', async ({ page }) => {
      // 1. Create
      await openAddForm(page);

      await page.locator('select').filter({ visible: true }).first().selectOption({ index: 1 });
      await page.locator('input[placeholder*="Name"], input[name*="name"]').filter({ visible: true }).first().fill(EMP_NAME);
      await page.locator('input[type="date"]').filter({ visible: true }).first().fill('1988-08-20');
      await page.locator('input[placeholder*="Father"], input[name*="father"]').filter({ visible: true }).first().fill('E2E Father');
      await page.locator('input[placeholder*="Code"], input[name*="code"]').filter({ visible: true }).first().fill(EMP_CODE);
      await page.locator('input[type="radio"]').filter({ visible: true }).first().check({ force: true });
      await page.locator('input[placeholder*="Address"], textarea[placeholder*="Address"]').filter({ visible: true }).first().fill('E2E Street, Test Colony');
      await page.locator('input[placeholder*="City"], input[name*="city"]').filter({ visible: true }).first().fill('E2E City');
      await page.locator('input[placeholder*="Postal"], input[name*="postal"]').filter({ visible: true }).first().fill('110002');
      await page.locator('input[placeholder*="Mobile"], input[name*="mobile"]').filter({ visible: true }).first().fill('8080808080');
      await page.locator('input[placeholder*="Inhouse"], input[name*="inhouse"]').filter({ visible: true }).first().fill(`${EMP_USER}@ylims.test`);
      await page.locator('input[placeholder*="Username"], input[name*="username"]').filter({ visible: true }).first().fill(EMP_USER);
      await page.locator('input[type="password"]').filter({ visible: true }).nth(0).fill(EMP_PASS);
      await page.locator('input[type="password"]').filter({ visible: true }).nth(1).fill(EMP_PASS);

      await page.locator('button:has-text("Add Employee"), button:has-text("Save"), button:has-text("Submit")').last().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500', { timeout: 15000 });
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-001-submit.png' });

      // 2. Search & Verify
      await page.locator('input[placeholder*="Search"]').first().fill(EMP_CODE);
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(EMP_NAME, { timeout: 10000 });

      // 3. Edit
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.locator('button:has-text("Action")').first().click({ force: true });
      await page.locator('body').getByText(/^Edit$/i).click({ force: true });
      await expect(page.locator('input[placeholder*="Name"]').first()).toBeVisible({ timeout: 10000 });

      const updatedName = `${EMP_NAME} Edit`;
      await page.locator('input[name*="name"], input[placeholder*="Name"]').filter({ visible: true }).first().fill(updatedName);
      await page.locator('button:has-text("Update Employee"), button:has-text("Save"), button:has-text("Update")').last().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500', { timeout: 15000 });

      // Verify Edit
      await page.locator('input[placeholder*="Search"]').first().fill(EMP_CODE);
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(updatedName, { timeout: 10000 });

      // 4. Delete
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.locator('button:has-text("Action")').first().click({ force: true });
      await page.locator('body').getByText(/^Delete$/i).click({ force: true });
      await page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').filter({ visible: true }).last().click({ force: true });
      await expect(page.locator('body')).not.toContainText('500', { timeout: 15000 });

      // Verify Delete
      await page.locator('input[placeholder*="Search"]').first().fill(EMP_CODE);
      await page.locator('button:has-text("Search")').first().click();
      await expect(page.locator('body')).toContainText(/No record|No data|0 result/i, { timeout: 10000 });
    });
  });
});
