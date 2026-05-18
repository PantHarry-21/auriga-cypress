// tests/helpers/selectors.ts
//
// Centralized selector definitions for the YLIMS application (Playwright version).
// Enhanced with comprehensive selectors for all 14 modules.
//

export const YLIMS_SELECTORS = {

  // ── Login Page ──────────────────────────────────────────────────────────
  login: {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    signInButton: 'button:has-text("Sign in")',
    locationDropdown: 'div:has-text("Choose your location")',
    locationOption: (name: string) => `span:has-text("${name}")`,
  },

  // ── Role Management — List Page (/dashboard/roles) ─────────────────────
  rolesList: {
    roleCard: (roleName: string) => `div.p-6.bg-white:has-text("${roleName}")`,
    roleIdSpan: (id: string) => `span.text-sm.text-gray-500:has-text("ID: ${id}")`,
    editButton: 'button.p-1\\.5.rounded-lg',
  },

  // ── Role Management — Edit Page (/dashboard/roles/edit/:id) ────────────
  roleEdit: {
    pageHeading: 'h1:has-text("Edit Role"), h2:has-text("Edit Role")',

    // ─── Step 2: Module Access ───────────────────────────────────────
    step2Heading: ':has-text("Module Access")',
    // Parent category container
    parentCategoryLabel: (name: string) => `div.rounded-lg.border:has(span:has-text("${name}"))`,
    // Checkbox container (the blue/gray square)
    parentCategoryCheckbox: (name: string) => `div.rounded-lg.border:has(span:has-text("${name}")) div.w-5.h-5`,
    // Sub-module chips
    moduleChip: (name: string) => `button:has-text("${name}")`,

    // ─── Step 3: Set Permissions ─────────────────────────────────────
    step3Heading: ':has-text("Set Permissions")',
    // Permission row container — it's a TABLE ROW (<tr>)
    permissionRow: (moduleName: string) => `tr:has(span:has-text("${moduleName}"))`,
    // Permission button inside a row (0-based index for View, Create, Update, Delete, Approve)
    permissionButton: (index: number) => `td:nth-child(${index + 2}) button`,

    permissionIndices: {
      view: 0,
      create: 1,
      update: 2,
      delete: 3,
      approve: 4,
    },

    // ─── Save / Update ──────────────────────────────────────────────
    updateButton: 'button:has-text("Update Role")',
  },

  // ── Generic Master Module ──────────────────────────────────────────────
  genericMaster: {
    pageHeading: ':has-text("Generic Master")',
    newButton: 'button:has-text("New Generic Master")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    editLink: 'a:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    submitButton: 'button:has-text("Submit for Review")',
    nameInput: 'input[placeholder*="name"]',
    descriptionInput: 'textarea[placeholder*="description"], input[placeholder*="Description"]',
    successMessage: '[role="status"]:has-text("successfully")',
  },

  // ── Product Master Module ──────────────────────────────────────────────
  productMaster: {
    pageHeading: ':has-text("Product Master"), :has-text("Product")',
    newButton: 'button:has-text("New Product")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    columnsButton: 'button:has-text("Columns")',
    table: 'table.min-w-full, [role="grid"]',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    editIcon: 'button[aria-label*="Edit"], svg[class*="edit"]',
    deleteIcon: 'button[aria-label*="Delete"], svg[class*="delete"]',
    nameInput: 'input[placeholder*="name"], input[placeholder*="Brand"]',
    categorySelect: 'select, [role="combobox"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    updateButton: 'button:has-text("Update")',
  },

  // ── Parameter Master Module ────────────────────────────────────────────
  parameterMaster: {
    pageHeading: ':has-text("Parameter")',
    newButton: 'button:has-text("New Parameter")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    parameterNameInput: 'input[placeholder*="Parameter"], input[placeholder*="parameter"]',
    unitInput: 'input[placeholder*="Unit"], input[placeholder*="unit"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    updateButton: 'button:has-text("Update")',
    submitButton: 'button:has-text("Submit for Review")',
  },

  // ── STP Master Module ──────────────────────────────────────────────────
  stpMaster: {
    pageHeading: ':has-text("STP Master"), :has-text("STP")',
    newButton: 'button:has-text("New STP")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    stpNameInput: 'input[placeholder*="STP"], input[placeholder*="stp"]',
    descriptionInput: 'textarea, input[placeholder*="description"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit for Review")',
    updateButton: 'button:has-text("Update")',
    approveButton: 'button:has-text("Approve")',
  },

  // ── STP Group Module ───────────────────────────────────────────────────
  stpGroup: {
    pageHeading: ':has-text("STP Group")',
    newButton: 'button:has-text("New STP Group")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    groupNameInput: 'input[placeholder*="Group"], input[placeholder*="group"]',
    stpCheckboxes: 'input[type="checkbox"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit for Review")',
    updateButton: 'button:has-text("Update")',
  },

  // ── Employee Profile Module ────────────────────────────────────────────
  employeeProfile: {
    pageHeading: ':has-text("Employee")',
    newButton: 'button:has-text("New Employee"), button:has-text("Add Employee")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    nameInput: 'input[placeholder*="Name"], input[placeholder*="name"]',
    emailInput: 'input[type="email"], input[placeholder*="email"]',
    departmentSelect: 'select, [role="combobox"]',
    roleSelect: 'select, [role="combobox"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    updateButton: 'button:has-text("Update")',
    deleteButton: 'button:has-text("Delete")',
  },

  // ── Method Development Module ──────────────────────────────────────────
  methodDevelopment: {
    pageHeading: ':has-text("Method Development")',
    newButton: 'button:has-text("New Method"), button:has-text("Add Method")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    methodNameInput: 'input[placeholder*="Method"], input[placeholder*="method"]',
    descriptionInput: 'textarea, input[placeholder*="description"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit for Review")',
    updateButton: 'button:has-text("Update")',
    approveButton: 'button:has-text("Approve")',
  },

  // ── Method Upload Module ───────────────────────────────────────────────
  methodUpload: {
    pageHeading: ':has-text("Method Upload")',
    newButton: 'button:has-text("New"), button:has-text("Upload")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    fileInput: 'input[type="file"]',
    uploadButton: 'button:has-text("Upload"), button:has-text("Submit")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    documentNameInput: 'input[placeholder*="Document"], input[placeholder*="document"]',
  },

  // ── Method Validation Upload Module ────────────────────────────────────
  methodValidationUpload: {
    pageHeading: ':has-text("Method Validation")',
    newButton: 'button:has-text("New"), button:has-text("Upload")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    fileInput: 'input[type="file"]',
    uploadButton: 'button:has-text("Upload"), button:has-text("Submit")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    documentNameInput: 'input[placeholder*="Document"], input[placeholder*="document"]',
  },

  // ── Indent Management Module ───────────────────────────────────────────
  indentManagement: {
    pageHeading: ':has-text("Indent")',
    newButton: 'button:has-text("New Indent"), button:has-text("Create Indent")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    indentNumberInput: 'input[placeholder*="Indent"], input[placeholder*="indent"]',
    quantityInput: 'input[placeholder*="Quantity"], input[placeholder*="quantity"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    generateButton: 'button:has-text("Generate Indent")',
    approveButton: 'button:has-text("Approve")',
  },

  // ── Admin Indent Module ────────────────────────────────────────────────
  adminIndent: {
    pageHeading: ':has-text("Admin Indent"), :has-text("Indent")',
    newButton: 'button:has-text("New"), button:has-text("Create")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    approveButton: 'button:has-text("Approve")',
    rejectButton: 'button:has-text("Reject")',
    viewButton: 'button:has-text("View"), a:has-text("View")',
  },

  // ── Client Quotation Module ────────────────────────────────────────────
  clientQuotation: {
    pageHeading: ':has-text("Quotation"), :has-text("Client Quotation")',
    newButton: 'button:has-text("New Quotation"), button:has-text("Add Quotation")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    clientNameInput: 'input[placeholder*="Client"], input[placeholder*="client"]',
    quotationNumberInput: 'input[placeholder*="Quotation"], input[placeholder*="quotation"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit")',
    approveButton: 'button:has-text("Approve")',
    editButton: 'button:has-text("Edit"), a:has-text("Edit")',
  },

  // ── Client Product Pricing Module ──────────────────────────────────────
  clientProductPricing: {
    pageHeading: ':has-text("Product Pricing"), :has-text("Pricing")',
    newButton: 'button:has-text("New"), button:has-text("Add Pricing")',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    clientSelect: 'select, [role="combobox"]',
    productSelect: 'select, [role="combobox"]',
    priceInput: 'input[placeholder*="Price"], input[type="number"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    updateButton: 'button:has-text("Update")',
    deleteButton: 'button:has-text("Delete")',
  },

  // ── Sidebar Navigation ─────────────────────────────────────────────────
  sidebar: {
    container: 'nav, [class*="sidebar"]',
    categoryButton: (name: string) => `button:has-text("${name}")`,
    subModuleLink: (name: string) => `a:has-text("${name}")`,
    activeLink: 'a.bg-blue-50, a.text-blue-600',
  },

  // ── Common Page Elements ──────────────────────────────────────────────
  common: {
    loadingIndicator: ':has-text("fetching your data")',
    slideOverPanel: 'div.animate-slide-in-right',
    dialog: '[role="dialog"]',
    dataTable: 'table.min-w-full',
    tableRow: 'tbody tr',
    rowCheckbox: 'td input[type="checkbox"]',
    successMessage: '[role="status"]:has-text("successfully"), :has-text("updated successfully")',
    errorMessage: '[role="alert"], .text-red-600',
    pageTitle: 'h1, h2, span.text-2xl',
    addButton: 'button:has-text("New"), button:has-text("Add"), button:has-text("Create")',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    cancelButton: 'button:has-text("Cancel"), button:has-text("Close")',
    deleteButton: 'button:has-text("Delete"), button[aria-label*="Delete"]',
    editButton: 'button:has-text("Edit"), a:has-text("Edit"), button[aria-label*="Edit"]',
    viewButton: 'button:has-text("View"), a:has-text("View")',
  },
};

export async function isChipSelected(locator: any) {
  const innerDiv = locator.locator('div.bg-\\[\\#00a6fb\\]');
  const count = await innerDiv.count();
  const hasClass = await locator.evaluate((node: any) => node.classList.contains('bg-blue-500'));
  return count > 0 || hasClass;
}

export async function isPermissionActive(locator: any) {
  return await locator.evaluate((node: any) => {
    return node.classList.contains('bg-blue-500') ||
           node.classList.contains('bg-emerald-500') ||
           node.classList.contains('bg-amber-500') ||
           node.classList.contains('bg-red-500') ||
           node.classList.contains('bg-purple-500') ||
           node.querySelector('svg') !== null;
  });
}
