/**
 * Generic Master Module - Selector Registry
 *
 * This file centralizes all selectors used in Generic Master module tests.
 * Using a selector registry improves maintainability and reduces duplication.
 *
 * Selector Priority (most specific to least specific):
 * 1. [data-testid="..."]        - Most stable, requires frontend support
 * 2. [aria-label="..."]         - Accessible elements
 * 3. [name="..."] or [id="..."] - Form elements
 * 4. button:has-text("...")     - Text-based fallback
 * 5. Generic selectors          - Last resort
 */

export const GENERIC_MASTER_SELECTORS = {
  // ─── Page Elements ─────────────────────────────────────────────────────────
  PAGE: {
    TITLE: 'h1, h2, [class*="title"]',
    SIDEBAR: '[class*="sidebar"], aside, nav',
    NAVIGATION: 'nav, [role="navigation"]',
    MAIN_CONTENT: '[role="main"], main, .main-content',
  },

  // ─── List Operations ──────────────────────────────────────────────────────
  LIST: {
    TABLE: '[data-testid="gm-table"] || table',
    ROWS: 'table tbody tr',
    COLUMN_HEADERS: 'th, [role="columnheader"]',
    SEARCH_INPUT: '[data-testid="gm-search"] || input[placeholder*="Search"]',
    SORTABLE_HEADER: 'th:has-text("Sort"), [role*="sort"]',
    PAGINATION: '[aria-label*="page"], .pagination',
    ITEMS_PER_PAGE: 'select[name*="per_page"], select[name*="limit"]',
    CHECKBOX: 'input[type="checkbox"]',
    BULK_ACTIONS: 'button:has-text("Actions"), button:has-text("Bulk")',
    FILTER_BUTTON: 'button:has-text("Filter")',
    EXPORT_BUTTON: 'button:has-text("Export"), button:has-text("Download")',
  },

  // ─── Create/Edit Form ─────────────────────────────────────────────────────
  FORM: {
    CREATE_BUTTON: '[data-testid="create-button"] || button:has-text("Create") || button:has-text("Add New")',
    CREATE_MODAL: '[role="dialog"], .modal, [class*="modal"]',
    MODAL_TITLE: 'h2, h3, [class*="modal-title"]',

    // Form fields (using name attributes as they're most reliable)
    CODE_FIELD: 'input[name*="code"], input[placeholder*="Code"]',
    NAME_FIELD: 'input[name*="name"], input[placeholder*="Name"]',
    DESCRIPTION_FIELD: 'textarea[name*="description"], textarea[placeholder*="Description"]',
    STATUS_FIELD: 'select[name*="status"]',

    // Generic form methods
    ALL_INPUTS: 'input[type="text"], input[type="email"], input[type="number"], textarea, select',
    REQUIRED_FIELDS: '[required], [aria-required="true"]',

    // Buttons
    SUBMIT_BUTTON: '[data-testid="submit"] || button:has-text("Save"), button:has-text("Create"), button:has-text("Update")',
    CANCEL_BUTTON: 'button:has-text("Cancel"), button:has-text("Close")',
    SAVE_BUTTON: 'button:has-text("Save")',
  },

  // ─── Row Actions ──────────────────────────────────────────────────────────
  ROW_ACTIONS: {
    EDIT_BUTTON: (rowIndex: number) => `table tbody tr:nth-child(${rowIndex}) button[title*="Edit"], table tbody tr:nth-child(${rowIndex}) [data-testid="edit"]`,
    DELETE_BUTTON: (rowIndex: number) => `table tbody tr:nth-child(${rowIndex}) button[title*="Delete"], table tbody tr:nth-child(${rowIndex}) [data-testid="delete"]`,
    VIEW_BUTTON: (rowIndex: number) => `table tbody tr:nth-child(${rowIndex}) button[title*="View"], table tbody tr:nth-child(${rowIndex}) [data-testid="view"]`,
    ACTIONS_MENU: (rowIndex: number) => `table tbody tr:nth-child(${rowIndex}) button[aria-label*="More"], table tbody tr:nth-child(${rowIndex}) button:has-text("...")`,
  },

  // ─── Alerts & Messages ────────────────────────────────────────────────────
  MESSAGES: {
    SUCCESS: '[role="alert"]:has-text("Success"), .alert-success',
    ERROR: '[role="alert"]:has-text("Error"), .alert-danger, [class*="error"]',
    WARNING: '[role="alert"]:has-text("Warning"), .alert-warning',
    INFO: '[role="alert"]:has-text("Info"), .alert-info',
    VALIDATION_ERROR: '.form-error, .invalid-feedback, [class*="error-message"]',
  },

  // ─── Dialog/Modal ─────────────────────────────────────────────────────────
  DIALOG: {
    OVERLAY: '[role="dialog"], .modal-backdrop, [class*="overlay"]',
    CLOSE_BUTTON: 'button[aria-label="Close"], button:has-text("×"), button.close',
    CONFIRM_BUTTON: 'button:has-text("Confirm"), button:has-text("Yes")',
    DELETE_CONFIRM: 'button:has-text("Delete"), button:has-text("Confirm Delete")',
  },
};

/**
 * Helper function to safely get selector with fallbacks
 * Usage: getSelectorChain(['data-testid="gm-search"', 'input[placeholder*="Search"]'])
 */
export function getSelectorChain(...selectors: string[]): string {
  return selectors.filter(s => s.trim()).join(', ');
}

/**
 * Helper function to get row-specific selector
 * Usage: getRowSelector(1, 'edit') returns selector for edit button in row 1
 */
export function getRowSelector(rowIndex: number, action: 'edit' | 'delete' | 'view'): string {
  const actions = {
    edit: ROW_ACTIONS.EDIT_BUTTON,
    delete: ROW_ACTIONS.DELETE_BUTTON,
    view: ROW_ACTIONS.VIEW_BUTTON,
  };
  return actions[action](rowIndex);
}

// Re-export with better naming
export const ROW_ACTIONS = GENERIC_MASTER_SELECTORS.ROW_ACTIONS;
