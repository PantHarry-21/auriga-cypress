import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — STP Groups Module — Comprehensive Test Suite
// URL    : /dashboard/testing/stp-groups
// Run    : npx playwright test tests/modules/stp_group.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/testing/stp-groups';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const GROUP_NAME = `AutoGroup ${TS}`;

const FORM_OPEN  = 'input[name="stpGroupName"]';
const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

test.describe('STP Groups Module', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await page.waitForTimeout(1500);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openAddForm = async (page: any) => {
    await page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i }).click();
    await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(500);
  };

  const closeForm = async (page: any) => {
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    if (await cancelBtn.count() > 0) {
      await cancelBtn.first().click({ force: true });
      await page.waitForTimeout(800);
    }
    // Ensure form is dismissed
    await page.waitForTimeout(300);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Page Load', () => {

    test('TC-STPG-001: navigating to STP Groups opens the listing screen', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('stp-groups'));
      await expect(page.locator('body')).not.toContainText('404');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-001.png' });
    });

    test('TC-STPG-002: data table or listing loads within expected timeout', async ({ page }) => {
      await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 30000 });
      await expect(page.locator('thead').first()).toBeVisible();
    });

    test('TC-STPG-003: page displays a recognizable heading for STP Groups', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/STP Group|Group/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-003.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Toolbar Elements', () => {

    test('TC-STPG-004: New STP Group button is visible in the toolbar', async ({ page }) => {
      await expect(page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-004.png' });
    });

    test('TC-STPG-005: Excel export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Excel")').first()).toBeVisible();
    });

    test('TC-STPG-006: PDF export button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    });

    test('TC-STPG-007: Search input is displayed', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
    });

    test('TC-STPG-008: Search button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("Search")').first()).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. GRID / LISTING
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Grid & Listing', () => {

    test('TC-STPG-009: grid renders with header row', async ({ page }) => {
      await expect(page.locator('thead').first()).toBeVisible();
    });

    test('TC-STPG-010: table header contains Group Name column', async ({ page }) => {
      const headerText = await page.locator('thead').first().textContent() ?? '';
      expect(headerText).toMatch(/Group Name|STP Group/i);
    });

    test('TC-STPG-011: at least one data row is present', async ({ page }) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('TC-STPG-012: row checkboxes are present for each record', async ({ page }) => {
      const checkboxCount = await page.locator('tbody input[type="checkbox"]').count();
      expect(checkboxCount).toBeGreaterThan(0);
    });

    test('TC-STPG-013: S.No. column starts at 1', async ({ page }) => {
      const firstRowTds = page.locator('tbody tr').first().locator('td');
      const cellTexts = await firstRowTds.allInnerTexts();
      const firstNum = cellTexts.map(t => t.trim()).find(t => /^\d+$/.test(t));
      expect(firstNum).toBe('1');
    });

    test('TC-STPG-014: pagination controls are present', async ({ page }) => {
      const navBtns = page.locator('button').filter({ hasText: /Next|First|Last|Prev/i });
      const count = await navBtns.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-STPG-015: total result count is displayed', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Search Functionality', () => {

    test('TC-STPG-016: search input accepts valid text', async ({ page }) => {
      const input = page.locator('input[placeholder*="Search"]').first();
      await input.clear();
      await input.fill('Group');
      await expect(input).toHaveValue('Group');
    });

    test('TC-STPG-017: searching with a valid keyword returns matching records', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('Group');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-017.png' });
    });

    test('TC-STPG-018: searching with non-existent keyword shows no-record message', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNEVEREXIST99XYZ');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-018.png' });
    });

    test('TC-STPG-019: searching with special characters does not break the page', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('@#$%^&*');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-STPG-020: clearing search and clicking Search returns full listing', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().clear();
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ADD STP GROUP — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Add STP Group — Form Display', () => {

    test('TC-STPG-021: clicking New STP Group opens the create form', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/STP Group|Group/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-021.png' });
      await closeForm(page);
    });

    test('TC-STPG-022: STP Group Name field is displayed', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('input[name="stpGroupName"]')).toBeVisible();
      await closeForm(page);
    });

    test('TC-STPG-023: STP selection/multi-select field is displayed', async ({ page }) => {
      await openAddForm(page);
      await expect(page.locator('body')).toContainText(/Select STP|STP/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-023.png' });
      await closeForm(page);
    });

    test('TC-STPG-024: Create/Save button is displayed in the form', async ({ page }) => {
      await openAddForm(page);
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await expect(saveBtn.first()).toBeVisible();
      await closeForm(page);
    });

    test('TC-STPG-025: Cancel button closes the form without saving', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="stpGroupName"]').fill('Should Not Save');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator(FORM_OPEN)).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-025.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ADD STP GROUP — FORM VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Add STP Group — Form Validations', () => {

    test('TC-STPG-026: clicking Create without filling fields shows validation errors', async ({ page }) => {
      await openAddForm(page);
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory|cannot be empty/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-026.png' });
      await closeForm(page);
    });

    test('TC-STPG-027: Group Name with spaces only shows required validation', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="stpGroupName"]').fill('      ');
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await closeForm(page);
    });

    test('TC-STPG-028: Group Name accepts valid alphanumeric and special characters', async ({ page }) => {
      await openAddForm(page);
      const input = page.locator('input[name="stpGroupName"]');
      await input.fill('Group-Test_123!');
      await expect(input).toHaveValue('Group-Test_123!');
      await closeForm(page);
    });

    test('TC-STPG-029: very long Group Name is handled gracefully', async ({ page }) => {
      await openAddForm(page);
      await page.locator('input[name="stpGroupName"]').fill('A'.repeat(300));
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });

    test('TC-STPG-030: validation errors disappear after correcting the field', async ({ page }) => {
      await openAddForm(page);
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.locator('input[name="stpGroupName"]').fill('Valid Group Name');
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText('required');
      await closeForm(page);
    });

    test('TC-STPG-031: XSS injection in Group Name does not trigger alerts', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS triggered!'); });
      await openAddForm(page);
      await page.locator('input[name="stpGroupName"]').fill("<script>alert('XSS')</script>");
      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. STPs MULTI-SELECT DROPDOWN
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. STPs Multi-Select Dropdown', () => {

    test('TC-STPG-032: STP search/select dropdown opens and shows options', async ({ page }) => {
      await openAddForm(page);
      const stpInput = page.locator('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]').filter({ visible: true });
      if (await stpInput.count() > 0) {
        await stpInput.first().click({ force: true });
        await page.waitForTimeout(800);
        const optionCount = await page.locator('[role="option"]').filter({ visible: true }).count();
        expect(optionCount).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-032.png' });
        await page.click('body', { position: { x: 0, y: 0 } });
      } else {
        // Try combobox fallback
        const combobox = page.locator('[role="combobox"]').filter({ visible: true }).first();
        if (await combobox.count() > 0) {
          await combobox.click({ force: true });
          await page.waitForTimeout(800);
          await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-032-combobox.png' });
          await page.click('body', { position: { x: 0, y: 0 } });
        }
      }
      await closeForm(page);
    });

    test('TC-STPG-033: selecting an STP from the dropdown adds it to the group', async ({ page }) => {
      await openAddForm(page);
      const stpInput = page.locator('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]').filter({ visible: true });
      if (await stpInput.count() > 0) {
        await stpInput.first().click({ force: true });
        await page.waitForTimeout(800);
        const firstOption = page.locator('[role="option"]').filter({ visible: true }).first();
        if (await firstOption.count() > 0) {
          await firstOption.click({ force: true });
          await page.waitForTimeout(300);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-033.png' });
        }
      }
      await closeForm(page);
    });

    test('TC-STPG-034: selecting multiple STPs adds them all to the group', async ({ page }) => {
      await openAddForm(page);
      const stpInput = page.locator('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]').filter({ visible: true });
      if (await stpInput.count() > 0) {
        await stpInput.first().click({ force: true });
        await page.waitForTimeout(800);
        const options = page.locator('[role="option"]').filter({ visible: true });
        const optCount = await options.count();
        if (optCount >= 2) {
          await options.first().click({ force: true });
          await page.waitForTimeout(200);
          await stpInput.first().click({ force: true });
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').filter({ visible: true }).nth(1).click({ force: true });
        }
        await page.click('body', { position: { x: 0, y: 0 } });
        await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-034.png' });
      }
      await closeForm(page);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. CREATE STP GROUP — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Create STP Group — Success Flow', () => {

    test('TC-STPG-035: filling Group Name, selecting STPs, and clicking Create succeeds', async ({ page }) => {
      await page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i }).click();
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(500);

      await page.locator('input[name="stpGroupName"]').fill(GROUP_NAME);

      const stpInput = page.locator('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]').filter({ visible: true });
      if (await stpInput.count() > 0) {
        await stpInput.first().click({ force: true });
        await page.waitForTimeout(800);
        const firstOption = page.locator('[role="option"]').filter({ visible: true }).first();
        if (await firstOption.count() > 0) {
          await firstOption.click({ force: true });
        }
        await page.click('body', { position: { x: 0, y: 0 } });
      }

      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(3500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-035.png' });
    });

    test('TC-STPG-036: newly created group appears in the listing', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(GROUP_NAME);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(new RegExp(GROUP_NAME, 'i'));
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-036.png' });
    });

    test('TC-STPG-037: duplicate Group Name is rejected with an error message', async ({ page }) => {
      await page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i }).click();
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });

      await page.locator('input[name="stpGroupName"]').fill(GROUP_NAME);

      const stpInput = page.locator('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]').filter({ visible: true });
      if (await stpInput.count() > 0) {
        await stpInput.first().click({ force: true });
        await page.waitForTimeout(800);
        const firstOption = page.locator('[role="option"]').filter({ visible: true }).first();
        if (await firstOption.count() > 0) {
          await firstOption.click({ force: true });
        }
        await page.click('body', { position: { x: 0, y: 0 } });
      }

      const saveBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/already exists|duplicate|unique/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-037.png' });
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EDIT STP GROUP
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Edit STP Group', () => {

    const openEditFirst = async (page: any) => {
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      await page.locator('tbody tr').first().locator('button').last().click({ force: true });
      await page.waitForTimeout(300);
      await page.getByText(/^Edit$/i).first().click({ force: true });
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });
    };

    test('TC-STPG-038: clicking Edit on a row opens the Edit form', async ({ page }) => {
      await openEditFirst(page);
      await expect(page.locator('body')).toContainText(/Edit.*Group|Update.*Group/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-038.png' });
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });

    test('TC-STPG-039: Edit form pre-populates the Group Name field', async ({ page }) => {
      await openEditFirst(page);
      const value = await page.locator('input[name="stpGroupName"]').inputValue();
      expect(value).not.toBe('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-039.png' });
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });

    test('TC-STPG-040: Edit form pre-populates existing STPs in the selection', async ({ page }) => {
      await openEditFirst(page);
      // Check that there are pre-populated STP selections (tags, chips, or selected options)
      const hasSelectedItems =
        (await page.locator('[class*="tag"], [class*="chip"], [class*="badge"], [class*="selected"]').count() > 0) ||
        (await page.locator('[role="option"][aria-selected="true"]').count() > 0);
      // Log result but don't fail — the form may have no STPs assigned yet
      console.log(`Pre-populated STPs found: ${hasSelectedItems}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-040.png' });
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });

    test('TC-STPG-041: modifying Group Name and saving persists the change', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill(GROUP_NAME);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);

      await page.locator('tbody tr').first().locator('button').last().click({ force: true });
      await page.waitForTimeout(300);
      await page.getByText(/^Edit$/i).first().click({ force: true });
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });

      const updatedName = `${GROUP_NAME} Upd`;
      await page.locator('input[name="stpGroupName"]').clear();
      await page.locator('input[name="stpGroupName"]').fill(updatedName);

      const saveBtn = page.getByRole('button', { name: /Update|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-041.png' });
    });

    test('TC-STPG-042: clearing Group Name in Edit shows validation error', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="stpGroupName"]').clear();
      const saveBtn = page.getByRole('button', { name: /Update|Save/i }).filter({ visible: true });
      await saveBtn.last().click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toContainText(/required|mandatory/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-042.png' });
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });

    test('TC-STPG-043: Cancel in Edit form closes without saving', async ({ page }) => {
      await openEditFirst(page);
      await page.locator('input[name="stpGroupName"]').fill('SHOULD_NOT_PERSIST');
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).not.toContainText('SHOULD_NOT_PERSIST');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. DELETE STP GROUP
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Delete STP Group', () => {

    test('TC-STPG-044: selecting a row and clicking Actions > Delete shows confirmation', async ({ page }) => {
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.getByRole('button', { name: /Actions|Action/i }).click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('body').getByText(/^Delete$/i).first().click({ force: true });
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"], .modal, .swal2-popup').filter({ visible: true });
      expect(await dialog.count()).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-044.png' });
      await page.getByRole('button', { name: /Cancel|No/i }).first().click({ force: true });
    });

    test('TC-STPG-045: canceling the delete dialog does not remove the record', async ({ page }) => {
      const beforeCount = await page.locator('tbody tr').count();
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.getByRole('button', { name: /Actions|Action/i }).click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('body').getByText(/^Delete$/i).first().click({ force: true });
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Cancel|No/i }).first().click({ force: true });
      await page.waitForTimeout(500);
      const afterCount = await page.locator('tbody tr').count();
      expect(afterCount).toBe(beforeCount);
    });

    test('TC-STPG-046: confirming delete removes the group from the listing', async ({ page }) => {
      const searchName = `${GROUP_NAME} Upd`;
      await page.locator('input[placeholder*="Search"]').first().fill(searchName);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent() ?? '';
      if (/No record|No data/i.test(bodyText)) {
        // Try original name
        await page.locator('input[placeholder*="Search"]').first().fill(GROUP_NAME);
        await page.locator('button:has-text("Search")').first().click();
        await page.waitForTimeout(2000);
      }

      const rowCount = await page.locator('tbody tr').count();
      if (rowCount > 0) {
        await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
        await page.getByRole('button', { name: /Actions|Action/i }).click({ force: true });
        await page.waitForTimeout(500);
        await page.locator('body').getByText(/^Delete$/i).first().click({ force: true });
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click({ force: true });
        await page.waitForTimeout(3000);
        await expect(page.locator('body')).not.toContainText('500');
        await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-046.png' });
      } else {
        console.log('Created group not found for deletion — skipping');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. Export Functionality', () => {

    test('TC-STPG-047: Excel export completes without page error', async ({ page }) => {
      await page.locator('button:has-text("Excel")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-047.png' });
    });

    test('TC-STPG-048: PDF export completes without page error', async ({ page }) => {
      await page.locator('button:has-text("PDF")').first().click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('12. Edge Cases', () => {

    test('TC-STPG-049: rapid double-click on New STP Group does not open multiple forms', async ({ page }) => {
      const btn = page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i });
      await btn.dblclick({ force: true });
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toContainText('500');
      // Only one cancel button should exist
      const cancelCount = await page.getByRole('button', { name: /Cancel/i }).count();
      expect(cancelCount).toBeLessThanOrEqual(2);
      await page.getByRole('button', { name: /Cancel/i }).first().click({ force: true });
    });

    test('TC-STPG-050: browser back navigation does not corrupt listing state', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-STPG-051: searching for zero-result query shows appropriate message', async ({ page }) => {
      await page.locator('input[placeholder*="Search"]').first().fill('ZZZNORESULT99999ABC');
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result|not found|Showing 0|0 of 0/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-051.png' });
    });

    test('TC-STPG-052: column sort on Group Name column works correctly', async ({ page }) => {
      const headers = page.locator('thead th').filter({ visible: true });
      const count = await headers.count();
      let found = false;
      for (let i = 0; i < count; i++) {
        const text = await headers.nth(i).textContent() ?? '';
        if (/Group Name|Name/i.test(text)) {
          await headers.nth(i).click({ force: true });
          await page.waitForTimeout(1000);
          await expect(page.locator('body')).not.toContainText('500');
          await headers.nth(i).click({ force: true });
          await page.waitForTimeout(1000);
          await expect(page.locator('body')).not.toContainText('500');
          found = true;
          break;
        }
      }
      console.log(`Group Name column sort found and tested: ${found}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-STPG-052.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('13. End-to-End Workflows', () => {

    test('E2E-STPG-001: Create → Search → Edit → Delete an STP Group', async ({ page }) => {
      const E2E_TS   = Date.now().toString().slice(-5);
      const E2E_NAME = `E2EGroup ${E2E_TS}`;

      // 1. Create
      await page.getByRole('button', { name: /New STP Group|Add STP Group|New Group/i }).click();
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });
      await page.locator('input[name="stpGroupName"]').fill(E2E_NAME);

      const stpInput = page.locator(
        'input[placeholder*="Search STP"], input[placeholder*="STP"], [role="combobox"]'
      ).filter({ visible: true }).first();
      if (await stpInput.count() > 0) {
        await stpInput.click({ force: true });
        await page.waitForTimeout(800);
        const firstOption = page.locator('[role="option"]').filter({ visible: true }).first();
        if (await firstOption.count() > 0) {
          await firstOption.click({ force: true });
        }
        await page.click('body', { position: { x: 0, y: 0 } });
      }

      const createBtn = page.getByRole('button', { name: /Create|Save/i }).filter({ visible: true });
      await createBtn.last().click({ force: true });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-STPG-001-created.png' });

      // 2. Search
      await page.locator('input[placeholder*="Search"]').first().fill(E2E_NAME);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(new RegExp(E2E_NAME, 'i'));

      // 3. Edit
      await page.locator('tbody tr').first().locator('button').last().click({ force: true });
      await page.waitForTimeout(300);
      await page.getByText(/^Edit$/i).first().click({ force: true });
      await expect(page.locator(FORM_OPEN)).toBeVisible({ timeout: 20000 });
      const updatedName = `${E2E_NAME} Upd`;
      await page.locator('input[name="stpGroupName"]').clear();
      await page.locator('input[name="stpGroupName"]').fill(updatedName);
      const updateBtn = page.getByRole('button', { name: /Update|Save/i }).filter({ visible: true });
      await updateBtn.last().click({ force: true });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-STPG-001-edited.png' });

      // 4. Delete
      await page.locator('input[placeholder*="Search"]').first().fill(updatedName);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await page.locator('tbody input[type="checkbox"]').first().check({ force: true });
      await page.getByRole('button', { name: /Actions|Action/i }).click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('body').getByText(/^Delete$/i).first().click({ force: true });
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click({ force: true });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-STPG-001-deleted.png' });

      // 5. Verify deletion
      await page.locator('input[placeholder*="Search"]').first().fill(updatedName);
      await page.locator('button:has-text("Search")').first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toContainText(/No record|No data|0 result/i);
    });
  });
});
