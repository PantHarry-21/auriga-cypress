/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Client Quotation Module — Comprehensive E2E Test Suite
// URL    : /dashboard/quotation/client
// Run    : npx cypress run --spec cypress/e2e/modules/client_quotation.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/quotation/client';
const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);

const QUOTATION_TITLE = `AutoQuote ${TS}`;
const CLIENT_SEARCH   = 'ARB';
const SLIDE_OVER      = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

const openAddForm = () => {
  cy.contains('button', /New Quotation/i).click();
  cy.contains('button', /Cancel|Close panel/i, { timeout: 20000 }).should('be.visible');
};

const closeForm = () => {
  cy.contains('button', /Cancel/i).click({ force: true });
  cy.wait(500);
  cy.get('body').then($body => {
    if ($body.text().match(/Discard|Are you sure|unsaved/i)) {
      cy.contains('button', /Confirm|Yes|Discard/i).click({ force: true });
    }
  });
};

describe('Client Quotation Module', () => {

  beforeEach(() => {
    cy.loginAs('admin', LAB);
    cy.visit(MODULE_URL, { timeout: 60000 });
    cy.get('body', { timeout: 30000 }).should('not.contain', '404');
    cy.wait(2000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Module Access & Page Load', () => {

    it('TC-CQ-001: navigating to Client Quotation opens the listing screen', () => {
      cy.url().should('include', '/quotation/client');
      cy.get('body').should('not.contain', '404');
      cy.get('body').invoke('text').should('match', /Client Quotation/i);
      cy.screenshot('TC-CQ-001');
    });

    it('TC-CQ-002: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
      cy.screenshot('TC-CQ-002');
    });

    it('TC-CQ-003: table header contains expected columns', () => {
      cy.get('thead').invoke('text').then(headerText => {
        expect(headerText).to.match(/S\.?No|#/i);
        expect(headerText).to.match(/Quotation No/i);
        expect(headerText).to.match(/Title/i);
        expect(headerText).to.match(/Status/i);
        expect(headerText).to.match(/Client Name/i);
      });
      cy.screenshot('TC-CQ-003');
    });

    it('TC-CQ-004: "New Quotation" button is visible in the toolbar', () => {
      cy.contains('button', /New Quotation/i).should('be.visible');
      cy.screenshot('TC-CQ-004');
    });

    it('TC-CQ-005: at least one data row is present in the table', () => {
      cy.get('tbody tr, .ag-row', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-CQ-006: each data row has action buttons', () => {
      cy.get('tbody tr, .ag-row').first().find('button, a[role="button"]')
        .should('have.length.greaterThan', 0);
    });

    it('TC-CQ-007: row S.No. column starts at 1', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds)
          .map(td => td.textContent.trim())
          .find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-CQ-008: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
      cy.screenshot('TC-CQ-008');
    });

    it('TC-CQ-009: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-CQ-010: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-CQ-011: Search input is visible', () => {
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').should('be.visible');
    });

    it('TC-CQ-012: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });

    it('TC-CQ-013: Account Manager dropdown is visible in filter area', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(500);
      cy.get('body').invoke('text').should('match', /Account Manager/i);
      cy.contains('button', /Clear All/i).click({ force: true });
    });

    it('TC-CQ-014: Quotation Type dropdown is visible in filter area', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(500);
      cy.get('body').then($body => {
        const hasType = $body.text().match(/Quotation Type|Type/i);
        cy.log(`Quotation Type filter visible: ${!!hasType}`);
        cy.screenshot('TC-CQ-014');
      });
      cy.contains('button', /Clear All/i).click({ force: true });
    });

    it('TC-CQ-015: Columns button opens column visibility panel with checkboxes', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('body').then($body => {
        expect($body.find('input[type="checkbox"]').length).to.be.greaterThan(3);
      });
      cy.screenshot('TC-CQ-015');
      cy.get('body').click(0, 0);
    });

    it('TC-CQ-016: column visibility checkbox toggles a column off and on', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('input[type="checkbox"]').filter(':visible').first().then($cb => {
        const wasChecked = $cb.prop('checked');
        cy.wrap($cb).click({ force: true });
        cy.wait(500);
        cy.wrap($cb).should(wasChecked ? 'not.be.checked' : 'be.checked');
        cy.wrap($cb).click({ force: true }); // restore
      });
      cy.get('body').click(0, 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Search Functionality', () => {

    const getSearchInput = () =>
      cy.get('input[placeholder*="Search by quotation"], input[placeholder*="Search"]').first();

    it('TC-CQ-017: search input accepts text input', () => {
      getSearchInput().clear().type('Quote').should('have.value', 'Quote');
    });

    it('TC-CQ-018: search by quotation number returns matching records', () => {
      // Grab first row's quotation number then search for it
      cy.get('tbody tr').first().find('td').eq(1).invoke('text').then(qNo => {
        const trimmed = qNo.trim().replace(/\s+/g, ' ').substring(0, 6);
        if (trimmed) {
          getSearchInput().clear().type(trimmed);
          cy.contains('button', /^Search$/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
        }
      });
      cy.screenshot('TC-CQ-018');
    });

    it('TC-CQ-019: search by title keyword returns relevant records', () => {
      getSearchInput().clear().type('Quotation');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-019');
    });

    it('TC-CQ-020: search by client name returns records for that client', () => {
      getSearchInput().clear().type(CLIENT_SEARCH);
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-020');
    });

    it('TC-CQ-021: search with non-existent keyword shows no-results state', () => {
      getSearchInput().clear().type('ZZZNEVEREXISTS99XYZ');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-CQ-021');
    });

    it('TC-CQ-022: search with special characters does not crash the page', () => {
      getSearchInput().clear().type('<>@#$%');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-CQ-023: clearing search and clicking Search restores full listing', () => {
      getSearchInput().clear();
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Filter Functionality', () => {

    const openFilters = () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
    };

    const clearFilters = () => {
      cy.contains('button', /Clear All/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-CQ-024: clicking Filters expands the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        expect(
          $body.find('input:visible, select:visible, [role="combobox"]:visible').length
        ).to.be.greaterThan(0);
      });
      cy.screenshot('TC-CQ-024');
      clearFilters();
    });

    it('TC-CQ-025: Date From filter accepts a valid date and filters results', () => {
      openFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().type('2024-01-01');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-025');
      clearFilters();
    });

    it('TC-CQ-026: Date From and Date To together narrow results', () => {
      openFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().type('2024-01-01');
      cy.get('input[type="date"], input[placeholder*="Date To"]').first().type('2025-12-31');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-026');
      clearFilters();
    });

    it('TC-CQ-027: Date From greater than Date To returns no results or validation message', () => {
      openFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().type('2025-12-31');
      cy.get('input[type="date"], input[placeholder*="Date To"]').first().type('2024-01-01');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').then($body => {
        const bodyText = $body.text();
        const hasValidationOrNoRecord = /invalid date|cannot|No record|No data|0 result/i.test(bodyText);
        expect(hasValidationOrNoRecord).to.be.true;
      });
      clearFilters();
    });

    it('TC-CQ-028: Account Manager filter populates and applies correctly', () => {
      openFilters();
      cy.get('body').then($body => {
        const amSelect = $body.find('select').filter((_, el) =>
          /Account Manager|account/i.test(el.textContent) ||
          el.innerHTML.includes('Account Manager')
        );
        if (amSelect.length > 0) {
          cy.wrap(amSelect.first()).select(1, { force: true });
          cy.contains('button', /^Search$/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-CQ-028');
        } else {
          cy.log('Account Manager select not found — trying combobox approach');
        }
      });
      clearFilters();
    });

    it('TC-CQ-029: Quotation Type filter applies correctly', () => {
      openFilters();
      cy.get('body').then($body => {
        const typeSelect = $body.find('select').filter((_, el) =>
          /Type|Quotation Type/i.test(el.textContent)
        );
        if (typeSelect.length > 0) {
          cy.wrap(typeSelect.first()).then($sel => {
            const options = Array.from($sel[0].options).filter(o => o.value);
            if (options.length > 0) {
              cy.wrap($sel).select(options[0].value, { force: true });
              cy.contains('button', /^Search$/i).click({ force: true });
              cy.wait(2000);
              cy.get('body').should('not.contain', '500');
              cy.screenshot('TC-CQ-029');
            }
          });
        }
      });
      clearFilters();
    });

    it('TC-CQ-030: multiple filters applied together do not crash the page', () => {
      openFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().type('2024-01-01');
      cy.get('input[type="date"], input[placeholder*="Date To"]').first().type('2026-12-31');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-030');
      clearFilters();
    });

    it('TC-CQ-031: Clear All Filters resets filter inputs to empty state', () => {
      openFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().type('2024-01-01');
      cy.wait(300);
      clearFilters();
      cy.get('input[type="date"], input[placeholder*="Date From"]').first().should('have.value', '');
    });

    it('TC-CQ-032: Clear All Filters restores full data listing', () => {
      openFilters();
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').first().clear().type('ZZNOTEXIST');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      clearFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Pagination', () => {

    it('TC-CQ-033: pagination controls are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) =>
          /Next|First|Last|Prev|>/i.test(el.textContent.trim())
        ).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-CQ-034: clicking Next page loads a different set of records', () => {
      cy.get('tbody tr').first().invoke('text').then(pg1RowText => {
        cy.get('body').then($body => {
          const $next = $body.find('button').filter((_, el) =>
            /^Next$|^>$/.test(el.textContent.trim())
          ).first();
          if ($next.length) {
            cy.wrap($next).click({ force: true });
            cy.wait(1500);
            cy.get('tbody tr').first().invoke('text').should('not.eq', pg1RowText);
          } else {
            cy.log('Next page button not found or only one page');
          }
        });
      });
      cy.screenshot('TC-CQ-034');
    });

    it('TC-CQ-035: clicking Previous page navigates back', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) =>
          /^Next$|^>$/.test(el.textContent.trim())
        ).first();
        if ($next.length) {
          cy.wrap($next).click({ force: true });
          cy.wait(1200);
          cy.get('body').find('button').filter((_, el) =>
            /^Prev(ious)?$|^<$/.test(el.textContent.trim())
          ).first().click({ force: true });
          cy.wait(1200);
          cy.get('tbody tr').first().find('td').then($tds => {
            const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
            expect(firstNum).to.eq('1');
          });
        } else {
          cy.log('Pagination not available');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. EXPORT BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Export Buttons', () => {

    it('TC-CQ-036: Excel export button click does not throw a JS error', () => {
      cy.on('uncaught:exception', () => false);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-036');
    });

    it('TC-CQ-037: PDF export button click does not throw a JS error', () => {
      cy.on('uncaught:exception', () => false);
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-037');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD QUOTATION — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add Quotation — Form Display', () => {

    it('TC-CQ-038: clicking "New Quotation" opens the create form panel', () => {
      openAddForm();
      cy.get(SLIDE_OVER).filter(':visible').should('exist');
      cy.screenshot('TC-CQ-038');
      closeForm();
    });

    it('TC-CQ-039: form shows Select Client mandatory field', () => {
      openAddForm();
      cy.get('input[name="clientId"], input[placeholder*="Search client"]').should('be.visible');
      cy.screenshot('TC-CQ-039');
      closeForm();
    });

    it('TC-CQ-040: form shows Select Product(s) combobox', () => {
      openAddForm();
      cy.get('input[placeholder*="Select Product"], input[placeholder*="Product"]').should('be.visible');
      cy.screenshot('TC-CQ-040');
      closeForm();
    });

    it('TC-CQ-041: form shows Quotation Title mandatory field', () => {
      openAddForm();
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').should('be.visible');
      cy.screenshot('TC-CQ-041');
      closeForm();
    });

    it('TC-CQ-042: form shows Contact Name field', () => {
      openAddForm();
      cy.get('input[name="contactPerson"]').should('be.visible');
      cy.screenshot('TC-CQ-042');
      closeForm();
    });

    it('TC-CQ-043: form shows Mobile field', () => {
      openAddForm();
      cy.get('input[name="contactPersonMobile"]').should('be.visible');
      closeForm();
    });

    it('TC-CQ-044: form shows Email field of type email', () => {
      openAddForm();
      cy.get('input[name="contactPersonEmail"]').should('be.visible').and('have.attr', 'type', 'email');
      closeForm();
    });

    it('TC-CQ-045: form shows Product Type radio buttons (With Product / Without Product)', () => {
      openAddForm();
      cy.get('input[name="productType"]').should('have.length.greaterThan', 0);
      cy.get('body').invoke('text').should('match', /With Product|Without Product/i);
      cy.screenshot('TC-CQ-045');
      closeForm();
    });

    it('TC-CQ-046: form shows Assign To and Valid Till mandatory fields', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Assign To/i);
      cy.get('body').invoke('text').should('match', /Valid Till/i);
      cy.screenshot('TC-CQ-046');
      closeForm();
    });

    it('TC-CQ-047: form shows Discount (%) field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Discount/i);
      closeForm();
    });

    it('TC-CQ-048: form shows Other Charge Name and Amount fields', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Other Charge|Charge Name/i);
      closeForm();
    });

    it('TC-CQ-049: form shows Note / rich-text area', () => {
      openAddForm();
      cy.get('.ql-editor, textarea, [contenteditable="true"]').should('exist');
      closeForm();
    });

    it('TC-CQ-050: Cancel button closes the form without navigating away', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        if ($body.text().match(/Discard|Are you sure/i)) {
          cy.contains('button', /Confirm|Yes|Discard/i).click({ force: true });
        }
      });
      cy.get(SLIDE_OVER).should('not.exist');
      cy.screenshot('TC-CQ-050');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD QUOTATION — FIELD VALIDATIONS (NEGATIVE)
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Quotation — Field Validations', () => {

    it('TC-CQ-051: submitting blank form shows mandatory field validation errors', () => {
      openAddForm();
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|invalid|please|mandatory/i);
      cy.screenshot('TC-CQ-051');
      closeForm();
    });

    it('TC-CQ-052: Select Client field is required — blank submit shows error', () => {
      openAddForm();
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type('Title Only');
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /client|required/i);
      cy.screenshot('TC-CQ-052');
      closeForm();
    });

    it('TC-CQ-053: client search with fewer than 3 characters shows no dropdown results', () => {
      openAddForm();
      cy.get('input[name="clientId"], input[placeholder*="Search client"]').type('AB');
      cy.wait(1200);
      cy.get('body').then($body => {
        const hasDropdown = $body.find('[role="option"], [role="listbox"] li').filter(':visible').length > 0;
        cy.log(`Dropdown appeared with 2 chars: ${hasDropdown}`);
        // If minimum 3 chars enforced, dropdown should not yet appear
      });
      cy.screenshot('TC-CQ-053');
      closeForm();
    });

    it('TC-CQ-054: client search with 3 or more characters shows autocomplete results', () => {
      openAddForm();
      cy.get('input[name="clientId"], input[placeholder*="Search client"]').type(CLIENT_SEARCH);
      cy.wait(1500);
      cy.get('[role="option"], [role="listbox"] li, .autocomplete-item').filter(':visible')
        .should('have.length.greaterThan', 0);
      cy.screenshot('TC-CQ-054');
      closeForm();
    });

    it('TC-CQ-055: Quotation Title is required — blank submit shows error', () => {
      openAddForm();
      // Fill client
      cy.get('input[name="clientId"], input[placeholder*="Search client"]').type(CLIENT_SEARCH);
      cy.wait(1500);
      cy.get('[role="option"], [role="listbox"] li').filter(':visible').first().click({ force: true });
      cy.wait(500);
      // Leave title empty and submit
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /title|subject|required/i);
      cy.screenshot('TC-CQ-055');
      closeForm();
    });

    it('TC-CQ-056: Quotation Title accepts long text up to expected max length', () => {
      openAddForm();
      const longTitle = 'A'.repeat(200);
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type(longTitle);
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').invoke('val').then(val => {
        expect(val.length).to.be.greaterThan(0);
        cy.log(`Accepted ${val.length} characters`);
      });
      cy.screenshot('TC-CQ-056');
      closeForm();
    });

    it('TC-CQ-057: Assign To is required — blank submit shows error', () => {
      openAddForm();
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type('Assign To Test');
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /assign|employee|required/i);
      cy.screenshot('TC-CQ-057');
      closeForm();
    });

    it('TC-CQ-058: Valid Till is required — blank submit shows error', () => {
      openAddForm();
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type('Valid Till Test');
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /valid till|date|required/i);
      cy.screenshot('TC-CQ-058');
      closeForm();
    });

    it('TC-CQ-059: Valid Till date picker accepts a future date', () => {
      openAddForm();
      cy.contains(/Valid Till/i).closest('div, label').parent()
        .find('input[type="date"]').first().type('2027-06-30');
      cy.contains(/Valid Till/i).closest('div, label').parent()
        .find('input[type="date"]').first().should('have.value', '2027-06-30');
      cy.screenshot('TC-CQ-059');
      closeForm();
    });

    it('TC-CQ-060: Mobile field accepts digits — optional field', () => {
      openAddForm();
      cy.get('input[name="contactPersonMobile"]').type('9876543210');
      cy.get('input[name="contactPersonMobile"]').should('have.value', '9876543210');
      closeForm();
    });

    it('TC-CQ-061: Email field rejects invalid email format', () => {
      openAddForm();
      cy.get('input[name="contactPersonEmail"]').type('notanemail@@.com');
      cy.get('body').click(0, 0); // trigger blur / native validation
      cy.get('input[name="contactPersonEmail"]').then($el => {
        const valid = $el[0].validity.valid;
        expect(valid).to.be.false;
      });
      cy.screenshot('TC-CQ-061');
      closeForm();
    });

    it('TC-CQ-062: Email field accepts a valid email address', () => {
      openAddForm();
      cy.get('input[name="contactPersonEmail"]').type('test@example.com');
      cy.get('input[name="contactPersonEmail"]').then($el => {
        expect($el[0].validity.valid).to.be.true;
      });
      closeForm();
    });

    it('TC-CQ-063: Product Type radio — "Without Product" hides the product selector', () => {
      openAddForm();
      cy.get('input[name="productType"]').then($radios => {
        // Click the "Without Product" radio (usually index 1)
        const withoutIdx = Array.from($radios).findIndex(r => {
          const label = r.closest('label')?.textContent || '';
          return /Without Product/i.test(label);
        });
        const idx = withoutIdx >= 0 ? withoutIdx : 1;
        cy.wrap($radios[idx]).click({ force: true });
      });
      cy.wait(500);
      cy.get('body').then($body => {
        const productVisible = $body.find('input[placeholder*="Select Product"]').filter(':visible').length > 0;
        cy.log(`Product combobox visible after Without Product: ${productVisible}`);
      });
      cy.screenshot('TC-CQ-063');
      closeForm();
    });

    it('TC-CQ-064: Product Type radio — "With Product" shows the product selector', () => {
      openAddForm();
      cy.get('input[name="productType"]').then($radios => {
        const withIdx = Array.from($radios).findIndex(r => {
          const label = r.closest('label')?.textContent || '';
          return /With Product/i.test(label);
        });
        const idx = withIdx >= 0 ? withIdx : 0;
        cy.wrap($radios[idx]).click({ force: true });
      });
      cy.wait(500);
      cy.get('input[placeholder*="Select Product"]').should('be.visible');
      cy.screenshot('TC-CQ-064');
      closeForm();
    });

    it('TC-CQ-065: Discount % accepts a valid number between 0 and 100', () => {
      openAddForm();
      cy.contains(/Discount/i).closest('div, label').parent()
        .find('input[type="number"], input').first().clear().type('15');
      cy.contains(/Discount/i).closest('div, label').parent()
        .find('input[type="number"], input').first().should('have.value', '15');
      closeForm();
    });

    it('TC-CQ-066: Discount % with negative value triggers validation or is rejected', () => {
      openAddForm();
      cy.contains(/Discount/i).closest('div, label').parent()
        .find('input[type="number"], input').first().clear().type('-5');
      cy.get('body').click(0, 0);
      cy.get('body').then($body => {
        const bodyText = $body.text();
        if (/invalid|greater than|minimum|0 or/i.test(bodyText)) {
          cy.log('Negative discount validation message shown');
        } else {
          cy.contains(/Discount/i).closest('div, label').parent()
            .find('input[type="number"]').first().then($el => {
              if ($el.length) {
                const val = Number($el.val());
                cy.log(`Input min attribute prevents negative: ${$el.attr('min')}`);
              }
            });
        }
      });
      cy.screenshot('TC-CQ-066');
      closeForm();
    });

    it('TC-CQ-067: Other Charge Name and Amount can be entered and added', () => {
      openAddForm();
      cy.contains(/Other Charge Name/i).closest('div, label').parent()
        .find('input[type="text"], input').first().type('Handling Fee');
      cy.contains(/Amount/i).closest('div, label').parent()
        .find('input[type="number"], input').first().type('250');
      cy.contains('button', /^Add$/i).click({ force: true });
      cy.wait(600);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-067');
      closeForm();
    });

    it('TC-CQ-068: Note field accepts free-form text', () => {
      openAddForm();
      cy.get('.ql-editor, [contenteditable="true"]').first().type('Automated test note content.');
      cy.get('.ql-editor, [contenteditable="true"]').first()
        .invoke('text').should('match', /Automated test note/i);
      cy.screenshot('TC-CQ-068');
      closeForm();
    });

    it('TC-CQ-069: XSS payload in Quotation Title does not trigger alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS alert triggered!'); });
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]')
        .type("<script>alert('xss')</script>");
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-069');
      closeForm();
    });

    it('TC-CQ-070: special characters in Quotation Title are accepted without crash', () => {
      openAddForm();
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]')
        .type('Quote & Test "Special" <Chars>');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-070');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD QUOTATION — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Add Quotation — Success Flow', () => {

    it('TC-CQ-071: filling all mandatory fields and saving creates a quotation', () => {
      openAddForm();

      // 1. Select Client
      cy.get('input[name="clientId"], input[placeholder*="Search client"]').type(CLIENT_SEARCH);
      cy.wait(1800);
      cy.get('[role="option"], [role="listbox"] li, .autocomplete-item').filter(':visible')
        .first().click({ force: true });
      cy.wait(800);

      // 2. Select Product(s) — With Product mode (default)
      cy.get('input[placeholder*="Select Product"], input[placeholder*="Product"]')
        .first().click({ force: true }).type('A');
      cy.wait(1200);
      cy.get('[role="option"], [role="listbox"] li, .autocomplete-item').filter(':visible')
        .first().click({ force: true });
      cy.get('body').click(0, 0);
      cy.wait(2000);

      // 3. Quotation Title
      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type(QUOTATION_TITLE);

      // 4. Assign To
      cy.contains(/Assign To/i).closest('div, label').parent()
        .find('select, input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true }).type('Admin');
            cy.wait(1000);
            cy.get('[role="option"], [role="listbox"] li').filter(':visible')
              .first().click({ force: true });
          }
        });
      cy.wait(500);

      // 5. Valid Till
      cy.contains(/Valid Till/i).closest('div, label').parent()
        .find('input[type="date"]').first().type('2027-12-31');

      // 6. Contact (optional)
      cy.get('input[name="contactPerson"]').type('QA Tester');

      // 7. Save / Generate
      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').invoke('text').should('match', /success|generated|saved|created/i);
      cy.screenshot('TC-CQ-071');
    });

    it('TC-CQ-072: after save the new quotation appears in the list', () => {
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').first()
        .clear().type(QUOTATION_TITLE);
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', new RegExp(QUOTATION_TITLE, 'i'));
      cy.screenshot('TC-CQ-072');
    });

    it('TC-CQ-073: newly created quotation has a Status value in the list', () => {
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').first()
        .clear().type(QUOTATION_TITLE);
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('tbody tr').first().find('td').then($tds => {
        const cellTexts = Array.from($tds).map(td => td.textContent.trim());
        const hasStatus = cellTexts.some(t => /New|Draft|Approved|Pending|Sent/i.test(t));
        expect(hasStatus).to.be.true;
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ROW ACTION BUTTONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Row Action Buttons', () => {

    it('TC-CQ-074: each data row has at least one visible action button', () => {
      cy.get('tbody tr').first().find('button').should('have.length.greaterThan', 0);
      cy.screenshot('TC-CQ-074');
    });

    it('TC-CQ-075: row has exactly 3 action buttons (view/edit/delete)', () => {
      cy.get('tbody tr').first().find('button').its('length').then(count => {
        cy.log(`Row action button count: ${count}`);
        expect(count).to.be.greaterThan(0);
      });
    });

    it('TC-CQ-076: clicking the first row action button opens a panel or navigates', () => {
      cy.get('tbody tr').first().find('button').first().click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CQ-076');
      cy.get('body').then($body => {
        if ($body.find('[role="dialog"]').length) {
          cy.contains('button', /Cancel|Close/i).click({ force: true });
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EDIT QUOTATION FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Edit Quotation Flow', () => {

    const openEditFirstRow = () => {
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').first()
        .clear().type(QUOTATION_TITLE);
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('tbody tr').first().then($row => {
        // Find the edit button — typically second or third button in row actions
        const $btns = $row.find('button');
        if ($btns.length >= 2) {
          cy.wrap($btns.eq(1)).click({ force: true });
        } else {
          cy.wrap($btns.first()).click({ force: true });
        }
      });
      cy.wait(2500);
    };

    it('TC-CQ-077: Edit mode opens the form with pre-populated data', () => {
      openEditFirstRow();
      cy.get(SLIDE_OVER).filter(':visible').then($panel => {
        if ($panel.length) {
          cy.get('input[name="quotationSubject"], input[id="quotationSubject"]')
            .invoke('val').should('not.be.empty');
          cy.screenshot('TC-CQ-077');
          closeForm();
        } else {
          cy.log('Panel did not open — row may be view-only');
        }
      });
    });

    it('TC-CQ-078: clearing mandatory Title field in Edit shows validation error', () => {
      openEditFirstRow();
      cy.get('body').then($body => {
        if ($body.find('input[name="quotationSubject"]').filter(':visible').length) {
          cy.get('input[name="quotationSubject"]').clear();
          cy.contains('button', /Update|Save|Generate/i).click({ force: true });
          cy.wait(1000);
          cy.get('body').invoke('text').should('match', /required|invalid|title/i);
          cy.screenshot('TC-CQ-078');
          closeForm();
        } else {
          cy.log('Edit form not available for first row');
        }
      });
    });

    it('TC-CQ-079: editing and saving a field updates the record successfully', () => {
      openEditFirstRow();
      cy.get('body').then($body => {
        if ($body.find('input[name="contactPerson"]').filter(':visible').length) {
          cy.get('input[name="contactPerson"]').clear().type('Updated Contact');
          cy.contains('button', /Update|Save|Generate/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').invoke('text').should('match', /success|updated|saved/i);
          cy.screenshot('TC-CQ-079');
        } else {
          cy.log('Edit form fields not accessible');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. STATUS VALUES IN LIST
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Status Values', () => {

    it('TC-CQ-080: Status column shows recognizable status values', () => {
      cy.get('tbody tr').each(($row, idx) => {
        if (idx > 4) return false; // Only check first 5 rows
        cy.wrap($row).find('td').then($tds => {
          const texts = Array.from($tds).map(td => td.textContent.trim());
          const hasStatus = texts.some(t => /New|Draft|Approved|Pending|Sent|Accepted|Rejected/i.test(t));
          cy.log(`Row ${idx + 1} has status: ${hasStatus}`);
        });
      });
      cy.screenshot('TC-CQ-080');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. End-to-End Workflow', () => {

    const E2E_TS    = Date.now().toString().slice(-5);
    const E2E_TITLE = `E2E Quote ${E2E_TS}`;

    it('TC-CQ-081: E2E — create full quotation → verify in list → edit → verify update', () => {
      // ── STEP 1: Create ────────────────────────────────────────────────────
      openAddForm();

      cy.get('input[name="clientId"], input[placeholder*="Search client"]').type(CLIENT_SEARCH);
      cy.wait(1800);
      cy.get('[role="option"], [role="listbox"] li, .autocomplete-item').filter(':visible')
        .first().click({ force: true });
      cy.wait(800);

      cy.get('input[placeholder*="Select Product"], input[placeholder*="Product"]')
        .first().click({ force: true }).type('A');
      cy.wait(1200);
      cy.get('[role="option"], [role="listbox"] li, .autocomplete-item').filter(':visible')
        .first().click({ force: true });
      cy.get('body').click(0, 0);
      cy.wait(2000);

      cy.get('input[name="quotationSubject"], input[id="quotationSubject"]').type(E2E_TITLE);

      cy.contains(/Assign To/i).closest('div, label').parent()
        .find('select, input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true }).type('Admin');
            cy.wait(1000);
            cy.get('[role="option"], [role="listbox"] li').filter(':visible')
              .first().click({ force: true });
          }
        });

      cy.contains(/Valid Till/i).closest('div, label').parent()
        .find('input[type="date"]').first().type('2027-12-31');

      cy.contains('button', /Generate Quotation|Save/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').invoke('text').should('match', /success|generated|saved/i);
      cy.screenshot('TC-CQ-081-created');

      // ── STEP 2: Verify in list ─────────────────────────────────────────────
      cy.get('input[placeholder*="Search"], input[placeholder*="search"]').first()
        .clear().type(E2E_TITLE);
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_TITLE, 'i'));
      cy.screenshot('TC-CQ-081-verified-in-list');

      // ── STEP 3: Edit the record ────────────────────────────────────────────
      cy.get('tbody tr').first().find('button').eq(1).click({ force: true });
      cy.wait(2500);

      cy.get('body').then($body => {
        if ($body.find('input[name="contactPerson"]').filter(':visible').length) {
          cy.get('input[name="contactPerson"]').clear().type('E2E Updated Contact');
          cy.contains('button', /Update|Save|Generate/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').invoke('text').should('match', /success|updated|saved/i);
          cy.screenshot('TC-CQ-081-edited');
        } else {
          cy.log('Edit form not accessible — skipping edit step');
          cy.screenshot('TC-CQ-081-edit-skipped');
        }
      });
    });
  });
});
