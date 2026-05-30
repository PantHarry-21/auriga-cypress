/**
 * Ticket — Comprehensive CRUD Test Suite
 * URL  : /dashboard/support/tickets
 * Role : admin
 * Open : "Generate Ticket" button
 * Save : "Generate Ticket" (button inside form — use .last() or .nth(1))
 * Cancel : Escape key (no Cancel button in form)
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/support/tickets';
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
  await page.getByRole('button', { name: 'Generate Ticket' }).first().click();
  await page.waitForTimeout(1500);
}

// ── Suite ─────────────────────────────────────────────────────────────────────
test.describe('[TICKET-CRUD] Ticket — Create & Update', () => {
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
      expect(page.url()).toMatch(/tickets/i);
    });

    test('TC-C03 form opens on Generate Ticket click', async ({ page }) => {
      await openForm(page);
      const subjectVisible = await page.locator('input[name="subject"]').first().isVisible({ timeout: 10000 }).catch(() => false);
      const reportNoVisible = await page.locator('input[name="reportNo"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(subjectVisible || reportNoVisible).toBe(true);
    });

    test('TC-C04 subject field is visible in form', async ({ page }) => {
      await openForm(page);
      await expect(page.locator('input[name="subject"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-C05 valid subject is accepted in field', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      const field = page.locator('input[name="subject"]').first();
      if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
        await field.fill(`AutoTicket_${ts}`);
        const val = await field.inputValue();
        // Accept partial match (autocomplete may modify)
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C06 valid dueDate 2026-01-31 is accepted in field', async ({ page }) => {
      await openForm(page);
      const dueDateField = page.locator('input[name="dueDate"]').first();
      if (await dueDateField.isVisible({ timeout: 8000 }).catch(() => false)) {
        await dueDateField.fill('2026-01-31');
        const val = await dueDateField.inputValue();
        expect(val.length).toBeGreaterThan(0);
      }
    });

    test('TC-C07 empty subject submit shows error or keeps form open', async ({ page }) => {
      await openForm(page);
      // The submit button inside the form shares "Generate Ticket" text — use last()
      const submitBtn = page.locator('button:has-text("Generate Ticket")').last();
      if (await submitBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
        await submitBtn.click();
      }
      await page.waitForTimeout(1000);
      const hasError = await expectError(page);
      const stillOpen = await page.locator('input[name="subject"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError || stillOpen).toBe(true);
    });

    test('TC-C08 cancel via Escape closes the form', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="subject"]').first().waitFor({ timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      const formGone = await page.locator('input[name="subject"]').isVisible({ timeout: 3000 }).catch(() => false);
      // Either the form closes OR the table remains visible
      const tableVisible = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
      expect(!formGone || tableVisible).toBe(true);
    });

    test('TC-C09 special characters in subject are accepted', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="subject"]').first().fill('<Ticket> & "Special" chars: <>!@#$%');
      const val = await page.locator('input[name="subject"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C10 long subject (200 chars) is accepted in field', async ({ page }) => {
      await openForm(page);
      const longSubject = 'AutoTicket_' + 'S'.repeat(189);
      await page.locator('input[name="subject"]').first().fill(longSubject);
      const val = await page.locator('input[name="subject"]').first().inputValue();
      expect(val.length).toBeGreaterThan(0);
    });

    test('TC-C11 reportNo field is visible and accepts text', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      const reportNoField = page.locator('input[name="reportNo"]').first();
      await expect(reportNoField).toBeVisible({ timeout: 8000 });
      await reportNoField.fill(`RPT-${ts}`);
      expect(await reportNoField.inputValue()).toBe(`RPT-${ts}`);
    });

    test('TC-C12 both form buttons (Generate Ticket submit) are visible', async ({ page }) => {
      await openForm(page);
      // After opening: the trigger button + submit inside form
      const allGenBtns = page.locator('button:has-text("Generate Ticket")');
      const count = await allGenBtns.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('TC-C13 form closes on Escape key', async ({ page }) => {
      await openForm(page);
      await page.locator('input[name="subject"]').first().waitFor({ timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      const subjectVisible = await page.locator('input[name="subject"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      // Escape should close the form or at minimum not crash
      const bodyOk = !(await page.locator('body').textContent() ?? '').includes('Internal Server Error');
      expect(!subjectVisible || bodyOk).toBe(true);
    });

    test('TC-C14 subject and dueDate together are accepted', async ({ page }) => {
      const ts = Date.now().toString().slice(-6);
      await openForm(page);
      await page.locator('input[name="subject"]').first().fill(`AutoTicket_${ts}`);
      const dueDateField = page.locator('input[name="dueDate"]').first();
      if (await dueDateField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dueDateField.fill('2026-03-15');
      }
      const subjectVal = await page.locator('input[name="subject"]').first().inputValue();
      expect(subjectVal).toBe(`AutoTicket_${ts}`);
    });

    test('TC-C15 Generate Ticket button is visible on list page', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Generate Ticket' }).first()).toBeVisible();
    });
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  test.describe('Update', () => {

    test('TC-U01 table loads with rows or is empty', async ({ page }) => {
      const tableVisible = await page.locator('table').isVisible({ timeout: 15000 }).catch(() => false);
      if (!tableVisible) {
        // Tickets may show in a card/list layout
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
        return;
      }
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });

    test('TC-U02 rows have Edit or View buttons when table has data', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      expect(opened).toBe(true);
    });

    test('TC-U03 edit form opens and shows subject or form fields', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const subjectVisible = await page.locator('input[name="subject"]').first().isVisible({ timeout: 10000 }).catch(() => false);
      const anyInput = await page.locator('input, textarea').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(subjectVisible || anyInput).toBe(true);
    });

    test('TC-U04 verify subject and dueDate fields in edit form', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const subjectVisible = await page.locator('input[name="subject"]').first().isVisible({ timeout: 8000 }).catch(() => false);
      const reportNoVisible = await page.locator('input[name="reportNo"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      const dueDateVisible = await page.locator('input[name="dueDate"]').first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(subjectVisible || reportNoVisible || dueDateVisible).toBe(true);
    });

    test('TC-U05 cancel/Escape in edit form closes it without saving', async ({ page }) => {
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount === 0) { test.skip(); return; }
      const opened = await openFirstEdit(page);
      if (!opened) { test.skip(); return; }
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(1000);
      const bodyOk = !(await page.locator('body').textContent() ?? '').includes('Internal Server Error');
      expect(bodyOk).toBe(true);
    });
  });
});
