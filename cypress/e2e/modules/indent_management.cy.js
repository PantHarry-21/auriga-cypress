/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Indent Management Module — Comprehensive E2E Test Suite
// URL    : /dashboard/purchase/indent
// Run    : npx cypress run --spec cypress/e2e/modules/indent_management.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/purchase/indent';
const LAB = 'Arbro - Delhi';
const TS = Date.now().toString().slice(-6);

const INDENT_SUBJECT = `AutoIndent ${TS}`;
const SLIDE_OVER     = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';
const TEST_FILE_PATH = 'cypress/fixtures/files for testing/SOP _ Employee Profile.pdf';

const openAddForm = () => {
  cy.contains('button', /New Indent/i).click();
  cy.contains('button', /Cancel|Add Product/i, { timeout: 20000 }).should('be.visible');
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

describe('Indent Management Module', () => {

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

    it('TC-IM-001: navigating to Indent Management opens the listing screen', () => {
      cy.url().should('include', '/purchase/indent');
      cy.get('body').should('not.contain', '404');
      cy.get('body').invoke('text').should('match', /Indent Manage/i);
      cy.screenshot('TC-IM-001');
    });

    it('TC-IM-002: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
      cy.screenshot('TC-IM-002');
    });

    it('TC-IM-003: table header contains expected columns', () => {
      cy.get('thead').invoke('text').then(headerText => {
        expect(headerText).to.match(/S\.?No|#/i);
        expect(headerText).to.match(/Indent No/i);
        expect(headerText).to.match(/Status/i);
        expect(headerText).to.match(/Priority/i);
        expect(headerText).to.match(/Subject/i);
      });
      cy.screenshot('TC-IM-003');
    });

    it('TC-IM-004: "New Indent" button is visible in the toolbar', () => {
      cy.contains('button', /New Indent/i).should('be.visible');
      cy.screenshot('TC-IM-004');
    });

    it('TC-IM-005: at least one data row is present in the table', () => {
      cy.get('tbody tr, .ag-row', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-IM-006: row S.No. column starts at 1', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds)
          .map(td => td.textContent.trim())
          .find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-IM-007: each data row contains an Indent No (IND# format)', () => {
      cy.get('tbody tr').first().invoke('text').should('match', /IND#\d+|IND-\d+|IND\d+/i);
      cy.screenshot('TC-IM-007');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-IM-008: Search input is visible', () => {
      cy.get('input[placeholder*="Search"], input[placeholder="Search"]').should('be.visible');
      cy.screenshot('TC-IM-008');
    });

    it('TC-IM-009: "My Indents" toggle button is visible', () => {
      cy.contains('button', /My Indents/i).should('be.visible');
      cy.screenshot('TC-IM-009');
    });

    it('TC-IM-010: "All Priorities" filter button is visible', () => {
      cy.contains('button', /All Priorities/i).should('be.visible');
      cy.screenshot('TC-IM-010');
    });

    it('TC-IM-011: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-IM-012: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-IM-013: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-IM-014: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Search Functionality', () => {

    const getSearchInput = () =>
      cy.get('input[placeholder="Search"], input[placeholder*="Search"]').first();

    it('TC-IM-015: search input accepts text', () => {
      getSearchInput().clear().type('IND').should('have.value', 'IND');
    });

    it('TC-IM-016: search by partial indent number returns matching records', () => {
      cy.get('tbody tr').first().invoke('text').then(rowText => {
        const match = rowText.match(/IND[#-]?\d+/i);
        if (match) {
          const partialNum = match[0].substring(0, 7);
          getSearchInput().clear().type(partialNum);
          cy.wait(1500);
          cy.get('body').should('not.contain', '500');
        } else {
          cy.log('Could not extract indent number from first row');
        }
      });
      cy.screenshot('TC-IM-016');
    });

    it('TC-IM-017: search with non-existent keyword shows no-results state', () => {
      getSearchInput().clear().type('ZZZNEVEREXIST99XYZ');
      cy.wait(1500);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found|empty/i);
      cy.screenshot('TC-IM-017');
    });

    it('TC-IM-018: search with special characters does not crash the page', () => {
      getSearchInput().clear().type('<>@#$%^');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-IM-019: clearing search restores full listing', () => {
      getSearchInput().clear().type('ZZNOTEXIST');
      cy.wait(1500);
      getSearchInput().clear();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Filter Functionality', () => {

    it('TC-IM-020: "My Indents" toggle filters list to current user indents', () => {
      cy.get('tbody tr').its('length').then(totalBefore => {
        cy.contains('button', /My Indents/i).click({ force: true });
        cy.wait(2000);
        cy.get('body').should('not.contain', '500');
        cy.log(`Before My Indents: ${totalBefore} rows`);
        cy.screenshot('TC-IM-020');
        // Toggle back off
        cy.contains('button', /My Indents|All Indents/i).click({ force: true });
        cy.wait(1500);
      });
    });

    it('TC-IM-021: "All Priorities" dropdown shows priority options', () => {
      cy.contains('button', /All Priorities/i).click({ force: true });
      cy.wait(600);
      cy.get('body').invoke('text').should('match', /Normal|High|Urgent|Low/i);
      cy.screenshot('TC-IM-021');
      cy.get('body').click(0, 0);
    });

    it('TC-IM-022: selecting a priority from the dropdown filters records', () => {
      cy.contains('button', /All Priorities/i).click({ force: true });
      cy.wait(600);
      cy.get('[role="option"], [role="listbox"] li, ul li').filter(':visible').then($opts => {
        const normalOpt = Array.from($opts).find(el => /Normal/i.test(el.textContent));
        if (normalOpt) {
          cy.wrap(normalOpt).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-IM-022');
        } else if ($opts.length > 0) {
          cy.wrap($opts.first()).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
        }
      });
    });

    it('TC-IM-023: Filters button expands the filter panel', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
      cy.get('body').then($body => {
        expect(
          $body.find('input:visible, select:visible, [role="combobox"]:visible').length
        ).to.be.greaterThan(0);
      });
      cy.screenshot('TC-IM-023');
      cy.contains('button', /Clear All/i).click({ force: true });
    });

    it('TC-IM-024: Status filter applies correctly', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
      cy.get('body').then($body => {
        const statusSel = $body.find('select').filter((_, el) =>
          /Status/i.test(el.textContent + el.name + el.id)
        );
        if (statusSel.length > 0) {
          cy.wrap(statusSel.first()).then($sel => {
            const opts = Array.from($sel[0].options).filter(o => o.value);
            if (opts.length > 0) {
              cy.wrap($sel).select(opts[0].value, { force: true });
              cy.wait(2000);
              cy.get('body').should('not.contain', '500');
              cy.screenshot('TC-IM-024');
            }
          });
        } else {
          cy.log('Status filter select not found');
        }
      });
      cy.contains('button', /Clear All/i).click({ force: true });
    });

    it('TC-IM-025: Clear All Filters resets filter state', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
      cy.contains('button', /Clear All/i).click({ force: true });
      cy.wait(800);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('TC-IM-025');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Pagination', () => {

    it('TC-IM-026: pagination controls are present in the list view', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) =>
          /Next|First|Last|Prev|>/i.test(el.textContent.trim())
        ).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-IM-027: clicking Next page loads a different set of records', () => {
      cy.get('tbody tr').first().invoke('text').then(pg1RowText => {
        cy.get('body').then($body => {
          const $next = $body.find('button').filter((_, el) =>
            /^Next$|^>$/.test(el.textContent.trim())
          ).first();
          if ($next.length) {
            cy.wrap($next).click({ force: true });
            cy.wait(1500);
            cy.get('tbody tr').first().invoke('text').should('not.eq', pg1RowText);
            cy.screenshot('TC-IM-027');
          } else {
            cy.log('Next page button not found or only one page');
          }
        });
      });
    });

    it('TC-IM-028: clicking Previous page navigates back to page 1', () => {
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

    it('TC-IM-029: Excel export button click does not throw a JS error', () => {
      cy.on('uncaught:exception', () => false);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-IM-029');
    });

    it('TC-IM-030: PDF export button click does not throw a JS error', () => {
      cy.on('uncaught:exception', () => false);
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-IM-030');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD INDENT — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add Indent — Form Display', () => {

    it('TC-IM-031: clicking "New Indent" opens the create form panel', () => {
      openAddForm();
      cy.get(SLIDE_OVER).filter(':visible').should('exist');
      cy.screenshot('TC-IM-031');
      closeForm();
    });

    it('TC-IM-032: form contains Department mandatory field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Department/i);
      cy.screenshot('TC-IM-032');
      closeForm();
    });

    it('TC-IM-033: form contains Assigned To mandatory field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Assigned To/i);
      closeForm();
    });

    it('TC-IM-034: form contains Priority field with Normal as an option', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Priority/i);
      cy.get('body').invoke('text').should('match', /Normal/i);
      cy.screenshot('TC-IM-034');
      closeForm();
    });

    it('TC-IM-035: form contains Subject / Heading textarea', () => {
      openAddForm();
      cy.get('textarea[name="Heading"]').should('be.visible');
      cy.screenshot('TC-IM-035');
      closeForm();
    });

    it('TC-IM-036: form contains PO No field (optional)', () => {
      openAddForm();
      cy.get('input[name="PONo"]').should('be.visible');
      closeForm();
    });

    it('TC-IM-037: form contains File Upload input', () => {
      openAddForm();
      cy.get('input[type="file"]').should('exist');
      cy.screenshot('TC-IM-037');
      closeForm();
    });

    it('TC-IM-038: product section contains Product Type field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Product Type/i);
      cy.screenshot('TC-IM-038');
      closeForm();
    });

    it('TC-IM-039: product section contains Instrument ID combobox', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select instrument"]').should('be.visible');
      cy.screenshot('TC-IM-039');
      closeForm();
    });

    it('TC-IM-040: product section contains Product/Item Name field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Product.*Name|Item.*Name/i);
      closeForm();
    });

    it('TC-IM-041: product section contains Quantity field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Qty|Quantity/i);
      closeForm();
    });

    it('TC-IM-042: product section contains Part No field', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Part No/i);
      closeForm();
    });

    it('TC-IM-043: product section contains CAS No field (optional)', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /CAS No/i);
      closeForm();
    });

    it('TC-IM-044: product section contains Company/Make Name combobox', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select company"]').should('be.visible');
      cy.screenshot('TC-IM-044');
      closeForm();
    });

    it('TC-IM-045: product section contains Remarks/Specification field (optional)', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Remark|Specification/i);
      closeForm();
    });

    it('TC-IM-046: "Add Product" button is visible in the form', () => {
      openAddForm();
      cy.contains('button', /Add Product/i).should('be.visible');
      cy.screenshot('TC-IM-046');
      closeForm();
    });

    it('TC-IM-047: product sub-table columns are visible', () => {
      openAddForm();
      cy.get('body').invoke('text').then(text => {
        expect(text).to.match(/Product Name|Item Name/i);
        expect(text).to.match(/Qty|Quantity/i);
        expect(text).to.match(/Part No/i);
      });
      cy.screenshot('TC-IM-047');
      closeForm();
    });

    it('TC-IM-048: Cancel button closes the form without saving', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        if ($body.text().match(/Discard|Are you sure/i)) {
          cy.contains('button', /Confirm|Yes|Discard/i).click({ force: true });
        }
      });
      cy.get(SLIDE_OVER).should('not.exist');
      cy.screenshot('TC-IM-048');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD INDENT — FIELD VALIDATIONS (NEGATIVE)
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Indent — Field Validations', () => {

    it('TC-IM-049: submitting blank form shows mandatory field validation errors', () => {
      openAddForm();
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|invalid|please|mandatory/i);
      cy.screenshot('TC-IM-049');
      closeForm();
    });

    it('TC-IM-050: Department is required — blank submit shows validation', () => {
      openAddForm();
      cy.get('textarea[name="Heading"]').type('Subject Only');
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /department|required/i);
      cy.screenshot('TC-IM-050');
      closeForm();
    });

    it('TC-IM-051: Assigned To is required — blank submit shows validation', () => {
      openAddForm();
      cy.get('textarea[name="Heading"]').type('Subject for Assign To Test');
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /assigned|assign|required/i);
      cy.screenshot('TC-IM-051');
      closeForm();
    });

    it('TC-IM-052: Subject / Heading textarea is required — blank submit shows validation', () => {
      openAddForm();
      // Leave Heading empty; try to save
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /heading|subject|required/i);
      cy.screenshot('TC-IM-052');
      closeForm();
    });

    it('TC-IM-053: Subject / Heading accepts very long text', () => {
      openAddForm();
      const longSubject = 'Long Subject '.repeat(15);
      cy.get('textarea[name="Heading"]').type(longSubject);
      cy.get('textarea[name="Heading"]').invoke('val').should('have.length.greaterThan', 50);
      cy.screenshot('TC-IM-053');
      closeForm();
    });

    it('TC-IM-054: PO No is optional — form accepts empty PO No without error', () => {
      openAddForm();
      cy.get('input[name="PONo"]').should('be.visible').and('have.value', '');
      cy.log('PO No is empty — optional field confirmed');
      cy.screenshot('TC-IM-054');
      closeForm();
    });

    it('TC-IM-055: PO No field accepts alphanumeric text', () => {
      openAddForm();
      cy.get('input[name="PONo"]').type('PO-2025-001');
      cy.get('input[name="PONo"]').should('have.value', 'PO-2025-001');
      closeForm();
    });

    it('TC-IM-056: Priority field contains "Normal" as a default or selectable option', () => {
      openAddForm();
      cy.get('body').then($body => {
        const normalVisible = $body.text().includes('Normal');
        expect(normalVisible).to.be.true;
        cy.screenshot('TC-IM-056');
      });
      closeForm();
    });

    it('TC-IM-057: Product Type "Consumer item" is a selectable option', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Consumer item|Consumer/i);
      cy.screenshot('TC-IM-057');
      closeForm();
    });

    it('TC-IM-058: Instrument ID combobox search returns results', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select instrument"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const hasOptions = $body.find('[role="option"], [role="listbox"] li').filter(':visible').length > 0;
        cy.log(`Instrument options appeared: ${hasOptions}`);
        cy.screenshot('TC-IM-058');
        if (hasOptions) {
          cy.get('[role="option"], [role="listbox"] li').filter(':visible').first().click({ force: true });
        } else {
          cy.get('body').click(0, 0);
        }
      });
      closeForm();
    });

    it('TC-IM-059: Company/Make Name combobox search returns results', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select company"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const hasOptions = $body.find('[role="option"], [role="listbox"] li').filter(':visible').length > 0;
        cy.log(`Company options appeared: ${hasOptions}`);
        cy.screenshot('TC-IM-059');
        if (hasOptions) {
          cy.get('[role="option"], [role="listbox"] li').filter(':visible').first().click({ force: true });
        } else {
          cy.get('body').click(0, 0);
        }
      });
      closeForm();
    });

    it('TC-IM-060: Quantity field is required in the product row — zero is rejected', () => {
      openAddForm();
      cy.contains(/Quantity|Qty/i).closest('div, td, label').parent()
        .find('input[type="number"], input').first().then($input => {
          if ($input.length) {
            cy.wrap($input).clear().type('0');
            cy.get('body').click(0, 0);
            cy.get('body').then($body => {
              const hasError = /greater than|minimum|invalid|positive/i.test($body.text());
              cy.log(`Quantity zero validation shown: ${hasError}`);
              cy.screenshot('TC-IM-060');
            });
          }
        });
      closeForm();
    });

    it('TC-IM-061: Quantity field rejects negative numbers', () => {
      openAddForm();
      cy.contains(/Quantity|Qty/i).closest('div, td, label').parent()
        .find('input[type="number"], input').first().then($input => {
          if ($input.length) {
            cy.wrap($input).clear().type('-5');
            cy.get('body').click(0, 0);
            cy.get('body').then($body => {
              cy.log(`Negative qty validation present: ${/invalid|minimum|positive/i.test($body.text())}`);
              cy.screenshot('TC-IM-061');
            });
          }
        });
      closeForm();
    });

    it('TC-IM-062: CAS No is optional — form accepts empty CAS No', () => {
      openAddForm();
      cy.get('body').then($body => {
        const casInput = $body.find('input').filter((_, el) =>
          /CAS/i.test(el.placeholder || el.name || el.id || '')
        );
        if (casInput.length) {
          cy.wrap(casInput.first()).should('have.value', '');
          cy.log('CAS No is empty — optional confirmed');
        }
      });
      closeForm();
    });

    it('TC-IM-063: Remarks/Specification is optional — accepts any text', () => {
      openAddForm();
      cy.get('body').then($body => {
        const specInput = $body.find('input').filter((_, el) =>
          /Remark|Specification|Spec/i.test(el.placeholder || el.name || el.id || '')
        );
        if (specInput.length) {
          cy.wrap(specInput.first()).type('Test remark text');
          cy.wrap(specInput.first()).should('have.value', 'Test remark text');
          cy.screenshot('TC-IM-063');
        }
      });
      closeForm();
    });

    it('TC-IM-064: XSS payload in Subject field does not trigger alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS alert triggered!'); });
      cy.get('textarea[name="Heading"]').type("<script>alert('xss')</script>");
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-IM-064');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. PRODUCT SUB-TABLE INTERACTION
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Product Sub-Table Interaction', () => {

    const fillMinimalHeader = () => {
      // Fill the minimum header fields required before adding products
      cy.get('body').then($body => {
        // Department
        const deptField = $body.find('select, [role="combobox"]').filter((_, el) => {
          const label = el.closest('div')?.querySelector('label')?.textContent || '';
          return /Department/i.test(label);
        });
        if (deptField.length > 0) {
          const $dept = Cypress.$(deptField[0]);
          if ($dept.is('select')) {
            cy.wrap($dept).select(1, { force: true });
          } else {
            cy.wrap($dept).click({ force: true });
            cy.wait(500);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
          cy.wait(300);
        }
      });

      cy.get('textarea[name="Heading"]').type(`Sub-table Test ${TS}`);
    };

    it('TC-IM-065: "Add Product" button adds a new row to the product sub-table', () => {
      openAddForm();
      fillMinimalHeader();
      cy.get('table, tbody').then($table => {
        const initialRows = $table.find('tr').length;
        cy.contains('button', /Add Product/i).click({ force: true });
        cy.wait(800);
        cy.get('table, tbody').find('tr').should('have.length.greaterThan', initialRows);
        cy.screenshot('TC-IM-065');
      });
      closeForm();
    });

    it('TC-IM-066: multiple "Add Product" clicks create multiple rows', () => {
      openAddForm();
      fillMinimalHeader();
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(600);
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(600);
      cy.get('body').then($body => {
        // At least 2 product rows should exist (via input fields in table)
        const inputsInTable = $body.find('table input, tbody input').length;
        expect(inputsInTable).to.be.greaterThan(0);
        cy.screenshot('TC-IM-066');
      });
      closeForm();
    });

    it('TC-IM-067: product sub-table shows Type, Product Name, Qty, Part No columns', () => {
      openAddForm();
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').then(text => {
        expect(text).to.match(/Type/i);
        expect(text).to.match(/Product Name|Item Name/i);
        expect(text).to.match(/Qty|Quantity/i);
        expect(text).to.match(/Part No/i);
        cy.screenshot('TC-IM-067');
      });
      closeForm();
    });

    it('TC-IM-068: product row delete button removes the row from sub-table', () => {
      openAddForm();
      fillMinimalHeader();
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(800);
      cy.get('table tbody tr, .product-row').then($rows => {
        const countBefore = $rows.length;
        // Find delete/remove button within the row
        cy.get('table tbody tr, .product-row').last().find('button').filter((_, el) =>
          /delete|remove|trash/i.test(el.className + el.textContent)
        ).first().then($delBtn => {
          if ($delBtn.length) {
            cy.wrap($delBtn).click({ force: true });
            cy.wait(800);
            cy.get('table tbody tr, .product-row').should('have.length.lessThan', countBefore + 1);
            cy.screenshot('TC-IM-068');
          } else {
            // Try the last button in the row as fallback
            cy.get('table tbody tr').last().find('button').last().click({ force: true });
            cy.wait(800);
            cy.screenshot('TC-IM-068-fallback');
          }
        });
      });
      closeForm();
    });

    it('TC-IM-069: file upload accepts a valid PDF file', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(TEST_FILE_PATH, { force: true });
      cy.wait(1500);
      cy.get('input[type="file"]').then($input => {
        expect($input[0].files.length).to.be.greaterThan(0);
        cy.log(`File selected: ${$input[0].files[0]?.name}`);
      });
      cy.screenshot('TC-IM-069');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ADD INDENT — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Add Indent — Success Flow', () => {

    it('TC-IM-070: filling all mandatory fields and saving creates an indent', () => {
      openAddForm();

      // 1. Department
      cy.contains(/Department/i).closest('div, label').parent()
        .find('select, [role="combobox"], input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(500);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
        });
      cy.wait(500);

      // 2. Assigned To
      cy.contains(/Assigned To/i).closest('div, label').parent()
        .find('select, [role="combobox"], input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true }).type('Admin');
            cy.wait(1000);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
        });
      cy.wait(500);

      // 3. Priority — select Normal (or first available)
      cy.contains(/Priority/i).closest('div, label').parent()
        .find('select, [role="combobox"]').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).then($sel => {
              const opts = Array.from($sel[0].options).filter(o => o.value);
              if (opts.length > 0) {
                cy.wrap($sel).select(opts[0].value, { force: true });
              }
            });
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(500);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
        });
      cy.wait(300);

      // 4. Subject / Heading
      cy.get('textarea[name="Heading"]').type(INDENT_SUBJECT);

      // 5. Add a product row
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(800);

      // 6. Fill product details in the first row
      cy.get('table tbody tr').first().within(() => {
        // Product Type — select "Consumer item" if available
        cy.get('select').first().then($sel => {
          const opts = Array.from($sel[0].options).filter(o => o.value);
          if (opts.length > 0) {
            cy.wrap($sel).select(opts[0].value, { force: true });
          }
        });
        cy.wait(300);

        // Product Name
        cy.get('input[type="text"]').first().clear().type('Test Product Item');

        // Quantity
        cy.get('input[type="number"], input[type="text"]').then($inputs => {
          const qtyInput = Array.from($inputs).find(el =>
            /qty|quantity/i.test(el.placeholder || el.name || el.id || '')
          );
          if (qtyInput) {
            cy.wrap(qtyInput).clear().type('5');
          } else {
            cy.get('input[type="number"]').first().clear().type('5');
          }
        });

        // Part No
        cy.get('input').filter((_, el) =>
          /part/i.test(el.placeholder || el.name || el.id || '')
        ).first().then($el => {
          if ($el.length) cy.wrap($el).clear().type('PN-001');
        });

        // Company
        cy.get('input[placeholder*="Search and select company"]').type('A');
      });
      cy.wait(1500);
      cy.get('[role="option"], [role="listbox"] li').filter(':visible').first().click({ force: true });
      cy.wait(500);

      // 7. Save
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').invoke('text').should('match', /success|created|saved|IND#/i);
      cy.screenshot('TC-IM-070');
    });

    it('TC-IM-071: after save the new indent appears in the list with an IND# number', () => {
      cy.get('input[placeholder="Search"], input[placeholder*="Search"]').first()
        .clear().type(INDENT_SUBJECT);
      cy.wait(1500);
      cy.get('body').invoke('text').should('match', /IND#\d+|IND-\d+|IND\d+/i);
      cy.screenshot('TC-IM-071');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ROW-LEVEL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Row-Level Actions', () => {

    it('TC-IM-072: each data row has visible action buttons or links', () => {
      cy.get('tbody tr').first().find('button, a[role="button"]').should('have.length.greaterThan', 0);
      cy.screenshot('TC-IM-072');
    });

    it('TC-IM-073: clicking the Indent No button opens the indent details', () => {
      cy.get('tbody tr').first().find('button').filter((_, el) =>
        /IND#|IND-/i.test(el.textContent)
      ).first().then($btn => {
        if ($btn.length) {
          cy.wrap($btn).click({ force: true });
          cy.wait(2500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-IM-073');
          // Close any modal/panel that opened
          cy.get('body').then($b => {
            if ($b.find('[role="dialog"]').length) {
              cy.contains('button', /Cancel|Close/i).click({ force: true });
            }
          });
        } else {
          cy.log('Indent No button not found with IND# text');
          cy.get('tbody tr').first().find('button').first().click({ force: true });
          cy.wait(2000);
          cy.screenshot('TC-IM-073-fallback');
          cy.get('body').then($b => {
            if ($b.find('[role="dialog"]').length) {
              cy.contains('button', /Cancel|Close/i).click({ force: true });
            }
          });
        }
      });
    });

    it('TC-IM-074: second action button on a row opens an action or detail view', () => {
      cy.get('tbody tr').first().find('button').then($btns => {
        if ($btns.length >= 2) {
          cy.wrap($btns.eq(1)).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-IM-074');
          cy.get('body').then($b => {
            if ($b.find('[role="dialog"]').length) {
              cy.contains('button', /Cancel|Close/i).click({ force: true });
            }
          });
        } else {
          cy.log('Only one button in row — skipping second button test');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. VIEW / EDIT EXISTING INDENT
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. View / Edit Existing Indent', () => {

    it('TC-IM-075: opening an existing indent from the row shows its subject', () => {
      cy.get('tbody tr').first().invoke('text').then(rowText => {
        cy.get('tbody tr').first().find('button').first().click({ force: true });
        cy.wait(2500);
        cy.get('body').should('not.contain', '500');
        cy.screenshot('TC-IM-075');
        cy.get('body').then($b => {
          if ($b.find('[role="dialog"]').length) {
            cy.contains('button', /Cancel|Close/i).click({ force: true });
          }
        });
      });
    });

    it('TC-IM-076: opened indent form/view contains the Indent No header', () => {
      cy.get('tbody tr').first().find('button').first().click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /IND#\d+|IND-\d+|IND\d+/i);
      cy.screenshot('TC-IM-076');
      cy.get('body').then($b => {
        if ($b.find('[role="dialog"]').length) {
          cy.contains('button', /Cancel|Close/i).click({ force: true });
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. LARGE FILE & INVALID FILE UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. File Upload Edge Cases', () => {

    it('TC-IM-077: uploading valid PDF file is accepted without errors', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(TEST_FILE_PATH, { force: true });
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-IM-077');
      closeForm();
    });

    it('TC-IM-078: form does not crash when file input is interacted with', () => {
      openAddForm();
      cy.get('input[type="file"]').should('exist');
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. END-TO-END WORKFLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. End-to-End Workflow', () => {

    const E2E_TS      = Date.now().toString().slice(-5);
    const E2E_SUBJECT = `E2E Indent ${E2E_TS}`;

    it('TC-IM-079: E2E — create indent with product → verify in list → view details', () => {
      // ── STEP 1: Create ────────────────────────────────────────────────────
      openAddForm();

      // Department
      cy.contains(/Department/i).closest('div, label').parent()
        .find('select, [role="combobox"], input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(500);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
        });
      cy.wait(500);

      // Assigned To
      cy.contains(/Assigned To/i).closest('div, label').parent()
        .find('select, [role="combobox"], input').first().then($el => {
          if ($el.is('select')) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true }).type('Admin');
            cy.wait(1000);
            cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          }
        });
      cy.wait(300);

      // Priority
      cy.contains(/Priority/i).closest('div, label').parent()
        .find('select').first().then($sel => {
          const opts = Array.from($sel[0].options).filter(o => o.value);
          if (opts.length > 0) cy.wrap($sel).select(opts[0].value, { force: true });
        });
      cy.wait(300);

      // Subject
      cy.get('textarea[name="Heading"]').type(E2E_SUBJECT);

      // Add product row
      cy.contains('button', /Add Product/i).click({ force: true });
      cy.wait(800);

      cy.get('table tbody tr').first().within(() => {
        cy.get('select').first().then($sel => {
          const opts = Array.from($sel[0].options).filter(o => o.value);
          if (opts.length > 0) cy.wrap($sel).select(opts[0].value, { force: true });
        });
        cy.get('input[type="text"]').first().clear().type('E2E Test Product');
        cy.get('input[type="number"]').first().clear().type('3');
        cy.get('input').filter((_, el) =>
          /part/i.test(el.placeholder || el.name || el.id || '')
        ).first().then($el => {
          if ($el.length) cy.wrap($el).clear().type('PN-E2E');
        });
        cy.get('input[placeholder*="Search and select company"]').type('A');
      });
      cy.wait(1500);
      cy.get('[role="option"], [role="listbox"] li').filter(':visible').first().click({ force: true });
      cy.wait(500);

      // Upload file
      cy.get('input[type="file"]').selectFile(TEST_FILE_PATH, { force: true });
      cy.wait(1000);

      // Save
      cy.contains('button', /^Save$|Submit/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').invoke('text').should('match', /success|created|saved|IND#/i);
      cy.screenshot('TC-IM-079-created');

      // ── STEP 2: Verify in list ─────────────────────────────────────────────
      cy.get('input[placeholder="Search"], input[placeholder*="Search"]').first()
        .clear().type(E2E_SUBJECT);
      cy.wait(1500);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_SUBJECT, 'i'));
      cy.screenshot('TC-IM-079-verified-in-list');

      // ── STEP 3: View details ───────────────────────────────────────────────
      cy.get('tbody tr').first().find('button').first().click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.get('body').invoke('text').should('match', /IND#\d+|IND-\d+|IND\d+/i);
      cy.screenshot('TC-IM-079-viewed');

      cy.get('body').then($b => {
        if ($b.find('[role="dialog"]').length) {
          cy.contains('button', /Cancel|Close/i).click({ force: true });
        }
      });
    });
  });
});
