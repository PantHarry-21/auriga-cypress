// tests/helpers/AdminRolePage.ts
//
// Page object for Role Management → Edit Role (Playwright version).
//

import { expect, Page } from '@playwright/test';
import { YLIMS_SELECTORS, isChipSelected, isPermissionActive } from './selectors';

const SEL = YLIMS_SELECTORS.roleEdit;
const PERM_IDX: Record<string, number> = SEL.permissionIndices;

export class AdminRolePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateToEdit(roleName: string) {
    await this.page.goto('/dashboard/roles', { waitUntil: 'domcontentloaded', timeout: 120000 });

    // Use search input if present
    const searchInput = this.page.locator('input[placeholder*="earch"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.clear();
      await searchInput.fill(roleName);
      await this.page.waitForTimeout(1000);
    }

    // Find the matching role card and click its first (edit) button
    const roleCard = this.page.locator(`div.p-6.bg-white:has-text("${roleName}")`).first();
    await roleCard.getByRole('button').first().click({ force: true });

    await expect(this.page).toHaveURL(new RegExp('/dashboard/roles/edit/'));
    await this.page.waitForTimeout(1500);
  }

  // ── Step 2: Module Access ─────────────────────────────────────────────────

  async _ensureParentCategoryEnabled(parentGroup: string) {
    const parentLabel = this.page.locator(SEL.parentCategoryLabel(parentGroup)).first();
    await parentLabel.scrollIntoViewIfNeeded();
    
    const checkbox = parentLabel.locator('div.w-5.h-5');
    const classStr = (await checkbox.getAttribute('class')) || '';
    const isChecked = classStr.includes('bg-[#00a6fb]') || classStr.includes('bg-blue');
    
    if (!isChecked) {
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(800);
    }
  }

  async toggleSubModule(parentGroup: string, subModule: string, enable: boolean) {
    await this._ensureParentCategoryEnabled(parentGroup);

    const chip = this.page.locator(SEL.moduleChip(subModule)).first();
    await chip.scrollIntoViewIfNeeded();
    await expect(chip).toBeVisible({ timeout: 10000 });

    const selected = await isChipSelected(chip);

    if (enable && !selected) {
      await chip.click({ force: true });
    } else if (!enable && selected) {
      await chip.click({ force: true });
    }
    await this.page.waitForTimeout(1000);
  }

  // ── Step 3: Set Permissions ──────────────────────────────────────────────

  async setPermissions(subModule: string, permissions: Record<string, boolean>) {
    const row = this.page.locator(SEL.permissionRow(subModule)).first();
    await row.scrollIntoViewIfNeeded();

    for (const [perm, enable] of Object.entries(permissions)) {
      const idx = PERM_IDX[perm.toLowerCase()];
      if (idx === undefined) continue;

      const btn = row.locator(SEL.permissionButton(idx));
      const active = await isPermissionActive(btn);
      
      if ((enable && !active) || (!enable && active)) {
        await btn.click({ force: true });
      }
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async save() {
    const updateBtn = this.page.getByRole('button', { name: /Update Role/i });
    await updateBtn.scrollIntoViewIfNeeded();
    
    if (await updateBtn.isDisabled()) {
      // No changes detected
    } else {
      await updateBtn.click({ force: true });
      await expect(this.page).toHaveURL(new RegExp('/dashboard/roles'), { timeout: 30000 });
    }
  }

  // ── Combined convenience methods ─────────────────────────────────────────

  async grant(roleName: string, parentGroup: string, subModule: string, permissions: Record<string, boolean> = { view: true }) {
    await this.navigateToEdit(roleName);
    await this.toggleSubModule(parentGroup, subModule, true);
    await this.setPermissions(subModule, permissions);
    await this.save();
  }

  async revoke(roleName: string, parentGroup: string, subModule: string) {
    await this.navigateToEdit(roleName);
    await this.toggleSubModule(parentGroup, subModule, false);
    await this.save();
  }

  async updatePermissions(roleName: string, subModule: string, permissions: Record<string, boolean>) {
    await this.navigateToEdit(roleName);
    await this.setPermissions(subModule, permissions);
    await this.save();
  }
}
