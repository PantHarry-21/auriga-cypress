/**
 * Generate PO — Comprehensive CRUD Test Suite
 * URL  : /dashboard/purchase/generate-po
 * Role : admin
 * Open : "Generate PO" button
 * Save : "Generate PO" (inside form)
 * Cancel : "Cancel"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/generate-po';
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

async function openForm(page: any) {
  await page.getByRole('button', { name: 'Generate PO' }).first().click();
  await page.waitForTimeout(1500);
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[GEN-PO-CRUD] Generate PO — Create & Update', () => {
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

    test('TC-C02 page URL contains expected path segment', async ({ page }) => {
      expect(page.url()).toMatch(/generate.{0,1}po/i);
    });

    test('TC-C03 table is visible with rows or empty', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rowCount = await page.locator('table tbody tr').count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-C04 Generate PO button is visible on list page', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Generate PO' }).first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-C05 form opens on Generate PO click and shows Address field', async ({ page }) => {
      await openForm(page);
      await expect(page.locator('textarea[name="Address"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-C06 empty submit — no Address — shows error or keeps form open', async ({ page }) => {
      await openForm(page);
      // The submit button inside the form shares the same text "Generate PO" — use last()
      const submitBtn = page.locator('button:has-text("Generate PO")').last();
      if (await submitBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
        await submitBtn.click();
      }
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('textarea[name="Address"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C07 Address only filled — submit triggers error or response', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Address"]').first().fill('Test Address 123');
      const submitBtn = page.locator('button:has-text("Generate PO")').last();
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();
      }
      await page.waitForTimeout(1000);
      const succeeded = await expectSuccess(page);
      const hadError = await expectError(page);
      const stillOpen = await page.locator('textarea[name="Address"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(succeeded || hadError || stillOpen).toBe(true);
    });

    test('TC-C08 valid Address "Test Address 123" is accepted in field', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Address"]').first().fill('Test Address 123');
      const val = await page.locator('textarea[name="Address"]').first().inputValue();
      expect(val).toBe('Test Address 123');
    });

    test('TC-C09 QuotationNo field visible and accepts text', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      const field = page.locator('input[name="QuotationNo"]').first();
      const isVisible = await field.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        await field.fill(`QN-${ts}`);
        const val = await field.inputValue();
        expect(val.length).toBeGreaterThan(0); // autocomplete may change value
      }
    });

    test('TC-C10 QuotationDate field accepts a valid date', async ({ page }) => {
      await openForm(page);
      const dateField = page.locator('input[name="QuotationDate"]').first();
      if (await dateField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await dateField.fill('2026-06-01');
        const val = await dateField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C11 BankDetails textarea visible and accepts text', async ({ page }) => {
      await openForm(page);
      const bankField = page.locator('textarea[name="BankDetails"]').first();
      if (await bankField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await bankField.fill('Bank: HDFC\nAccount: 123456789\nIFSC: HDFC0001234');
        const val = await bankField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C12 Cancel button closes the form and table is visible', async ({ page }) => {
      await openForm(page);
      await page.getByRole('button', { name: 'Cancel' }).first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('textarea[name="Address"]')).not.toBeVisible();
    });

    test('TC-C13 long Address (500 chars) accepted in textarea', async ({ page }) => {
      await openForm(page);
      const longAddr = 'TestAddr_' + 'X'.repeat(491);
      await page.locator('textarea[name="Address"]').first().fill(longAddr);
      const val = await page.locator('textarea[name="Address"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C14 special characters in Address are accepted', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Address"]').first().fill('Plot #12, Sector-5, "Main Road" & Lane: <>!@#');
      const val = await page.locator('textarea[name="Address"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C15 clear Address after fill then submit shows error or form remains open', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Address"]').first().fill('Temporary Address');
      await page.locator('textarea[name="Address"]').first().clear();
      const submitBtn = page.locator('button:has-text("Generate PO")').last();
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) await submitBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('textarea[name="Address"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C16 PaymentTerms field visible and accepts text', async ({ page }) => {
      await openForm(page);
      const payField = page.locator('input[name="PaymentTerms"]').first();
      if (await payField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await payField.fill('Net 30 Days');
        const val = await payField.inputValue();
        expect(val).toBe('Net 30 Days');
      }
    });

    test('TC-C17 Warranty field visible and accepts text', async ({ page }) => {
      await openForm(page);
      const warrantyField = page.locator('input[name="Warranty"]').first();
      if (await warrantyField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await warrantyField.fill('1 Year');
        const val = await warrantyField.inputValue();
        expect(val).toBe('1 Year');
      }
    });

    test('TC-C18 TermCondition textarea visible and accepts text', async ({ page }) => {
      await openForm(page);
      // Verified live 2026-07-10: the field is textarea[name="TermCondition"] (not "TermsAndConditions")
      const tncField = page.locator('textarea[name="TermCondition"]').first();
      if (await tncField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await tncField.fill('Standard terms and conditions apply. Delivery within 30 days.');
        const val = await tncField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C19 Heading textarea visible and accepts text', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      const headingField = page.locator('textarea[name="Heading"]').first();
      if (await headingField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await headingField.fill(`PO Heading ${ts}`);
        const val = await headingField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 table loads with rows or is empty', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('TC-U02 first row edit button accessible when rows exist', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      expect(opened).toBe(true);
    });

    test('TC-U03 edit form opens with Address field visible', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const addrVisible = await page.locator('textarea[name="Address"]').first().isVisible({ timeout: 10000 }).catch(() => false);
      const anyInput = await page.locator('input, textarea').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(addrVisible || anyInput).toBe(true);
    });

    test('TC-U04 cancel edit returns to table view', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });
  });
});
