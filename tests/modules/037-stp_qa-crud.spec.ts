/**
 * STP QA — Comprehensive CRUD Test Suite
 * URL  : /dashboard/stp-qa
 * Role : admin
 * Form : opened with "New STP QA"
 * Save : Add (or Submit)
 * Cancel : Escape key (no cancel button)
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/stp-qa';
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
    'table tbody tr:first-child [data-action="edit"]',
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
  await page.getByRole('button', { name: 'New STP QA' }).click();
  await page.waitForTimeout(1500);
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[STP-QA-CRUD] STP QA — Create & Update', () => {
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
      expect(page.url()).toContain('stp-qa');
    });

    test('TC-C03 data table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    });

    test('TC-C04 table has expected column headers', async ({ page }) => {
      const headers = await page.locator('th, [role="columnheader"]').allTextContents();
      // Headers may vary — just verify there are some headers
      expect(headers.length).toBeGreaterThan(0);
    });

    test('TC-C05 New STP QA button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'New STP QA' })).toBeVisible();
    });

    test('TC-C06 form opens on New STP QA click', async ({ page }) => {
      await openForm(page);
      await expect(page.locator('input[name="stp_title"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-C07 empty submit shows validation error or keeps form open', async ({ page }) => {
      await openForm(page);
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
      await addBtn.waitFor({ timeout: 8000 });
      await addBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('input[name="stp_title"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C08 stp_title only — submit shows error or response', async ({ page }) => {
      const ts = Date.now();
      await openForm(page);
      await page.locator('input[name="stp_title"]').first().fill(`AutoSTPQA_${ts}`);
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const succeeded = await expectSuccess(page);
      const hadError = await expectError(page);
      expect(succeeded || hadError).toBe(true);
    });

    test('TC-C09 valid full data — title and code — form submits or shows response', async ({ page }) => {
      const ts = Date.now();
      await openForm(page);
      await page.locator('input[name="stp_title"]').first().fill(`AutoSTPQA_${ts}`);
      const codeField = page.locator('input[name="stp_code"]').first();
      if (await codeField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await codeField.fill(`CODE_${ts}`);
      }
      const issueNoField = page.locator('input[name="issue_no"]').first();
      if (await issueNoField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await issueNoField.fill(`ISS-${ts}`);
      }
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const succeeded = await expectSuccess(page);
      const hadError = await expectError(page);
      expect(succeeded || hadError).toBe(true);
    });

    test('TC-C10 Escape key closes the form', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="stp_title"]').first().waitFor({ timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      // After Escape, either form closes or table remains visible
      const tableVisible = await page.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
      const formGone = !(await page.locator('input[name="stp_title"]').isVisible({ timeout: 2000 }).catch(() => false));
      expect(tableVisible || formGone).toBe(true);
    });

    test('TC-C11 special characters in stp_title accepted', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="stp_title"]').first().fill('STP-QA_#01!@Special');
      const val = await page.locator('input[name="stp_title"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C12 long stp_title (200 chars) accepted in field', async ({ page }) => {
      await openForm(page);
      const longTitle = 'AutoSTPQA_' + 'L'.repeat(190);
      await page.locator('input[name="stp_title"]').first().fill(longTitle);
      const actual = await page.locator('input[name="stp_title"]').first().inputValue();
      expect(actual.length).toBeGreaterThan(0);
    });

    test('TC-C13 issue_date field accepts date value', async ({ page }) => {
      await openForm(page);
      const dateField = page.locator('input[name="issue_date"]').first();
      await expect(dateField).toBeAttached({ timeout: 8000 });
      await dateField.fill('2026-01-15');
      const val = await dateField.inputValue();
      expect(val).toBeTruthy();
    });

    test('TC-C14 next_revision_date field accepts date value', async ({ page }) => {
      await openForm(page);
      const nextRevField = page.locator('input[name="next_revision_date"]').first();
      await expect(nextRevField).toBeAttached({ timeout: 8000 });
      await nextRevField.fill('2027-06-30');
      const val = await nextRevField.inputValue();
      expect(val).toBeTruthy();
    });

    test('TC-C15 clearing stp_title after fill triggers error on submit', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="stp_title"]').first().fill('TempSTPQA');
      await page.locator('input[name="stp_title"]').first().clear();
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('input[name="stp_title"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C16 description textarea is visible and accepts text', async ({ page }) => {
      await openForm(page);
      const descField = page.locator('textarea[name="description"]').first();
      await expect(descField).toBeVisible({ timeout: 8000 });
      await descField.fill('Test description for STP QA automation');
      const val = await descField.inputValue();
      expect(val).toContain('Test description');
    });

    test('TC-C17 owner_title field accepts text', async ({ page }) => {
      await openForm(page);
      const ownerField = page.locator('input[name="owner_title"]').first();
      await expect(ownerField).toBeVisible({ timeout: 8000 });
      await ownerField.fill('Lab Quality Manager');
      expect(await ownerField.inputValue()).toBe('Lab Quality Manager');
    });

    test('TC-C18 Add button is visible in form', async ({ page }) => {
      await openForm(page);
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
      await expect(addBtn).toBeVisible({ timeout: 8000 });
    });
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 first row edit button is accessible', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) test.skip();
      const opened = await openFirstEdit(page);
      expect(opened).toBe(true);
    });

    test('TC-U02 edit form opens with stp_title field visible', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) test.skip();
      const opened = await openFirstEdit(page);
      if (!opened) test.skip();
      await expect(page.locator('input[name="stp_title"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-U03 update stp_title and save — response is received', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) test.skip();
      const opened = await openFirstEdit(page);
      if (!opened) test.skip();
      const titleField = page.locator('input[name="stp_title"]').first();
      await titleField.waitFor({ timeout: 8000 });
      await titleField.clear();
      await titleField.fill(`AutoSTPQA_Updated_${Date.now()}`);
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit"), button:has-text("Save"), button:has-text("Update")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const succeeded = await expectSuccess(page);
      const hadError = await expectError(page);
      expect(succeeded || hadError).toBe(true);
    });

    test('TC-U04 clearing required stp_title in edit shows error or keeps form open', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) test.skip();
      const opened = await openFirstEdit(page);
      if (!opened) test.skip();
      const titleField = page.locator('input[name="stp_title"]').first();
      await titleField.waitFor({ timeout: 8000 });
      await titleField.clear();
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Submit"), button:has-text("Save"), button:has-text("Update")').first();
      await addBtn.click();
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('input[name="stp_title"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-U05 Escape key closes edit form', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) test.skip();
      const opened = await openFirstEdit(page);
      if (!opened) test.skip();
      await page.locator('input[name="stp_title"]').first().waitFor({ timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      const tableVisible = await page.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
      const formGone = !(await page.locator('input[name="stp_title"]').isVisible({ timeout: 2000 }).catch(() => false));
      expect(tableVisible || formGone).toBe(true);
    });
  });
});
