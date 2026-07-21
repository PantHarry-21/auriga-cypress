/**
 * STP Master — Real E2E Test Suite
 * URL  : /dashboard/testing/stp-master
 * Role : admin
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/testing/stp-master';
const LAB = 'Arbro - Delhi';
const TS  = Date.now().toString().slice(-6);

test.describe('[MODULE-004] STP Master', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── 1. Page Load ────────────────────────────────────────────────────────
  test.describe('1. Page Load', () => {

    test('TC-001 page loads without errors', async ({ page }) => {
      const body = await page.locator('body').textContent() || '';
      expect(body).not.toContain('403 Forbidden');
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-002 table is visible with rows', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('TC-003 correct table headers', async ({ page }) => {
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.some(h => h.includes('STP Name'))).toBe(true);
      expect(headers.some(h => h.includes('Parameters'))).toBe(true);
      expect(headers.some(h => h.includes('Status'))).toBe(true);
    });

    test('TC-004 status filter tabs are present', async ({ page }) => {
      await expect(page.locator('button:has-text("Active")')).toBeVisible();
      await expect(page.locator('button:has-text("Draft")')).toBeVisible();
      await expect(page.locator('button:has-text("Approval Pending")')).toBeVisible();
    });
  });

  // ── 2. Search ────────────────────────────────────────────────────────────
  test.describe('2. Search', () => {

    test('TC-005 search input accepts text', async ({ page }) => {
      const search = page.locator('input[placeholder*="STP name"]');
      await expect(search).toBeVisible();
      await search.fill('test stp');
      expect(await search.inputValue()).toBe('test stp');
    });
  });

  // ── 3. Create Form ───────────────────────────────────────────────────────
  test.describe('3. Create Form', () => {

    test('TC-006 "New STP" button is visible', async ({ page }) => {
      await expect(page.locator('button:has-text("New STP")')).toBeVisible();
    });

    test('TC-007 clicking "New STP" opens create form', async ({ page }) => {
      await page.click('button:has-text("New STP")');
      await page.waitForTimeout(1200);
      await expect(page.locator('input[name="stpName"]')).toBeVisible({ timeout: 10000 });
    });

    test('TC-008 form title is "Create New STP"', async ({ page }) => {
      await page.click('button:has-text("New STP")');
      await page.waitForTimeout(1200);
      const formTitle = page.locator('[class*="modal"] h2, [role="dialog"] h2, [class*="panel"] h2, h2:has-text("Create")').first();
      await expect(formTitle).toContainText('STP', { timeout: 8000 });
    });

    test('TC-009 stpName field is present and auto-composed (readonly)', async ({ page }) => {
      await page.click('button:has-text("New STP")');
      await page.waitForTimeout(1200);
      // Verified live 2026-07-10: stpName is readonly — the app composes it as
      // "Parameter-Product-Instrument/Technique-Reference Method" from the selections above
      const nameField = page.locator('input[name="stpName"]');
      await expect(nameField).toBeVisible({ timeout: 8000 });
      await expect(nameField).toHaveAttribute('readonly', '');
      await expect(nameField).toHaveAttribute('placeholder', 'Parameter-Product-Instrument/Technique-Reference Method');
    });

    test('TC-010 form has Cancel, Save as Draft, Submit for Review buttons', async ({ page }) => {
      await page.click('button:has-text("New STP")');
      await page.waitForTimeout(1200);
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Save as Draft")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible({ timeout: 8000 });
    });

    test('TC-011 Cancel closes the form and returns to list', async ({ page }) => {
      await page.click('button:has-text("New STP")');
      await page.waitForTimeout(1200);
      await page.locator('input[name="stpName"]').waitFor({ timeout: 8000 });
      await page.locator('button:has-text("Cancel")').click();
      await page.waitForTimeout(800);
      await expect(page.locator('table')).toBeVisible();
    });
  });

  // ── 4. NABL Actions ─────────────────────────────────────────────────────
  test.describe('4. NABL Actions', () => {

    test('TC-012 NABL action buttons are present in table rows', async ({ page }) => {
      // Verified live 2026-07-10: row buttons are labelled just "NABL".
      // Wait for rows first — count() doesn't wait, and this table loads slowly on UAT.
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
      const nablBtns = page.locator('button:has-text("NABL")');
      await expect(nablBtns.first()).toBeVisible({ timeout: 15000 });
      expect(await nablBtns.count()).toBeGreaterThan(0);
    });
  });
});
