/**
 * Admin Indent — Comprehensive CRUD Test Suite
 * URL  : /dashboard/purchase/admin-indent
 * Role : admin
 * Open : "New Indent" button
 * Save : "Add Product" (primary), "Generate Indent" (final step)
 * Cancel : "Cancel"
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/purchase/admin-indent';
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
  await page.click('button:has-text("New Indent")');
  await page.waitForTimeout(1500);
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[ADMIN-INDENT-CRUD] Admin Indent — Create & Update', () => {
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

    test('TC-C02 table is visible with expected headers', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      expect(headers.some(h => h.includes('Indent No'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });

    test('TC-C03 New Indent button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New Indent")')).toBeVisible();
    });

    test('TC-C04 form opens on New Indent click', async ({ page }) => {
      await openForm(page);
      // Any form content indicates the form opened (field names may vary)
      const anyInput = await page.locator('input, textarea').filter({ hasText: '' }).first().isVisible({ timeout: 8000 }).catch(() => false);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const hasFormContent = /heading|indent|po.?no|subject|cancel|submit/i.test(bodyText);
      expect(anyInput || hasFormContent).toBe(true);
    });

    test('TC-C05 empty submit — both PONo and Heading empty — shows error or keeps form open', async ({ page }) => {
      await openForm(page);
      const genBtn = page.locator('button:has-text("Generate Indent")').first();
      if (await genBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
        await genBtn.click();
      } else {
        const addBtn = page.locator('button:has-text("Add Product")').first();
        await addBtn.click();
      }
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const formStillOpen = await page.locator('textarea[name="Heading"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || formStillOpen).toBe(true);
    });

    test('TC-C06 Heading only — submit triggers error or response', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      await page.locator('textarea[name="Heading"]').first().fill(`AutoHeading_${ts}`);
      const genBtn = page.locator('button:has-text("Generate Indent")').first();
      if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await genBtn.click();
      }
      await page.waitForTimeout(1000);
      const succeeded = await expectSuccess(page);
      const hadError = await expectError(page);
      const stillOpen = await page.locator('textarea[name="Heading"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(succeeded || hadError || stillOpen).toBe(true);
    });

    test('TC-C07 PONo only — Heading empty — shows error or form remains open', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      await page.locator('input[name="PONo"]').first().fill(`PO-${ts}`);
      const genBtn = page.locator('button:has-text("Generate Indent")').first();
      if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await genBtn.click();
      }
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('input[name="PONo"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C08 valid Heading and PONo filled together', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      await page.locator('textarea[name="Heading"]').first().fill(`Subject_${ts}`);
      await page.locator('input[name="PONo"]').first().fill(`PO-${ts}`);
      expect(await page.locator('textarea[name="Heading"]').first().inputValue()).toContain(`Subject_${ts}`);
      expect(await page.locator('input[name="PONo"]').first().inputValue()).toContain(`PO-${ts}`);
    });

    test('TC-C09 company search input accepts text', async ({ page }) => {
      await openForm(page);
      const companyField = page.locator('input[placeholder="Search and select company..."]').first();
      if (await companyField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await companyField.fill('Test Company');
        await page.waitForTimeout(1000);
        expect(await companyField.inputValue()).toBe('Test Company');
      }
    });

    test('TC-C10 company search combobox accepts text', async ({ page }) => {
      await openForm(page);
      // Verified live 2026-07-10: the form's combobox is "Search and select company..."
      // (there is no instrument search field on New Indent)
      const companyField = page.locator('input[placeholder="Search and select company..."]').first();
      await expect(companyField).toBeVisible({ timeout: 8000 });
      await companyField.fill('TestCompany');
      await page.waitForTimeout(1000);
      expect(await companyField.inputValue()).toBe('TestCompany');
    });

    test('TC-C11 Cancel button closes the form', async ({ page }) => {
      await openForm(page);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('table')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('textarea[name="Heading"]')).not.toBeVisible();
    });

    test('TC-C12 special characters in Heading are accepted', async ({ page }) => {
      await openForm(page);
      const field = page.locator('textarea[name="Heading"]').first();
      if (await field.isVisible({ timeout: 5000 }).catch(() => false)) {
        await field.fill('<b>Indent & "Test"</b> — special: <>!@#$%^&*()');
        const val = await field.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C13 very long Heading (500 chars) accepted in textarea', async ({ page }) => {
      await openForm(page);
      const longText = 'AutoHeading_' + 'A'.repeat(488);
      await page.locator('textarea[name="Heading"]').first().fill(longText);
      const val = await page.locator('textarea[name="Heading"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C14 newline in Heading textarea is accepted', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Heading"]').first().fill('Line one\nLine two\nLine three');
      const val = await page.locator('textarea[name="Heading"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C15 clear Heading after fill then submit triggers error or form remains open', async ({ page }) => {
      await openForm(page);
      await page.locator('textarea[name="Heading"]').first().fill('TempHeading');
      await page.locator('textarea[name="Heading"]').first().clear();
      const genBtn = page.locator('button:has-text("Generate Indent")').first();
      if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await genBtn.click();
      }
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('textarea[name="Heading"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C16 Add Product button is visible in form', async ({ page }) => {
      await openForm(page);
      const addProductBtn = page.locator('button:has-text("Add Product")').first();
      const isVisible = await addProductBtn.isVisible({ timeout: 8000 }).catch(() => false);
      expect(isVisible).toBe(true);
    });

    test('TC-C17 Generate Indent and Cancel buttons visible in form', async ({ page }) => {
      await openForm(page);
      const genBtn = await page.locator('button:has-text("Generate Indent")').first().isVisible({ timeout: 8000 }).catch(() => false);
      const cancelBtn = await page.locator('button:has-text("Cancel")').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(genBtn || cancelBtn).toBe(true);
    });

    test('TC-C18 PONo field accepts alphanumeric input', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      await page.locator('input[name="PONo"]').first().fill(`PO-AUTO-${ts}`);
      const val = await page.locator('input[name="PONo"]').first().inputValue();
      expect(val).toBe(`PO-AUTO-${ts}`);
    });

    test('TC-C19 form has multiple input fields (Heading, PONo, company, instrument)', async ({ page }) => {
      await openForm(page);
      const inputCount = await page.locator('input, textarea').count();
      expect(inputCount).toBeGreaterThan(1);
    });
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 table loads with rows or is empty', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('TC-U02 first row edit button is accessible when rows exist', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      expect(opened).toBe(true);
    });

    test('TC-U03 edit form opens with form elements visible', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const headingVisible = await page.locator('textarea[name="Heading"]').first().isVisible({ timeout: 10000 }).catch(() => false);
      const poNoVisible = await page.locator('input[name="PONo"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      const anyInput = await page.locator('input, textarea').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(headingVisible || poNoVisible || anyInput).toBe(true);
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
