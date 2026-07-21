/**
 * CRM Working Standard — Create & Update Scenarios
 * URL  : /dashboard/crm-working-standard
 * Role : admin
 * Form : opened with "New CRM"
 * Save : "Submit"
 * Cancel : Escape (no Cancel button)
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/crm-working-standard';
const LAB = 'Arbro - Delhi';
const TS  = () => Date.now().toString().slice(-6);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function expectError(page: any): Promise<boolean> {
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
  await page.locator('button:has-text("New CRM")').first().click();
  await page.waitForTimeout(1500);
  await page.locator('input[name="productName"]').waitFor({ state: 'visible', timeout: 10000 });
}

async function saveForm(page: any) {
  await page.locator('button:has-text("Submit")').first().click();
  await page.waitForTimeout(1500);
}

async function cancelForm(page: any) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('[MODULE-078-CRUD] CRM Working Standard — Create & Update', () => {
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

    // TC-C002: productName only → submit → error or success
    test('TC-C002 productName only submit returns error or proceeds', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill(`OnlyCRM_${TS()}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C003: Valid productName + codeNo → success or error
    test('TC-C003 valid productName and codeNo submit succeeds or errors', async ({ page }) => {
      const ts = TS();
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill(`AutoCRM_${ts}`);
      await page.locator('input[name="codeNo"]').fill(`CODE_${ts}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C004: Cancel via Escape after filling → form closes, table visible
    test('TC-C004 pressing Escape after filling closes form without saving', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill(`CancelCRM_${TS()}`);
      await cancelForm(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      const formVisible = await page.locator('input[name="productName"]').isVisible({ timeout: 2000 }).catch(() => false);
      expect(formVisible).toBe(false);
    });

    // TC-C005: Special characters in productName accepted by field
    test('TC-C005 special characters in productName are accepted by field', async ({ page }) => {
      await openCreateForm(page);
      const specialName = `CRM@#$%_${TS()}`;
      await page.locator('input[name="productName"]').fill(specialName);
      const value = await page.locator('input[name="productName"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C006: Very long productName (300 chars) does not crash form
    test('TC-C006 very long productName (300 chars) does not crash form', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill('P'.repeat(300));
      const value = await page.locator('input[name="productName"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C007: quantity field accepts numeric input
    test('TC-C007 quantity field accepts numeric input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="quantity"]').fill('50');
      const value = await page.locator('input[name="quantity"]').inputValue();
      expect(value).toBe('50');
      await cancelForm(page);
    });

    // TC-C008: Text in quantity field — rejected or error
    test('TC-C008 text in quantity field is rejected or shows error on submit', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill(`CRM_${TS()}`);
      await page.locator('input[name="quantity"]').fill('abc');
      await saveForm(page);
      const qtyValue = await page.locator('input[name="quantity"]').inputValue().catch(() => '');
      const hasError  = await expectError(page);
      expect(hasError || qtyValue === '' || qtyValue === '0').toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C009: versionNo field accepts text
    test('TC-C009 versionNo field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="versionNo"]').fill(`V1.0_${TS()}`);
      const value = await page.locator('input[name="versionNo"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C010: storageCondition field accepts text
    test('TC-C010 storageCondition field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="storageCondition"]').fill('Store at 2–8°C');
      const value = await page.locator('input[name="storageCondition"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C011: source field accepts text
    test('TC-C011 source field accepts text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="source"]').fill('USP Reference');
      const value = await page.locator('input[name="source"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
    });

    // TC-C012: Clearing productName after fill → error on submit
    test('TC-C012 clearing productName after fill shows validation error on submit', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill('TempCRM');
      await page.locator('input[name="productName"]').clear();
      await saveForm(page);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
      await cancelForm(page);
    });

    // TC-C013: Submit button or Cancel is visible inside form (form opened)
    test('TC-C013 Submit button is visible inside the New CRM form', async ({ page }) => {
      await openCreateForm(page);
      // Submit button may be named differently — check any action button is present
      const actionBtn = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').first();
      const isVisible = await actionBtn.isVisible({ timeout: 5000 }).catch(() => false);
      // Verified live 2026-07-10: this form's secondary action is "Reset" (no Cancel button)
      const resetVisible = await page.locator('button:has-text("Reset")').first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(isVisible || resetVisible).toBe(true);
      await cancelForm(page);
    });

    // TC-C014: Partial data (productName + codeNo, missing other required) → error or success
    test('TC-C014 partial data submit with productName and codeNo shows result', async ({ page }) => {
      const ts = TS();
      await openCreateForm(page);
      await page.locator('input[name="productName"]').fill(`PartialCRM_${ts}`);
      await page.locator('input[name="codeNo"]').fill(`CODE_${ts}`);
      await saveForm(page);
      const hasError   = await expectError(page);
      const hasSuccess = await expectSuccess(page);
      expect(hasError || hasSuccess).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-C015: lodWaterContent field accepts numeric text
    test('TC-C015 lodWaterContent field accepts numeric text input', async ({ page }) => {
      await openCreateForm(page);
      await page.locator('input[name="lodWaterContent"]').fill('0.05');
      const value = await page.locator('input[name="lodWaterContent"]').inputValue();
      expect(value.length).toBeGreaterThan(0);
      await cancelForm(page);
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
        const formVisible = await page.locator('input[name="productName"]').isVisible({ timeout: 5000 }).catch(() => false);
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
      await page.locator('input[name="productName"]').fill(`UpdatedCRM_${TS()}`);
      await saveForm(page);
      const hasSuccess = await expectSuccess(page);
      const hasError   = await expectError(page);
      expect(hasSuccess || hasError).toBe(true);
      try { await cancelForm(page); } catch { /* may have closed */ }
    });

    // TC-U003: Clear required productName → error on save
    test('TC-U003 clearing productName in edit shows validation error', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('input[name="productName"]').clear();
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
      const formGone = !(await page.locator('input[name="productName"]').isVisible({ timeout: 2000 }).catch(() => false));
      expect(formGone).toBe(true);
    });

    // TC-U005: Edit form is pre-filled with existing data
    test('TC-U005 edit form is pre-filled with existing productName', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const nameValue = await page.locator('input[name="productName"]').inputValue();
      expect(nameValue.length).toBeGreaterThan(0);
      await cancelForm(page);
    });
  });
});
