/**
 * Booking Stats — E2E Test Suite
 * URL  : /dashboard/samples/booking-stats
 * Role : admin
 *
 * Discovered via live UAT crawl on 2026-07-10 — no spec previously covered it.
 * Live behavior verified for BOTH the admin role and a Lab Analyst account:
 * the route resolves but the app renders "Access Denied" for every role we
 * have credentials for. This suite locks in that observed behavior so a
 * future permission change (intentional or not) shows up as a test failure
 * instead of going unnoticed.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/samples/booking-stats';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-099] Booking Stats', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  test.describe('1. Page Load', () => {

    test('TC-001 page loads without server errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body.length).toBeGreaterThan(20);
    });

    test('TC-002 page URL is correct', async ({ page }) => {
      expect(page.url()).toContain('/dashboard/samples/booking-stats');
    });
  });

  test.describe('2. Access Control', () => {

    test('TC-003 route is gated: "Access Denied" is shown for admin', async ({ page }) => {
      await expect(page.getByText('Access Denied')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/don.?t have permission/i)).toBeVisible();
    });

    test('TC-004 "Go to Home" recovery link is present and navigates back to dashboard', async ({ page }) => {
      const goHome = page.getByRole('link', { name: 'Go to Home' }).or(page.getByRole('button', { name: 'Go to Home' }));
      await expect(goHome).toBeVisible({ timeout: 10000 });
      await goHome.click();
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      expect(page.url()).toMatch(/\/dashboard\/?$/);
    });
  });

}); // describe Booking Stats
