// tests/helpers/PageObjects.ts
//
// Page object classes for all YLIMS modules (Playwright version).
// Provides abstraction layer for all module interactions.
//

import { expect, Page } from '@playwright/test';
import { YLIMS_SELECTORS } from './selectors';

// ═══════════════════════════════════════════════════════════════════════════
// BASE PAGE OBJECT — Abstract parent class for common operations
// ═══════════════════════════════════════════════════════════════════════════

export class BasePage {
  readonly page: Page;
  readonly selectors: any;

  constructor(page: Page, selectorKey: string) {
    this.page = page;
    this.selectors = YLIMS_SELECTORS[selectorKey as keyof typeof YLIMS_SELECTORS] || {};
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(1000);
  }

  async waitForPageLoad() {
    await expect(this.page.locator('body')).not.toContainText('404', { timeout: 30000 });
    await this.page.waitForTimeout(1500);
  }

  async clickButton(selector: string) {
    await this.page.locator(selector).first().click({ force: true, timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async fillInput(selector: string, value: string) {
    const locator = this.page.locator(selector).first();
    await locator.scrollIntoViewIfNeeded();
    await locator.clear();
    await locator.fill(value);
    await this.page.waitForTimeout(300);
  }

  async selectDropdown(selector: string, value: string) {
    const locator = this.page.locator(selector).first();
    await locator.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator(`[role="option"]:has-text("${value}"), li:has-text("${value}")`).first().click();
    await this.page.waitForTimeout(300);
  }

  async search(searchValue: string) {
    await this.fillInput(this.selectors.searchInput, searchValue);
    await this.clickButton(this.selectors.searchButton);
    await this.page.waitForTimeout(2000);
  }

  async getTableRowCount(): Promise<number> {
    return await this.page.locator(this.selectors.tableRow).count();
  }

  async getFirstRowText(): Promise<string> {
    return await this.page.locator(this.selectors.firstRow).innerText();
  }

  async clickFirstRowEdit() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.editButton).first().click({ force: true, timeout: 10000 });
    await this.page.waitForTimeout(2000);
  }

  async clickNewButton() {
    await this.clickButton(this.selectors.newButton);
    await this.page.waitForTimeout(1500);
  }

  async clickSaveButton() {
    await this.clickButton(this.selectors.saveButton);
    await this.page.waitForTimeout(2000);
  }

  async clickUpdateButton() {
    if (this.selectors.updateButton) {
      await this.clickButton(this.selectors.updateButton);
      await this.page.waitForTimeout(2000);
    }
  }

  async waitForSuccessMessage() {
    await expect(this.page.locator(YLIMS_SELECTORS.common.successMessage)).toBeVisible({ timeout: 15000 });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `playwright-report/screenshots/${name}.png` });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC MASTER PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class GenericMasterPage extends BasePage {
  constructor(page: Page) {
    super(page, 'genericMaster');
  }

  async navigate() {
    await this.goto('/dashboard/products/generic-master');
    await this.waitForPageLoad();
  }

  async createNewEntry(name: string, description?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.nameInput, name);
    if (description && this.selectors.descriptionInput) {
      await this.fillInput(this.selectors.descriptionInput, description);
    }
    await this.clickSaveButton();
    await this.waitForSuccessMessage();
  }

