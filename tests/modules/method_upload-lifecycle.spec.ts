/**
 * Method Upload — Full Lifecycle Suite (Add + Edit)  [DESTRUCTIVE]
 * URL  : /dashboard/method/method-upload  (nav: Document Management → Method Upload)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "New Method Upload" — Method ID* (a "Search or enter method ID..."
 *     combobox whose placeholder LIES: it does NOT actually filter by typed
 *     text — it always lists the full STP Master code list, e.g.
 *     "APL/CHE/STP-001", regardless of what you type. It is really just a
 *     picker over existing STP codes), Version No (optional), Product Name*,
 *     Message (optional), Expiry Date* (fully custom calendar widget, zero
 *     native date inputs — click the "dd/mm/yyyy" span, then a day button),
 *     Client Name* (a REAL filtering combobox, `[role="option"]`), Active
 *     (checkbox, checked by default), Upload Method File* (REQUIRED file
 *     input — PDF/DOC/DOCX/XLS/XLSX/PNG/JPG, max 20MB).
 *   • REAL APP CONSTRAINT: Method ID is UNIQUE across all Method Upload
 *     records — the vast majority of STP codes already have an uploaded
 *     method on UAT, so picking the first dropdown option usually fails with
 *     "Failed to create method upload: Method 'X' already exists". The only
 *     reliable strategy is to try dropdown options in order until one saves.
 *   • The dropdown's own option list is mouse-click-flaky (elements detach
 *     from the DOM mid-click, "element was detached from the DOM, retrying"
 *     — likely a re-render on every reopen), so Method ID is selected via
 *     ArrowDown×N + Enter keyboard nav rather than clicking the option
 *     directly. Save's result (existing-ID error vs success) is also polled
 *     for up to 12s rather than read after one fixed delay — under UAT load
 *     with 43k+ existing records, the "Save" request can still be in flight
 *     (visible spinner) 3+ seconds after the click.
 *   • ON SUCCESS THE PANEL DOES NOT CLOSE — it silently resets its own
 *     fields (Method ID etc. all blank again) so you can immediately upload
 *     another method, showing only a "Method created successfully" toast.
 *     A "panel closed" check for success is a false negative here; the
 *     toast text is the only reliable success signal. No explicit panel
 *     close is needed afterward — the next step always navigates away via
 *     goto(URL) anyway, and the panel's own "Close panel" button is itself
 *     flaky (detaches from the DOM mid-click after the list behind it
 *     refetches on save).
 *   • Since this suite has now run repeatedly against the same UAT
 *     environment, permanently consuming low STP-code indices, Method ID
 *     selection starts from a RANDOM offset each run rather than always
 *     walking from index 0 — otherwise every run re-treads a growing prefix
 *     of guaranteed "already exists" collisions.
 *   • Edit ("Edit Method" panel, opened via the row's second icon button) is
 *     the same field set plus a read-only "View Version History" table of
 *     previously uploaded files. Saving shows a "... updated successfully"
 *     toast and the panel auto-closes (unlike several other modules in this
 *     suite where the detail panel stays open after a successful update).
 *
 * DESTRUCTIVE: creates a real AUTOQA method upload record (consuming one
 * previously-unused STP Method ID permanently — Method IDs cannot be freed
 * once used) and edits it. UAT only.
 */
import path from 'path';
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/method/method-upload';
const LAB = 'Arbro - Delhi';
const DUMMY_FILE = path.join(__dirname, '..', 'fixtures', 'dummy.pdf');

async function pickMethodIdByArrow(page: any, index: number): Promise<string> {
  const midInput = page.locator('input[placeholder="Search or enter method ID..."]').first();
  await midInput.click();
  await page.waitForTimeout(800);
  for (let i = 0; i <= index; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(150); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  return midInput.inputValue().catch(() => '');
}

async function attemptSave(page: any): Promise<'exists' | 'saved' | 'unknown'> {
  await page.locator('button:has-text("Save")').first().click();
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(600);
    const err = page.getByText(/already exists/i);
    if (await err.isVisible({ timeout: 300 }).catch(() => false)) {
      // the toast takes ~6s to auto-dismiss — wait it out fully so a stale
      // "already exists" toast can't bleed into the NEXT attempt's check and
      // produce a false negative on an attempt that actually just succeeded
      await err.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
      return 'exists';
    }
    // NOTE: on success the panel does NOT close — it resets its own fields so
    // you can immediately upload another method. The success toast is the
    // only reliable signal.
    const success = await page.getByText(/created successfully/i).isVisible({ timeout: 300 }).catch(() => false);
    if (success) return 'saved';
  }
  return 'unknown';
}

async function createMethodUpload(page: any, productName: string): Promise<string> {
  await page.click('button:has-text("New Method Upload")');
  await page.waitForTimeout(2500);

  let usedMethodId = '';
  let saved = false;
  // random starting offset: UAT has ~104 STP codes and this suite has been
  // run repeatedly, permanently consuming low indices — starting from a
  // random point avoids re-walking a long, now-mostly-"already exists" prefix
  const start = Math.floor(Math.random() * 70);

  for (let i = 0; i < 20 && !saved; i++) {
    const attempt = start + i;
    usedMethodId = await pickMethodIdByArrow(page, attempt);
    if (!usedMethodId) break;

    if (i === 0) {
      await page.locator('input[name="productName"]').fill(productName);
      await page.waitForTimeout(300);
      await page.getByText('dd/mm/yyyy', { exact: true }).click();
      await page.waitForTimeout(800);
      await page.locator('button:has-text("28")').last().click();
      await page.waitForTimeout(600);
      const clientInput = page.locator('input[placeholder="Search and select client..."]').first();
      await clientInput.click();
      await clientInput.fill('lab');
      await page.waitForTimeout(2000);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(800);
      await page.locator('input[type="file"]').setInputFiles(DUMMY_FILE);
      await page.waitForTimeout(1200);
    }

    const result = await attemptSave(page);
    if (result === 'saved') saved = true;
    else if (result === 'unknown') break;
  }

  expect(saved, `method upload saved (last tried Method ID: ${usedMethodId})`).toBe(true);
  return usedMethodId;
}

async function findMethodRow(page: any, productName: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(productName);
  await page.waitForTimeout(2500);
  return page.locator('table tbody tr', { hasText: productName }).first();
}

test.describe('[MODULE-METHOD-UPLOAD-LIFECYCLE] Method Upload — Add + Edit', () => {

  test.setTimeout(240000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 upload a new method (unique Method ID + required file) → verify in list', async ({ page }) => {
    const productName = `AUTOQA Method Product ${Date.now().toString().slice(-6)}`;
    await createMethodUpload(page, productName);

    const row = await findMethodRow(page, productName);
    await expect(row).toBeVisible({ timeout: 12000 });
  });

  test('TC-LC02 upload a method → Edit icon → change Message → Update → verify success', async ({ page }) => {
    const productName = `AUTOQA Method Product Edit ${Date.now().toString().slice(-6)}`;
    await createMethodUpload(page, productName);

    const row = await findMethodRow(page, productName);
    await expect(row).toBeVisible({ timeout: 12000 });

    await row.locator('button').nth(1).click(); // second icon = Edit
    await page.waitForTimeout(2000);
    await expect(page.getByText('Edit Method')).toBeVisible({ timeout: 8000 });

    await page.locator('input[name="message"]').fill('AUTOQA edit message');
    const updateBtn = page.locator('button:has-text("Update")').first();
    await updateBtn.click();
    await page.waitForTimeout(4000);

    await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10000 });
  });

}); // describe Method Upload lifecycle
