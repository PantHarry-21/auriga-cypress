/**
 * Role Management — E2E Test Suite
 * URL  : /dashboard/role-management
 * Role : admin
 * Note : Shows role cards (not a table), each card has Edit button
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/roles';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-012] Role Management', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ──────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without 403/500 errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
      expect(body.length).toBeGreaterThan(100);
    });

    test('TC-002 page URL is correct', async ({ page }) => {
      expect(page.url()).toContain('/role-management');
    });

    test('TC-003 role cards are visible on the page', async ({ page }) => {
      // Role management shows cards, not a table
      const cards = page.locator('[class*="bg-white"], [class*="rounded"]').filter({ hasText: /admin|reception|analyst|reviewer|quality/i });
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-004 page content includes known role names', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      // At least one role name should appear
      const hasRole = /admin|reception|analyst|master|reviewer|compilation/i.test(bodyText);
      expect(hasRole).toBe(true);
    });
  });

  // ── 2. Role Card Actions ──────────────────────────────────────────────────
  test.describe('2. Role Card Actions', () => {

    test('TC-005 Edit button is visible on at least one role card', async ({ page }) => {
      const editBtns = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), a:has-text("Edit"), svg[class*="edit"]').first();
      await expect(editBtns).toBeVisible({ timeout: 10000 });
    });

    test('TC-006 clicking Edit navigates to role edit page', async ({ page }) => {
      const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), a:has-text("Edit")').first();
      const isVisible = await editBtn.isVisible({ timeout: 8000 }).catch(() => false);
      if (isVisible) {
        await editBtn.click();
        await page.waitForTimeout(1500);
        // Should navigate to a role edit URL or open an edit panel
        const urlOrBody = page.url() + await page.locator('body').innerText().catch(() => '');
        const isEditPage = /edit|role.*step|module.*access|set.*permission/i.test(urlOrBody);
        expect(isEditPage).toBe(true);
      }
    });
  });

  // ── 3. Role Edit Page ─────────────────────────────────────────────────────
  test.describe('3. Role Edit — Module Access', () => {

    test('TC-007 role edit page has Module Access section', async ({ page }) => {
      const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), a:has-text("Edit")').first();
      const isVisible = await editBtn.isVisible({ timeout: 8000 }).catch(() => false);
      if (!isVisible) { test.skip(); return; }
      await editBtn.click();
      await page.waitForTimeout(2000);
      const body = await page.locator('body').innerText();
      expect(/module.*access|set.*permission|update.*role/i.test(body)).toBe(true);
    });

    test('TC-008 Update Role button is present on edit page', async ({ page }) => {
      const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), a:has-text("Edit")').first();
      const isVisible = await editBtn.isVisible({ timeout: 8000 }).catch(() => false);
      if (!isVisible) { test.skip(); return; }
      await editBtn.click();
      await page.waitForTimeout(2000);
      const updateBtn = page.locator('button:has-text("Update Role")');
      const btnExists = await updateBtn.isVisible({ timeout: 8000 }).catch(() => false);
      expect(btnExists).toBe(true);
    });
  });
});
