import { Page, BrowserContext, expect } from '@playwright/test';
import { loginAs, stubStimulsoft } from './commands';

export class ModuleTestBase {
  page: Page;
  context: BrowserContext;
  env: Record<string, string>;
  labName: string;

  constructor(page: Page, context: BrowserContext, labName: string = 'Arbro - Delhi') {
    this.page = page;
    this.context = context;
    // Use process.env as fallback; will be overridden by test fixtures if available
    this.env = (global as any).__testEnv__ || process.env as Record<string, string>;
    this.labName = labName;
  }

  async setup(roleKey: string = 'master_personel') {
    await stubStimulsoft(this.context);
    await loginAs(this.page, this.context, roleKey, this.env, this.labName);
  }

  async navigateTo(moduleUrl: string, timeout: number = 20000) {
    await this.page.goto(moduleUrl, { waitUntil: 'domcontentloaded', timeout });
    await this.page.waitForTimeout(300);
  }

  async isPageAccessible(): Promise<boolean> {
    const text = await this.page.locator('body').textContent() || '';
    return !text.includes('403') && text.length > 50;
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForElement(selector: string, timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async clickElement(selector: string) {
    const locator = this.page.locator(selector).first();
    await locator.click();
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async getInputValue(selector: string): Promise<string> {
    return await this.page.inputValue(selector);
  }

  async selectDropdown(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async getTableRowCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }

  async searchInTable(searchTerm: string, searchSelector: string = 'input[placeholder*="Search"], input[type="search"]') {
    const searchInput = this.page.locator(searchSelector).first();
    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500);
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).first().isVisible().catch(() => false);
  }

  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).first().textContent() || '';
  }

  async expectElementVisible(selector: string, message?: string) {
    const isVisible = await this.isElementVisible(selector);
    expect(isVisible).toBe(true);
  }

  async expectElementHidden(selector: string, message?: string) {
    const isVisible = await this.isElementVisible(selector);
    expect(isVisible).toBe(false);
  }

  async getErrorMessage(): Promise<string> {
    const errorSelectors = [
      '.error-message',
      '.alert-danger',
      '.alert-error',
      '[role="alert"]',
      '.form-error',
      '.invalid-feedback',
    ];

    for (const selector of errorSelectors) {
      const text = await this.getElementText(selector);
      if (text) return text;
    }
    return '';
  }

  async clearAllSessions() {
    await this.context.clearCookies();
  }
}
