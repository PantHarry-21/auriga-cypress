import { Page, expect } from '@playwright/test';

export class FormHelper {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openCreateForm(buttonSelectors: string[] = ['button:has-text("New")', 'button:has-text("Add")', 'button:has-text("Create")']) {
    for (const selector of buttonSelectors) {
      const btn = this.page.locator(selector).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await this.page.waitForTimeout(800);
        return true;
      }
    }
    return false;
  }

  async fillFormField(fieldSelector: string, value: string, fieldType: 'text' | 'email' | 'number' | 'date' | 'select' = 'text') {
    const field = this.page.locator(fieldSelector).first();

    if (fieldType === 'select') {
      await field.selectOption(value);
    } else if (fieldType === 'date') {
      await field.fill(value);
    } else {
      await field.clear();
      await field.fill(value);
    }

    await this.page.waitForTimeout(300);
  }

  async fillFormFields(fields: Record<string, string>) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.fillFormField(selector, value);
    }
  }

  async submitForm(submitButtonSelector: string = 'button[type="submit"], button:has-text("Save"), button:has-text("Submit")') {
    const submitBtn = this.page.locator(submitButtonSelector).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  async cancelForm(cancelButtonSelector: string = 'button:has-text("Cancel"), button:has-text("Close")') {
    const cancelBtn = this.page.locator(cancelButtonSelector).first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  async getValidationError(): Promise<string> {
    const errorSelectors = [
      '.error-message',
      '.validation-error',
      '.invalid-feedback',
      '[class*="error"]',
      'span[class*="error"]',
    ];

    for (const selector of errorSelectors) {
      try {
        const text = await this.page.locator(selector).first().textContent();
        if (text && text.trim()) return text.trim();
      } catch {}
    }
    return '';
  }

  async expectValidationError(expectedError: string) {
    const actualError = await this.getValidationError();
    expect(actualError.toLowerCase()).toContain(expectedError.toLowerCase());
  }

  async openEditForm(rowSelector: string = 'table tbody tr:first-child') {
    const editBtn = this.page.locator(rowSelector).locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await this.page.waitForTimeout(800);
      return true;
    }
    return false;
  }

  async deleteItem(rowSelector: string = 'table tbody tr:first-child') {
    const deleteBtn = this.page.locator(rowSelector).locator('button:has-text("Delete"), a:has-text("Delete")').first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await this.page.waitForTimeout(500);

      // Handle confirmation dialog
      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await this.page.waitForTimeout(1000);
      }
      return true;
    }
    return false;
  }

  async getFormFieldValue(fieldSelector: string): Promise<string> {
    try {
      const value = await this.page.inputValue(fieldSelector);
      return value || '';
    } catch {
      return '';
    }
  }

  async isFieldRequired(fieldSelector: string): Promise<boolean> {
    const field = this.page.locator(fieldSelector).first();
    const required = await field.getAttribute('required');
    return required !== null;
  }

  async clearForm(formSelector: string = 'form') {
    const inputs = this.page.locator(`${formSelector} input[type="text"], ${formSelector} textarea`);
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }
  }

  async isCreateButtonVisible(): Promise<boolean> {
    const selectors = ['button:has-text("New")', 'button:has-text("Add")', 'button:has-text("Create")'];
    for (const selector of selectors) {
      if (await this.page.locator(selector).first().isVisible().catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  async isEditButtonVisible(): Promise<boolean> {
    return await this.page.locator('button:has-text("Edit"), a:has-text("Edit")').first().isVisible().catch(() => false);
  }

  async isDeleteButtonVisible(): Promise<boolean> {
    return await this.page.locator('button:has-text("Delete"), a:has-text("Delete")').first().isVisible().catch(() => false);
  }

  async isApproveButtonVisible(): Promise<boolean> {
    return await this.page.locator('button:has-text("Approve"), button:has-text("Accept")').first().isVisible().catch(() => false);
  }

  async waitForFormToLoad(timeout: number = 5000) {
    await this.page.waitForSelector('form, [role="dialog"] form', { timeout }).catch(() => {});
  }
}
