/**
 * Mailer — Lifecycle Suite (Compose + Save Draft, then re-open)  [DESTRUCTIVE]
 * URL  : /dashboard/mail/inbox  (nav: Support → Mailer)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * IMPORTANT SCOPE NOTE: Mailer is a genuine email client wired to real delivery
 * (the Inbox shows mail from/to real addresses like a Gmail account). Unlike
 * every other module in this suite, clicking "Send" here has an effect OUTSIDE
 * the app — it delivers a real email to whatever recipient is selected. To stay
 * within safe, reversible, in-app testing, this spec exercises the "Save Draft"
 * path only (a separate, distinct button from "Send") and does not click Send.
 *
 * Discovered flow:
 *   • "Compose" opens a "New Message" panel: To (search-by-name-or-email
 *     combobox, optional for a draft), Subject*, Message*, with "Save Draft" /
 *     "Cancel" / "Send" as three DISTINCT actions (not a single submit).
 *   • Save Draft succeeds even with no recipient — toast "Draft saved
 *     successfully!" — and the draft appears in the "Drafts" folder (with its
 *     unread-style count badge incrementing).
 *   • CLICKING A DRAFT IN THE LIST RE-OPENS THE SAME COMPOSE PANEL, pre-filled,
 *     with the same Save Draft/Cancel/Send controls — this is the module's
 *     "edit" affordance; there is no separate pencil/edit icon.
 *
 * DESTRUCTIVE (in-app only): creates a real AUTOQA draft email. Never sends.
 * UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/mail/inbox';
const LAB = 'Arbro - Delhi';

test.describe('[MODULE-MAILER-LIFECYCLE] Mailer — Compose + Save Draft', () => {

  test.setTimeout(120000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 compose a message → Save Draft (never Send) → verify in Drafts folder', async ({ page }) => {
    const subject = `AUTOQA Mail ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("Compose")');
    await page.waitForTimeout(2500);

    await page.locator('input[name="subject"]').fill(subject);
    await page.locator('textarea').fill('AUTOQA test draft message body');

    const draftBtn = page.locator('button:has-text("Save Draft")').first();
    await expect(draftBtn).toBeEnabled({ timeout: 5000 });
    await draftBtn.click();
    await expect(page.getByText(/Draft saved successfully/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000); // let the panel settle back before switching folders

    await page.click('text="Drafts"');
    await page.waitForTimeout(3000);
    await expect(page.getByText(subject).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-LC02 clicking a saved draft re-opens the same Compose panel pre-filled', async ({ page }) => {
    const subject = `AUTOQA MailEdit ${Date.now().toString().slice(-6)}`;
    await page.click('button:has-text("Compose")');
    await page.waitForTimeout(2500);
    await page.locator('input[name="subject"]').fill(subject);
    await page.locator('textarea').fill('AUTOQA test draft message body — original');
    await page.locator('button:has-text("Save Draft")').first().click();
    await expect(page.getByText(/Draft saved successfully/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000); // let the panel settle back before switching folders

    await page.click('text="Drafts"');
    await page.waitForTimeout(3000);
    await page.getByText(subject).first().click();
    await page.waitForTimeout(1500);

    // re-opens the same compose surface, pre-filled — the module's "edit" flow
    await expect(page.locator('input[name="subject"]')).toHaveValue(subject, { timeout: 8000 });
    await expect(page.locator('button:has-text("Save Draft")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Send")')).toBeVisible();

    // update the draft body and re-save (edit, still never Send)
    await page.locator('textarea').fill('AUTOQA test draft message body — edited');
    await page.locator('button:has-text("Save Draft")').first().click();
    await expect(page.getByText(/Draft saved successfully/i)).toBeVisible({ timeout: 10000 });
  });

}); // describe Mailer lifecycle
