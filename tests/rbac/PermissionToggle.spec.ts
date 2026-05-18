import { test, expect } from '../global-setup';
import { loginAs, freshLoginAs, stubStimulsoft } from '../helpers/commands';
import { AdminRolePage } from '../helpers/AdminRolePage';

// ═══════════════════════════════════════════════════════════════════════════════
// Dynamic Permissions — Toggle Spec
// Verifies that admin-applied permission changes are immediately reflected
// for the affected role user.
// ═══════════════════════════════════════════════════════════════════════════════

const LAB = 'Arbro - Delhi';

test.describe('Dynamic Permissions — Toggle Flow', () => {

  test.beforeEach(async ({ context }) => {
    await stubStimulsoft(context);
  });

  test('Scenario 1 — Grant access to Price List for Reception', async ({ page, context, env }) => {
    const adminRolePage = new AdminRolePage(page);

    // 1. Admin grants access
    await loginAs(page, context, 'admin', env, LAB);
    await adminRolePage.grant('Reception', 'Sample Management', 'Price List', { view: true });

    // 2. Role user verifies access
    await freshLoginAs(page, context, 'reception', env, LAB);
    await page.goto('/dashboard/price-list', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/price-list/);

    // 3. Cleanup: Admin revokes access
    await loginAs(page, context, 'admin', env, LAB);
    await adminRolePage.revoke('Reception', 'Sample Management', 'Price List');
  });

  test('Scenario 2 — Revoke Mailer CREATE permission from Reception', async ({ page, context, env }) => {
    const adminRolePage = new AdminRolePage(page);

    // 1. Admin revokes CREATE
    await loginAs(page, context, 'admin', env, LAB);
    await adminRolePage.updatePermissions('Reception', 'Mailer', { create: false });

    // 2. Role user verifies restriction
    await freshLoginAs(page, context, 'reception', env, LAB);
    await page.goto('/dashboard/mail/inbox', { waitUntil: 'domcontentloaded' });
    
    // Logic: if button exists, it should be disabled; or it should be hidden
    const createBtn = page.getByRole('button', { name: /Add|Create|New/i }).first();
    const count = await createBtn.count();
    if (count > 0) {
      const isDisabled = await createBtn.isDisabled();
      if (!isDisabled) {
          // If not disabled, maybe it's hidden from view
          await expect(createBtn).not.toBeVisible();
      }
    }

    // 3. Cleanup: Admin restores CREATE
    await loginAs(page, context, 'admin', env, LAB);
    await adminRolePage.updatePermissions('Reception', 'Mailer', { create: true });
  });
});
