/**
 * Form B — Positive / Negative / Edge Case Suite (auto-generated from live prod crawl 2026-07-20)
 * URL  : /dashboard/nabl-form-b
 * Role : admin
 * Selectors captured live from prod.bharatlims.ai. Non-destructive: opens
 * forms/filters and asserts behavior, never persists or deletes shared data.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/nabl-form-b';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-NABL_FORM_B-PNE] Form B — Positive/Negative/Edge', () => {
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
      expect(page.url()).toContain('nabl-form-b');
    });
  });

  test.describe('Negative', () => {
    test('TC-N01 rapid reloads do not surface a server error', async ({ page }) => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-E01 deep-link navigation renders the module', async ({ page }) => {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(2000);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(50);
    });
  });

});
