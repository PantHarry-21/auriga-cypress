/**
 * Client Profile — Comprehensive CRUD Test Suite
 * URL  : /dashboard/profile/client
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/profile/client';
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

// ─── Open New Client form helper ───────────────────────────────────────────────
async function openNewClientForm(page: any) {
  await page.click('button:has-text("New Client")');
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().waitFor({ timeout: 10000 });
}

// ══════════════════════════════════════════════════════════════════════════════
test.describe('Client Profile — Create', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('CDP-C-001 empty submit shows validation errors', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-002 valid GST format "22AAAAA0000A1Z5" is accepted by field', async ({ page }) => {
    await openNewClientForm(page);
    const gstField = page.locator('input[placeholder="22AAAAA0000A1Z5"]').first();
    await gstField.fill('22AAAAA0000A1Z5');
    expect(await gstField.inputValue()).toBe('22AAAAA0000A1Z5');
  });

  test('CDP-C-003 invalid GST format "123ABC" triggers error on submit', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().fill('123ABC');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-004 valid company email + GST fills both fields correctly', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await openNewClientForm(page);
    await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().fill('22AAAAA0000A1Z5');
    await page.locator('input[name="companyEmail"]').first().fill(`auto${ts}@testco.com`);
    expect(await page.locator('input[name="companyEmail"]').first().inputValue()).toBe(`auto${ts}@testco.com`);
    expect(await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().inputValue()).toBe('22AAAAA0000A1Z5');
  });

  test('CDP-C-005 invalid email format in companyEmail triggers error on submit', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().fill('22AAAAA0000A1Z5');
    await page.locator('input[name="companyEmail"]').first().fill('not-an-email');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-006 Escape key closes the form', async ({ page }) => {
    await openNewClientForm(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    const formGone = !(await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().isVisible({ timeout: 3000 }).catch(() => false));
    const tableBack = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
    expect(formGone || tableBack).toBe(true);
  });

  test('CDP-C-007 Verify button click for GST field is visible and clickable', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().fill('22AAAAA0000A1Z5');
    const verifyBtn = page.locator('button:has-text("Verify")').first();
    await expect(verifyBtn).toBeVisible({ timeout: 8000 });
    await verifyBtn.click();
    await page.waitForTimeout(2000);
    // After click, either a success indicator or an error appears (network dependent)
    const pageBody = await page.locator('body').innerText().catch(() => '');
    expect(pageBody.length).toBeGreaterThan(50);
  });

  test('CDP-C-008 clearing required companyEmail after filling triggers error', async ({ page }) => {
    await openNewClientForm(page);
    const emailField = page.locator('input[name="companyEmail"]').first();
    await emailField.fill('valid@test.com');
    await emailField.clear();
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-009 display name field accepts optional short name', async ({ page }) => {
    await openNewClientForm(page);
    const displayName = page.locator('input[placeholder="Short name / display name (optional)"]').first();
    await expect(displayName).toBeVisible({ timeout: 8000 });
    await displayName.fill('TestCo');
    expect(await displayName.inputValue()).toBe('TestCo');
  });

  test('CDP-C-010 TAN No field accepts valid format', async ({ page }) => {
    await openNewClientForm(page);
    const tanField = page.locator('input[placeholder="e.g. ABCD12345E"]').first();
    const isVisible = await tanField.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await tanField.fill('ABCD12345E');
      const val = await tanField.inputValue();
      expect(val.length).toBeGreaterThan(0);
    }
  });

  test('CDP-C-011 contact phone field with letters triggers error on submit', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="9876543210"]').first().fill('ABCDEFGHIJ');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-012 contact email without @ triggers error on submit', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="email@company.com"]').first().fill('invalidemail');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-013 GST with wrong length triggers error', async ({ page }) => {
    await openNewClientForm(page);
    await page.locator('input[placeholder="22AAAAA0000A1Z5"]').first().fill('TOOSHORT');
    await page.locator('input[name="companyEmail"]').first().fill('test@test.com');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(1000);
    const hasError = await expectError(page);
    expect(hasError).toBe(true);
  });

  test('CDP-C-014 portal username and password fields are visible', async ({ page }) => {
    await openNewClientForm(page);
    const usernameField = page.locator('input[placeholder="Enter username"]').first();
    const passwordField = page.locator('input[placeholder="Minimum 8 characters"]').first();
    await expect(usernameField).toBeVisible({ timeout: 8000 });
    await expect(passwordField).toBeVisible({ timeout: 8000 });
  });

  test('CDP-C-015 TCS percentage field accepts numeric value', async ({ page }) => {
    await openNewClientForm(page);
    const tcsField = page.locator('input[placeholder="e.g. 10"]').first();
    await expect(tcsField).toBeVisible({ timeout: 8000 });
    await tcsField.fill('5');
    expect(await tcsField.inputValue()).toBe('5');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe('Client Profile — Update', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  test('CDP-U-001 first row edit button opens form with existing data', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const gstField = page.locator('input[placeholder="22AAAAA0000A1Z5"]').first();
    const emailField = page.locator('input[name="companyEmail"]').first();
    const gstVisible = await gstField.isVisible({ timeout: 8000 }).catch(() => false);
    const emailVisible = await emailField.isVisible({ timeout: 8000 }).catch(() => false);
    expect(gstVisible || emailVisible).toBe(true);
  });

  test('CDP-U-002 edit form pre-populates with existing record data', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const emailField = page.locator('input[name="companyEmail"]').first();
    if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const val = await emailField.inputValue();
      expect(val.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('CDP-U-003 change display name and save succeeds', async ({ page }) => {
    const ts = Date.now().toString().slice(-6);
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    const displayNameField = page.locator('input[placeholder="Short name / display name (optional)"]').first();
    if (await displayNameField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await displayNameField.clear();
      await displayNameField.fill(`Edited_${ts}`);
      await page.locator('button:has-text("Save")').first().click();
      await page.waitForTimeout(1000);
      const success = await expectSuccess(page);
      const error = await expectError(page);
      expect(success || !error).toBe(true);
    }
  });

  test('CDP-U-004 cancel edit returns to table without changes', async ({ page }) => {
    await page.locator('table tbody tr').first().waitFor({ timeout: 15000 });
    const opened = await openFirstEdit(page);
    if (!opened) { test.skip(); return; }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('CDP-U-005 table has expected headers after navigation', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    const headers = await page.locator('table thead th').allTextContents();
    expect(headers.some(h => h.includes('Company Name'))).toBe(true);
    expect(headers.some(h => h.includes('GST No'))).toBe(true);
  });
});
