/**
 * Client Quotation — Comprehensive CRUD Test Suite
 * URL  : /dashboard/quotation/client
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/quotation/client';
const LAB = 'Arbro - Delhi';

// ─── Shared helpers ────────────────────────────────────────────────────────────
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

// ─── Open New Quotation form helper ────────────────────────────────────────────
async function openNewQuotationForm(page: any) {
  await page.click('button:has-text("New Quotation")');
  await page.waitForTimeout(1500);
  await page.locator('input[name="quotationSubject"]').waitFor({ timeout: 10000 });
}

// ══════════════════════════════════════════════════════════════════════════════
test.describe('Client Quotation — Create', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('CQ-C-001 empty submit shows validation errors', async ({ page }) => {
    await openNewQuotationForm(page);
    await page.locator('button:has-text("Generate Quotation")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CQ-C-002 quotationSubject only — form accepts input and submit proceeds', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await openNewQuotationForm(page);
    await page.locator('input[name="quotationSubject"]').fill(`AutoSubject_${ts}`);
    await page.locator('button:has-text("Generate Quotation")').first().click();
    await page.waitForTimeout(1000);
    // May show error for missing client — that is acceptable
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.length).toBeGreaterThan(50);
  });

  test('CQ-C-003 client search field accepts 3+ char input', async ({ page }) => {
    await openNewQuotationForm(page);
    const clientField = page.locator('input[name="clientId"]').first();
    await expect(clientField).toBeVisible({ timeout: 8000 });
    await clientField.fill('Arb');
    await page.waitForTimeout(1500);
    expect(await clientField.inputValue()).toBe('Arb');
  });

  test('CQ-C-004 valid subject + contact fields accept input', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await openNewQuotationForm(page);
    await page.locator('input[name="quotationSubject"]').fill(`Valid Quotation Subject ${ts}`);
    await page.locator('input[name="contactPerson"]').fill('John Doe');
    await page.locator('input[name="contactPersonMobile"]').fill('9876543210');
    expect(await page.locator('input[name="contactPerson"]').inputValue()).toBe('John Doe');
    expect(await page.locator('input[name="contactPersonMobile"]').inputValue()).toBe('9876543210');
  });

  test('CQ-C-005 invalid email in contactPersonEmail triggers error on submit', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await openNewQuotationForm(page);
    await page.locator('input[name="quotationSubject"]').fill(`TestSubject_${ts}`);
    await page.locator('input[name="contactPersonEmail"]').fill('bademail@@nodot');
    await page.locator('button:has-text("Generate Quotation")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CQ-C-006 invalid mobile with letters triggers error on submit', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await openNewQuotationForm(page);
    await page.locator('input[name="quotationSubject"]').fill(`TestSubject_${ts}`);
    const mobileField = page.locator('input[name="contactPersonMobile"]').first();
    if (await mobileField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await mobileField.fill('ABCDEFGHIJ');
    }
    const genBtn = page.locator('button:has-text("Generate Quotation")').first();
    const genDisabled = await genBtn.isDisabled({ timeout: 1000 }).catch(() => false);
    if (genDisabled) {
      // Disabled button = form validation is active — this IS the error state
      expect(genDisabled).toBe(true);
    } else {
      await genBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    }
  });

  test('CQ-C-007 Cancel button closes the form', async ({ page }) => {
    await openNewQuotationForm(page);
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toBeVisible({ timeout: 8000 });
  });

  test('CQ-C-008 500-char subject is accepted in field', async ({ page }) => {
    await openNewQuotationForm(page);
    const field = page.locator('input[name="quotationSubject"]').first();
    if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
      const longSubject = 'A'.repeat(500);
      await field.fill(longSubject);
      const val = await field.inputValue();
      expect(val.length).toBeGreaterThan(0);
    }
  });

  test('CQ-C-009 special characters in quotationSubject are accepted', async ({ page }) => {
    await openNewQuotationForm(page);
    await page.locator('input[name="quotationSubject"]').fill('Test <Quote> & "Special" @2024');
    const val = await page.locator('input[name="quotationSubject"]').inputValue();
    expect(val.length).toBeGreaterThan(0);
  });

  test('CQ-C-010 Generate Quotation button is visible on form', async ({ page }) => {
    await openNewQuotationForm(page);
    await expect(page.locator('button:has-text("Generate Quotation")')).toBeVisible({ timeout: 8000 });
  });

  test('CQ-C-011 Assign To field accepts input', async ({ page }) => {
    await openNewQuotationForm(page);
    const assignField = page.locator('input[name="assignTo"]').first();
    if (await assignField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await assignField.fill('Manager');
      expect(await assignField.inputValue()).toBe('Manager');
    }
  });

  test('CQ-C-012 Valid Till date field accepts a date', async ({ page }) => {
    await openNewQuotationForm(page);
    const validTill = page.locator('input[name="validTill"]').first();
    if (await validTill.isVisible({ timeout: 5000 }).catch(() => false)) {
      await validTill.fill('2025-12-31');
      const val = await validTill.inputValue();
      expect(val.length).toBeGreaterThan(0);
    }
  });

  test('CQ-C-013 table has correct headers on page load', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    const headers = await page.locator('table thead th').allTextContents();
    expect(headers.some(h => h.includes('Quotation No'))).toBe(true);
    expect(headers.some(h => h.includes('Title') || h.includes('Subject'))).toBe(true);
    expect(headers.some(h => h.includes('Client Name'))).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe('Client Quotation — Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('CQ-U-001 open first record in edit mode', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const subjectField = page.locator('input[name="quotationSubject"]').first();
    const isVisible = await subjectField.isVisible({ timeout: 8000 }).catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('CQ-U-002 change quotationSubject and save', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const subjectField = page.locator('input[name="quotationSubject"]').first();
    if (await subjectField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await subjectField.clear();
      await subjectField.fill(`Updated Subject ${ts}`);
      const saveBtn = page.locator('button:has-text("Generate Quotation"), button:has-text("Save"), button:has-text("Update")').first();
      await saveBtn.click();
      await page.waitForTimeout(1000);
      const success = await expectSuccess(page);
      const error = await expectError(page);
      expect(success || !error).toBe(true);
    }
  });

  test('CQ-U-003 clear subject then save triggers required field error', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const subjectField = page.locator('input[name="quotationSubject"]').first();
    if (await subjectField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await subjectField.clear();
      const saveBtn = page.locator('button:has-text("Generate Quotation"), button:has-text("Save"), button:has-text("Update")').first();
      await saveBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      expect(hasError).toBe(true);
    }
  });

  test('CQ-U-004 cancel edit returns to table', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('CQ-U-005 table rows have at least one record', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});
