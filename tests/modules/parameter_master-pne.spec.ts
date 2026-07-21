/**
 * Parameter Master — Positive / Negative / Edge Case Suite
 * URL  : /dashboard/testing/analyt-master-v2
 * Role : admin
 *
 * Behaviour verified live on prod.bharatlims.ai 2026-07-19. The "New Parameter"
 * wizard has two steps:
 *   Step 1 (dedup): type a candidate name → Search. A novel name yields
 *     "No matches found" + a Create "<name>" button; an existing name lists matches.
 *   Step 2 (details): Canonical Name (required, name-format rule), Symbol/Short name,
 *     aliases, and a MANDATORY "Is this a chemical compound?" choice. "Submit for
 *     Review" stays disabled until (a) the compound question is answered AND
 *     (b) the canonical name passes the format rule (no digits/underscores/units/
 *     methods/conditions — otherwise the red warning shows and blocks submit).
 *
 * These tests assert the validation GATES and Cancel out — they do not persist
 * records, so they are safe to run repeatedly against a shared environment.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';
import { YLIMS_SELECTORS } from '../helpers/selectors';

const URL = '/dashboard/testing/analyt-master-v2';
const LAB = 'Arbro - Delhi';
const S = YLIMS_SELECTORS.parameterMaster;
const uniq = () => Date.now().toString().slice(-6);

async function openWizard(page: any) {
  await page.click(S.newButton);
  await page.waitForTimeout(1500);
  await expect(page.locator(S.wizardSearchInput)).toBeVisible({ timeout: 10000 });
}

async function dedupSearch(page: any, term: string) {
  await page.locator(S.wizardSearchInput).fill(term);
  await page.locator(S.wizardSearchButton).last().click();
  await page.waitForTimeout(2500);
}

async function reachStep2(page: any, name: string) {
  await dedupSearch(page, name);
  await page.locator(S.createNamedButton(name)).click();
  await page.waitForTimeout(2500);
  await expect(page.locator(S.canonicalNameInput)).toBeVisible({ timeout: 10000 });
}

test.describe('[MODULE-PARAM-PNE] Parameter Master — Positive/Negative/Edge', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1500);
  });

  // ── POSITIVE ───────────────────────────────────────────────────────────────
  test.describe('Positive', () => {

    test('TC-P01 novel name in dedup search yields "No matches found" + Create button', async ({ page }) => {
      const name = `AUTOQA Novel Param ${uniq()}`;
      await openWizard(page);
      await dedupSearch(page, name);
      await expect(page.getByText('No matches found')).toBeVisible({ timeout: 8000 });
      await expect(page.locator(S.createNamedButton(name))).toBeVisible();
    });

    test('TC-P02 Create advances to step 2 with the name pre-filled', async ({ page }) => {
      const name = `AUTOQA Param ${uniq()}`;
      await openWizard(page);
      await reachStep2(page, name);
      expect(await page.locator(S.canonicalNameInput).inputValue()).toContain('AUTOQA');
    });

    test('TC-P03 a clean name + compound choice + category enables Submit for Review', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      // Clean canonical name (letters/spaces only — passes the format rule)
      await page.locator(S.canonicalNameInput).fill('Autoqa Clean Parameter Name');
      await page.locator(S.symbolInput).fill('AQ');
      await page.locator(S.compoundNo).click();
      await page.locator(S.templateCategory('Physical')).first().click();
      await page.waitForTimeout(800);
      await expect(page.locator(S.submitButton)).toBeEnabled({ timeout: 8000 });
      // non-destructive: leave without persisting
      await page.locator(S.cancelButton).first().click();
    });

    test('TC-P04 alias input is present on step 2 and accepts a value', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      await page.waitForTimeout(1000); // let the details form settle (it re-renders once)
      const alias = page.locator(S.aliasInput);
      await expect(alias).toBeVisible({ timeout: 10000 });
      await alias.fill('autoqa-alias');
      // retrying assertion tolerates the form's post-fill re-render
      await expect(alias).toHaveValue('autoqa-alias', { timeout: 6000 });
    });
  });

  // ── NEGATIVE ───────────────────────────────────────────────────────────────
  test.describe('Negative', () => {

    test('TC-N01 canonical name is required — clearing it disables Submit', async ({ page }) => {
      // Verified live 2026-07-20: a filled clean name + compound choice enables Submit;
      // clearing the required canonical name must disable it again.
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      await page.locator(S.canonicalNameInput).fill('Autoqa Required Name');
      await page.locator(S.compoundNo).click();
      await page.waitForTimeout(600);
      await expect(page.locator(S.submitButton)).toBeEnabled({ timeout: 6000 });
      await page.locator(S.canonicalNameInput).clear();
      await page.waitForTimeout(600);
      await expect(page.locator(S.submitButton)).toBeDisabled({ timeout: 6000 });
    });

    test('TC-N02 Submit stays disabled until the compound question is answered', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      await page.locator(S.canonicalNameInput).fill('Autoqa Unanswered Compound');
      // no compound choice made
      await expect(page.locator(S.submitButton)).toBeDisabled({ timeout: 6000 });
    });

    test('TC-N03 empty canonical name blocks Submit', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      await page.locator(S.canonicalNameInput).fill('');
      await page.locator(S.compoundNo).click();
      await page.waitForTimeout(600);
      await expect(page.locator(S.submitButton)).toBeDisabled();
    });

    test('TC-N04 an existing parameter name surfaces matches (no Create shortcut)', async ({ page }) => {
      // "acid" matches thousands of seeded parameters — dedup must show them
      await openWizard(page);
      await dedupSearch(page, 'acid');
      const noMatches = await page.getByText('No matches found').isVisible({ timeout: 4000 }).catch(() => false);
      expect(noMatches).toBe(false);
    });
  });

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  test.describe('Edge Cases', () => {

    test('TC-E01 very long canonical name (300 chars) is accepted without crashing', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      const longName = 'Autoqa ' + 'A'.repeat(300);
      await page.locator(S.canonicalNameInput).fill(longName);
      await page.waitForTimeout(500);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E02 special characters in the dedup search term do not break the page', async ({ page }) => {
      await openWizard(page);
      await dedupSearch(page, `<script>alert(1)</script>' OR 1=1;--`);
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
      expect(body).not.toContain('502 Bad Gateway');
      expect(body).not.toMatch(/Error code 5\d\d/);
    });

    test('TC-E03 CAS-number-formatted term is accepted by dedup search', async ({ page }) => {
      await openWizard(page);
      await dedupSearch(page, '7439-92-1');
      const body = await page.locator('body').textContent() ?? '';
      expect(body).not.toContain('Internal Server Error');
    });

    test('TC-E04 whitespace-only search term keeps the Search button disabled', async ({ page }) => {
      await openWizard(page);
      // Verified live: the dedup Search button is disabled for empty/whitespace input.
      await page.locator(S.wizardSearchInput).fill('   ');
      await page.waitForTimeout(600);
      await expect(page.locator(S.wizardSearchButton).last()).toBeDisabled({ timeout: 6000 });
      const createVisible = await page.locator('button:has-text("Create \\"")').first()
        .isVisible({ timeout: 2000 }).catch(() => false);
      expect(createVisible).toBe(false);
    });

    test('TC-E05 Cancel from step 2 returns to the list intact', async ({ page }) => {
      await openWizard(page);
      await reachStep2(page, `AUTOQA Param ${uniq()}`);
      await page.locator(S.cancelButton).first().click();
      await page.waitForTimeout(1500);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });
  });

}); // describe Parameter Master P/N/E
