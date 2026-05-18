import { Page } from '@playwright/test';

export class SelectorHelper {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Find button by text
  async findButton(text: string): Promise<string> {
    const selectors = [
      `button:has-text("${text}")`,
      `a:has-text("${text}")`,
      `[role="button"]:has-text("${text}")`,
    ];

    for (const selector of selectors) {
      if (await this.page.locator(selector).first().isVisible().catch(() => false)) {
        return selector;
      }
    }

    return `button:has-text("${text}")`;
  }

  // Find input by label
  async findInputByLabel(labelText: string): Promise<string> {
    const label = this.page.locator(`label:has-text("${labelText}")`).first();
    const forAttribute = await label.getAttribute('for').catch(() => null);

    if (forAttribute) {
      return `#${forAttribute}`;
    }

    const selector = `label:has-text("${labelText}") ~ input, label:has-text("${labelText}") ~ textarea, label:has-text("${labelText}") + input`;
    return selector;
  }

  // Find all form inputs
  async getAllFormInputs(): Promise<string[]> {
    const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="number"], textarea, select');
    const count = await inputs.count();
    const selectors: string[] = [];

    for (let i = 0; i < count; i++) {
      const name = await inputs.nth(i).getAttribute('name').catch(() => null);
      if (name) {
        selectors.push(`[name="${name}"]`);
      }
    }

    return selectors;
  }

  // Find table cells
  async findTableCell(rowIndex: number, columnIndex: number): Promise<string> {
    return `table tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`;
  }

  // Find element by aria-label
  async findByAriaLabel(label: string): Promise<string> {
    const selector = `[aria-label="${label}"]`;
    if (await this.page.locator(selector).isVisible().catch(() => false)) {
      return selector;
    }
    return '';
  }

  // Find element by placeholder
  async findByPlaceholder(placeholder: string): Promise<string> {
    return `input[placeholder="${placeholder}"], input[placeholder*="${placeholder}"]`;
  }

  // Find dropdown options
  async getDropdownOptions(selectSelector: string): Promise<string[]> {
    const options = this.page.locator(`${selectSelector} option`);
    const count = await options.count();
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      const value = await options.nth(i).textContent();
      if (value) values.push(value.trim());
    }

    return values;
  }

  // Find visible elements of type
  async findVisibleElements(selector: string): Promise<number> {
    return await this.page.locator(selector).filter({ visible: true }).count();
  }

  // Check if element has class
  async hasClass(selector: string, className: string): Promise<boolean> {
    const classes = await this.page.locator(selector).first().getAttribute('class').catch(() => '');
    return classes?.includes(className) || false;
  }

  // Get element's test ID selector
  async getTestIdSelector(testId: string): Promise<string> {
    return `[data-testid="${testId}"]`;
  }

  // Find modal/dialog
  async findModal(): Promise<boolean> {
    const selectors = [
      '[role="dialog"]',
      '.modal',
      '.modal-content',
      '[class*="modal"]',
      '[class*="dialog"]',
    ];

    for (const selector of selectors) {
      if (await this.page.locator(selector).first().isVisible().catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  // Find alert/notification
  async findAlert(): Promise<string | null> {
    const alertSelectors = [
      '[role="alert"]',
      '.alert',
      '.notification',
      '.toast',
      '[class*="alert"]',
      '[class*="notification"]',
    ];

    for (const selector of alertSelectors) {
      const text = await this.page.locator(selector).first().textContent().catch(() => '');
      if (text) return text.trim();
    }
    return null;
  }

  // Find pagination
  async hasPagination(): Promise<boolean> {
    const selectors = [
      '[role="navigation"] a',
      '.pagination',
      '.pager',
      '[class*="pagination"]',
    ];

    for (const selector of selectors) {
      if (await this.page.locator(selector).first().isVisible().catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  // Check if table has data
  async hasTableData(): Promise<boolean> {
    const rowCount = await this.page.locator('table tbody tr').count();
    return rowCount > 0;
  }

  // Get current page URL path
  async getCurrentPath(): Promise<string> {
    return this.page.url().split('?')[0];
  }

  // Find breadcrumb navigation
  async getBreadcrumbs(): Promise<string[]> {
    const breadcrumbs = this.page.locator('[role="navigation"] li, .breadcrumb li, nav li');
    const count = await breadcrumbs.count();
    const items: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await breadcrumbs.nth(i).textContent();
      if (text) items.push(text.trim());
    }

    return items;
  }
}
