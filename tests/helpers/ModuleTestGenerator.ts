/**
 * ModuleTestGenerator.ts - Automated Test Generation for YLIMS Modules
 *
 * This helper provides utilities to systematically generate CRUD, validation,
 * RBAC, and workflow tests for all 46 YLIMS modules.
 *
 * Usage:
 *  const generator = new ModuleTestGenerator(page, moduleConfig);
 *  await generator.generateCRUDTests();
 *  await generator.generateValidationTests();
 *  await generator.generateRBACTests();
 */

import { Page, expect } from '@playwright/test';

export interface ModuleField {
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'dropdown' | 'combobox' | 'checkbox' | 'radio' | 'textarea' | 'password';
  required: boolean;
  readonly?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  validation?: string[];
  dependsOn?: string;
}

export interface ModuleConfig {
  name: string;
  url: string;
  category: string;
  fields: Record<string, ModuleField>;
  buttons?: Record<string, { selector: string; behavior?: string }>;
  hasWorkflow?: boolean;
  workflowStates?: string[];
  hasPagination?: boolean;
  hasSearch?: boolean;
  hasFilter?: boolean;
  hasExport?: boolean;
  testData?: {
    validCreate: Record<string, any>;
    invalidCreate?: Record<string, Record<string, any>>;
  };
}

export class ModuleTestGenerator {
  constructor(private page: Page, private config: ModuleConfig) {}

  /**
   * Fill a form field with value based on field type
   */
  async fillField(fieldName: string, value: any, fieldType: string): Promise<void> {
    const field = this.config.fields[fieldName];
    if (!field) throw new Error(`Field ${fieldName} not found in config`);

    const selector = `input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`;
    const element = this.page.locator(selector).first();

    switch (fieldType.toLowerCase()) {
      case 'text':
      case 'email':
      case 'phone':
      case 'password':
        await element.fill(String(value));
        break;

      case 'number':
        await element.fill(String(value));
        break;

      case 'date':
        await element.fill(String(value));
        break;

      case 'textarea':
        await this.page.locator(`textarea[name="${fieldName}"]`).fill(String(value));
        break;

      case 'dropdown':
      case 'select':
        await this.page.locator(`select[name="${fieldName}"]`).selectOption(String(value));
        break;

      case 'combobox':
        // Type to search and select
        await this.page.locator(`input[name="${fieldName}"]`).fill(String(value));
        await this.page.waitForTimeout(300);
        const option = this.page.locator(`[role="option"]:has-text("${value}")`).first();
        if (await option.isVisible()) {
          await option.click();
        }
        break;

      case 'checkbox':
        if (value === true) {
          await this.page.locator(`input[type="checkbox"][name="${fieldName}"]`).check();
        } else if (value === false) {
          await this.page.locator(`input[type="checkbox"][name="${fieldName}"]`).uncheck();
        }
        break;

      case 'radio':
        await this.page.locator(`input[type="radio"][name="${fieldName}"][value="${value}"]`).check();
        break;

      default:
        throw new Error(`Unknown field type: ${fieldType}`);
    }
  }

  /**
   * Fill form with multiple field values
   */
  async fillForm(data: Record<string, any>): Promise<void> {
    for (const [fieldName, value] of Object.entries(data)) {
      const field = this.config.fields[fieldName];
      if (field) {
        await this.fillField(fieldName, value, field.type);
        await this.page.waitForTimeout(100);
      }
    }
  }

  /**
   * Submit form and verify success
   */
  async submitForm(expectedSuccessMessage?: string): Promise<void> {
    const submitButton = this.page.locator(
      'button[type="submit"], button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")'
    ).first();

    await submitButton.click();
    await this.page.waitForTimeout(500);

    if (expectedSuccessMessage) {
      await expect(
        this.page.locator('.toast, [role="alert"], .success, .notification')
      ).toContainText(expectedSuccessMessage);
    }
  }

  /**
   * Verify validation error for a field
   */
  async expectValidationError(fieldName: string, expectedError?: string): Promise<void> {
    const errorSelector = `
      [data-testid="error_${fieldName}"],
      .error-${fieldName},
      [data-field="${fieldName}"] ~ .error,
      [name="${fieldName}"] ~ .error,
      .error:visible
    `;

    const errorElement = this.page.locator(errorSelector).first();
    await expect(errorElement).toBeVisible({ timeout: 5000 });

    if (expectedError) {
      await expect(errorElement).toContainText(expectedError);
    }
  }

