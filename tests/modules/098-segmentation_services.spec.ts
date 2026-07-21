/**
 * Segmentation Services — E2E Test Suite
 * URL  : /dashboard/administration/segmentation-services
 * Role : admin
 *
 * Tier x delivery-channel entitlement matrix (Bronze/Silver/Gold/Diamond ×
 * COA Digital/COA Print/Invoice Digital/Invoice Print/Raw Data). Each cell is
 * a role="checkbox" toggle button; "Update All" persists the matrix.
 * Discovered via live UAT crawl on 2026-07-10 — no spec previously covered it.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/administration/segmentation-services';
const LAB = 'Arbro - Delhi';
const TIERS = ['Bronze', 'Silver', 'Gold', 'Diamond'];
const COLUMNS = ['COA Digital', 'COA Print', 'Invoice Digital', 'Invoice Print', 'Raw Data'];

function tierRow(page: any, tier: string) {
  return page.locator('table tbody tr', { hasText: tier });
}

test.describe('[MODULE-098] Segmentation Services', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without critical errors', async ({ page }) => {
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body.length).toBeGreaterThan(50);
    });

    test('TC-002 page URL is correct', async ({ page }) => {
      expect(page.url()).toContain('/dashboard/administration/segmentation-services');
    });

    test('TC-003 "Segmentation Services" heading is visible', async ({ page }) => {
      await expect(page.getByText('Segmentation Services').first()).toBeVisible({ timeout: 15000 });
    });
  });

  // ── 2. Entitlement Matrix ────────────────────────────────────────────────
  test.describe('2. Entitlement Matrix', () => {

    test('TC-004 matrix table is visible', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    });

    test('TC-005 table headers list all delivery channels', async ({ page }) => {
      const headerText = await page.locator('table thead').innerText();
      for (const col of COLUMNS) {
        expect(headerText).toContain(col);
      }
    });

    test('TC-006 all four tiers are listed as rows', async ({ page }) => {
      for (const tier of TIERS) {
        await expect(tierRow(page, tier)).toBeVisible({ timeout: 10000 });
      }
    });

    test('TC-007 each tier row has 5 entitlement toggles', async ({ page }) => {
      for (const tier of TIERS) {
        const toggles = tierRow(page, tier).locator('button[role="checkbox"]');
        expect(await toggles.count()).toBe(COLUMNS.length);
      }
    });

    test('TC-008 Diamond tier has all entitlements enabled', async ({ page }) => {
      const toggles = tierRow(page, 'Diamond').locator('button[role="checkbox"]');
      const count = await toggles.count();
      for (let i = 0; i < count; i++) {
        await expect(toggles.nth(i)).toHaveAttribute('aria-checked', 'true');
      }
    });

    test('TC-009 Bronze tier has at least one entitlement disabled', async ({ page }) => {
      const toggles = tierRow(page, 'Bronze').locator('button[role="checkbox"]');
      const states = await toggles.evaluateAll(els => els.map(e => e.getAttribute('aria-checked')));
      expect(states).toContain('false');
    });
  });

  // ── 3. Toggle Interaction ────────────────────────────────────────────────
  test.describe('3. Toggle Interaction', () => {

    test('TC-010 clicking a toggle flips its aria-checked state, then reverts (non-destructive)', async ({ page }) => {
      const toggle = tierRow(page, 'Bronze').locator('button[role="checkbox"]').nth(2); // Invoice Digital — starts unchecked on Bronze
      const before = await toggle.getAttribute('aria-checked');

      await toggle.click({ force: true });
      await page.waitForTimeout(400);
      const after = await toggle.getAttribute('aria-checked');
      expect(after).not.toBe(before);

      // Revert so the shared UAT config is left unchanged (this suite never persists via "Update All")
      await toggle.click({ force: true });
      await page.waitForTimeout(400);
      const reverted = await toggle.getAttribute('aria-checked');
      expect(reverted).toBe(before);
    });
  });

  // ── 4. Persist Action ────────────────────────────────────────────────────
  test.describe('4. Persist Action', () => {

    test('TC-011 "Update All" is disabled until the matrix is dirty, enabled after a change', async ({ page }) => {
      const updateAll = page.locator('button:has-text("Update All")');
      await expect(updateAll).toBeVisible({ timeout: 10000 });
      // Pristine matrix → save is disabled (verified live: button carries `disabled` until a toggle changes)
      await expect(updateAll).toBeDisabled();

      const toggle = tierRow(page, 'Bronze').locator('button[role="checkbox"]').nth(2);
      await toggle.click({ force: true });
      await page.waitForTimeout(400);
      await expect(updateAll).toBeEnabled();

      // Revert the toggle so the shared UAT config is left unchanged
      await toggle.click({ force: true });
      await page.waitForTimeout(400);
    });

    // NOTE: "Update All" is intentionally never clicked in this suite — it persists
    // the tier entitlement matrix for the whole shared UAT lab, which other roles/
    // tests read as ground truth. Exercise it only in a dedicated, opt-in test.
  });

}); // describe Segmentation Services
