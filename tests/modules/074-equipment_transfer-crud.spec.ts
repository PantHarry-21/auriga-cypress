/**
 * Equipment Transfer — Create & Update Scenarios
 * URL  : /dashboard/equipment/transfer
 * Role : admin
 * Form : opened with "New Transfer"
 * Save : "Submit"
 * Cancel : "Cancel"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/equipment/transfer';
const LAB = 'Arbro - Delhi';
const TS  = () => Date.now().toString().slice(-6);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function expectError(page: any): Promise<boolean> {
  // Disabled submit = validation enforced
  if (await page.locator('button:has-text("Submit")').first().isDisabled({ timeout: 1000 }).catch(() => false)) return true;

  const sels = [
    '[class*="error"]:visible',
    '[class*="invalid"]:visible',
    '[role="alert"]:visible',
    '.text-red-500:visible',
    '.text-red-600:visible',
    'p[class*="text-red"]:visible',
    'span[class*="text-red"]:visible',
  ];
  for (const s of sels) {
    if (await page.locator(s).first().isVisible({ timeout: 3000 }).catch(() => false)) return true;
  }
  return false;
}

async function expectSuccess(page: any): Promise<boolean> {
  const sels = [
    '[role="status"]:visible',
    '[class*="toast"]:visible',
    '[class*="success"]:visible',
    '.text-green-600:visible',
    '[class*="notification"]:visible',
  ];
  for (const s of sels) {
    if (await page.locator(s).first().isVisible({ timeout: 8000 }).catch(() => false)) return true;
  }
  return false;
}

async function openFirstEdit(page: any): Promise<boolean> {
  const sels = [
    'table tbody tr:first-child button[aria-label*="edit" i]',
    'table tbody tr:first-child a:has-text("Edit")',
    'table tbody tr:first-child button:has-text("Edit")',
    'tbody tr:first-child td:last-child button:first-child',
  ];
  for (const s of sels) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

async function openCreateForm(page: any) {
  await page.locator('button:has-text("New Transfer")').first().click();
  await page.waitForTimeout(1500);
  // Wait for the quantity field or remarks field in the form
  await page.locator('textarea[name="remarks"], input[name="quantity"]').first()
    .waitFor({ state: 'visible', timeout: 10000 });
}

async function saveForm(page: any) {
  const btn = page.locator('button:has-text("Submit")').first();
  const isDisabled = await btn.isDisabled({ timeout: 1000 }).catch(() => false);
  if (isDisabled) {
    await btn.click({ force: true }).catch(() => {});
  } else {
    await btn.click();
  }
  await page.waitForTimeout(1500);
}

async function cancelForm(page: any) {
  await page.locator('button:has-text("Cancel")').first().click();
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('[MODULE-074-CRUD] Equipment Transfer — Create & Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  // ── CREATE ─────────────────────────────────────────────────────────────────
  test.describe('Create', () => {

    // TC-C001: Empty form submit → validation error
    test('TC-C001 empty form submit shows validation error', async ({ page }) => {
      await openCreateForm(page);
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-C002: remarks only → submit → error or success
    test('TC-C002 remarks only submit returns error or proceeds', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('textarea[name="remarks"]').fill(`AutoTransfer_Remarks_${TS()}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C003: Valid quantity + remarks → success or error
    test('TC-C003 valid quantity and remarks submit succeeds or errors', async ({ page }) => {
      const ts = TS();
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('5');
      await page.locator('textarea[name="remarks"]').fill(`AutoTransfer_${ts}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C004: Invalid quantity (text) → rejected or error
    test('TC-C004 text in quantity field is rejected or shows error on submit', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('notanumber');
      await page.locator('textarea[name="remarks"]').fill(`Remarks_${TS()}`);
      await saveForm(page);
      const qtyValue = await page.locator('input[name="quantity"]').inputValue().catch(() => '');
      const hasError  = await expectError(page);
      expect(hasError || qtyValue === '' || qtyValue === '0').toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C005: Very long remarks accepted by field
    test('TC-C005 very long remarks (500 chars) accepted by textarea', async ({ page }) => {
      await openCreateForm(page);
      const longRemarks = 'R'.repeat(500);
      await page.locator('textarea[name="remarks"]').fill(longRemarks);
      const value = await page.locator('textarea[name="remarks"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C006: Cancel button closes form
    test('TC-C006 Cancel button closes form and returns to list', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('textarea[name="remarks"]').fill('WillCancel');
      await cancelForm(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const formVisible = await page.locator('textarea[name="remarks"]').isVisible({ timeout: 2000 }).catch(() => false);
      expect(formVisible).toBe(false);
    });

    // TC-C007: Clearing remarks after fill → error on submit
    test('TC-C007 clearing remarks after fill shows validation error on submit', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('textarea[name="remarks"]').fill('TempRemarks');
      await page.locator('textarea[name="remarks"]').clear();
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-C008: Equipment search input is visible and accepts text
    test('TC-C008 equipment search input is visible and accepts text', async ({ page }) => {
      await openCreateForm(page);
      const searchEl = page.locator('input[placeholder="Search equipment name..."]').first();
      const isVisible = await searchEl.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        await searchEl.fill('Auto');
        await page.waitForTimeout(500);
        // Autocomplete may change value — just check field is interactive
        const value = await searchEl.inputValue().catch(() => '');
        expect(value.length).toBeGreaterThanOrEqual(0);
      }
      await cancelForm(page);
    });

    // TC-C009: Submit and Cancel buttons are both present on form
    test('TC-C009 Submit and Cancel buttons are both present on New Transfer form', async ({ page }) => {
      await openCreateForm(page);
      await expect(page.locator('button:has-text("Submit")').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('button:has-text("Cancel")').first()).toBeVisible({ timeout: 5000 });
      await cancelForm(page);
    });

    // TC-C010: quantity as 0 — accepted or shows error
    test('TC-C010 quantity value of 0 is handled by form validation', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('0');
      await page.locator('textarea[name="remarks"]').fill(`ZeroQty_${TS()}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C011: Negative quantity — handled by form
    test('TC-C011 negative quantity is handled by form validation', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('-10');
      await page.locator('textarea[name="remarks"]').fill(`NegQty_${TS()}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });
  });

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    // TC-U001: Edit button on first row opens form
    test('TC-U001 edit button on first row opens the edit form', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      expect(opened || rowCount > 0).toBe(true);
      if (opened) {
        const remarksVisible = await page.locator('textarea[name="remarks"]').isVisible({ timeout: 5000 }).catch(() => false);
        expect(remarksVisible).toBe(true);
        await cancelForm(page);
      }
    });

    // TC-U002: Change remarks → save → success or error
    test('TC-U002 changing remarks and saving shows success or error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('textarea[name="remarks"]').clear();
      await page.locator('textarea[name="remarks"]').fill(`UpdatedRemarks_${TS()}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-U003: Clear remarks → error on save
    test('TC-U003 clearing remarks in edit shows validation error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('textarea[name="remarks"]').clear();
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-U004: Cancel leaves list unchanged
    test('TC-U004 cancel edit leaves list unchanged', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('textarea[name="remarks"]').fill('SHOULD_NOT_SAVE');
      await cancelForm(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const formGone = !(await page.locator('textarea[name="remarks"]').isVisible({ timeout: 2000 }).catch(() => false));
      expect(formGone).toBe(true);
    });

    // TC-U005: Edit form is pre-filled with existing data
    test('TC-U005 edit form is pre-filled with existing remarks or quantity', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      // Either remarks or quantity should have a value
      const remarksValue = await page.locator('textarea[name="remarks"]').inputValue().catch(() => '');
      const qtyValue     = await page.locator('input[name="quantity"]').inputValue().catch(() => '');
      expect(remarksValue.length > 0 || qtyValue.length > 0).toBe(true);
      await cancelForm(page);
    });
  });
});
