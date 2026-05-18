import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// Price List Scenarios — Comprehensive Test Suite
// URL    : /dashboard/price-list
// Run    : npx playwright test tests/scenarios/PriceListScenarios.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const selectors = {
  // Fields based on CSS selectors from legacy Cypress tests
  nameInput: ':nth-child(1) > :nth-child(2) > :nth-child(1) > .w-full',
  departmentSelect: ':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full',
  validFromDate: ':nth-child(1) > :nth-child(2) > :nth-child(3) > .w-full',
  validToDate: ':nth-child(1) > :nth-child(2) > :nth-child(4) > .w-full',
  industrySelect: '.pt-4 > .grid > :nth-child(1) > .w-full',
  techniqueSelect: '.pt-4 > .grid > :nth-child(2) > .w-full',
  descriptionInput: 'input[placeholder="Enter description"]',
  priceInputs: 'input[placeholder="0.00"]',
  searchInput: 'input[placeholder*="Search"], input[type="search"]',
};

const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);

test.describe('Add Price List - End to End Validations', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await openAddPriceListModal(page);
  });

  async function openAddPriceListModal(page: any) {
    await page.getByText('Reports').click();
    await page.getByText('Price List').click();
    await page.getByRole('button', { name: /New Price List/i }).click();
    await expect(page.getByText('Add Price List')).toBeVisible({ timeout: 15000 });
  }

  test('TC01 - should create a price list successfully with valid data', async ({ page }) => {
    const name = `Auto Price List ${TS}`;
    
    // Fill basic details
    await page.locator(selectors.nameInput).fill(name);
    await page.locator(selectors.departmentSelect).selectOption({ index: 1 });
    await page.locator(selectors.validFromDate).fill('2026-09-01');
    await page.locator(selectors.validToDate).fill('2026-09-30');
    
    // Select Labs
    await page.getByText('Applicable Labs').scrollIntoViewIfNeeded();
    // In the legacy UI, labs were labels in a grid
    const labLabels = page.locator('label:visible');
    if (await labLabels.count() > 2) {
       await labLabels.nth(0).click({ force: true });
       await labLabels.nth(1).click({ force: true });
    }

    // Fill pricing and technical details
    await page.locator(selectors.industrySelect).selectOption({ index: 1 });
    await page.locator(selectors.techniqueSelect).selectOption({ index: 1 });
    await page.locator(selectors.descriptionInput).fill('Automation test description');
    
    // Price in Rs and USD
    await page.locator(selectors.priceInputs).nth(0).fill('1500');
    await page.locator(selectors.priceInputs).nth(1).fill('25');
    
    // Discount (last visible input in the section)
    const inputs = page.locator('input:visible');
    await inputs.last().fill('10');

    // Save
    await page.getByRole('button', { name: /Save/i }).click({ force: true });
    
    // Success Assertion
    await expect(page.getByText(/Price list created successfully|successfully/i)).toBeVisible({ timeout: 15000 });

    // Verify in listing
    const search = page.locator(selectors.searchInput).first();
    if (await search.isVisible()) {
        await search.fill(name);
        await expect(page.locator('body')).toContainText(name);
    }
  });

  test('TC02 - should show validation when Name is blank', async ({ page }) => {
    await page.locator(selectors.nameInput).clear();
    await page.getByRole('button', { name: /Save/i }).click({ force: true });
    await expect(page.getByText(/Name is required|required/i)).toBeVisible();
  });

  test('TC06 - should show validation when Valid To Date is earlier than Valid From Date', async ({ page }) => {
    await page.locator(selectors.validFromDate).fill('2026-12-31');
    await page.locator(selectors.validToDate).fill('2026-01-01');
    await page.getByRole('button', { name: /Save/i }).click({ force: true });
    await expect(page.getByText(/Valid To Date should be greater/i)).toBeVisible();
  });
});