  async submitForReview() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }

  async editFirstEntry(newName: string, newDescription?: string) {
    await this.clickFirstRowEdit();
    await this.fillInput(this.selectors.nameInput, newName);
    if (newDescription && this.selectors.descriptionInput) {
      await this.fillInput(this.selectors.descriptionInput, newDescription);
    }
    await this.clickUpdateButton();
    await this.page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT MASTER PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class ProductMasterPage extends BasePage {
  constructor(page: Page) {
    super(page, 'productMaster');
  }

  async navigate() {
    await this.goto('/dashboard/products/master');
    await this.waitForPageLoad();
  }

  async createNewProduct(brandName: string, category?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.nameInput, brandName);
    if (category && this.selectors.categorySelect) {
      await this.selectDropdown(this.selectors.categorySelect, category);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async searchProduct(productName: string) {
    await this.search(productName);
  }

  async editFirstProduct() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async getProductCount(): Promise<number> {
    return await this.getTableRowCount();
  }

  async verifyProductsDisplayed(): Promise<boolean> {
    const count = await this.getProductCount();
    return count > 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARAMETER MASTER PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class ParameterMasterPage extends BasePage {
  constructor(page: Page) {
    super(page, 'parameterMaster');
  }

  async navigate() {
    await this.goto('/dashboard/testing/analyt-master-v2');
    await this.waitForPageLoad();
  }

  async createNewParameter(parameterName: string, unit?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.parameterNameInput, parameterName);
    if (unit && this.selectors.unitInput) {
      await this.fillInput(this.selectors.unitInput, unit);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async searchParameter(paramName: string) {
    await this.search(paramName);
  }

  async editFirstParameter() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async submitFirstParameterForReview() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STP MASTER PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class StpMasterPage extends BasePage {
  constructor(page: Page) {
    super(page, 'stpMaster');
  }

  async navigate() {
    await this.goto('/dashboard/testing/stp-master');
    await this.waitForPageLoad();
  }

  async createNewStp(stpName: string, description?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.stpNameInput, stpName);
    if (description && this.selectors.descriptionInput) {
      await this.fillInput(this.selectors.descriptionInput, description);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async submitForReview() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }

  async searchStp(stpName: string) {
    await this.search(stpName);
  }

  async editFirstStp() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async approveFirstStp() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STP GROUP PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class StpGroupPage extends BasePage {
  constructor(page: Page) {
    super(page, 'stpGroup');
  }

  async navigate() {
    await this.goto('/dashboard/testing/stp-groups');
    await this.waitForPageLoad();
  }

  async createNewGroup(groupName: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.groupNameInput, groupName);
    // Select some STPs
    const checkboxes = this.page.locator(this.selectors.stpCheckboxes);
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async searchGroup(groupName: string) {
    await this.search(groupName);
  }

  async editFirstGroup() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async submitForReview() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE PROFILE PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class EmployeeProfilePage extends BasePage {
  constructor(page: Page) {
    super(page, 'employeeProfile');
  }

  async navigate() {
    await this.goto('/dashboard/profile/employee');
    await this.waitForPageLoad();
  }

  async createNewEmployee(name: string, email: string, department?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.nameInput, name);
    await this.fillInput(this.selectors.emailInput, email);
    if (department && this.selectors.departmentSelect) {
      await this.selectDropdown(this.selectors.departmentSelect, department);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async searchEmployee(name: string) {
    await this.search(name);
  }

  async editFirstEmployee() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async getEmployeeCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// METHOD DEVELOPMENT PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class MethodDevelopmentPage extends BasePage {
  constructor(page: Page) {
    super(page, 'methodDevelopment');
  }

  async navigate() {
    await this.goto('/dashboard/method/development');
    await this.waitForPageLoad();
  }

  async createNewMethod(methodName: string, description?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.methodNameInput, methodName);
    if (description && this.selectors.descriptionInput) {
      await this.fillInput(this.selectors.descriptionInput, description);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async submitForReview() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }

  async searchMethod(methodName: string) {
    await this.search(methodName);
  }

  async editFirstMethod() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async approveFirstMethod() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// METHOD UPLOAD PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class MethodUploadPage extends BasePage {
  constructor(page: Page) {
    super(page, 'methodUpload');
  }

  async navigate() {
    await this.goto('/dashboard/method/method-upload');
    await this.waitForPageLoad();
  }

  async uploadMethod(filePath: string, documentName?: string) {
    await this.clickNewButton();
    if (documentName && this.selectors.documentNameInput) {
      await this.fillInput(this.selectors.documentNameInput, documentName);
    }
    await this.page.locator(this.selectors.fileInput).setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
    await this.clickButton(this.selectors.uploadButton);
    await this.page.waitForTimeout(2000);
  }

  async searchUpload(name: string) {
    await this.search(name);
  }

  async getUploadCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// METHOD VALIDATION UPLOAD PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class MethodValidationUploadPage extends BasePage {
  constructor(page: Page) {
    super(page, 'methodValidationUpload');
  }

  async navigate() {
    await this.goto('/dashboard/method/validation-upload');
    await this.waitForPageLoad();
  }

  async uploadValidation(filePath: string, documentName?: string) {
    await this.clickNewButton();
    if (documentName && this.selectors.documentNameInput) {
      await this.fillInput(this.selectors.documentNameInput, documentName);
    }
    await this.page.locator(this.selectors.fileInput).setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
    await this.clickButton(this.selectors.uploadButton);
    await this.page.waitForTimeout(2000);
  }

  async searchValidation(name: string) {
    await this.search(name);
  }

  async getValidationCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INDENT MANAGEMENT PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class IndentManagementPage extends BasePage {
  constructor(page: Page) {
    super(page, 'indentManagement');
  }

  async navigate() {
    await this.goto('/dashboard/purchase/indent');
    await this.waitForPageLoad();
  }

  async createNewIndent(indentName: string, quantity?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.indentNumberInput, indentName);
    if (quantity && this.selectors.quantityInput) {
      await this.fillInput(this.selectors.quantityInput, quantity);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async generateIndent() {
    await this.clickButton(this.selectors.generateButton);
    await this.page.waitForTimeout(2000);
  }

  async approveFirstIndent() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async searchIndent(indentName: string) {
    await this.search(indentName);
  }

  async getIndentCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN INDENT PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class AdminIndentPage extends BasePage {
  constructor(page: Page) {
    super(page, 'adminIndent');
  }

  async navigate() {
    await this.goto('/dashboard/purchase/admin-indent');
    await this.waitForPageLoad();
  }

  async approveFirstIndent() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async rejectFirstIndent() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.rejectButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async viewFirstIndent() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.viewButton).first().click({ force: true });
    await this.page.waitForTimeout(1500);
  }

  async searchIndent(indentName: string) {
    await this.search(indentName);
  }

  async getIndentCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT QUOTATION PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class ClientQuotationPage extends BasePage {
  constructor(page: Page) {
    super(page, 'clientQuotation');
  }

  async navigate() {
    await this.goto('/dashboard/quotation/client');
    await this.waitForPageLoad();
  }

  async createNewQuotation(clientName: string, quotationNumber?: string) {
    await this.clickNewButton();
    await this.fillInput(this.selectors.clientNameInput, clientName);
    if (quotationNumber && this.selectors.quotationNumberInput) {
      await this.fillInput(this.selectors.quotationNumberInput, quotationNumber);
    }
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async submitQuotation() {
    await this.clickButton(this.selectors.submitButton);
    await this.page.waitForTimeout(2000);
  }

  async approveFirstQuotation() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.approveButton).first().click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async editFirstQuotation() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async searchQuotation(clientName: string) {
    await this.search(clientName);
  }

  async getQuotationCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEGMENTATION SERVICES PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class SegmentationServicesPage extends BasePage {
  constructor(page: Page) {
    super(page, 'segmentationServices');
  }

  async navigate() {
    await this.goto('/dashboard/administration/segmentation-services');
    await this.waitForPageLoad();
  }

  tierRowLocator(tier: string) {
    return this.page.locator(this.selectors.tierRow(tier));
  }

  toggleLocator(tier: string, columnIndex: number) {
    return this.tierRowLocator(tier).locator(this.selectors.toggleButtons).nth(columnIndex);
  }

  async isToggleChecked(tier: string, columnIndex: number): Promise<boolean> {
    return (await this.toggleLocator(tier, columnIndex).getAttribute('aria-checked')) === 'true';
  }

  async clickToggle(tier: string, columnIndex: number) {
    await this.toggleLocator(tier, columnIndex).click({ force: true });
    await this.page.waitForTimeout(300);
  }

  async clickUpdateAll() {
    await this.clickButton(this.selectors.updateAllButton);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT PRODUCT PRICING PAGE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class ClientProductPricingPage extends BasePage {
  constructor(page: Page) {
    super(page, 'clientProductPricing');
  }

  async navigate() {
    await this.goto('/dashboard/client-product-pricing');
    await this.waitForPageLoad();
  }

  async createNewPricing(client: string, product: string, price: string) {
    await this.clickNewButton();
    await this.selectDropdown(this.selectors.clientSelect, client);
    await this.selectDropdown(this.selectors.productSelect, product);
    await this.fillInput(this.selectors.priceInput, price);
    await this.clickSaveButton();
    await this.page.waitForTimeout(2000);
  }

  async editFirstPricing() {
    await this.clickFirstRowEdit();
    await this.page.waitForTimeout(1500);
  }

  async deleteFirstPricing() {
    await this.page.locator(this.selectors.firstRow).locator(this.selectors.deleteButton).first().click({ force: true });
    await this.page.waitForTimeout(1500);
  }

  async searchPricing(clientName: string) {
    await this.search(clientName);
  }

  async getPricingCount(): Promise<number> {
    return await this.getTableRowCount();
  }
}
