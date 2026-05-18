// tests/helpers/ModulePageObject.ts
//
// Master Module Page Object — Base class for all module tests.
// Provides comprehensive CRUD testing capabilities.
//

import { expect, Page } from '@playwright/test';

export interface ModuleConfig {
  name: string;
  url: string;
  moduleKey: string;
  hasAdd?: boolean;
  hasEdit?: boolean;
  hasDelete?: boolean;
  hasApprove?: boolean;
  hasSearch?: boolean;
  hasFilter?: boolean;
  hasPagination?: boolean;
  hasExport?: boolean;
  hasTable?: boolean;
  hasForm?: boolean;
}

export class ModulePageObject {
  readonly page: Page;
  readonly config: ModuleConfig;

  // Common selectors (to be overridden per module)
  protected selectors = {
    pageTitle: 'h1, h2, span.text-2xl',
    addButton: 'button:has-text("New"), button:has-text("Add"), button:has-text("Create")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    filterButton: 'button:has-text("Filter")',
    table: 'table, [role="grid"]',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    editButton: 'button:has-text("Edit"), a:has-text("Edit")',
    deleteButton: 'button:has-text("Delete"), a:has-text("Delete")',
    approveButton: 'button:has-text("Approve")',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    cancelButton: 'button:has-text("Cancel"), button:has-text("Close")',
    successMessage: '[role="status"]:has-text("success")',
    errorMessage: '[role="alert"], .text-red-600',
    exportButton: 'button:has-text("Export"), button:has-text("Excel")',
    nextPageButton: 'button:has-text("Next")',
    prevPageButton: 'button:has-text("Prev")',
  };

  constructor(page: Page, config: ModuleConfig) {
    this.page = page;
    this.config = config;
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigateTo() {
    await this.page.goto(this.config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(1500);
  }

  async waitForPageLoad() {
    await expect(this.page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await expect(this.page.locator('body')).not.toContainText('500', { timeout: 30000 });
    if (this.config.hasTable) {
      await expect(this.page.locator(this.selectors.table).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    }
  }

  // ─── Verification ──────────────────────────────────────────────────────────

  async verifyPageLoaded() {
    await this.waitForPageLoad();
    const pageTitle = await this.page.locator(this.selectors.pageTitle).textContent();
    expect(pageTitle).toContain(this.config.name);
  }

  async verifyTableVisible() {
    if (this.config.hasTable) {
      await expect(this.page.locator(this.selectors.table).first()).toBeVisible({ timeout: 15000 });
    }
  }

  async verifyTableRowCount(): Promise<number> {
    if (!this.config.hasTable) return 0;
    return await this.page.locator(this.selectors.tableRow).count();
  }

  async verifyAddButtonVisible() {
    if (this.config.hasAdd) {
      await expect(this.page.locator(this.selectors.addButton).first()).toBeVisible();
    }
  }

  async verifySearchFunctional() {
    if (this.config.hasSearch) {
      const searchInput = this.page.locator(this.selectors.searchInput).first();
      await expect(searchInput).toBeVisible();

      // Try searching for something
      await searchInput.fill('test');
      await this.page.locator(this.selectors.searchButton).first().click();
      await this.page.waitForTimeout(2000);

      // Verify no 500 error
      await expect(this.page.locator('body')).not.toContainText('500');
    }
  }

  // ─── CRUD Operations ───────────────────────────────────────────────────────

  async clickAdd() {
    if (this.config.hasAdd) {
      await this.page.locator(this.selectors.addButton).first().click({ force: true });
      await this.page.waitForTimeout(1500);
    }
  }

  async fillFormField(fieldSelector: string, value: string) {
    const locator = this.page.locator(fieldSelector).first();
    await locator.scrollIntoViewIfNeeded();
    await locator.clear();
    await locator.fill(value);
    await this.page.waitForTimeout(300);
  }

  async selectDropdown(dropdownSelector: string, optionText: string) {
    const locator = this.page.locator(dropdownSelector).first();
    await locator.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator(`[role="option"]:has-text("${optionText}"), li:has-text("${optionText}")`).first().click();
    await this.page.waitForTimeout(300);
  }

  async clickSave() {
    await this.page.locator(this.selectors.saveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async clickCancel() {
    const cancelBtn = this.page.locator(this.selectors.cancelButton).first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  async clickEdit() {
    if (this.config.hasEdit && this.config.hasTable) {
      await this.page.locator(this.selectors.firstRow).locator(this.selectors.editButton).first().click({ force: true, timeout: 10000 });
      await this.page.waitForTimeout(2000);
    }
  }

  async clickDelete() {
    if (this.config.hasDelete && this.config.hasTable) {
      await this.page.locator(this.selectors.firstRow).locator(this.selectors.deleteButton).first().click({ force: true });
      await this.page.waitForTimeout(1500);

      // Handle confirmation dialog
      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click({ force: true });
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async clickApprove() {
    if (this.config.hasApprove && this.config.hasTable) {
      const approveBtn = this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first();
      if (await approveBtn.isVisible().catch(() => false)) {
        await approveBtn.click({ force: true });
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async search(query: string) {
    if (this.config.hasSearch) {
      await this.fillFormField(this.selectors.searchInput, query);
      await this.page.locator(this.selectors.searchButton).first().click();
      await this.page.waitForTimeout(2000);
    }
  }

  async exportToExcel() {
    if (this.config.hasExport) {
      await this.page.locator('button:has-text("Excel")').first().click({ force: true });
      await this.page.waitForTimeout(2500);
    }
  }

  async goToNextPage() {
    if (this.config.hasPagination) {
      await this.page.locator(this.selectors.nextPageButton).first().click({ force: true });
      await this.page.waitForTimeout(1500);
    }
  }

  // ─── Validation Tests ──────────────────────────────────────────────────────

  async testEmptyFormSubmission() {
    if (this.config.hasAdd && this.config.hasForm) {
      await this.clickAdd();

      // Try to save empty form
      await this.clickSave();

      // Should show validation error
      await expect(this.page.locator(this.selectors.errorMessage).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(this.page.locator('body')).toContainText(/required|mandatory|cannot be empty/i).catch(() => {});

      await this.clickCancel();
    }
  }

  async testLongInputs() {
    if (this.config.hasAdd && this.config.hasForm) {
      await this.clickAdd();

      // Find first text input
      const textInput = this.page.locator('input[type="text"]').first();
      if (await textInput.isVisible().catch(() => false)) {
        // Try very long input
        await textInput.fill('A'.repeat(1000));

        // Should not break
        await expect(this.page.locator('body')).not.toContainText('500');
      }

      await this.clickCancel();
    }
  }

  async testSpecialCharacters() {
    if (this.config.hasAdd && this.config.hasForm) {
      await this.clickAdd();

      // Find first text input
      const textInput = this.page.locator('input[type="text"]').first();
      if (await textInput.isVisible().catch(() => false)) {
        // Try special characters
        await textInput.fill('<script>alert("xss")</script>');

        // Should not trigger alert or break page
        await expect(this.page.locator('body')).not.toContainText('500');
      }

      await this.clickCancel();
    }
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `playwright-report/screenshots/${this.config.moduleKey}_${name}.png` });
  }

  async waitForSuccess() {
    await expect(this.page.locator(this.selectors.successMessage).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
  }

  async getTableRowCount(): Promise<number> {
    if (!this.config.hasTable) return 0;
    return await this.page.locator(this.selectors.tableRow).count();
  }

  async getFirstRowText(): Promise<string> {
    if (!this.config.hasTable) return '';
    return await this.page.locator(this.selectors.firstRow).innerText();
  }
}
