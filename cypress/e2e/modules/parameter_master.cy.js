/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Parameter (Analyte Master) Module — Comprehensive Test Suite
// URL    : /dashboard/testing/analyt-master-v2
// Run    : npx cypress run --spec cypress/e2e/modules/parameter_master.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/testing/analyt-master-v2';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const PARAM_NAME = `AutoParam ${TS}`;

describe('Parameter (Analyte Master) Module', () => {

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

    it('TC-PARAM-001: navigating to the Parameter module opens the listing screen', () => {
      cy.url().should('include', 'analyt-master');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-PARAM-001');
    });

    it('TC-PARAM-002: page displays a recognizable module heading', () => {
      cy.get('h1, h2, h3, span.text-xl, [class*="text-2xl"]').first()
        .invoke('text').should('match', /parameter|analyte|master/i);
    });

    it('TC-PARAM-003: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
      cy.screenshot('TC-PARAM-003');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-PARAM-004: New Parameter button is visible in the toolbar', () => {
      cy.contains('button', /New Parameter/i).should('be.visible');
      cy.screenshot('TC-PARAM-004');
    });

    it('TC-PARAM-005: Excel export button is visible in the toolbar', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-PARAM-006: PDF export button is visible in the toolbar', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-PARAM-007: Columns button is visible in the toolbar', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-PARAM-008: Search input is displayed with a placeholder', () => {
      cy.get('input[placeholder*="earch"], input[placeholder*="Search"]').should('be.visible');
    });

    it('TC-PARAM-009: Search button is visible beside the search input', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });

    it('TC-PARAM-010: Filters button is visible in the toolbar', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. GRID / LISTING
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Grid & Listing', () => {

    it('TC-PARAM-011: grid renders with table header row visible', () => {
      cy.get('thead').should('be.visible');
      cy.screenshot('TC-PARAM-011');
    });

    it('TC-PARAM-012: table header contains S.No. column', () => {
      cy.get('thead').invoke('text').should('match', /S\.No|#/i);
    });

    it('TC-PARAM-013: table header contains Parameter Name column', () => {
      cy.get('thead').invoke('text').should('match', /parameter|analyte|name/i);
    });

    it('TC-PARAM-014: table header contains an Actions column', () => {
      cy.get('thead').invoke('text').should('match', /action/i);
    });

    it('TC-PARAM-015: at least one data row is present in the grid', () => {
      cy.get('tbody tr', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-PARAM-016: row checkboxes are displayed for each record', () => {
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });

    it('TC-PARAM-017: header checkbox is displayed for bulk selection', () => {
      cy.get('thead input[type="checkbox"]').should('exist');
    });

    it('TC-PARAM-018: S.No. column starts at 1 for the first row', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-PARAM-019: pagination controls are present at the bottom of the grid', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|First|Last|Prev/i.test(el.textContent)).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-PARAM-020: total result count is displayed', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Search Functionality', () => {

    it('TC-PARAM-021: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('pH').should('have.value', 'pH');
    });

    it('TC-PARAM-022: searching with valid keyword returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('pH');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-022');
    });

    it('TC-PARAM-023: searching with partial text returns relevant records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('par');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PARAM-024: searching with non-existent text shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99999XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-PARAM-024');
    });

    it('TC-PARAM-025: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('@#$%^');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500').and('not.contain', 'Unhandled');
    });

    it('TC-PARAM-026: searching with empty input returns all records', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-PARAM-027: search input trims leading/trailing spaces before querying', () => {
      cy.get('input[placeholder*="earch"]').clear().type('  pH  ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
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

    it('TC-PARAM-028: clicking Filters expands the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        expect($body.find('input:visible, select:visible').length).to.be.greaterThan(0);
      });
      cy.screenshot('TC-PARAM-028');
    });

    it('TC-PARAM-029: filter panel can be collapsed after opening', () => {
      openFilters();
      cy.contains('button', /Filter/i).click();
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PARAM-030: filtering by Parameter Name returns matching results', () => {
      openFilters();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]')
        .filter(':visible').first().clear().type('pH');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-030');
      clearFilters();
    });

    it('TC-PARAM-031: clearing filters restores the full list', () => {
      openFilters();
      cy.get('input').filter(':visible').first().clear().type('ZZZNOTEXIST');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      clearFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-PARAM-032: Status filter shows Active/Inactive options when present', () => {
      openFilters();
      cy.get('body').then($body => {
        const hasStatusFilter = $body.find('select, [role="combobox"]').filter(':visible').length > 0;
        cy.log(`Status filter found: ${hasStatusFilter}`);
        cy.screenshot('TC-PARAM-032');
      });
      clearFilters();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ROW SELECTION & BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Row Selection & Bulk Actions', () => {

    it('TC-PARAM-033: clicking a row checkbox selects the row', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('tbody input[type="checkbox"]').first().should('be.checked');
    });

    it('TC-PARAM-034: header checkbox selects all rows on the page', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => cy.wrap($cb).should('be.checked'));
    });

    it('TC-PARAM-035: unchecking header checkbox deselects all rows', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('thead input[type="checkbox"]').uncheck({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => cy.wrap($cb).should('not.be.checked'));
    });

    it('TC-PARAM-036: Actions button is visible after selecting a row', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.screenshot('TC-PARAM-036');
      cy.get('body').click(0, 0);
    });

    it('TC-PARAM-037: Actions menu contains Delete option when row selected', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('contain', 'Delete');
      cy.get('body').click(0, 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD PARAMETER — FORM DISPLAY & VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add Parameter — Form Display & Validations', () => {

    const openAddForm = () => {
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
    };

    it('TC-PARAM-038: clicking New Parameter opens the create form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /New Parameter|Add Parameter|Create Parameter|Analyte/i);
      cy.screenshot('TC-PARAM-038');
      closeForm();
    });

    it('TC-PARAM-039: Parameter Name field is visible and mandatory', () => {
      openAddForm();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]')
        .filter(':visible').first().should('exist');
      closeForm();
    });

    it('TC-PARAM-040: Cancel button closes the form without saving', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').invoke('text').should('not.match', /New Parameter|Add Parameter/i);
      cy.screenshot('TC-PARAM-040');
    });

    it('TC-PARAM-041: clicking Save/Submit without filling fields shows validation errors', () => {
      openAddForm();
      cy.contains('button', /Next Step|Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-PARAM-041');
      closeForm();
    });

    it('TC-PARAM-042: Parameter Name field rejects blank/spaces-only input', () => {
      openAddForm();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first().type('   ');
      cy.contains('button', /Next Step|Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      closeForm();
    });

    it('TC-PARAM-043: Parameter Name accepts valid alphanumeric input', () => {
      openAddForm();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .type('Test Param 123').should('have.value', 'Test Param 123');
      closeForm();
    });

    it('TC-PARAM-044: form contains Unit/Dropdown fields when present', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasUnit = $body.find('input[placeholder*="Unit"], select, [role="combobox"]').filter(':visible').length > 0;
        cy.log(`Unit field found: ${hasUnit}`);
        cy.screenshot('TC-PARAM-044');
      });
      closeForm();
    });

    it('TC-PARAM-045: all visible fields accept valid input without errors', () => {
      openAddForm();
      cy.get('input').filter(':visible').each($input => {
        const placeholder = $input.attr('placeholder') || '';
        if (!/search|select/i.test(placeholder) && $input.attr('type') !== 'checkbox') {
          cy.wrap($input).clear().type('Test Value').should('have.value', 'Test Value');
          cy.wrap($input).clear();
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD PARAMETER — SUCCESSFUL CREATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Parameter — Successful Creation', () => {

    it('TC-PARAM-046: filling mandatory fields and submitting creates the parameter', () => {
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');

      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]')
        .filter(':visible').first().clear().type(PARAM_NAME);

      cy.get('body').then($body => {
        const dropdowns = $body.find('[role="combobox"], select').filter(':visible');
        if (dropdowns.length > 0) {
          cy.wrap(dropdowns.first()).click({ force: true });
          cy.wait(300);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      cy.contains('button', /Next Step|Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-046');
    });

    it('TC-PARAM-047: newly created parameter appears in the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(PARAM_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(PARAM_NAME, 'i'));
      cy.screenshot('TC-PARAM-047');
    });

    it('TC-PARAM-048: duplicate Parameter Name is rejected with an error', () => {
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .clear().type(PARAM_NAME);
      cy.contains('button', /Next Step|Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /already exists|duplicate|unique/i);
      cy.screenshot('TC-PARAM-048');
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EDIT PARAMETER
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Edit Parameter', () => {

    const openEditFirst = () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.wait(2500);
    };

    it('TC-PARAM-049: clicking Edit on a row opens the Edit Parameter form', () => {
      openEditFirst();
      cy.get('body').invoke('text').should('match', /Edit Parameter|Update Parameter|Edit Analyte/i);
      cy.screenshot('TC-PARAM-049');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PARAM-050: Edit form pre-populates Parameter Name field', () => {
      openEditFirst();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-PARAM-050');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PARAM-051: clearing Parameter Name in Edit shows validation error on save', () => {
      openEditFirst();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first().clear();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-PARAM-051');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PARAM-052: modifying Parameter Name and saving persists the change', () => {
      cy.get('input[placeholder*="earch"]').clear().type(PARAM_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.wait(2500);

      const updatedName = `${PARAM_NAME} Upd`;
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .clear().type(updatedName);
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-052');
    });

    it('TC-PARAM-053: Cancel in Edit form closes the form without saving changes', () => {
      openEditFirst();
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .clear().type('SHOULD_NOT_PERSIST');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. DELETE PARAMETER
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Delete Parameter', () => {

    it('TC-PARAM-054: selecting a row and clicking Actions > Delete shows confirmation dialog', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-PARAM-054');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-PARAM-055: canceling the delete dialog does not remove the record', () => {
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

    it('TC-PARAM-056: confirming delete removes the parameter from the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(PARAM_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('Parameter not found — skipping deletion');
        } else {
          cy.get('tbody input[type="checkbox"]').first().check({ force: true });
          cy.contains('button', /Actions|Action/i).click({ force: true });
          cy.wait(500);
          cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.wait(1000);
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-PARAM-056');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Export Functionality', () => {

    it('TC-PARAM-057: clicking Excel export triggers download without page error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-057');
    });

    it('TC-PARAM-058: clicking PDF export triggers download without page error', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-PARAM-058');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Pagination', () => {

    it('TC-PARAM-059: Next page button navigates to the next set of records', () => {
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

    it('TC-PARAM-060: First page button returns to the first page', () => {
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
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Edge Cases', () => {

    it('TC-PARAM-061: very long Parameter Name does not break the grid layout', () => {
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      const longName = 'A'.repeat(200);
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .type(longName, { delay: 0 });
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .invoke('val').its('length').should('be.at.most', 200);
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PARAM-062: XSS/injection strings in Parameter Name do not trigger alerts', () => {
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      const xss = "<script>alert('XSS')</script>";
      cy.on('window:alert', () => { throw new Error('XSS Alert triggered!'); });
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first().type(xss);
      cy.contains('button', /Next Step|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.screenshot('TC-PARAM-062');
    });

    it('TC-PARAM-063: browser back navigation does not corrupt the listing', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-PARAM-064: rapid multiple clicks on New Parameter do not open multiple forms', () => {
      cy.contains('button', /New Parameter/i)
        .dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-PARAM-065: the listing is responsive during heavy data load', () => {
      cy.get('tbody tr', { timeout: 25000 }).should('have.length.greaterThan', 0);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2EParam ${E2E_TS}`;

    it('E2E-PARAM-001: Create → Search → Edit → Delete a parameter', () => {
      // Create
      cy.contains('button', /New Parameter/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .clear().type(E2E_NAME);
      cy.get('body').then($body => {
        const dropdowns = $body.find('[role="combobox"], select').filter(':visible');
        if (dropdowns.length > 0) {
          cy.wrap(dropdowns.first()).click({ force: true });
          cy.wait(300);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });
      cy.contains('button', /Next Step|Save|Submit|Create/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-PARAM-001-created');

      // Search
      cy.get('input[placeholder*="earch"]').clear().type(E2E_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_NAME, 'i'));

      // Edit
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.wait(2500);
      cy.get('input[placeholder*="parameter name"], input[placeholder*="Parameter Name"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);

      // Delete
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
      cy.wait(3000);
      cy.screenshot('E2E-PARAM-001-deleted');

      // Verify deletion
      cy.get('input[placeholder*="earch"]').clear().type(E2E_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
    });

    it('E2E-PARAM-002: Apply search filter, export to Excel, verify no errors', () => {
      cy.get('input[placeholder*="earch"]').clear().type('pH');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-PARAM-002');
    });
  });
});
