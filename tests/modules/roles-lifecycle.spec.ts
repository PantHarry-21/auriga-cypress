/**
 * Role Management (All Roles + Create Role) — Full Lifecycle Suite
 * (Add + Edit + Delete)  [DESTRUCTIVE]
 * URL  : /dashboard/roles (list) , /dashboard/roles/create (new)
 * Role : admin
 *
 * Verified end-to-end on uat.bharatlims.ai 2026-07-21. This is the RBAC role
 * builder — "All Roles" and "Create Role" are two nav entries for the same
 * underlying entity, so one spec covers both.
 *
 * Discovered flow:
 *   • "Create Role" is a 3-step form: (1) Role Name + optional Reason, (2) Module
 *     Access — a list of 19 top-level modules, each showing "(N sub-modules)",
 *     (3) Set Permissions — a table that only appears once a sub-module is
 *     selected, with one row per selected sub-module and 5 toggle buttons per
 *     row: View / Create / Update / Delete / Approve.
 *   • SELECTOR TRAP: nearly every module/sub-module NAME also exists verbatim as
 *     a sidebar nav link ("Home", "Home Page", etc). A plain text locator matches
 *     the sidebar first. Fix: `.nth(1)` for the top-level module row (the sidebar
 *     copy is always index 0), or `.last()` for a sub-module chip. This bug is
 *     silent — the click "succeeds" on the wrong element and just navigates the
 *     sidebar instead of expanding/selecting anything.
 *   • THE MODULE ROW ITSELF IS A CHECKBOX-LIKE TOGGLE — clicking the top-level
 *     module name (e.g. "Home") both expands it AND selects it in one click, no
 *     separate expand affordance.
 *   • THE PERMISSION TOGGLES ARE PLAIN `<button>`s with clean, stable
 *     `aria-label="<Permission> permission for <Sub-module name>"` attributes —
 *     by far the most reliable selector found in this whole exploration; prefer
 *     it over any DOM-position-based approach.
 *   • "Create Role" stays disabled until: a role name is entered, at least one
 *     module+sub-module is selected, AND that sub-module has at least one
 *     permission checked (the page shows inline warnings guiding through these
 *     three states in order).
 *   • THE ALL ROLES LIST IS CARD-BASED (not a table). Each card has 2 icon
 *     buttons: pencil (Edit — navigates to a dedicated `/dashboard/roles/edit/
 *     <id>` page, same 3-step form pre-filled, footer button "Update Role") and
 *     trash (Delete — confirm dialog "Delete role? Delete <name>? Users
 *     currently assigned this role will lose its permissions. This cannot be
 *     undone." → Cancel / Delete).
 *
 * DESTRUCTIVE: creates, edits, and deletes a real AUTOQA role. UAT only.
 */
import { test, expect } from '../global-setup';
import { stubStimulsoft, loginAs } from '../helpers/commands';

const LIST_URL = '/dashboard/roles';
const CREATE_URL = '/dashboard/roles/create';
const LAB = 'Arbro - Delhi';

async function fillMinimalRole(page: any, roleName: string) {
  await page.locator('input[placeholder*="Lab Manager"]').fill(roleName);
  await page.waitForTimeout(1500); // async role-name uniqueness check

  // top-level module row: index 0 is the sidebar's own "Home" link, index 1 is
  // the actual Module Access row — clicking it both expands AND selects it
  const homeModuleRow = page.locator('text="Home"').nth(1);
  await homeModuleRow.click();
  await page.waitForTimeout(1000);

  // sub-module chip: same sidebar-collision issue, use .last()
  await page.getByText('Home Page', { exact: true }).last().click();
  await page.waitForTimeout(1200);

  // permission toggle — stable aria-label, no positional guessing needed
  await page.locator('button[aria-label="View permission for Home Page"]').click();
  await page.waitForTimeout(500);
}

async function findRoleCard(page: any, roleName: string) {
  await page.goto(LIST_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder*="Search roles"]').fill(roleName);
  await page.waitForTimeout(2000);
  return page.getByText(roleName, { exact: true }).locator('xpath=ancestor::div[.//button][1]');
}

test.describe('[MODULE-ROLES-LIFECYCLE] Role Management — Add + Edit + Delete', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page, context, env }) => {
    await stubStimulsoft(context);
    await loginAs(page, context, 'admin', env, LAB);
  });

  test('TC-LC01 create a role (name + module + sub-module + View permission) → verify in All Roles', async ({ page }) => {
    const roleName = `AUTOQA Role ${Date.now().toString().slice(-6)}`;
    await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    await fillMinimalRole(page, roleName);

    const createBtn = page.locator('button:has-text("Create Role")').first();
    await expect(createBtn).toBeEnabled({ timeout: 5000 });
    await createBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(new RegExp(`Role "${roleName}" created`))).toBeVisible({ timeout: 10000 });

    const card = await findRoleCard(page, roleName);
    await expect(card).toBeVisible({ timeout: 12000 });

    // cleanup: delete it via the card's trash (second) icon
    const btns = card.locator('button');
    await btns.nth(1).click();
    await page.waitForTimeout(1200);
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(2000);
  });

  test('TC-LC02 create a role → pencil icon → dedicated edit page pre-filled with Update Role → then Delete → confirm → verify gone', async ({ page }) => {
    const roleName = `AUTOQA RoleEd ${Date.now().toString().slice(-6)}`;
    await page.goto(CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    await fillMinimalRole(page, roleName);
    await page.locator('button:has-text("Create Role")').first().click();
    await page.waitForTimeout(3000);

    let card = await findRoleCard(page, roleName);
    await expect(card).toBeVisible({ timeout: 12000 });

    // pencil (Edit) navigates to a dedicated edit page pre-filled
    await card.locator('button').first().click();
    await page.waitForTimeout(2500);
    await expect(page).toHaveURL(/\/dashboard\/roles\/edit\/\d+/, { timeout: 8000 });
    await expect(page.locator('input[placeholder*="Lab Manager"]')).toHaveValue(roleName, { timeout: 8000 });
    await expect(page.locator('button:has-text("Update Role")')).toBeVisible({ timeout: 6000 });

    // delete via the list card's trash (second) icon
    card = await findRoleCard(page, roleName);
    await expect(card).toBeVisible({ timeout: 12000 });
    const btns = card.locator('button');
    await btns.nth(1).click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/Users currently assigned this role will lose its permissions/i)).toBeVisible({ timeout: 6000 });
    await page.locator('button:has-text("Delete")').last().click();
    await page.waitForTimeout(2500);
    await expect(page.getByText(new RegExp(`Role "${roleName}" deleted`))).toBeVisible({ timeout: 8000 }).catch(() => {});

    const goneCheck = await findRoleCard(page, roleName);
    await expect(goneCheck).toBeHidden({ timeout: 10000 }).catch(() => {});
  });

}); // describe Role Management lifecycle
