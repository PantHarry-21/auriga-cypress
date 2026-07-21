/**
 * Ticket — Full Lifecycle Suite (Add + Reply/Close)  [DESTRUCTIVE]
 * URL  : /dashboard/support/tickets  (nav: Support → Ticket)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21.
 *
 * Discovered flow:
 *   • "Generate Ticket" — Account Manager (employee combobox, optional), Category*
 *     (a "Type to search..." dropdown — filter on a real category word like
 *     "Technical", not a bare "a"; the filtered list can otherwise resolve
 *     ambiguously and silently leave nothing selected), Report/Invoice No.
 *     (optional), File Upload (optional), Priority (defaults to Low), Due Date
 *     (prefilled), Subject*, Remarks* (rich-text editor — a
 *     `div[contenteditable="true"]`, not a textarea; click it and use
 *     `page.keyboard.type()`).
 *   • THE LIST IS CARD-BASED, NOT A TABLE. Each ticket card has 3 icon actions:
 *     reply (↩), assign (person+), note (document). Clicking reply/note expands
 *     an INLINE panel in place — it does not navigate or open a modal.
 *   • THE REPLY PANEL'S "Close Ticket" CHECKBOX STARTS DISABLED — it only
 *     becomes enabled once the reply's rich-text body has content. Type the
 *     reply first, then check it (checking it before typing has no effect,
 *     since it can't be interacted with while disabled). "Send Reply" with
 *     "Close Ticket" checked both posts the reply AND flips the ticket's status
 *     badge from "New Ticket" to "Closed" in one action — there's no separate
 *     "close" button.
 *
 * DESTRUCTIVE: creates a real AUTOQA support ticket, replies to it, and closes
 * it. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const URL = '/dashboard/support/tickets';
const LAB = 'Arbro - Delhi';

async function pickTypeSearch(page: any, buttonLabel: string, term: string) {
  await page.locator(`button:has-text("${buttonLabel}")`).first().click();
  await page.waitForTimeout(1000);
  const search = page.locator('input[placeholder="Type to search..."]').last();
  await search.fill(term);
  await page.waitForTimeout(800);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function generateTicket(page: any, subject: string) {
  await page.click('button:has-text("Generate Ticket")');
  await page.waitForTimeout(3000);

  await pickTypeSearch(page, '--Select Employee--', 'a');
  await pickTypeSearch(page, '-----Select Category-----', 'Technical');
  await page.locator('input[name="subject"]').fill(subject);
  const editor = page.locator('div[contenteditable="true"]').last();
  await editor.click();
  await page.keyboard.type('AUTOQA ticket remarks body');

  const genBtn = page.locator('button:has-text("Generate Ticket")').last();
  await expect(genBtn).toBeEnabled({ timeout: 5000 });
  await genBtn.click();
  await expect(page.getByText(/Ticket created successfully/i)).toBeVisible({ timeout: 10000 });
}

async function findTicketCard(page: any, subject: string) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.locator('input[placeholder="Search"]').first().fill(subject);
  await page.waitForTimeout(2500);
  return page.locator('div').filter({ hasText: /^TK#/ }).filter({ hasText: subject }).first();
}

test.describe('[MODULE-TICKET-LIFECYCLE] Ticket — Add + Reply/Close', () => {

  test.setTimeout(150000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
  });

  test('TC-LC01 generate a ticket (employee + category comboboxes + rich-text remarks) → verify in list', async ({ page }) => {
    const subject = `AUTOQA Ticket ${Date.now().toString().slice(-6)}`;
    await generateTicket(page, subject);

    const card = await findTicketCard(page, subject);
    await expect(card).toBeVisible({ timeout: 12000 });
    await expect(card).toContainText('New Ticket');
    await expect(card).toContainText('Technical');
  });

  test('TC-LC02 generate a ticket → reply icon expands inline → reply + Close Ticket → status becomes Closed', async ({ page }) => {
    const subject = `AUTOQA TicketClose ${Date.now().toString().slice(-6)}`;
    await generateTicket(page, subject);

    const card = await findTicketCard(page, subject);
    await expect(card).toBeVisible({ timeout: 12000 });

    // reply (first icon) expands an inline panel on the same card
    const icons = card.locator('button, a').filter({ has: page.locator('svg') });
    await icons.first().click();
    await page.waitForTimeout(1500);

    const replyEditor = page.locator('div[contenteditable="true"]').last();
    await replyEditor.click();
    await page.keyboard.type('AUTOQA reply message');
    await page.waitForTimeout(500);

    // "Close Ticket" is disabled until the reply body has content (now satisfied)
    const closeCheckbox = page.locator('input[type="checkbox"]').last();
    await expect(closeCheckbox).toBeEnabled({ timeout: 5000 });
    await closeCheckbox.check();

    const sendBtn = page.locator('button:has-text("Send Reply")').first();
    await expect(sendBtn).toBeEnabled({ timeout: 5000 });
    await sendBtn.click();
    await expect(page.getByText(/Reply sent successfully/i)).toBeVisible({ timeout: 10000 });

    const card2 = await findTicketCard(page, subject);
    await expect(card2).toBeVisible({ timeout: 12000 });
    await expect(card2).toContainText('Closed');
  });

}); // describe Ticket lifecycle
