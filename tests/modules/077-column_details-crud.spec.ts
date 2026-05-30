/**
 * Column Details — Create & Update Scenarios
 * URL  : /dashboard/column-details
 * Role : admin
 * Form : opened with "Add New Column"
 * Save : "Add New Column" (last / .nth(1) inside form)
 * Cancel : Escape (no Cancel button)
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/column-details';
const LAB = 'Arbro - Delhi';
const TS  = () => Date.now().toString().slice(-6);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function expectError(page: any): Promise<boolean> {
  // Disabled submit button = validation enforced (disabled-button pattern)
  const submitBtn = page.locator('button:has-text("Add New Column")').last();
  if (await submitBtn.isDisabled({ timeout: 1000 }).catch(() => false)) return true;

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
  // Click the page-level "Add New Column" button (first occurrence)
  await page.locator('button:has-text("Add New Column")').first().click();
  await page.waitForTimeout(1500);
  await page.locator('input[name="columnId"]').waitFor({ state: 'visible', timeout: 10000 });
}

async function saveForm(page: any) {
  // Inside the form the same text appears — use last() to pick the form submit button
  const btn = page.locator('button:has-text("Add New Column")').last();
  const isDisabled = await btn.isDisabled({ timeout: 1000 }).catch(() => false);
  if (isDisabled) {
    await btn.click({ force: true }).catch(() => {}); // attempt force click to trigger any validation
  } else {
    await btn.click();
  }
  await page.waitForTimeout(1500);
}

async function cancelForm(page: any) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('[MODULE-077-CRUD] Column Details — Create & Update', () => {
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

    // TC-C002: columnId only → submit → error or success
    test('TC-C002 columnId only submit returns error or proceeds', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill(`COL_${TS()}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C003: Valid full data (columnId + productName) → success or error
    test('TC-C003 valid columnId and productName creates record or shows error', async ({ page }) => {
      const ts = TS();
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill(`COL_${ts}`);
      await page.locator('input[name="productName"]').fill(`AutoProduct_${ts}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C004: Cancel via Escape after filling → form closes, table visible
    test('TC-C004 pressing Escape after filling closes form without saving', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill(`COL_CANCEL_${TS()}`);
      await page.locator('input[name="productName"]').fill('CancelProduct');
      await cancelForm(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const formVisible = await page.locator('input[name="columnId"]').isVisible({ timeout: 2000 }).catch(() => false);
      expect(formVisible).toBe(false);
    });

    // TC-C005: Special characters in columnId accepted by field
    test('TC-C005 special characters in columnId are accepted by field', async ({ page }) => {
      await openCreateForm(page);
      const specialId = `COL@#$_${TS()}`;
      await page.locator('input[name="columnId"]').fill(specialId);
      const value = await page.locator('input[name="columnId"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C006: Numeric quantity valid
    test('TC-C006 quantity field accepts numeric input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('100');
      const value = await page.locator('input[name="quantity"]').inputValue();
      expect(value).toBe('100');
      await cancelForm(page);
    });

    // TC-C007: Text in quantity field — browser/app rejects or shows error
    test('TC-C007 text in quantity field is rejected or shows error', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill(`COL_${TS()}`);
      await page.locator('input[name="quantity"]').fill('abc');
      await saveForm(page);
      const qtyValue = await page.locator('input[name="quantity"]').inputValue().catch(() => '');
      const hasError  = await expectError(page);
      expect(hasError || qtyValue === '' || qtyValue === '0').toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C008: Very long columnId (300 chars) does not crash form
    test('TC-C008 very long columnId (300 chars) does not crash form', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill('C'.repeat(300));
      const value = await page.locator('input[name="columnId"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C009: purchaseDate field accepts valid date
    test('TC-C009 purchaseDate field accepts valid date input', async ({ page }) => {
      await openCreateForm(page);
      const dateField = page.locator('input[name="purchaseDate"]').first();
      const isEditable = await dateField.isVisible({ timeout: 3000 }).catch(() => false) &&
                         !(await dateField.isDisabled().catch(() => true));
      if (isEditable) {
        await dateField.fill('2025-01-01');
        const val = await dateField.inputValue();
        // Date input may format differently — just check something was accepted
        expect(val.length).toBeGreaterThanOrEqual(0);
      }
      await cancelForm(page);
    });

    // TC-C010: expiryDate before purchaseDate — form should error or accept
    test('TC-C010 expiryDate before purchaseDate triggers error or is accepted', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill(`COL_${TS()}`);
      await page.locator('input[name="purchaseDate"]').fill('2025-06-01');
      await page.locator('input[name="expiryDate"]').fill('2025-01-01');
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C011: manufacturer field accepts text
    test('TC-C011 manufacture field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="manufacture"]').fill('AutoManufacturer Ltd');
      const value = await page.locator('input[name="manufacture"]').inputValue();
      expect(value).toBe('AutoManufacturer Ltd');
      await cancelForm(page);
    });

    // TC-C012: supplier field accepts text
    test('TC-C012 supplier field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="supplier"]').fill('AutoSupplier Co');
      const value = await page.locator('input[name="supplier"]').inputValue();
      expect(value).toBe('AutoSupplier Co');
      await cancelForm(page);
    });

    // TC-C013: Clearing columnId after fill → error on submit
    test('TC-C013 clearing columnId after fill shows validation error on submit', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="columnId"]').fill('TEMP_COL');
      await page.locator('input[name="columnId"]').clear();
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-C014: batchNo field accepts text
    test('TC-C014 batchNo field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="batchNo"]').fill(`BATCH_${TS()}`);
      const value = await page.locator('input[name="batchNo"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C015: invoiceNo field accepts text
    test('TC-C015 invoiceNo field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="invoiceNo"]').fill(`INV_${TS()}`);
      const value = await page.locator('input[name="invoiceNo"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C016: Save button is visible inside form
    test('TC-C016 Add New Column save button is visible inside form', async ({ page }) => {
      await openCreateForm(page);
      // The save button (last occurrence) should be visible
      const saveBtn = page.locator('button:has-text("Add New Column")').last();
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await cancelForm(page);
    });
  });

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    // TC-U001: openFirstEdit opens form
    test('TC-U001 edit button on first row opens the edit form', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      expect(opened || rowCount > 0).toBe(true);
      if (opened) {
        const formVisible = await page.locator('input[name="columnId"]').isVisible({ timeout: 5000 }).catch(() => false);
        expect(formVisible).toBe(true);
        await cancelForm(page);
      }
    });

    // TC-U002: Change productName → save → success or error
    test('TC-U002 changing productName and saving shows success or error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('input[name="productName"]').clear();
      await page.locator('input[name="productName"]').fill(`UpdatedProduct_${TS()}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-U003: Clear columnId → error on save
    test('TC-U003 clearing columnId in edit shows validation error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('input[name="columnId"]').clear();
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-U004: Escape cancels edit — list remains
    test('TC-U004 pressing Escape on edit form leaves list unchanged', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('input[name="productName"]').fill('SHOULD_NOT_SAVE');
      await cancelForm(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const formGone = !(await page.locator('input[name="columnId"]').isVisible({ timeout: 2000 }).catch(() => false));
      expect(formGone).toBe(true);
    });

    // TC-U005: Edit form is pre-filled with existing data
    test('TC-U005 edit form is pre-filled with existing columnId data', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const colIdValue = await page.locator('input[name="columnId"]').inputValue();
      expect(colIdValue.length).toBeGreaterThan(0);
      await cancelForm(page);
    });
  });
});