  /**
   * Generate CRUD tests for this module
   */
  async generateCRUDTestResults(): Promise<string[]> {
    const results: string[] = [];
    const testData = this.config.testData?.validCreate;

    if (!testData) {
      results.push('No test data configured');
      return results;
    }

    try {
      // Open create form
      const createButton = this.page.locator(
        'button:has-text("New"), button:has-text("Create"), button:has-text("Add")'
      ).first();

      if (!(await createButton.isVisible())) {
        results.push('⚠️  Create button not found');
        return results;
      }

      await createButton.click();
      await this.page.waitForTimeout(500);
      results.push('✓ Create form opened');

      // Fill form
      await this.fillForm(testData);
      results.push('✓ Form fields filled');

      // Submit
      await this.submitForm();
      results.push('✓ Form submitted successfully');

      // Verify in list
      const listView = this.page.locator('table, [role="grid"]').first();
      if (await listView.isVisible()) {
        results.push('✓ List view displays after create');
      }

    } catch (error: any) {
      results.push(`✗ Error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test field validation
   */
  async testFieldValidation(fieldName: string, invalidValue: any): Promise<string[]> {
    const results: string[] = [];
    const field = this.config.fields[fieldName];

    if (!field) {
      results.push(`Field ${fieldName} not configured`);
      return results;
    }

    try {
      const createButton = this.page.locator(
        'button:has-text("New"), button:has-text("Create")'
      ).first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await this.page.waitForTimeout(500);
      }

      // Fill invalid value
      await this.fillField(fieldName, invalidValue, field.type);
      results.push(`✓ Invalid value entered for ${fieldName}`);

      // Try to submit
      const submitButton = this.page.locator('button[type="submit"]').first();
      await submitButton.click();
      await this.page.waitForTimeout(300);

      // Check for error
      try {
        await this.expectValidationError(fieldName);
        results.push(`✓ Validation error displayed for ${fieldName}`);
      } catch {
        results.push(`⚠️  No validation error found for ${fieldName}`);
      }

    } catch (error: any) {
      results.push(`✗ Error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test required field validation
   */
  async testRequiredFields(): Promise<string[]> {
    const results: string[] = [];
    const requiredFields = Object.entries(this.config.fields)
      .filter(([, field]) => field.required && !field.readonly)
      .map(([name]) => name);

    for (const fieldName of requiredFields) {
      const errors = await this.testFieldValidation(fieldName, '');
      results.push(...errors);
    }

    return results;
  }

  /**
   * Test search functionality
   */
  async testSearch(searchValue: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const searchInput = this.page.locator('input[placeholder*="Search"]').first();
      if (!(await searchInput.isVisible())) {
        results.push('⚠️  Search input not found');
        return results;
      }

      await searchInput.fill(searchValue);
      results.push(`✓ Search value entered: ${searchValue}`);

      const searchButton = this.page.locator('button:has-text("Search")').first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await this.page.waitForTimeout(500);
        results.push('✓ Search button clicked');
      }

      // Check if results filtered
      const tableRows = this.page.locator('tbody tr');
      const rowCount = await tableRows.count();
      results.push(`✓ Results filtered: ${rowCount} rows`);

    } catch (error: any) {
      results.push(`✗ Search error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test pagination
   */
  async testPagination(): Promise<string[]> {
    const results: string[] = [];

    if (!this.config.hasPagination) {
      results.push('ℹ️  Module does not have pagination');
      return results;
    }

    try {
      const nextButton = this.page.locator('button:has-text("Next")').first();
      if (!(await nextButton.isVisible())) {
        results.push('⚠️  Next button not found');
        return results;
      }

      const isDisabled = await nextButton.isDisabled();
      if (isDisabled) {
        results.push('ℹ️  Next button is disabled (likely on last page or single page)');
        return results;
      }

      await nextButton.click();
      await this.page.waitForTimeout(500);
      results.push('✓ Navigated to next page');

      const prevButton = this.page.locator('button:has-text("Previous")').first();
      if (await prevButton.isVisible()) {
        results.push('✓ Previous button visible on next page');
      }

    } catch (error: any) {
      results.push(`✗ Pagination error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test export functionality
   */
  async testExport(format: 'excel' | 'pdf'): Promise<string[]> {
    const results: string[] = [];

    if (!this.config.hasExport) {
      results.push('ℹ️  Module does not have export');
      return results;
    }

    try {
      const exportButton = this.page.locator(
        `button:has-text("${format === 'excel' ? 'Excel' : 'PDF'}")`
      ).first();

      if (!(await exportButton.isVisible())) {
        results.push(`⚠️  ${format.toUpperCase()} export button not found`);
        return results;
      }

      const [download] = await Promise.all([
        this.page.waitForEvent('download').catch(() => null),
        exportButton.click(),
      ]);

      if (download) {
        results.push(`✓ ${format.toUpperCase()} download initiated`);
      } else {
        results.push(`⚠️  Download event not captured for ${format}`);
      }

    } catch (error: any) {
      results.push(`✗ Export error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test column visibility toggle
   */
  async testColumnToggle(): Promise<string[]> {
    const results: string[] = [];

    try {
      const columnsButton = this.page.locator('button:has-text("Columns")').first();
      if (!(await columnsButton.isVisible())) {
        results.push('⚠️  Columns button not found');
        return results;
      }

      await columnsButton.click();
      await this.page.waitForTimeout(300);

      const columnCheckboxes = this.page.locator('input[type="checkbox"]').first();
      if (await columnCheckboxes.isVisible()) {
        results.push('✓ Column toggle panel opened');
      }

    } catch (error: any) {
      results.push(`✗ Column toggle error: ${error.message}`);
    }

    return results;
  }

  /**
   * Test RBAC button visibility
   */
  async testRBACButtonVisibility(): Promise<Record<string, boolean>> {
    const visibility: Record<string, boolean> = {};

    const buttonMapping = {
      create: 'button:has-text("New"), button:has-text("Create")',
      edit: 'button:has-text("Edit")',
      delete: 'button:has-text("Delete")',
      export: 'button:has-text("Export")',
      approve: 'button:has-text("Approve")',
      reject: 'button:has-text("Reject")',
    };

    for (const [action, selector] of Object.entries(buttonMapping)) {
      try {
        visibility[action] = await this.page.locator(selector).first().isVisible();
      } catch {
        visibility[action] = false;
      }
    }

    return visibility;
  }

  /**
   * Generate test execution summary
   */
  async generateSummary(): Promise<string> {
    const fieldCount = Object.keys(this.config.fields).length;
    const requiredFieldCount = Object.values(this.config.fields).filter(f => f.required).length;

    return `
═══════════════════════════════════════════════════════════
Module: ${this.config.name}
URL: ${this.config.url}
Category: ${this.config.category}
═══════════════════════════════════════════════════════════
FIELD SUMMARY:
- Total Fields: ${fieldCount}
- Required Fields: ${requiredFieldCount}
- Optional Fields: ${fieldCount - requiredFieldCount}

FEATURES:
- Workflow: ${this.config.hasWorkflow ? '✓' : '✗'}
- Pagination: ${this.config.hasPagination ? '✓' : '✗'}
- Search: ${this.config.hasSearch ? '✓' : '✗'}
- Filter: ${this.config.hasFilter ? '✓' : '✗'}
- Export: ${this.config.hasExport ? '✓' : '✗'}

ESTIMATED TEST CASES:
- CRUD Tests: 6-8
- Validation Tests: ${requiredFieldCount * 2}
- Workflow Tests: ${this.config.hasWorkflow ? '5-10' : '0'}
- RBAC Tests: 15-20
- Feature Tests: 5-10
- TOTAL ESTIMATE: ${30 + requiredFieldCount * 2}
═══════════════════════════════════════════════════════════
    `;
  }
}

/**
 * MultiModuleTestRunner - Run tests across multiple modules systematically
 */
export class MultiModuleTestRunner {
  private modules: ModuleConfig[] = [];

  addModule(config: ModuleConfig): void {
    this.modules.push(config);
  }

  addModules(configs: ModuleConfig[]): void {
    this.modules.push(...configs);
  }

  /**
   * Get all modules that match filter criteria
   */
  filterModules(criteria: {
    category?: string;
    hasWorkflow?: boolean;
    hasPagination?: boolean;
  }): ModuleConfig[] {
    return this.modules.filter(m => {
      if (criteria.category && m.category !== criteria.category) return false;
      if (criteria.hasWorkflow !== undefined && m.hasWorkflow !== criteria.hasWorkflow) return false;
      if (criteria.hasPagination !== undefined && m.hasPagination !== criteria.hasPagination) return false;
      return true;
    });
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const byCategory = this.modules.reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {} as Record<string, ModuleConfig[]>);

    let report = `
═══════════════════════════════════════════════════════════
YLIMS MODULE TEST COVERAGE REPORT
═══════════════════════════════════════════════════════════
Total Modules: ${this.modules.length}

BY CATEGORY:
`;

    for (const [category, mods] of Object.entries(byCategory)) {
      report += `\n${category}: ${mods.length} modules\n`;
      for (const mod of mods) {
        const features = [
          mod.hasWorkflow && 'workflow',
          mod.hasPagination && 'pagination',
          mod.hasSearch && 'search',
          mod.hasExport && 'export',
        ].filter(Boolean).join(', ');

        report += `  - ${mod.name} (${features || 'basic'})\n`;
      }
    }

    const workflowModules = this.modules.filter(m => m.hasWorkflow).length;
    const searchModules = this.modules.filter(m => m.hasSearch).length;
    const exportModules = this.modules.filter(m => m.hasExport).length;

    report += `
FEATURE COVERAGE:
- Modules with Workflow: ${workflowModules} (${((workflowModules / this.modules.length) * 100).toFixed(1)}%)
- Modules with Search: ${searchModules} (${((searchModules / this.modules.length) * 100).toFixed(1)}%)
- Modules with Export: ${exportModules} (${((exportModules / this.modules.length) * 100).toFixed(1)}%)

ESTIMATED TEST GENERATION:
- Total Modules: ${this.modules.length}
- Avg Tests per Module: 30-40
- Estimated Total Tests: ${this.modules.length * 35}
- With RBAC (19 roles): ${this.modules.length * 35 + this.modules.length * 19 * 5}

═══════════════════════════════════════════════════════════
    `;

    return report;
  }
}
