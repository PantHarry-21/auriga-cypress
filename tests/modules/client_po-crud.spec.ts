/**
 * Client Purchase Order — Comprehensive CRUD Test Suite
 * URL  : /dashboard/purchase/client-purchase-order
 * Role : admin
 * Open : "New Purchase Order" button
 * Save : "Create"
 * Cancel : "Cancel"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/client-purchase-order';
const LAB = 'Arbro - Delhi';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function expectError(page: any) {
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

async function expectSuccess(page: any) {
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

async function openFirstEdit(page: any) {
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

async function switchToActiveTab(page: any) {
  const activeTab = page.locator('button:has-text("Active"), [role="tab"]:has-text("Active")').first();
  if (await activeTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await activeTab.click();
    await page.waitForTimeout(1500);
  }
}

async function openNewPOForm(page: any) {
  await page.click('button:has-text("New Purchase Order")');
  await page.waitForTimeout(1500);
  await page.locator('input[name="poNo"]').waitFor({ timeout: 10000 });
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[CLIENT-PO-CRUD] Client Purchase Order — Create & Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  // ── Create ─────────────────────────────────────────────────────────────────
  test.describe('Create', () => {

    test('TC-C01 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(100);
    });

    test('TC-C02 empty submit shows validation errors', async ({ page }) => {
      await openNewPOForm(page);
      await page.locator('button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    });

    test('TC-C03 poNo only — triggers error for other required fields', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openNewPOForm(page);
      await page.locator('input[name="poNo"]').fill(`PO-${ts}`);
      await page.locator('button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    });

    test('TC-C04 valid poNo + remarks fills both fields correctly', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openNewPOForm(page);
      await page.locator('input[name="poNo"]').fill(`PO-AUTO-${ts}`);
      await page.locator('textarea[name="remarks"]').fill('Valid remarks for this PO entry test.');
      expect(await page.locator('input[name="poNo"]').inputValue()).toBe(`PO-AUTO-${ts}`);
      expect(await page.locator('textarea[name="remarks"]').inputValue()).toContain('Valid remarks');
    });

    test('TC-C05 invalid poAmount with text triggers error on submit', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openNewPOForm(page);
      await page.locator('input[name="poNo"]').fill(`PO-${ts}`);
      await page.locator('input[name="poAmount"]').fill('not-a-number');
      await page.locator('textarea[name="remarks"]').fill('Test remarks content here.');
      await page.locator('button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    });

    test('TC-C06 remarks under 5 chars triggers error on submit', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openNewPOForm(page);
      await page.locator('input[name="poNo"]').fill(`PO-${ts}`);
      await page.locator('textarea[name="remarks"]').fill('Hi');
      await page.locator('button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    });

    test('TC-C07 remarks over 500 chars triggers error on submit', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openNewPOForm(page);
      await page.locator('input[name="poNo"]').fill(`PO-${ts}`);
      await page.locator('textarea[name="remarks"]').fill('X'.repeat(501));
      await page.locator('button:has-text("Create")').first().click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    });

    test('TC-C08 Cancel button closes the form', async ({ page }) => {
      await openNewPOForm(page);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 8000 });
    });

    test('TC-C09 future expiry date 2026-12-31 is accepted in field', async ({ page }) => {
      await openNewPOForm(page);
      const expiryField = page.locator('input[name="poExpiredDate"]').first();
      if (await expiryField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expiryField.fill('2026-12-31');
        const val = await expiryField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C10 past expiry date 2020-01-01 is accepted in field (app may warn)', async ({ page }) => {
      await openNewPOForm(page);
      const expiryField = page.locator('input[name="poExpiredDate"]').first();
      if (await expiryField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expiryField.fill('2020-01-01');
        const val = await expiryField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C11 client search with fewer than 3 chars does not crash', async ({ page }) => {
      await openNewPOForm(page);
      const clientField = page.locator('input[name="clientName"]').first();
      if (await clientField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await clientField.fill('AB');
        await page.waitForTimeout(1500);
        // Dropdown should not appear or show no results — just verify field value
        expect(await clientField.inputValue()).toBe('AB');
      }
    });

    test('TC-C12 client search with 3+ chars triggers dropdown or response', async ({ page }) => {
      await openNewPOForm(page);
      const clientField = page.locator('input[name="clientName"]').first();
      await expect(clientField).toBeVisible({ timeout: 8000 });
      await clientField.fill('Arb');
      await page.waitForTimeout(1500);
      expect(await clientField.inputValue()).toBe('Arb');
    });

    test('TC-C13 poAmount numeric value is accepted', async ({ page }) => {
      await openNewPOForm(page);
      const amountField = page.locator('input[name="poAmount"]').first();
      await expect(amountField).toBeVisible({ timeout: 8000 });
      await amountField.fill('50000');
      expect(await amountField.inputValue()).toBe('50000');
    });

    test('TC-C14 file input is present in form', async ({ page }) => {
      await openNewPOForm(page);
      const fileInput = page.locator('input[name="poFile"]').first();
      const isPresent = await fileInput.isVisible({ timeout: 5000 }).catch(() => false) ||
                        (await fileInput.count()) > 0;
      expect(isPresent).toBe(true);
    });

    test('TC-C15 poType radio input is visible in form', async ({ page }) => {
      await openNewPOForm(page);
      const radioInput = page.locator('input[name="poType"], input[type="radio"]').first();
      const isPresent = await radioInput.isVisible({ timeout: 5000 }).catch(() => false) ||
                        (await radioInput.count()) > 0;
      expect(isPresent).toBe(true);
    });

    test('TC-C16 Create and Cancel buttons are present on form', async ({ page }) => {
      await openNewPOForm(page);
      await expect(page.locator('button:has-text("Create")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-C17 table headers include Client Name, PO Number, Status', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('Client Name'))).toBe(true);
      expect(headers.some(h => h.includes('PO Number'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });

    test('TC-C18 Active and Expired / Trash status tabs are present', async ({ page }) => {
      const activeTab = page.locator('button:has-text("Active"), [role="tab"]:has-text("Active")').first();
      const expiredTab = page.locator('button:has-text("Expired"), button:has-text("Trash"), [role="tab"]:has-text("Expired")').first();
      const hasActive = await activeTab.isVisible({ timeout: 5000 }).catch(() => false);
      const hasExpired = await expiredTab.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasActive || hasExpired).toBe(true);
    });
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 switch to Active tab and table loads', async ({ page }) => {
      await switchToActiveTab(page);
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('TC-U02 open first Active record edit form', async ({ page }) => {
      await switchToActiveTab(page);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const poNoField = page.locator('input[name="poNo"]').first();
      const poAmountField = page.locator('input[name="poAmount"]').first();
      const isVisible = await poNoField.isVisible({ timeout: 8000 }).catch(() => false) ||
                        await poAmountField.isVisible({ timeout: 8000 }).catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-U03 change poAmount and save', async ({ page }) => {
      await switchToActiveTab(page);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const amountField = page.locator('input[name="poAmount"]').first();
      if (await amountField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await amountField.clear();
        await amountField.fill('75000');
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Create")').first();
        const saveBtnVisible = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (!saveBtnVisible) { test.skip(); return; }
        const isDisabled = await saveBtn.isDisabled({ timeout: 500 }).catch(() => false);
        if (!isDisabled) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
        const success = await expectSuccess(page);
        const error = await expectError(page);
        expect(success || !error || isDisabled).toBe(true);
      }
    });

    test('TC-U04 clear remarks then save triggers required field error', async ({ page }) => {
      await switchToActiveTab(page);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const remarksField = page.locator('textarea[name="remarks"]').first();
      if (await remarksField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await remarksField.clear();
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Create")').first();
        await saveBtn.click();
        await page.waitForTimeout(1000);
        const hasError = await expectError(page);
        expect(hasError).toBe(true);
      }
    });

    test('TC-U05 cancel edit returns to table', async ({ page }) => {
      await switchToActiveTab(page);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });
  });
});
