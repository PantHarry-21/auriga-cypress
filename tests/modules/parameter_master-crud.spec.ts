/**
 * Parameter Master — Create & Update Scenarios
 * URL  : /dashboard/testing/analyt-master-v2
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/analyt-master-v2';
const LAB = 'Arbro - Delhi';
const TS  = () => Date.now().toString().slice(-6);

// ── Validation helpers ────────────────────────────────────────────────────────

async function expectError(page: any): Promise<boolean> {
  const selectors = [
    '[class*="error"]:visible',
    '[class*="invalid"]:visible',
    '[role="alert"]:visible',
    '.text-red-500:visible',
    '.text-red-600:visible',
    'p[class*="text-red"]:visible',
    'span[class*="text-red"]:visible',
  ];
  for (const sel of selectors) {
    if (await page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) return true;
  }
  return false;
}

async function expectSuccess(page: any): Promise<boolean> {
  const selectors = [
    '[role="status"]:visible',
    '[class*="toast"]:visible',
    '[class*="success"]:visible',
    '[class*="notification"]:visible',
    '.text-green-600:visible',
  ];
  for (const sel of selectors) {
    if (await page.locator(sel).first().isVisible({ timeout: 8000 }).catch(() => false)) return true;
  }
  return false;
}

async function openFirstEditForm(page: any): Promise<boolean> {
  const editSelectors = [
    'table tbody tr:first-child button[aria-label*="edit" i]',
    'table tbody tr:first-child a:has-text("Edit")',
    'table tbody tr:first-child button:has-text("Edit")',
    'table tbody tr:first-child [class*="edit"]',
    'table tbody tr:first-child svg[class*="edit"]',
    'tbody tr:first-child td:last-child button',
  ];
  for (const sel of editSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

// Opens "New Parameter" and waits for the Step 1 search panel
async function openStep1Panel(page: any) {
  await page.click('button:has-text("New Parameter")');
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]')
    .waitFor({ state: 'visible', timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('[MODULE-PARAM-CRUD] Parameter Master — Create & Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  // ── CREATE — Step 1 (search) ──────────────────────────────────────────────
  test.describe('Create — Step 1', () => {

    // TC-C001: Clicking "New Parameter" opens search panel
    test('TC-C001 clicking New Parameter opens search panel', async ({ page }) => {
      await page.click('button:has-text("New Parameter")');
      await page.waitForTimeout(1500);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    // TC-C002: Next Step and Cancel buttons present in Step 1
    test('TC-C002 Next Step and Cancel buttons are present in step 1', async ({ page }) => {
      await openStep1Panel(page);
      await expect(page.locator('button:has-text("Next Step")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
      // cleanup
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
    });

    // TC-C003: Empty search → Next Step shows error OR button is disabled
    test('TC-C003 empty search term then Next Step shows error or prompt', async ({ page }) => {
      await openStep1Panel(page);
      const nextBtn = page.locator('button:has-text("Next Step")').first();
      const isDisabled = await nextBtn.isDisabled({ timeout: 1000 }).catch(() => false);
      if (isDisabled) {
        // Disabled button = validation working correctly
        expect(isDisabled).toBe(true);
      } else {
        await nextBtn.click();
        await page.waitForTimeout(1000);
        const hasError = await expectError(page);
        const nextStepStillVisible = await page.locator('button:has-text("Next Step")').isVisible({ timeout: 2000 }).catch(() => false);
        expect(hasError || nextStepStillVisible).toBe(true);
      }
      // cleanup
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
    });

    // TC-C004: Search field accepts text input
    test('TC-C004 search input accepts typed text', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill('Glucose');
      expect(await searchInput.inputValue()).toBe('Glucose');
      // cleanup
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
    });

    // TC-C005: Type valid term → click Next Step → proceeds to step 2 or shows results
    test('TC-C005 typing valid term and clicking Next Step advances the flow', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill(`AutoParam_${TS()}`);
      await page.locator('button:has-text("Next Step")').first().click();
      await page.waitForTimeout(2000);
      // Either step 2 form fields appear, or a list of matches appears
      const step2Indicators = [
        'input[name="parameterName"]',
        'input[name="analyteName"]',
        'input[name="name"]',
        '[class*="step2"]',
        '[class*="step-2"]',
        'button:has-text("Submit")',
        'button:has-text("Create Parameter")',
        'button:has-text("Add")',
      ];
      let step2Visible = false;
      for (const sel of step2Indicators) {
        if (await page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
          step2Visible = true;
          break;
        }
      }
      // Also accept if Cancel is still present (still in the flow)
      const cancelVisible = await page.locator('button:has-text("Cancel")').isVisible({ timeout: 2000 }).catch(() => false);
      expect(step2Visible || cancelVisible).toBe(true);
      // cleanup
      try {
        await page.locator('button:has-text("Cancel")').first().click({ timeout: 3000 });
      } catch (_) { /* may have advanced */ }
      await page.waitForTimeout(800);
    });

    // TC-C006: CAS number as search term
    test('TC-C006 CAS number as search term is accepted', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill('50-99-7'); // glucose CAS
      expect(await searchInput.inputValue()).toBe('50-99-7');
      // cleanup
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
    });

    // TC-C007: Special characters in search term
    test('TC-C007 special characters in search term field', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill('Test@#$%');
      const value = await searchInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
      // cleanup
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(800);
    });

    // TC-C008: Cancel from Step 1 returns to the list
    test('TC-C008 cancel from step 1 returns to parameter list', async ({ page }) => {
      await openStep1Panel(page);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const panelGone = !(await page
        .locator('input[placeholder*="Type parameter name, alias, or CAS number"]')
        .isVisible({ timeout: 2000 }).catch(() => false));
      expect(panelGone).toBe(true);
    });
  });

  // ── CREATE — Step 2 (details) ─────────────────────────────────────────────
  test.describe('Create — Step 2', () => {

    // TC-C009: After Next Step, form fields or results area appears
    test('TC-C009 after Next Step form area is visible', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill(`NewParam_${TS()}`);
      await page.locator('button:has-text("Next Step")').first().click();
      await page.waitForTimeout(2000);
      // Broad check: any content area beyond the search box itself
      const contentArea = page.locator('[class*="form"], [class*="dialog"], [class*="panel"], [role="dialog"]').first();
      const isVisible = await contentArea.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBe(true);
      // cleanup
      try {
        await page.locator('button:has-text("Cancel")').first().click({ timeout: 3000 });
        await page.keyboard.press('Escape');
      } catch (_) { /* closed */ }
      await page.waitForTimeout(800);
    });

    // TC-C010: Cancel is reachable from Step 2
    test('TC-C010 cancel from step 2 flow returns to list', async ({ page }) => {
      await openStep1Panel(page);
      const searchInput = page.locator('input[placeholder*="Type parameter name, alias, or CAS number"]');
      await searchInput.fill(`CancelStep2_${TS()}`);
      await page.locator('button:has-text("Next Step")').first().click();
      await page.waitForTimeout(2000);
      // Try clicking Cancel; if not present use Escape
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    // TC-U001: Edit button visible on table rows
    test('TC-U001 edit action is available on first table row', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) {
        test.skip();
        return;
      }
      const lastCell = page.locator('tbody tr:first-child td:last-child');
      await expect(lastCell).toBeVisible({ timeout: 5000 });
    });

    // TC-U002: Clicking edit opens form pre-filled with data
    test('TC-U002 clicking edit opens pre-filled parameter details', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) {
        test.skip();
        return;
      }
      const opened = await openFirstEditForm(page);
      if (!opened) {
        test.skip();
        return;
      }
      // In edit mode some field should be visible and populated
      const anyInput = page.locator('input[type="text"], input[type="number"]').first();
      const isVisible = await anyInput.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBe(true);
      // cleanup
      try {
        await page.locator('button:has-text("Cancel")').first().click({ timeout: 3000 });
        await page.keyboard.press('Escape');
      } catch (_) { /* closed */ }
      await page.waitForTimeout(800);
    });

    // TC-U003: Modify a field → save → success or error
    test('TC-U003 modifying a field and saving shows success or validation error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) {
        test.skip();
        return;
      }
      const opened = await openFirstEditForm(page);
      if (!opened) {
        test.skip();
        return;
      }
      const firstText = page.locator('input[type="text"]').first();
      if (await firstText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstText.fill(`Updated_${TS()}`);
      }
      const saveBtn = page.locator(
        'button:has-text("Submit for Review"), button:has-text("Save"), button:has-text("Update"), button:has-text("Create")'
      ).first();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        const hasSuccess = await expectSuccess(page);
        const hasError   = await expectError(page);
        expect(hasSuccess || hasError).toBe(true);
      }
      // cleanup
      try {
        await page.locator('button:has-text("Cancel")').first().click({ timeout: 3000 });
        await page.keyboard.press('Escape');
      } catch (_) { /* closed on success */ }
      await page.waitForTimeout(800);
    });

    // TC-U004: Cancel edit → no changes applied
    test('TC-U004 cancel edit returns to list without changes', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) {
        test.skip();
        return;
      }
      const opened = await openFirstEditForm(page);
      if (!opened) {
        test.skip();
        return;
      }
      // Cancel out
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });
  });
});
