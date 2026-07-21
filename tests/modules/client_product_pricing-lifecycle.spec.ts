/**
 * Client Product Pricing — Full Lifecycle Suite (Set + Edit pricing)  [DESTRUCTIVE]
 * URL  : /dashboard/client-product-pricing  (nav: Quotation & Pricing → Client Product Pricing)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-20. This is the step after Product
 * Master in the chain ("after product is created in product master, we move to
 * Client Product Pricing and update the pricing for the product"). Flagged by the
 * user as the most complex module.
 *
 * IMPORTANT DISCOVERY — why this spec does NOT create its own disposable product:
 *   A brand-new Product Master record does NOT reliably show up in this module's
 *   "Not Priced" product search. Empirically verified: a freshly-created AUTOQA
 *   product was still NOT findable here after 100+ seconds of polling, across
 *   multiple attempts, including from a completely fresh browser session — so this
 *   is not simple actionability/timing flakiness, it looks like a real backend
 *   indexing/caching gap for this specific search endpoint (on the order of minutes,
 *   not seconds). That is impractical for an E2E test timeout. Instead, this spec
 *   works against the FIRST real, already-indexed "Not Priced" product the UI offers
 *   for a given client — never touching a product that already has real pricing, and
 *   never overwriting an existing price (only ever setting one where none exists
 *   yet, which is the legitimate first-time use of this screen). There is no delete
 *   affordance for pricing, so this necessarily leaves a small, harmless pricing
 *   footprint on that one real product+client pair in UAT — acceptable per the
 *   standing UAT destructive-testing authorization.
 *
 * Discovered flow:
 *   • The page has 4 top filters: Client Name (combobox, id="cpp-client-search" —
 *     NOTE the placeholder uses a Unicode ellipsis "…", not three ASCII dots, so a
 *     plain `[placeholder="Search client by name..."]` selector silently matches
 *     nothing), an "Is Priced" toggle (custom Listbox: "Not Priced" / "Priced"),
 *     a Product combobox, and a turnover-days number field.
 *   • THE PRODUCT COMBOBOX RESULTS ARE SCOPED BY THE "IS PRICED" FILTER. A product
 *     with no pricing yet only shows up while the filter is "Not Priced" (the
 *     default); once you save pricing for it, it moves to the "Priced" bucket and
 *     disappears from "Not Priced" results. Re-selecting it afterwards (to edit or
 *     verify) REQUIRES switching the filter to "Priced" first, or the product
 *     search finds nothing.
 *   • Once client+product are both chosen, a "Product STP Information" table
 *     appears — one row per STP linked to the product, each with plain (no
 *     id/placeholder) "Specific Price (Rupees)" and "Urgent Price (Rupees)" text
 *     inputs. Filling at least one row's two inputs enables the CTA button.
 *   • THE CTA BUTTON TEXT DEPENDS ON STATE: "Save Pricing" the first time (product
 *     not yet priced for this client), "Update Pricing" on subsequent edits (once
 *     it's already priced) — a `has-text("Save Pricing"), has-text("Update Pricing")`
 *     combined selector handles both. Both show the same toast: "Pricing saved
 *     successfully".
 *
 * DESTRUCTIVE: sets/edits real pricing for one real client+product pair. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const CPP_URL = '/dashboard/client-product-pricing';
const LAB = 'Arbro - Delhi';
const CLIENT_TERM = 'ALCATEC';

// NOTE: .innerText() on a locator matching ZERO elements blocks for the full
// actionability timeout (~30s) before rejecting — across many retries that alone
// can eat the whole test budget. Passing an explicit short { timeout } keeps each
// retry fast (~1s) so genuine "no match" cases fail quickly instead of hanging.
async function pickFirstOption(page: any, locatorInput: any, term: string, retries = 8) {
  await locatorInput.click().catch(() => {});
  await locatorInput.fill(term);
  for (let i = 0; i < retries; i++) {
    await page.waitForTimeout(2200);
    const first = page.locator('[role="option"], ul[role="listbox"] li, li[class*="cursor"]').first();
    const t = await first.innerText({ timeout: 1000 }).catch(() => '');
    if (t && !/searching/i.test(t)) { await first.click(); await page.waitForTimeout(900); return t; }
  }
  return null;
}

async function selectClientAndFilter(page: any, filter: 'Not Priced' | 'Priced') {
  await page.goto(CPP_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  const clientPicked = await pickFirstOption(page, page.locator('#cpp-client-search').first(), CLIENT_TERM);
  expect(clientPicked, 'client option in CPP').toBeTruthy();
  if (filter === 'Priced') {
    await page.locator('button:has-text("Not Priced")').first().click();
    await page.waitForTimeout(700);
    await page.getByText('Priced', { exact: true }).first().click();
    await page.waitForTimeout(1200);
  }
}

// Picks the first real, already-indexed "Not Priced" product for the client — a
// generic single-letter search term surfaces whatever the UI already has ready,
// which is what makes this reliable (vs. searching for a name we just created).
async function selectFirstNotPricedProduct(page: any) {
  const productInput = page.locator('input[placeholder="Search product..."]').first();
  const picked = await pickFirstOption(page, productInput, 'a');
  expect(picked, 'a Not Priced product option').toBeTruthy();
  await page.waitForTimeout(2000);
  return picked as string;
}

async function reselectProduct(page: any, productText: string) {
  // re-search using a distinctive token from the product's own name so we land
  // back on the exact same product, now under the "Priced" bucket
  const token = productText.replace(/\s*\(.*$/, '').trim().split(' ').slice(0, 2).join(' ');
  const productInput = page.locator('input[placeholder="Search product..."]').first();
  const picked = await pickFirstOption(page, productInput, token);
  expect(picked, `reselect product matching "${token}"`).toBeTruthy();
  await page.waitForTimeout(2000);
}

test.describe('[MODULE-CLIENT-PRODUCT-PRICING-LIFECYCLE] Client Product Pricing — Set + Edit', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
  });

  test('TC-LC01 pick a Not-Priced product → set STP pricing → Save Pricing → verify persisted', async ({ page }) => {
    await selectClientAndFilter(page, 'Not Priced');
    const productText = await selectFirstNotPricedProduct(page);

    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const inputs = firstRow.locator('input');
    await inputs.nth(0).fill('150');
    await inputs.nth(1).fill('200');

    const saveBtn = page.locator('button:has-text("Save Pricing"), button:has-text("Update Pricing")').first();
    await expect(saveBtn).toBeVisible({ timeout: 6000 });
    await saveBtn.click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Pricing saved successfully/i)).toBeVisible({ timeout: 8000 });

    // verify it persisted — the product now lives under the "Priced" bucket
    await selectClientAndFilter(page, 'Priced');
    await reselectProduct(page, productText);
    const persistedRow = page.locator('table tbody tr').first();
    const vals = await persistedRow.locator('input').evaluateAll((els: HTMLInputElement[]) => els.map(e => e.value));
    expect(vals[0]).toBe('150');
    expect(vals[1]).toBe('200');
  });

  test('TC-LC02 already-priced product → change price → "Update Pricing" → verify new value persisted', async ({ page }) => {
    // first pricing pass on a fresh Not-Priced product (Save Pricing)
    await selectClientAndFilter(page, 'Not Priced');
    const productText = await selectFirstNotPricedProduct(page);
    const row1 = page.locator('table tbody tr').first();
    const inputs1 = row1.locator('input');
    await inputs1.nth(0).fill('100');
    await inputs1.nth(1).fill('120');
    await page.locator('button:has-text("Save Pricing")').first().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Pricing saved successfully/i)).toBeVisible({ timeout: 8000 });

    // edit pass — must reopen via the "Priced" filter, button is now "Update Pricing"
    await selectClientAndFilter(page, 'Priced');
    await reselectProduct(page, productText);
    const row2 = page.locator('table tbody tr').first();
    const inputs2 = row2.locator('input');
    await inputs2.nth(0).fill('175');
    await inputs2.nth(1).fill('225');
    const updateBtn = page.locator('button:has-text("Update Pricing")').first();
    await expect(updateBtn).toBeVisible({ timeout: 6000 });
    await updateBtn.click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(/Pricing saved successfully/i)).toBeVisible({ timeout: 8000 });

    // verify the edited value replaced the original
    await selectClientAndFilter(page, 'Priced');
    await reselectProduct(page, productText);
    const row3 = page.locator('table tbody tr').first();
    const vals = await row3.locator('input').evaluateAll((els: HTMLInputElement[]) => els.map(e => e.value));
    expect(vals[0]).toBe('175');
    expect(vals[1]).toBe('225');
  });

}); // describe Client Product Pricing lifecycle
