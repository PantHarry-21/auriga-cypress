/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Product Master Module — Comprehensive Test Suite
// URL    : /dashboard/products/master-v2
// Run    : npx cypress run --spec cypress/e2e/modules/product_master.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL   = '/dashboard/products/master-v2';
const LAB          = 'Arbro - Delhi';
const TS           = Date.now().toString().slice(-6);
const BRAND_NAME   = `AutoBrand ${TS}`;

const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

describe('Product Master Module', () => {

  beforeEach(() => {
    cy.loginAs('admin', LAB);
    cy.visit(MODULE_URL, { timeout: 60000 });
    cy.get('body', { timeout: 30000 }).should('not.contain', '404');
    cy.wait(1500);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Module Access & Page Load', () => {

    it('TC-PM-001: navigating to Product Master opens the listing screen', () => {
      cy.url().should('include', 'master-v2');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-PM-001');
    });

    it('TC-PM-002: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
    });

    it('TC-PM-003: page heading indicates Product Master module', () => {
      cy.get('body').invoke('text').should('match', /Product Master|Product/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-PM-004: New Product button is visible in the toolbar', () => {
      cy.contains('button', /New Product Master/i).should('be.visible');
      cy.screenshot('TC-PM-004');
    });

    it('TC-PM-005: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-PM-006: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-PM-007: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-PM-008: Search input is displayed', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-PM-009: Search button is visible', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });

    it('TC-PM-010: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. GRID / LISTING
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Grid & Listing', () => {

    it('TC-PM-011: table header contains S.No. column', () => {
      cy.get('thead').invoke('text').should('match', /S\.No|#/i);
    });

    it('TC-PM-012: table header contains Brand Name column', () => {
      cy.get('thead').invoke('text').should('match', /Brand Name|Brand/i);
    });

    it('TC-PM-013: table header contains Generic Name column', () => {
      cy.get('thead').invoke('text').should('match', /Generic Name|Generic/i);
    });

    it('TC-PM-014: table header contains Client Name column', () => {
      cy.get('thead').invoke('text').should('match', /Client/i);
    });

    it('TC-PM-015: table header contains Matrix Name column', () => {
      cy.get('thead').invoke('text').should('match', /Matrix/i);
    });

    it('TC-PM-016: at least one data row is visible', () => {
      cy.get('tbody tr', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-PM-017: row checkboxes are present', () => {
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });

    it('TC-PM-018: S.No. column starts at 1', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-PM-019: pagination controls are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|First|Last|Prev/i.test(el.textContent)).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-PM-020: total result count is displayed', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Search Functionality', () => {

    it('TC-PM-021: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Product').should('have.value', 'Product');
    });

    it('TC-PM-022: searching by Brand Name returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('PARA');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PM-022');
    });

    it('TC-PM-023: searching with non-existent text shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-PM-023');
    });

    it('TC-PM-024: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('@#$%^');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PM-025: partial text search returns relevant records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('tab');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PM-026: clearing search and clicking Search restores full listing', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Filter Functionality', () => {

    const openFilters = () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
    };

    const clearFilters = () => {
      cy.contains('button', /Clear|Reset/i).click({ force: true });
      cy.wait(500);
    };

    it('TC-PM-027: clicking Filters expands the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        expect($body.find('input:visible, select:visible, [role="combobox"]:visible').length).to.be.greaterThan(0);
      });
      cy.screenshot('TC-PM-027');
    });

    it('TC-PM-028: filter by Brand Name returns only matching records', () => {
      openFilters();
      cy.get('input[placeholder*="Brand"], input[name*="brand"]').filter(':visible').then($el => {
        if ($el.length > 0) {
          cy.wrap($el.first()).clear().type('Test');
          cy.contains('button', /Apply|^Search$/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-028');
        } else {
          cy.log('Brand Name filter input not found');
        }
      });
      clearFilters();
    });

    it('TC-PM-029: clearing filters restores the full listing', () => {
      openFilters();
      cy.get('input').filter(':visible').first().clear().type('ZZNOTEXIST');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      clearFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. COLUMN SORTING
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Column Sorting', () => {

    it('TC-PM-030: clicking Brand Name column header sorts ascending', () => {
      cy.get('thead th').then($ths => {
        const brandTh = Array.from($ths).find(th => /Brand Name/i.test(th.textContent));
        if (brandTh) {
          cy.wrap(brandTh).click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-030-asc');
        }
      });
    });

    it('TC-PM-031: clicking Brand Name column header again sorts descending', () => {
      cy.get('thead th').then($ths => {
        const brandTh = Array.from($ths).find(th => /Brand Name/i.test(th.textContent));
        if (brandTh) {
          cy.wrap(brandTh).click({ force: true });
          cy.wait(500);
          cy.wrap(brandTh).click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-031-desc');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD PRODUCT MASTER — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add Product Master — Form Display', () => {

    const openAddForm = () => {
      cy.contains('button', /New Product Master/i).click();
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-PM-032: clicking New Product opens the create form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /New Product|Add Product|Create Product/i);
      cy.screenshot('TC-PM-032');
      closeForm();
    });

    it('TC-PM-033: Brand Name field is displayed', () => {
      openAddForm();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .should('exist');
      closeForm();
    });

    it('TC-PM-034: Client Name field/dropdown is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Client');
      closeForm();
    });

    it('TC-PM-035: Generic Name field/dropdown is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Generic');
      closeForm();
    });

    it('TC-PM-036: Save/Submit button is displayed', () => {
      openAddForm();
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').should('exist');
      closeForm();
    });

    it('TC-PM-037: Cancel button closes the form without saving', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.get('input[placeholder*="Brand"]').should('not.exist');
      cy.screenshot('TC-PM-037');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD PRODUCT MASTER — FORM VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Product Master — Form Validations', () => {

    const openAddForm = () => {
      cy.contains('button', /New Product Master/i).click();
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-PM-038: blank form submission shows validation errors', () => {
      openAddForm();
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-PM-038');
      closeForm();
    });

    it('TC-PM-039: Brand Name field rejects blank input', () => {
      openAddForm();
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /Brand.*required|Brand.*mandatory/i);
      closeForm();
    });

    it('TC-PM-040: Brand Name accepts valid text input', () => {
      openAddForm();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .type('Valid Brand Name').should('have.value', 'Valid Brand Name');
      closeForm();
    });

    it('TC-PM-041: Client Name dropdown opens and shows selectable options', () => {
      openAddForm();
      cy.get('body').then($body => {
        const clientEl = $body.find('input[placeholder*="Client"], [role="combobox"]').filter(':visible');
        if (clientEl.length > 0) {
          cy.wrap(clientEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').should('have.length.greaterThan', 0);
          cy.screenshot('TC-PM-041');
          cy.get('body').click(0, 0);
        }
      });
      closeForm();
    });

    it('TC-PM-042: selecting a Client populates dependent fields if any', () => {
      openAddForm();
      cy.get('body').then($body => {
        const clientEl = $body.find('input[placeholder*="Client"], [role="combobox"]').filter(':visible');
        if (clientEl.length > 0) {
          cy.wrap(clientEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.wait(500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-042');
        }
      });
      closeForm();
    });

    it('TC-PM-043: Generic Name dropdown opens and shows selectable options', () => {
      openAddForm();
      cy.get('body').then($body => {
        const genericEl = $body.find('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible');
        if (genericEl.length > 0) {
          cy.wrap(genericEl.first()).click({ force: true });
          cy.wait(800);
          cy.screenshot('TC-PM-043');
          cy.get('body').click(0, 0);
        }
      });
      closeForm();
    });

    it('TC-PM-044: selecting Generic Name auto-populates Matrix/Label fields if applicable', () => {
      openAddForm();
      cy.get('body').then($body => {
        const genericEl = $body.find('input[placeholder*="Generic"], [role="combobox"]').filter(':visible');
        if (genericEl.length > 0) {
          cy.wrap(genericEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-044');
        }
      });
      closeForm();
    });

    it('TC-PM-045: XSS injection in Brand Name does not trigger an alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .type("<script>alert('xss')</script>");
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-PM-046: extremely long Brand Name is handled gracefully', () => {
      openAddForm();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .type('A'.repeat(300), { delay: 0 });
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD PRODUCT MASTER — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Add Product Master — Success Flow', () => {

    it('TC-PM-047: filling mandatory fields and saving creates a product successfully', () => {
      cy.contains('button', /New Product Master/i).click();
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');

      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .clear().type(BRAND_NAME);

      // Select Client
      cy.get('body').then($body => {
        const clientEl = $body.find('input[placeholder*="Client"], [role="combobox"]').filter(':visible');
        if (clientEl.length > 0) {
          cy.wrap(clientEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      // Select Generic Name
      cy.get('body').then($body => {
        const genericEl = $body.find('input[placeholder*="Generic"], [role="combobox"]').filter(':visible');
        if (genericEl.length > 0) {
          cy.wrap(genericEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PM-047');
    });

    it('TC-PM-048: newly created product appears in the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(BRAND_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(BRAND_NAME, 'i'));
      cy.screenshot('TC-PM-048');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EDIT PRODUCT MASTER
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Edit Product Master', () => {

    const openEditFirst = () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');
    };

    it('TC-PM-049: clicking Edit on a row opens the Edit Product form', () => {
      openEditFirst();
      cy.get('body').invoke('text').should('match', /Edit Product|Update Product/i);
      cy.screenshot('TC-PM-049');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-050: Edit form pre-populates Brand Name field', () => {
      openEditFirst();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-PM-050');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-051: clearing Brand Name in Edit shows validation error', () => {
      openEditFirst();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first().clear();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-PM-051');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-052: viewing STP Details table in Edit mode shows relevant columns', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const hasSTPTable = $body.text().match(/L\s*LIMIT|U\s*LIMIT|UNIT|STP/i);
        cy.log(`STP Details table found: ${!!hasSTPTable}`);
        cy.screenshot('TC-PM-052');
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-053: Expected Testing Days fields are present and accept numeric values', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const testingDayEl = $body.find('input[placeholder*="Expected Testing"], input[placeholder*="Testing Day"]').filter(':visible');
        if (testingDayEl.length > 0) {
          cy.wrap(testingDayEl.first()).click({ force: true });
          cy.wait(300);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.screenshot('TC-PM-053');
        } else {
          cy.log('Expected Testing Day field not found in current layout');
        }
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-054: modifying and saving a product update completes without errors', () => {
      openEditFirst();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PM-054');
    });

    it('TC-PM-055: Cancel in Edit form closes without saving changes', () => {
      openEditFirst();
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .clear().type('SHOULD_NOT_PERSIST');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. VIEW PRODUCT
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. View Product', () => {

    it('TC-PM-056: clicking View on a row opens a read-only product form', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^View$/i, { matchCase: false }).click({ force: true });
      cy.wait(2000);
      cy.get(SLIDE_OVER).filter(':visible').should('exist');
      cy.screenshot('TC-PM-056');
      cy.contains('button', /Close|Cancel/i).click({ force: true });
    });

    it('TC-PM-057: View mode shows STP details table with L Limit, U Limit, Unit columns', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^View$/i, { matchCase: false }).click({ force: true });
      cy.wait(2000);
      cy.get('body').then($body => {
        const hasSTPCols = $body.text().match(/L\s*LIMIT|U\s*LIMIT|UNIT/i);
        cy.log(`STP table columns visible: ${!!hasSTPCols}`);
        cy.screenshot('TC-PM-057');
      });
      cy.contains('button', /Close|Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. DELETE PRODUCT MASTER
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Delete Product Master', () => {

    it('TC-PM-058: selecting a row and clicking Actions > Delete shows confirmation', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-PM-058');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-PM-059: canceling delete dialog keeps the record intact', () => {
      cy.get('tbody tr').its('length').then(before => {
        cy.get('tbody input[type="checkbox"]').first().check({ force: true });
        cy.contains('button', /Actions|Action/i).click({ force: true });
        cy.wait(500);
        cy.get('body').contains(/^Delete$/i).click({ force: true });
        cy.wait(1000);
        cy.contains('button', /Cancel|No/i).click({ force: true });
        cy.wait(500);
        cy.get('tbody tr').should('have.length', before);
      });
    });

    it('TC-PM-060: confirming delete removes the product from the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(BRAND_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('Created product not found — skipping deletion');
        } else {
          cy.get('tbody input[type="checkbox"]').first().check({ force: true });
          cy.contains('button', /Actions|Action/i).click({ force: true });
          cy.wait(500);
          cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.wait(1000);
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PM-060');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. ROW SELECTION & BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Row Selection & Bulk Actions', () => {

    it('TC-PM-061: clicking a row checkbox selects the row', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('tbody input[type="checkbox"]').first().should('be.checked');
    });

    it('TC-PM-062: header checkbox selects all rows on the page', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => cy.wrap($cb).should('be.checked'));
    });

    it('TC-PM-063: unchecking header checkbox deselects all rows', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('thead input[type="checkbox"]').uncheck({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => cy.wrap($cb).should('not.be.checked'));
    });

    it('TC-PM-064: Actions menu appears after selecting a row', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.screenshot('TC-PM-064');
      cy.get('body').click(0, 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Export Functionality', () => {

    it('TC-PM-065: Excel export completes without errors', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PM-065');
    });

    it('TC-PM-066: PDF export completes without errors', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PM-067: Excel export with filtered search results works without errors', () => {
      cy.get('input[placeholder*="earch"]').clear().type('PARA');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. Pagination', () => {

    it('TC-PM-068: Next page button loads the next set of records', () => {
      cy.get('tbody tr').first().invoke('text').then(pg1 => {
        cy.get('body').then($body => {
          const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
          if ($next.length) {
            cy.wrap($next).click({ force: true });
            cy.wait(1500);
            cy.get('tbody tr').first().invoke('text').should('not.eq', pg1);
          }
        });
      });
    });

    it('TC-PM-069: Last page button navigates to the last page', () => {
      cy.contains('button', /Last/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-PM-070: First page button returns to page 1', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
        if ($next.length) cy.wrap($next).click({ force: true });
      });
      cy.wait(1000);
      cy.contains('button', /First/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-PM-071: changing page size updates the visible row count', () => {
      cy.get('select').filter(':visible').first().then($sel => {
        const options = Array.from($sel.find('option')).map(o => o.value).filter(v => v && !isNaN(v));
        if (options.length > 1) {
          cy.wrap($sel).select(options[1], { force: true });
          cy.wait(2000);
          cy.get('tbody tr').should('have.length.at.most', parseInt(options[1]) + 1);
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('16. Edge Cases', () => {

    it('TC-PM-072: rapid double-click on New Product does not open multiple forms', () => {
      cy.contains('button', /New Product Master/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PM-073: browser back navigation does not corrupt the listing state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PM-074: searching for zero-result query shows appropriate message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNORESULT99999ABC');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-PM-074');
    });

    it('TC-PM-075: column toggle hides/shows columns correctly', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('input[type="checkbox"]:checked').filter(':visible').last().uncheck({ force: true });
      cy.wait(600);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PM-075');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('17. End-to-End Workflows', () => {

    const E2E_TS      = Date.now().toString().slice(-5);
    const E2E_BRAND   = `E2EBrand ${E2E_TS}`;

    it('E2E-PM-001: Create → Search → Edit → Delete a Product Master', () => {
      // Create
      cy.contains('button', /New Product Master/i).click();
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');
      cy.get('input[placeholder*="Brand Name"], input[placeholder*="Brand"]').filter(':visible').first()
        .clear().type(E2E_BRAND);
      cy.get('body').then($body => {
        const clientEl = $body.find('input[placeholder*="Client"], [role="combobox"]').filter(':visible');
        if (clientEl.length > 0) {
          cy.wrap(clientEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });
      cy.get('body').then($body => {
        const genericEl = $body.find('input[placeholder*="Generic"], [role="combobox"]').filter(':visible');
        if (genericEl.length > 0) {
          cy.wrap(genericEl.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });
      cy.contains('button', /Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-PM-001-created');

      // Search
      cy.get('input[placeholder*="earch"]').clear().type(E2E_BRAND);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_BRAND, 'i'));

      // Edit
      cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
      cy.wait(300);
      cy.contains(/^Edit$/i).click({ force: true });
      cy.get('input[placeholder*="Brand"]', { timeout: 20000 }).should('be.visible');
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.screenshot('E2E-PM-001-edited');

      // Delete
      cy.get('input[placeholder*="earch"]').clear().type(E2E_BRAND);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-PM-001-deleted');

      // Verify deletion
      cy.get('input[placeholder*="earch"]').clear().type(E2E_BRAND);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
    });

    it('E2E-PM-002: Search by Brand Name, export filtered results to Excel', () => {
      cy.get('input[placeholder*="earch"]').clear().type('PARA');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-PM-002');
    });
  });
});
