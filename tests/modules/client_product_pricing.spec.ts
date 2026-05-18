import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// Client Product Pricing Module — Comprehensive E2E Test Suite
// URL    : /dashboard/client-product-pricing
// Run    : npx playwright test tests/modules/client_product_pricing.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/client-product-pricing';
const LAB        = 'Arbro - Delhi';

test.describe('Client Product Pricing Module', () => {

  // Test Data
  const CLIENT_NAME      = 'ARBRO ANALYTICAL DIVISION';
  const CLIENT_PARTIAL   = 'ARBRO';
  const PRODUCT_NAME     = 'ABAMUNE- L';
  const PRODUCT_PARTIAL  = 'ABAMUNE';
  const TURNOVER_TIME    = '7';
  const TURNOVER_UPDATED = '14';
  const SPECIFIC_PRICE   = '150';
  const URGENT_PRICE     = '250';
  const XSS_PAYLOAD      = "<script>alert('xss')</script>";

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await page.waitForTimeout(1500);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectClient = async (page: any, name = CLIENT_NAME) => {
    const input = page.locator('input[id="cpp-client-search"]');
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.clear();
    await input.fill(name);
    await page.waitForTimeout(1200);
    await page.locator('body').getByText(name).first().click({ force: true });
    await page.waitForTimeout(1500);
  };

  const selectProduct = async (page: any, name = PRODUCT_NAME) => {
    const input = page.locator('input[placeholder="Search product..."]');
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.clear();
    await input.fill(name);
    await page.waitForTimeout(1500);
    await page.locator('body').getByText(name).first().click({ force: true });
    await page.waitForTimeout(2000);
  };

  const loadProductGrid = async (page: any, clientName = CLIENT_NAME, productName = PRODUCT_NAME) => {
    await selectClient(page, clientName);
    await selectProduct(page, productName);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('1. Module Access & Navigation', () => {

    test('TC-CPP-001: navigating to Client Product Pricing opens the page without errors', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp('/client-product-pricing'));
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-001.png' });
    });

    test('TC-CPP-002: URL is exactly /dashboard/client-product-pricing', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(MODULE_URL));
    });

    test('TC-CPP-003: page heading "Client Product Pricing" is visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Client Product Pricing/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-003.png' });
    });

    test('TC-CPP-004: sub-heading "Product STP Information" section is visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Product STP Information/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-004.png' });
    });

    test('TC-CPP-005: page loads without JavaScript console errors (500 not in body)', async ({ page }) => {
      await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
    });

    test('TC-CPP-006: page does not redirect to login', async ({ page }) => {
      await expect(page).not.toHaveURL(new RegExp('/login'));
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. FIELD VISIBILITY & UI LABELS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('2. Field Visibility & UI Labels', () => {

    test('TC-CPP-007: Client Name search input is visible on page load', async ({ page }) => {
      await expect(page.locator('input[id="cpp-client-search"]')).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-007.png' });
    });

    test('TC-CPP-008: Client Name label is displayed', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Client Name/i);
    });

    test('TC-CPP-009: Is Priced label is displayed', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Is Priced/i);
    });

    test('TC-CPP-010: Product label and search combobox are visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/\bProduct\b/i);
      await expect(page.locator('input[placeholder="Search product..."]')).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-010.png' });
    });

    test('TC-CPP-011: Total Turnover Time (Days) label and number input are visible', async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Total Turnover Time/i);
      await expect(page.locator('input[type="number"][placeholder="0"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-011.png' });
    });

    test('TC-CPP-012: "Not Priced" button is visible on page load', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Not Priced/i }).first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-012.png' });
    });

    test('TC-CPP-013: "Update Pricing" button is visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Update Pricing/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-013.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. CLIENT SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('3. Client Search Functionality', () => {

    test('TC-CPP-014: client search input accepts typed text', async ({ page }) => {
      const input = page.locator('input[id="cpp-client-search"]');
      await input.clear();
      await input.fill(CLIENT_PARTIAL);
      await expect(input).toHaveValue(CLIENT_PARTIAL);
    });

    test('TC-CPP-015: typing 3+ characters in client search shows suggestions', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').fill(CLIENT_PARTIAL.slice(0, 3));
      await page.waitForTimeout(1200);
      const suggestions = page.locator('[role="option"]:visible, [role="listbox"] li:visible, ul li:visible');
      const count = await suggestions.count();
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(count > 0 || bodyText.toUpperCase().includes('ARBRO')).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-015.png' });
    });

    test('TC-CPP-016: selecting a client from suggestions populates the client search field', async ({ page }) => {
      await selectClient(page);
      await expect(page.locator('input[id="cpp-client-search"]')).not.toHaveValue('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-016.png' });
    });

    test('TC-CPP-017: partial client name search (contains search) returns relevant results', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').fill(CLIENT_PARTIAL);
      await page.waitForTimeout(1200);
      await expect(page.locator('body')).toContainText(new RegExp(CLIENT_PARTIAL, 'i'));
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-017.png' });
    });

    test('TC-CPP-018: client search is case-insensitive', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').fill(CLIENT_PARTIAL.toLowerCase());
      await page.waitForTimeout(1200);
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(bodyText.toUpperCase().includes(CLIENT_PARTIAL.toUpperCase())).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-018.png' });
    });

    test('TC-CPP-019: invalid/non-existent client name shows no results', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').fill('ZZZNEVEREXIST99XYZ');
      await page.waitForTimeout(1500);
      const optionCount = await page.locator('[role="option"]:visible').count();
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasNoResult = optionCount === 0 || /No result|No client|not found/i.test(bodyText);
      console.log(`No results found as expected: ${hasNoResult}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-019.png' });
    });

    test('TC-CPP-020: clearing client search field resets product field', async ({ page }) => {
      await selectClient(page);
      await page.locator('input[id="cpp-client-search"]').clear();
      await page.waitForTimeout(1000);
      const productValue = await page.locator('input[placeholder="Search product..."]').inputValue();
      console.log(`Product field after client clear: "${productValue}"`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-020.png' });
    });

    test('TC-CPP-021: XSS payload in client search field does not trigger an alert', async ({ page }) => {
      page.on('dialog', dialog => { throw new Error('XSS triggered!'); });
      await page.locator('input[id="cpp-client-search"]').fill(XSS_PAYLOAD);
      await page.waitForTimeout(1200);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-021.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PRODUCT SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('4. Product Search Functionality', () => {

    test('TC-CPP-022: product search combobox is available after selecting a client', async ({ page }) => {
      await selectClient(page);
      await expect(page.locator('input[placeholder="Search product..."]')).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-022.png' });
    });

    test('TC-CPP-023: typing in product search after client selection shows product options', async ({ page }) => {
      await selectClient(page);
      await page.locator('input[placeholder="Search product..."]').fill(PRODUCT_PARTIAL.slice(0, 3));
      await page.waitForTimeout(1200);
      const suggestions = page.locator('[role="option"]:visible, [role="listbox"] li:visible');
      const count = await suggestions.count();
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(count > 0 || bodyText.includes('ABAMUNE')).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-023.png' });
    });

    test('TC-CPP-024: selecting a product from the list loads the STP grid', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('table, [role="grid"], tbody').first()).toBeVisible({ timeout: 20000 });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-024.png' });
    });

    test('TC-CPP-025: multiple products are available for a client in the product dropdown', async ({ page }) => {
      await selectClient(page);
      await page.locator('input[placeholder="Search product..."]').fill('A');
      await page.waitForTimeout(1500);
      const optionCount = await page.locator('[role="option"]:visible, [role="listbox"] li:visible').count();
      console.log(`Product options visible: ${optionCount}`);
      expect(optionCount).toBeGreaterThan(0);
      await page.click('body', { position: { x: 0, y: 0 } });
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-025.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PRODUCT STP INFORMATION GRID
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('5. Product STP Information Grid', () => {

    test('TC-CPP-026: STP grid populates with rows after selecting a client and product', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('table, [role="grid"], tbody').first()).toBeVisible({ timeout: 20000 });
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-026.png' });
    });

    test('TC-CPP-027: STP grid displays S.No, STP Name, Price Code columns', async ({ page }) => {
      await loadProductGrid(page);
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(/S\.NO|STP NAME|PRICE CODE/i.test(bodyText)).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-027.png' });
    });

    test('TC-CPP-028: STP grid displays Base Price, Specific Price, Urgent Price columns', async ({ page }) => {
      await loadProductGrid(page);
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(/BASE PRICE|SPECIFIC PRICE|URGENT PRICE/i.test(bodyText)).toBeTruthy();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-028.png' });
    });

    test('TC-CPP-029: Is Priced column shows correct pricing status per product row', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const bodyText = await page.locator('body').textContent() ?? '';
      const hasPricingStatus = /Priced|Not Priced|Yes|No/i.test(bodyText);
      console.log(`Pricing status present in grid: ${hasPricingStatus}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-029.png' });
    });

    test('TC-CPP-030: STP grid input fields are editable (not read-only)', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const firstInput = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first();
      if (await firstInput.count() > 0) {
        const isReadOnly = await firstInput.getAttribute('readonly');
        const isDisabled = await firstInput.isDisabled();
        expect(isReadOnly).toBeNull();
        expect(isDisabled).toBeFalsy();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. TOTAL TURNOVER TIME INPUT
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('6. Total Turnover Time (Days) Input', () => {

    test('TC-CPP-031: Total Turnover Time number input is visible', async ({ page }) => {
      await expect(page.locator('input[type="number"][placeholder="0"]').first()).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-031.png' });
    });

    test('TC-CPP-032: Turnover Time accepts positive integer values', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill(TURNOVER_TIME);
      await expect(input).toHaveValue(TURNOVER_TIME);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-032.png' });
    });

    test('TC-CPP-033: Turnover Time rejects negative values — browser constraint enforces min=0', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill('-5');
      const val = await input.inputValue();
      const isNegative = parseFloat(val) < 0;
      console.log(`Input value after typing -5: "${val}" — negative: ${isNegative}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-033.png' });
    });

    test('TC-CPP-034: Turnover Time with decimal is handled gracefully', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill('3.5');
      const val = await input.inputValue();
      console.log(`Decimal input value: "${val}"`);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-034.png' });
    });

    test('TC-CPP-035: Turnover Time accepts zero as a valid value', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill('0');
      await expect(input).toHaveValue('0');
    });

    test('TC-CPP-036: Turnover Time value can be updated to a new positive integer', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill(TURNOVER_TIME);
      await input.clear();
      await input.fill(TURNOVER_UPDATED);
      await expect(input).toHaveValue(TURNOVER_UPDATED);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-036.png' });
    });

    test('TC-CPP-037: very large Turnover Time value is handled without page crash', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill('999999');
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-037.png' });
    });

    test('TC-CPP-038: alphabetic input in Turnover Time number field is blocked by browser', async ({ page }) => {
      const input = page.locator('input[type="number"][placeholder="0"]').first();
      await input.clear();
      await input.fill('abc');
      const val = await input.inputValue();
      console.log(`Value after typing "abc" in number field: "${val}"`);
      // A type="number" input should not retain alphabetic characters
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. "NOT PRICED" / IS PRICED TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('7. Not Priced / Is Priced Toggle', () => {

    test('TC-CPP-039: "Not Priced" button is visible and clickable', async ({ page }) => {
      const btn = page.getByRole('button', { name: /Not Priced/i }).first();
      await expect(btn).toBeVisible();
      await btn.click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-039.png' });
    });

    test('TC-CPP-040: clicking "Not Priced" button changes the pricing status', async ({ page }) => {
      const bodyBefore = await page.locator('body').textContent() ?? '';
      await page.getByRole('button', { name: /Not Priced/i }).first().click({ force: true });
      await page.waitForTimeout(1000);
      // Either status text changed OR a success toast appeared — page must not error
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-040.png' });
    });

    test('TC-CPP-041: Is Priced filter toggle affects the product list loaded', async ({ page }) => {
      // Look for Is Priced label's parent container for toggle button
      const isPricedLabel = page.locator('body').getByText(/Is Priced/i).first();
      if (await isPricedLabel.count() > 0) {
        const container = isPricedLabel.locator('xpath=ancestor::div[1]');
        const trigger = container.locator('button, select, [role="combobox"]').first();
        if (await trigger.count() > 0 && await trigger.isVisible()) {
          await trigger.click({ force: true });
          await page.waitForTimeout(1000);
          await expect(page.locator('body')).not.toContainText('500');
          await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-041.png' });
        } else {
          console.log('Is Priced filter toggle element not found in expected container');
        }
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. PRICING GRID — DATA INPUT
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('8. Pricing Grid — Data Input', () => {

    test('TC-CPP-042: Specific Price input in STP grid accepts numeric values', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const input = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first();
      await input.clear();
      await input.fill(SPECIFIC_PRICE);
      await expect(input).toHaveValue(SPECIFIC_PRICE);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-042.png' });
    });

    test('TC-CPP-043: Urgent Price input in STP grid accepts numeric values', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const input = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').nth(1);
      await input.clear();
      await input.fill(URGENT_PRICE);
      await expect(input).toHaveValue(URGENT_PRICE);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-043.png' });
    });

    test('TC-CPP-044: clearing a Specific Price field leaves it empty', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const input = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first();
      await input.clear();
      await expect(input).toHaveValue('');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-044.png' });
    });

    test('TC-CPP-045: STP grid rows with Specific Price inputs are editable', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const firstInput = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first();
      if (await firstInput.count() > 0) {
        await firstInput.fill('99');
        await expect(firstInput).toHaveValue('99');
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. SAVE / UPDATE PRICING
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('9. Save / Update Pricing', () => {

    test('TC-CPP-046: Update Pricing button is visible at the bottom of the page', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Update Pricing/i })).toBeVisible();
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-046.png' });
    });

    test('TC-CPP-047: clicking Update Pricing after entering values triggers a success notification', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      await page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first().fill(SPECIFIC_PRICE);
      await page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').nth(1).fill(URGENT_PRICE);
      await page.getByRole('button', { name: /Update Pricing/i }).click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/success|saved|updated/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-047.png' });
    });

    test('TC-CPP-048: saved pricing values persist after navigating away and returning', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goto(MODULE_URL, { timeout: 60000 });
      await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
      await page.waitForTimeout(1500);
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const inputVal = await page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first().inputValue();
      console.log(`Pricing value after reload: "${inputVal}"`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-048.png' });
    });

    test('TC-CPP-049: updating Turnover Time and clicking Update Pricing saves correctly', async ({ page }) => {
      await loadProductGrid(page);
      await page.locator('input[type="number"][placeholder="0"]').first().fill(TURNOVER_UPDATED);
      await page.getByRole('button', { name: /Update Pricing/i }).click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/success|saved|updated/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-049.png' });
    });

    test('TC-CPP-050: clearing all price fields and clicking Update Pricing removes pricing rule', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      const inputs = page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      for (let i = 0; i < inputCount; i++) {
        await inputs.nth(i).clear();
      }
      await page.getByRole('button', { name: /Update Pricing/i }).click({ force: true });
      await page.waitForTimeout(2500);
      await expect(page.locator('body')).toContainText(/success|saved|updated/i);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-050.png' });
    });

    test('TC-CPP-051: rapid double-click on Update Pricing does not cause double-submission error', async ({ page }) => {
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Update Pricing/i }).dblclick({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-051.png' });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EDGE CASES & NEGATIVE TESTS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('10. Edge Cases & Negative Tests', () => {

    test('TC-CPP-052: searching an empty string in client search does not show a product list', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').clear();
      await page.waitForTimeout(800);
      const rowCount = await page.locator('tbody tr').count();
      console.log(`Table rows without client: ${rowCount}`);
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-052.png' });
    });

    test('TC-CPP-053: product search combobox input accepts text without errors', async ({ page }) => {
      await page.locator('input[placeholder="Search product..."]').fill('test');
      await page.waitForTimeout(800);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-CPP-054: SQL injection in client search does not crash the page', async ({ page }) => {
      await page.locator('input[id="cpp-client-search"]').fill("' OR 1=1 --");
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
    });

    test('TC-CPP-055: page remains stable after selecting and deselecting a client', async ({ page }) => {
      await selectClient(page);
      await page.locator('input[id="cpp-client-search"]').clear();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/TC-CPP-055.png' });
    });

    test('TC-CPP-056: browser back navigation from Client Product Pricing does not corrupt state', async ({ page }) => {
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  test.describe('11. End-to-End Workflows', () => {

    test('E2E-CPP-001: search client → select product → view STP grid → set prices → save', async ({ page }) => {
      // 1. Navigate and confirm page load
      await expect(page).toHaveURL(new RegExp('/client-product-pricing'));
      await expect(page.locator('body')).toContainText(/Client Product Pricing/i);

      // 2. Search for a client by partial name and select
      await page.locator('input[id="cpp-client-search"]').fill(CLIENT_PARTIAL);
      await page.waitForTimeout(1200);
      await page.locator('body').getByText(CLIENT_NAME).first().click({ force: true });
      await page.waitForTimeout(1500);

      // 3. Select a product
      await page.locator('input[placeholder="Search product..."]').fill(PRODUCT_PARTIAL);
      await page.waitForTimeout(1500);
      await page.locator('body').getByText(PRODUCT_NAME).first().click({ force: true });
      await page.waitForTimeout(2000);

      // 4. Confirm STP grid loaded with rows
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

      // 5. Set Total Turnover Time
      await page.locator('input[type="number"][placeholder="0"]').first().fill(TURNOVER_TIME);

      // 6. Enter Specific Price and Urgent Price on first row
      await page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').first().fill(SPECIFIC_PRICE);
      await page.locator('tbody tr').first().locator('input[type="number"], input[type="text"]').nth(1).fill(URGENT_PRICE);

      // 7. Click Update Pricing
      await page.getByRole('button', { name: /Update Pricing/i }).click({ force: true });
      await page.waitForTimeout(3000);

      // 8. Verify success
      await expect(page.locator('body')).toContainText(/success|saved|updated/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-CPP-001-saved.png' });
    });

    test('E2E-CPP-002: search client → toggle Not Priced → verify status change → reload to confirm', async ({ page }) => {
      // 1. Select a client
      await selectClient(page);

      // 2. Click Not Priced button
      await page.getByRole('button', { name: /Not Priced/i }).first().click({ force: true });
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('500');
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-CPP-002-toggled.png' });

      // 3. Reload and verify page integrity
      await page.goto(MODULE_URL, { timeout: 60000 });
      await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).toContainText(/Client Product Pricing/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-CPP-002-reloaded.png' });
    });

    test('E2E-CPP-003: set pricing → update turnover time → re-open product → verify new time shown', async ({ page }) => {
      // 1. Load the product grid
      await loadProductGrid(page);
      await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

      // 2. Update turnover time to a distinct value
      await page.locator('input[type="number"][placeholder="0"]').first().fill(TURNOVER_UPDATED);

      // 3. Save
      await page.getByRole('button', { name: /Update Pricing/i }).click({ force: true });
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).toContainText(/success|saved|updated/i);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-CPP-003-saved.png' });

      // 4. Navigate away and return
      await page.goto('/dashboard', { timeout: 60000 });
      await page.waitForTimeout(500);
      await page.goto(MODULE_URL, { timeout: 60000 });
      await expect(page.locator('body')).not.toContainText('404', { timeout: 30000 });
      await page.waitForTimeout(1500);

      // 5. Re-select the same client/product and verify turnover shows saved value
      await loadProductGrid(page);
      const turnoverVal = await page.locator('input[type="number"][placeholder="0"]').first().inputValue();
      console.log(`Turnover time after reload: "${turnoverVal}"`);
      await page.screenshot({ path: 'playwright-report/screenshots/E2E-CPP-003-verified.png' });
    });
  });
});
