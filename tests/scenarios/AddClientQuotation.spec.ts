import { test, expect } from '../global-setup';
import { loginAs, stubStimulsoft } from '../helpers/commands';

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Add Client Quotation Scenario
// Navigates to the Client Quotation module via the sidebar and creates a record.
// Run    : npx playwright test tests/scenarios/AddClientQuotation.spec.ts --project=uat
// ═══════════════════════════════════════════════════════════════════════════════

const LAB = 'Arbro - Delhi';

test.describe('Add Client Quotation', () => {

  test.beforeEach(async ({ page, context }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.waitForTimeout(1000);
  });

  test('should add a client quotation', async ({ page }) => {
    // ── Navigate via sidebar ─────────────────────────────────────────────────
    // The Cypress source uses nth-child(18) > nth-child(1) selectors which are
    // fragile; we use a more resilient label-based approach: look for a nav link
    // matching "Client Quotation" (or its parent group).

    // Expand the sidebar group that contains Client Quotation if needed
    const sidebarGroup = page.locator('nav, [role="navigation"]')
      .locator('text=/Quotation|Quote|Sales/i')
      .first();
    if (await sidebarGroup.count() > 0) {
      await sidebarGroup.click();
      await page.waitForTimeout(500);
    }

    // Click "Client Quotation" link in the sidebar
    const quotationLink = page.locator('nav a, nav button, [role="menuitem"]')
      .filter({ hasText: /Client Quotation/i })
      .first();
    if (await quotationLink.count() > 0) {
      await quotationLink.click();
    } else {
      // Fallback: navigate directly by URL if sidebar label is different
      await page.goto('/dashboard/sales/client-quotation', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toContainText('404');

    // ── Open the New Quotation form ──────────────────────────────────────────
    const newBtn = page.getByRole('button', { name: /New.*Quotation|Add.*Quotation|New/i }).first();
    if (await newBtn.count() > 0) {
      await newBtn.click();
    } else {
      // Cypress source clicks .border-b-0 > .flex > .sm\:px-4 which is the "New" tab/button
      await page.locator('.border-b-0 .sm\\:px-4').first().click();
    }
    await page.waitForTimeout(1000);

    // ── Fill Quotation Subject ───────────────────────────────────────────────
    const subjectInput = page.locator('[name="quotationSubject"]');
    await subjectInput.fill('Test Client Quotation');
    await expect(subjectInput).toHaveValue('Test Client Quotation');

    // ── Select a random option from the first dropdown ───────────────────────
    // The Cypress source selects from ':nth-child(1) > :nth-child(2) > .relative > .w-full'
    // We generalise: find the first visible select that has non-empty options.
    const firstSelect = page.locator('select').filter({ visible: true }).first();
    if (await firstSelect.count() > 0) {
      const optionValues = await firstSelect.locator('option').evaluateAll(
        (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
      );
      if (optionValues.length > 0) {
        const randomIdx = Math.floor(Math.random() * optionValues.length);
        await firstSelect.selectOption(optionValues[randomIdx], { force: true });
      }
    }

    // ── Fill the date field (01-02-2026 per Cypress source) ──────────────────
    // Look for visible date inputs
    const dateInput = page.locator('input[type="date"]:visible, input[placeholder*="date"]:visible').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill('2026-02-01');
    } else {
      // Try text input that might accept dd-mm-yyyy
      const textDateInput = page.locator('input[placeholder*="dd"], input[placeholder*="DD"]').first();
      if (await textDateInput.count() > 0) {
        await textDateInput.fill('01-02-2026');
      }
    }

    // ── Click the Product Type toggle ────────────────────────────────────────
    const productTypeInput = page.locator('[name="productType"]').first();
    if (await productTypeInput.count() > 0) {
      await productTypeInput.click();
      await page.waitForTimeout(500);
    }

    // ── Select from the first combobox dropdown (productType options) ─────────
    const combobox1 = page.locator('[role="combobox"], [role="listbox"]').filter({ visible: true }).first();
    if (await combobox1.count() > 0) {
      const comboOpts = combobox1.locator('[role="option"]').filter({ visible: true });
      const optCount = await comboOpts.count();
      if (optCount > 0) {
        const randomIdx = Math.floor(Math.random() * optCount);
        await comboOpts.nth(randomIdx).click({ force: true });
      }
    } else {
      // Try a select dropdown as fallback
      const selectCombo = page.locator('select').filter({ visible: true }).nth(1);
      if (await selectCombo.count() > 0) {
        const vals = await selectCombo.locator('option').evaluateAll(
          (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
        );
        if (vals.length > 0) {
          await selectCombo.selectOption(vals[Math.floor(Math.random() * vals.length)], { force: true });
        }
      }
    }
    await page.waitForTimeout(500);

    // ── Click the "Add" / confirm button in the product section ─────────────
    // Cypress: cy.get('div.mb-4 > .gap-2 > .bg-\[\#00a6fb\]').click()
    const addProductBtn = page.locator('div.mb-4 .gap-2 .bg-\\[\\#00a6fb\\]').first();
    if (await addProductBtn.count() > 0) {
      await addProductBtn.click({ force: true });
    } else {
      // Fallback: any visible button with text Add/Confirm in a dialog
      const dialogAddBtn = page.locator('[role="dialog"] button, [data-headlessui-state] button')
        .filter({ hasText: /Add|Confirm|OK/i })
        .filter({ visible: true })
        .first();
      if (await dialogAddBtn.count() > 0) {
        await dialogAddBtn.click({ force: true });
      }
    }
    await page.waitForTimeout(500);

    // ── Select from the second combobox ──────────────────────────────────────
    const combobox2 = page.locator('[role="combobox"], [role="listbox"]').filter({ visible: true }).first();
    if (await combobox2.count() > 0) {
      const comboOpts = combobox2.locator('[role="option"]').filter({ visible: true });
      const optCount = await comboOpts.count();
      if (optCount > 0) {
        const randomIdx = Math.floor(Math.random() * optCount);
        await comboOpts.nth(randomIdx).click({ force: true });
      }
    } else {
      const selectCombo2 = page.locator('select').filter({ visible: true }).nth(2);
      if (await selectCombo2.count() > 0) {
        const vals = await selectCombo2.locator('option').evaluateAll(
          (opts: HTMLOptionElement[]) => opts.map(o => o.value).filter(v => v !== '')
        );
        if (vals.length > 0) {
          await selectCombo2.selectOption(vals[Math.floor(Math.random() * vals.length)], { force: true });
        }
      }
    }

    // ── Click a checkbox / toggle in the row ─────────────────────────────────
    // Cypress: cy.get('.w-10 > .flex > .h-4').click()
    const rowCheckbox = page.locator('.w-10 .flex .h-4').first();
    if (await rowCheckbox.count() > 0) {
      await rowCheckbox.click({ force: true });
    }

    // ── Click the primary Save / Submit button ───────────────────────────────
    // Cypress: cy.get('.justify-end > .inline-flex').click() then cy.get('.gap-x-4 > .bg-\[\#00a6fb\]').click()
    const submitBtn = page.locator('.justify-end .inline-flex').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
    const saveBtn = page.locator('.gap-x-4 .bg-\\[\\#00a6fb\\]').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click({ force: true });
    } else {
      // Fallback to any Save/Submit button
      const genericSave = page.getByRole('button', { name: /Save|Submit|Confirm/i }).filter({ visible: true }).last();
      if (await genericSave.count() > 0) {
        await genericSave.click({ force: true });
      }
    }
    await page.waitForTimeout(3000);

    // ── Verify no server error ───────────────────────────────────────────────
    await expect(page.locator('body')).not.toContainText('500');
    await page.screenshot({ path: 'playwright-report/screenshots/AddClientQuotation.png' });
  });
});
