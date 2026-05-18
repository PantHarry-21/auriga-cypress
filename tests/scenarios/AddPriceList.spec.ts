import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Add Price List Scenario
// Navigates to the Price List module via the sidebar and creates a record.
// Run    : npx playwright test tests/scenarios/AddPriceList.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const LAB = 'Arbro - Delhi';

test.describe('Add Price List', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.waitForTimeout(1000);
  });

  test('should add a price list', async ({ page }) => {
    // ── Navigate via sidebar ─────────────────────────────────────────────────
    // The Cypress source uses :nth-child(19) — we use robust label matching.

    // Expand the sidebar group that contains Price List if needed
    const sidebarGroup = page.locator('nav, [role="navigation"]')
      .locator('text=/Price|Billing|Finance|Pricing/i')
      .first();
    if (await sidebarGroup.count() > 0) {
      await sidebarGroup.click();
      await page.waitForTimeout(500);
    }

    // Click "Price List" link in the sidebar
    const priceListLink = page.locator('nav a, nav button, [role="menuitem"]')
      .filter({ hasText: /Price List/i })
      .first();
    if (await priceListLink.count() > 0) {
      await priceListLink.click();
    } else {
      // Fallback: navigate directly
      await page.goto('/dashboard/billing/price-list', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('404');

    // ── Click "New Price List" button ────────────────────────────────────────
    await expect(
      page.getByRole('button', { name: /New Price List/i })
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /New Price List/i }).click();

    // Wait for the create panel / dialog to open
    const dialog = page.locator('div.animate-slide-in-right, [role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // ── Fill Price List Name ─────────────────────────────────────────────────
    // Cypress: ':nth-child(1) > :nth-child(2) > :nth-child(1) > .w-full' — first text input in the form
    const nameInput = dialog.locator('input[type="text"]').first();
    await nameInput.fill('Test Price List');
    await expect(nameInput).toHaveValue('Test Price List');

    // ── Select a random Price List Type ─────────────────────────────────────
    // Cypress: ':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full' — second child select
    const typeSelect = dialog.locator('select').filter({ visible: true }).first();
    if (await typeSelect.count() > 0) {
      const optionValues = await typeSelect.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (optionValues.length > 0) {
        const randomIdx = Math.floor(Math.random() * optionValues.length);
        await typeSelect.selectOption(optionValues[randomIdx], { force: true });
      }
    }

    // ── Valid From Date ──────────────────────────────────────────────────────
    // Cypress fills input[placeholder="dd-mm-yyyy"].eq(0) with '01-09-2026'
    const dateInputs = page.locator('input[placeholder="dd-mm-yyyy"]');
    const dateCount  = await dateInputs.count();
    if (dateCount > 0) {
      await dateInputs.first().fill('01-09-2026');
    } else {
      // Fallback: ISO date inputs
      const isoDateInputs = page.locator('input[type="date"]').filter({ visible: true });
      if (await isoDateInputs.count() > 0) {
        await isoDateInputs.first().fill('2026-09-01');
      }
    }

    // ── Valid To Date ────────────────────────────────────────────────────────
    if (dateCount > 1) {
      await dateInputs.nth(1).fill('30-09-2026');
    } else {
      const isoDateInputs = page.locator('input[type="date"]').filter({ visible: true });
      if (await isoDateInputs.count() > 1) {
        await isoDateInputs.nth(1).fill('2026-09-30');
      }
    }

    // ── Applicable Labs — randomly click 2 checkboxes ────────────────────────
    // Cypress: cy.contains('Applicable Labs').parent().find('label').then(shuffle & click 2)
    const applicableLabsSection = page.locator('*').filter({ hasText: /Applicable Labs/i }).last();
    const labLabels = applicableLabsSection.locator('label');
    const labCount  = await labLabels.count();
    if (labCount > 0) {
      // Shuffle indices
      const indices = Array.from({ length: labCount }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      // Click first 2 (or all if < 2)
      const toClick = Math.min(2, labCount);
      for (let i = 0; i < toClick; i++) {
        await labLabels.nth(indices[i]).click({ force: true });
        await page.waitForTimeout(200);
      }
    } else {
      // Fallback: click any visible checkboxes
      const checkboxes = page.locator('input[type="checkbox"]').filter({ visible: true });
      const cbCount = await checkboxes.count();
      if (cbCount >= 2) {
        await checkboxes.first().check({ force: true });
        await checkboxes.nth(1).check({ force: true });
      } else if (cbCount === 1) {
        await checkboxes.first().check({ force: true });
      }
    }

    // ── Select from 2nd and 3rd selects (random options) ─────────────────────
    // Cypress: cy.get('select').eq(1) and .eq(2) — page-level selects
    const allSelects = page.locator('select').filter({ visible: true });
    const selectCount = await allSelects.count();

    if (selectCount > 1) {
      const sel1 = allSelects.nth(1);
      const vals1 = await sel1.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (vals1.length > 0) {
        await sel1.selectOption(vals1[Math.floor(Math.random() * vals1.length)], { force: true });
      }
    }

    if (selectCount > 2) {
      const sel2 = allSelects.nth(2);
      const vals2 = await sel2.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (vals2.length > 0) {
        await sel2.selectOption(vals2[Math.floor(Math.random() * vals2.length)], { force: true });
      }
    }

    // ── Description of Test ──────────────────────────────────────────────────
    const descInput = page.locator('input[placeholder="Enter description"]');
    if (await descInput.count() > 0) {
      await descInput.fill('Automation test description');
    }

    // ── Price in Rs. ─────────────────────────────────────────────────────────
    const priceInputs = page.locator('input[placeholder="0.00"]').filter({ visible: true });
    const priceCount  = await priceInputs.count();
    if (priceCount > 0) {
      await priceInputs.first().clear();
      await priceInputs.first().fill('1500');
    }

    // ── Price in USD ─────────────────────────────────────────────────────────
    if (priceCount > 1) {
      await priceInputs.nth(1).clear();
      await priceInputs.nth(1).fill('25');
    }

    // ── Discount (%) — last visible input on the page ────────────────────────
    // Cypress: cy.get('input').filter(':visible').then($inputs => wrap($inputs[$inputs.length - 1]).clear().type('10'))
    const allVisibleInputs = page.locator('input').filter({ visible: true });
    const inputCount = await allVisibleInputs.count();
    if (inputCount > 0) {
      await allVisibleInputs.last().clear();
      await allVisibleInputs.last().fill('10');
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /^Save$/i }).click();
    await page.waitForTimeout(3000);

    // ── Verify success toast ─────────────────────────────────────────────────
    await expect(page.locator('body')).toContainText(/Price list created successfully|created successfully|success/i, { timeout: 10000 });
    await page.screenshot({ path: 'playwright-report/screenshots/AddPriceList.png' });
  });
});
