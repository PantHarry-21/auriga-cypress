// cypress/support/ylims_selectors.js
//
// Centralized selector definitions for the YLIMS application.
// Selectors verified via live browser inspection on 2026-05-11.
//
// ⚠️ The app does NOT use data-cy or data-testid attributes.
//    All selectors rely on Tailwind CSS classes and text content.

export const YLIMS_SELECTORS = {

  // ── Login Page ──────────────────────────────────────────────────────────
  login: {
    usernameInput: '[name="username"]',
    passwordInput: '[name="password"]',
    signInButton: 'button:contains("Sign in")',
    locationDropdown: 'div:contains("Choose your location")',
    locationOption: (name) => `span:contains("${name}")`,
  },

  // ── Role Management — List Page (/dashboard/roles) ─────────────────────
  rolesList: {
    roleCard: (roleName) => `div.p-6.bg-white:contains("${roleName}")`,
    roleIdSpan: (id) => `span.text-sm.text-gray-500:contains("ID: ${id}")`,
    editButton: 'button.p-1\\.5.rounded-lg',
  },

  // ── Role Management — Edit Page (/dashboard/roles/edit/:id) ────────────
  roleEdit: {
    pageHeading: 'h1:contains("Edit Role"), h2:contains("Edit Role")',
    
    // ─── Step 2: Module Access ───────────────────────────────────────
    step2Heading: ':contains("Module Access")',
    // Parent category container
    parentCategoryLabel: (name) => `div.rounded-lg.border:has(span:contains("${name}"))`,
    // Checkbox container (the blue/gray square)
    parentCategoryCheckbox: (name) => `div.rounded-lg.border:has(span:contains("${name}")) div.w-5.h-5`,
    // Sub-module chips
    moduleChip: (name) => `button:contains("${name}")`,

    // ─── Step 3: Set Permissions ─────────────────────────────────────
    step3Heading: ':contains("Set Permissions")',
    // Permission row container — it's a TABLE ROW (<tr>)
    permissionRow: (moduleName) => `tr:has(span:contains("${moduleName}"))`,
    // Permission button inside a row (0-based index for View, Create, Update, Delete, Approve)
    permissionButton: (index) => `td:nth-child(${index + 2}) button`,

    permissionIndices: {
      view: 0,
      create: 1,
      update: 2,
      delete: 3,
      approve: 4,
    },

    // ─── Save / Update ──────────────────────────────────────────────
    updateButton: 'button:contains("Update Role")',
  },

  // ── Sidebar Navigation ─────────────────────────────────────────────────
  // The app uses a collapsible left nav — not an <aside> element.
  // Selectors target nav items broadly so they work regardless of collapse state.
  sidebar: {
    container: 'nav, [class*="sidebar"]',
    categoryButton: (name) => `button:contains("${name}")`,
    subModuleLink: (name) => `a:contains("${name}")`,
    activeLink: 'a.bg-blue-50, a.text-blue-600',
  },

  // ── Common Page Elements ──────────────────────────────────────────────
  common: {
    loadingIndicator: ':contains("fetching your data")',
    slideOverPanel: 'div.animate-slide-in-right',
    dialog: '[role="dialog"]',
    dataTable: 'table.min-w-full',
    tableRow: 'tbody tr',
    rowCheckbox: 'td input[type="checkbox"]',
    successMessage: ':contains("successfully"), :contains("updated")',
  },
};

// ── Convenience helpers ──────────────────────────────────────────────────

export function isChipSelected($btn) {
  // A selected chip has a blue background in the inner div
  return $btn.find('div.bg-\\[\\#00a6fb\\]').length > 0 || $btn.hasClass('bg-blue-500');
}

export function isPermissionActive($btn) {
  // Active buttons have color backgrounds (blue, emerald, amber, red, purple)
  return $btn.hasClass('bg-blue-500') ||
         $btn.hasClass('bg-emerald-500') ||
         $btn.hasClass('bg-amber-500') ||
         $btn.hasClass('bg-red-500') ||
         $btn.hasClass('bg-purple-500') ||
         $btn.find('svg').length > 0;
}
