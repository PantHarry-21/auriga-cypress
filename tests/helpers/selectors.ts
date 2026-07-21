// tests/helpers/selectors.ts
//
// Centralized selector definitions for the YLIMS application (Playwright version).
// Enhanced with comprehensive selectors for all 14 modules.
//

export const YLIMS_SELECTORS = {

  // ── Login Page ──────────────────────────────────────────────────────────
  login: {
    usernameInput: '#username',
    passwordInput: '#password',
    signInButton: 'button[type="submit"]',
    locationButton: 'button:has-text("Choose your location")',
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
  // Verified live on prod.bharatlims.ai 2026-07-19. `version` is readonly.
  genericMaster: {
    pageHeading: ':has-text("Generic Master")',
    newButton: 'button:has-text("New Generic Master")',
    listSearchInput: 'input[placeholder="Search by Generic Name"]',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    excelButton: 'button:has-text("Excel")',
    columnsButton: 'button:has-text("Columns")',
    tabActive: 'button:has-text("Active")',
    tabMyDrafts: 'button:has-text("My Drafts")',
    tabApprovalPending: 'button:has-text("Approval Pending")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    editLink: 'a:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    submitButton: 'button:has-text("Submit for Review")',
    saveDraftButton: 'button:has-text("Save as Draft")',
    cancelButton: 'button:has-text("Cancel")',
    // Form (real named fields)
    genericNameInput: 'input[name="genericName"]',
    versionInput: 'input[name="version"]',                       // readonly, placeholder 1.0
    validationProtocolInput: 'input[name="validationProtocol"]',
    referenceToProtocolInput: 'input[name="referenceToProtocol"]',
    inhouseReferenceInput: 'input[name="inhouseReferenceToProtocol"]',
    remarksTextarea: 'textarea[name="remarks"]',
    allowChangesCheckbox: 'input[name="allowChangesInBooking"]',
    reportTemplateCombobox: 'input[placeholder="Search or select Report Template"]',
    matrixCombobox: 'input[placeholder="Search or select Matrix"]',
    labelCombobox: 'input[placeholder="Search or select Label"]',
    addLabelButton: 'button:has-text("Add Label")',
    nameInput: 'input[name="genericName"]',
    descriptionInput: 'textarea[name="remarks"]',
    successMessage: '[role="status"]:has-text("successfully")',
    api: { list: '/api/generic-master', stps: '/api/stps', stpGroups: '/api/stp-groups',
           matrices: '/api/nabl/matrices', labels: '/api/generic-master/labels', templates: '/api/report-templates' },
  },

  // ── Product Master Module ──────────────────────────────────────────────
  // Verified live on prod.bharatlims.ai 2026-07-19. Brand product bound to an
  // approved generic + a client via headless-ui comboboxes.
  productMaster: {
    pageHeading: ':has-text("Product Master"), :has-text("Product")',
    newButton: 'button:has-text("New Product")',
    listSearchInput: 'input[placeholder="Search by Brand or Generic Name"]',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    columnsButton: 'button:has-text("Columns")',
    table: 'table.min-w-full, [role="grid"]',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    editIcon: 'button[aria-label*="Edit"], svg[class*="edit"]',
    deleteIcon: 'button[aria-label*="Delete"], svg[class*="delete"]',
    // Form comboboxes (linkage: generic + client)
    genericCombobox: 'input[placeholder="Search and select generic product..."]',
    clientCombobox: 'input[placeholder="Search and select client..."]',
    brandNameInput: 'input[placeholder="Enter or search brand/product name..."]',
    addButton: 'button:has-text("Add")',
    viewButton: 'button:has-text("View")',
    cancelButton: 'button:has-text("Cancel")',
    nameInput: 'input[placeholder="Enter or search brand/product name..."]',
    categorySelect: 'select, [role="combobox"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit"), button:has-text("Add")',
    updateButton: 'button:has-text("Update")',
    api: { list: '/api/product-master', generics: '/api/generic-master', clients: '/api/client-profile/list' },
  },

  // ── Parameter Master Module ────────────────────────────────────────────
  // Verified live on prod.bharatlims.ai 2026-07-19. Two-step wizard:
  // step 1 dedup search → "Create <name>" → step 2 details.
  parameterMaster: {
    pageHeading: ':has-text("Parameter")',
    newButton: 'button:has-text("New Parameter")',
    // List
    listSearchInput: 'input[placeholder*="Search by parameter name"]',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    excelButton: 'button:has-text("Excel")',
    columnsButton: 'button:has-text("Columns")',
    tabAll: 'button:has-text("All")',
    tabApprovalPending: 'button:has-text("Approval Pending")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    // Wizard step 1 — dedup search
    wizardSearchInput: 'input[placeholder*="Type parameter name, alias, or CAS number"]',
    wizardSearchButton: 'button:has-text("Search")',
    createNamedButton: (name: string) => `button:has-text('Create "${name}"')`,
    nextStepButton: 'button:has-text("Next Step")',
    backButton: 'button:has-text("Back")',
    cancelButton: 'button:has-text("Cancel")',
    // Wizard step 2 — details
    canonicalNameInput: 'input[placeholder="Official Name"]',
    symbolInput: 'input[placeholder="e.g. Pb"]',
    aliasInput: 'input[placeholder="Type alias..."]',
    nameWarning: ':has-text("Don\'t include units, methods, or conditions")',
    compoundYes: 'text="Yes, Chemical"',
    compoundNo: 'text="No, Other Parameter"',
    templateCategory: (name: string) => `text="${name}"`,
    parameterNameInput: 'input[placeholder*="Parameter"], input[placeholder*="parameter"]',
    unitInput: 'input[placeholder*="Unit"], input[placeholder*="unit"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    updateButton: 'button:has-text("Update")',
    submitButton: 'button:has-text("Submit for Review")',
    // API endpoints (for network assertions / waits)
    api: { list: '/api/parameters' },
  },

  // ── STP Master Module ──────────────────────────────────────────────────
  // Verified live on prod.bharatlims.ai 2026-07-19. STP NAME is readonly and
  // auto-composed "Parameter-Product-Instrument/Technique-Reference Method".
  stpMaster: {
    pageHeading: ':has-text("STP Master"), :has-text("STP")',
    newButton: 'button:has-text("New STP")',
    listSearchInput: 'input[placeholder="Search by STP name or product name..."]',
    searchInput: 'input[placeholder*="Search"]',
    columnsButton: 'button:has-text("Columns")',
    tabActive: 'button:has-text("Active")',
    tabMyDrafts: 'button:has-text("My Drafts")',
    tabApprovalPending: 'button:has-text("Approval Pending")',
    tabAccredited: 'button:has-text("Accredited STPs")',
    nablButton: 'button:has-text("NABL")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    // Form (real named fields)
    stpNameInput: 'input[name="stpName"]',              // readonly, auto-composed
    sampleQuantityInput: 'input[name="sampleQuantity"]',
    turnAroundTimeInput: 'input[name="turnAroundTime"]',
    productNameInput: 'input[name="productName"]',
    validationProtocolInput: 'input[name="validationProtocol"]',
    remarksInput: 'input[name="remarks"]',
    parameterCombobox: 'input[placeholder="Search parameter..."]',
    departmentCombobox: 'input[placeholder="Search or select department..."]',
    methodCombobox: 'input[placeholder="Search or select method..."]',
    sourceCombobox: 'input[placeholder="Search or select source..."]',
    instrumentCombobox: 'input[placeholder="Search or select instrument..."]',
    stpTypeCombobox: 'input[placeholder="Select STP type..."]',
    procedureStepTextarea: 'textarea[placeholder="Describe the procedure step..."]',
    addStepButton: 'button:has-text("Add Step")',
    descriptionInput: 'textarea, input[placeholder*="description"]',
    saveDraftButton: 'button:has-text("Save as Draft")',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit for Review")',
    cancelButton: 'button:has-text("Cancel")',
    updateButton: 'button:has-text("Update")',
    approveButton: 'button:has-text("Approve")',
    api: { list: '/api/stps', parameters: '/api/parameters', departments: '/api/departments',
           units: '/api/units', methods: '/api/methods/upload', locations: '/api/stps/locations' },
  },

  // ── STP Group Module ───────────────────────────────────────────────────
  // Verified live on prod.bharatlims.ai 2026-07-19.
  stpGroup: {
    pageHeading: ':has-text("STP Group")',
    newButton: 'button:has-text("New STP Group")',
    listSearchInput: 'input[placeholder="Search stp group name..."]',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    excelButton: 'button:has-text("Excel")',
    columnsButton: 'button:has-text("Columns")',
    clearFiltersButton: 'button:has-text("Clear All Filters")',
    table: 'table.min-w-full',
    tableRow: 'tbody tr',
    firstRow: 'tbody tr:first-child',
    // Form
    groupNameInput: 'input[name="stpGroupName"]',
    groupHeaderInput: 'input[name="stpGroupHeader"]',
    groupDescriptionInput: 'input[name="stpGroupDescription"]',
    stpSearchCombobox: 'input[placeholder="Search STPs..."]',
    createButton: 'button:has-text("Create")',
    stpCheckboxes: 'input[type="checkbox"]',
    saveButton: 'button:has-text("Save"), button:has-text("Submit")',
    submitButton: 'button:has-text("Submit for Review")',
    updateButton: 'button:has-text("Update")',
    api: { list: '/api/stp-groups' },
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
  // Verified live on prod.bharatlims.ai 2026-07-19.
  clientProductPricing: {
    pageHeading: ':has-text("Product Pricing"), :has-text("Pricing")',
    newButton: 'button:has-text("New"), button:has-text("Add Pricing")',
    clientSearchInput: 'input[placeholder="Search client by name…"]',
    productSearchInput: 'input[placeholder="Search product..."]',
    searchInput: 'input[placeholder*="Search"]',
    searchButton: 'button:has-text("Search")',
    notPricedTab: 'button:has-text("Not Priced")',
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

  // ── Segmentation Services Module (verified live 2026-07-10) ────────────
  segmentationServices: {
    pageHeading: 'h1:has-text("Segmentation Services"), h2:has-text("Segmentation Services")',
    table: 'table',
    tierRow: (tier: string) => `table tbody tr:has-text("${tier}")`,
    toggleButtons: 'button[role="checkbox"]',
    updateAllButton: 'button:has-text("Update All")',
    tiers: ['Bronze', 'Silver', 'Gold', 'Diamond'],
    columns: ['COA Digital', 'COA Print', 'Invoice Digital', 'Invoice Print', 'Raw Data'],
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
