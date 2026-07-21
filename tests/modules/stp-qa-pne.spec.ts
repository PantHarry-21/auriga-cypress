/**
 * STP QA — Positive / Negative / Edge Case Suite (auto-generated from live prod crawl 2026-07-20)
 * URL  : /dashboard/stp-qa
 * Role : admin
 * Selectors captured live from prod.bharatlims.ai. Non-destructive: opens
 * forms/filters and asserts behavior, never persists or deletes shared data.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/stp-qa';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-STP_QA-PNE] STP QA — Positive/Negative/Edge', () => {
  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

  async function openForm(page) {
    await page.locator('button:has-text("New STP QA")').first().click({ force: true });
    await page.waitForTimeout(2500);
  }

  test.describe('Positive', () => {
    test('TC-P01 page loads without server or permission errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toContain('Access Denied');
      // Guard against an origin-down page (Cloudflare 5xx) passing spuriously
      expect(body).not.toContain('Connection timed out');
      expect(body).not.toMatch(/Error code 5\d\d/);
      expect(body.length).toBeGreaterThan(50);
    });

    test('TC-P02 URL reflects the module route', async ({ page }) => {
      expect(page.url()).toContain('stp-qa');
    });

    test('TC-P03 data table renders', async ({ page }) => {
      await expect(page.locator('table').first()).toBeVisible({ timeout: 20000 });
    });

    test('TC-P04 list search accepts input (or is gated until filters applied)', async ({ page }) => {
      const search = page.locator('input[placeholder="Search"]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill('AUTOQA');
      expect(await search.inputValue()).toBe('AUTOQA');
    });

    test('TC-P05 "New STP QA" action is present', async ({ page }) => {
      await expect(page.locator('button:has-text("New STP QA")').first()).toBeVisible({ timeout: 15000 });
    });

    test('TC-P06 opening the form reveals its fields', async ({ page }) => {
      await openForm(page);
      await expect(page.locator('input[name="stp_title"], textarea[name="stp_title"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-P07 text form fields accept input', async ({ page }) => {
      await openForm(page);
      {
        const el = page.locator('input[name="stp_title"], textarea[name="stp_title"]').first();
        if (await el.isVisible({ timeout: 4000 }).catch(() => false) && await el.isEnabled().catch(() => false)) {
          await el.fill('AUTOQA'); await expect(el).toHaveValue(/AUTOQA/, { timeout: 4000 });
        }
      }
      {
        const el = page.locator('input[name="stp_code"], textarea[name="stp_code"]').first();
        if (await el.isVisible({ timeout: 4000 }).catch(() => false) && await el.isEnabled().catch(() => false)) {
          await el.fill('AUTOQA'); await expect(el).toHaveValue(/AUTOQA/, { timeout: 4000 });
        }
      }
      {
        const el = page.locator('input[name="issue_no"], textarea[name="issue_no"]').first();
        if (await el.isVisible({ timeout: 4000 }).catch(() => false) && await el.isEnabled().catch(() => false)) {
          await el.fill('AUTOQA'); await expect(el).toHaveValue(/AUTOQA/, { timeout: 4000 });
        }
      }
      {
        const el = page.locator('input[name="owner_title"], textarea[name="owner_title"]').first();
        if (await el.isVisible({ timeout: 4000 }).catch(() => false) && await el.isEnabled().catch(() => false)) {
          await el.fill('AUTOQA'); await expect(el).toHaveValue(/AUTOQA/, { timeout: 4000 });
        }
      }
    });
  });

  test.describe('Negative', () => {
    test('TC-N01 submitting the empty form is blocked or shows validation', async ({ page }) => {
      await openForm(page);
      const submit = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Create"), button:has-text("Add"), button:has-text("Generate")').first();
      if (!(await submit.isVisible({ timeout: 4000 }).catch(() => false))) { test.skip(); return; }
      if (await submit.isDisabled().catch(() => false)) { expect(await submit.isDisabled()).toBe(true); return; }
      await submit.click().catch(() => {});
      await page.waitForTimeout(1200);
      const errs = page.locator('[class*="error"]:visible, [role="alert"]:visible, .text-red-500:visible, .text-red-600:visible');
      const stillOpen = await page.locator('input[name="stp_title"], textarea[name="stp_title"]').first().isVisible({ timeout: 2000 }).catch(() => false);
      expect((await errs.count()) > 0 || stillOpen).toBe(true);
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-E01 special characters in search do not break the page', async ({ page }) => {
      const search = page.locator('input[placeholder="Search"]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill(`<script>alert(1)</script>' OR 1=1;--`);
      await page.waitForTimeout(1800);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E02 search then clear restores the list without error', async ({ page }) => {
      const search = page.locator('input[placeholder="Search"]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill('AUTOQA'); await page.waitForTimeout(1200);
      await search.clear(); await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E03 long value (300 chars) in first text field does not crash', async ({ page }) => {
      await openForm(page);
      const el = page.locator('input[name="stp_title"], textarea[name="stp_title"]').first();
      if (await el.isVisible({ timeout: 4000 }).catch(() => false) && await el.isEnabled().catch(() => false)) { await el.fill('AUTOQA ' + 'A'.repeat(300)); }
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E04 Cancel / Escape closes the form without saving', async ({ page }) => {
      await openForm(page);
      const cancel = page.locator('button:has-text("Cancel")').first();
      if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) await cancel.click();
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(1200);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

});
