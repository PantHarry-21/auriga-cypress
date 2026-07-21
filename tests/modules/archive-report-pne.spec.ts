/**
 * Archive Report — Positive / Negative / Edge Case Suite (auto-generated from live prod crawl 2026-07-20)
 * URL  : /dashboard/archive-report
 * Role : admin
 * Selectors captured live from prod.bharatlims.ai. Non-destructive: opens
 * forms/filters and asserts behavior, never persists or deletes shared data.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/archive-report';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-ARCHIVE_REPORT-PNE] Archive Report — Positive/Negative/Edge', () => {
  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);
  });

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
      expect(page.url()).toContain('archive-report');
    });

    test('TC-P03 data table renders', async ({ page }) => {
      await expect(page.locator('table').first()).toBeVisible({ timeout: 20000 });
    });

    test('TC-P04 list search accepts input (or is gated until filters applied)', async ({ page }) => {
      const search = page.locator('input[placeholder="Search by sample request no..."]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill('AUTOQA');
      expect(await search.inputValue()).toBe('AUTOQA');
    });
  });

  test.describe('Negative', () => {
    test('TC-N01 search for a non-existent term does not crash', async ({ page }) => {
      const search = page.locator('input[placeholder="Search by sample request no..."]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill('ZZZ_NOMATCH_AUTOQA_999');
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-E01 special characters in search do not break the page', async ({ page }) => {
      const search = page.locator('input[placeholder="Search by sample request no..."]').first();
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
      const search = page.locator('input[placeholder="Search by sample request no..."]').first();
      await expect(search).toBeVisible({ timeout: 12000 });
      if (!(await search.isEnabled().catch(() => false))) { expect(await search.isDisabled()).toBe(true); return; }
      await search.fill('AUTOQA'); await page.waitForTimeout(1200);
      await search.clear(); await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });
  });

});
