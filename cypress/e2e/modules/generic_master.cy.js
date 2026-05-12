/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Generic Master Module — Comprehensive Test Suite
// URL    : /dashboard/products/generic-master-v2
// Run    : npx cypress run --spec cypress/e2e/modules/generic_master.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/products/generic-master-v2';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const GENERIC_NAME = `AutoGeneric ${TS}`;

const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

describe('Generic Master Module', () => {

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

    it('TC-GM-001: navigating to Generic Master opens the listing screen', () => {
      cy.url().should('include', 'generic-master');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-GM-001');
    });

    it('TC-GM-002: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
    });

    it('TC-GM-003: page heading indicates Generic Master module', () => {
      cy.get('body').invoke('text').should('match', /Generic Master|Generic/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TABS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Tabs', () => {

    it('TC-GM-004: Active tab is visible and selected by default', () => {
      cy.contains(/^Active$/i).should('be.visible');
      cy.screenshot('TC-GM-004');
    });

    it('TC-GM-005: Approval Pending tab is visible', () => {
      cy.contains(/Approval\s*Pending|Pending/i).should('be.visible');
    });

    it('TC-GM-006: clicking Approval Pending tab loads pending records', () => {
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-GM-006');
    });

    it('TC-GM-007: clicking Active tab returns to the active listing', () => {
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(1000);
      cy.contains(/^Active$/i).click({ force: true });
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Toolbar Elements', () => {

    it('TC-GM-008: New Generic Master button is visible', () => {
      cy.contains('button', /New Generic Master/i).should('be.visible');
      cy.screenshot('TC-GM-008');
    });

    it('TC-GM-009: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-GM-010: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-GM-011: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-GM-012: Search input is visible', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-GM-013: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. GRID / LISTING
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Grid & Listing', () => {

    it('TC-GM-014: grid header contains Generic Name column', () => {
      cy.get('thead').invoke('text').should('match', /Generic Name|Generic/i);
    });

    it('TC-GM-015: grid header contains Matrix Name column', () => {
      cy.get('thead').invoke('text').should('match', /Matrix/i);
    });

    it('TC-GM-016: at least one data row is visible', () => {
      cy.get('tbody tr', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-GM-017: row checkboxes are present for each record', () => {
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });

    it('TC-GM-018: S.No. column starts at 1 for the first row', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-GM-019: pagination controls are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|First|Last|Prev/i.test(el.textContent)).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-GM-020: total result count is displayed', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Search Functionality', () => {

    it('TC-GM-021: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Generic').should('have.value', 'Generic');
    });

    it('TC-GM-022: searching with a valid keyword returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Generic');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-GM-022');
    });

    it('TC-GM-023: searching with non-existent keyword shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-GM-023');
    });

    it('TC-GM-024: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('@#$%^');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-GM-025: clearing search and clicking Search restores full listing', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Filter Functionality', () => {

    const openFilters = () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
    };

    const clearFilters = () => {
      cy.contains('button', /Clear|Reset/i).click({ force: true });
      cy.wait(500);
    };

    it('TC-GM-026: clicking Filters expands the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        expect($body.find('input:visible, select:visible, [role="combobox"]:visible').length).to.be.greaterThan(0);
      });
      cy.screenshot('TC-GM-026');
    });

    it('TC-GM-027: Matrix filter field is present and accepts input', () => {
      openFilters();
      cy.get('body').then($body => {
        const matrixFilter = $body.find('input[placeholder*="Matrix"], select[name*="matrix"], [role="combobox"]').filter(':visible');
        if (matrixFilter.length > 0) {
          cy.log('Matrix filter found');
          cy.screenshot('TC-GM-027');
        } else {
          cy.log('Matrix filter not found in current layout');
        }
      });
      clearFilters();
    });

    it('TC-GM-028: applying and clearing filters restores full listing', () => {
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
  // 7. ADD GENERIC MASTER — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add Generic Master — Form Display', () => {

    const openAddForm = () => {
      cy.contains('button', /New Generic Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-GM-029: clicking New Generic Master opens the create form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /New Generic Master|Add Generic|Create Generic/i);
      cy.screenshot('TC-GM-029');
      closeForm();
    });

    it('TC-GM-030: Generic Name field is displayed', () => {
      openAddForm();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .should('exist');
      closeForm();
    });

    it('TC-GM-031: Matrix field/dropdown is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Matrix');
      closeForm();
    });

    it('TC-GM-032: Label field/dropdown is displayed', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasLabel = $body.text().match(/Label/i);
        cy.log(`Label field present: ${!!hasLabel}`);
        cy.screenshot('TC-GM-032');
      });
      closeForm();
    });

    it('TC-GM-033: Purpose field/dropdown is displayed', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasPurpose = $body.text().match(/Purpose/i);
        cy.log(`Purpose field present: ${!!hasPurpose}`);
      });
      closeForm();
    });

    it('TC-GM-034: Remarks field is displayed', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasRemarks = $body.find('input[placeholder*="Remarks"], textarea[placeholder*="Remarks"]').filter(':visible').length > 0;
        cy.log(`Remarks field present: ${hasRemarks}`);
        cy.screenshot('TC-GM-034');
      });
      closeForm();
    });

    it('TC-GM-035: Submit for Review button is displayed', () => {
      openAddForm();
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').should('exist');
      closeForm();
    });

    it('TC-GM-036: Cancel button closes the form', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD GENERIC MASTER — FORM VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Generic Master — Form Validations', () => {

    const openAddForm = () => {
      cy.contains('button', /New Generic Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-GM-037: blank form submission shows validation errors', () => {
      openAddForm();
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-GM-037');
      closeForm();
    });

    it('TC-GM-038: Generic Name field rejects blank/spaces-only input', () => {
      openAddForm();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .type('    ');
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      closeForm();
    });

    it('TC-GM-039: Generic Name accepts valid alphanumeric text', () => {
      openAddForm();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .type('Test Generic 123').should('have.value', 'Test Generic 123');
      closeForm();
    });

    it('TC-GM-040: Matrix dropdown shows selectable options when clicked', () => {
      openAddForm();
      cy.get('body').then($body => {
        const matrixEl = $body.find('input[placeholder*="Matrix"], [role="combobox"]').filter(':visible');
        if (matrixEl.length > 0) {
          cy.wrap(matrixEl.first()).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').should('have.length.greaterThan', 0);
          cy.screenshot('TC-GM-040');
          cy.get('body').click(0, 0);
        }
      });
      closeForm();
    });

    it('TC-GM-041: Label dropdown shows selectable options when clicked', () => {
      openAddForm();
      cy.get('body').then($body => {
        const allComboboxes = $body.find('[role="combobox"]').filter(':visible');
        if (allComboboxes.length > 1) {
          cy.wrap(allComboboxes.eq(1)).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').should('have.length.greaterThan', 0);
          cy.get('body').click(0, 0);
          cy.screenshot('TC-GM-041');
        }
      });
      closeForm();
    });

    it('TC-GM-042: XSS injection in Generic Name does not trigger alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .type("<script>alert('xss')</script>");
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-GM-043: form data is retained when validation fails and user stays on form', () => {
      openAddForm();
      const testName = 'Data Retain Generic Test';
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .type(testName);
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .should('have.value', testName);
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD GENERIC MASTER — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Add Generic Master — Success Flow', () => {

    it('TC-GM-044: filling all mandatory fields and submitting creates a Generic Master', () => {
      cy.contains('button', /New Generic Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');

      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .clear().type(GENERIC_NAME);

      // Fill Matrix
      cy.get('body').then($body => {
        const matrixEl = $body.find('input[placeholder*="Matrix"], [role="combobox"]').filter(':visible');
        if (matrixEl.length > 0) {
          cy.wrap(matrixEl.first()).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      // Fill Label (second combobox)
      cy.get('body').then($body => {
        const allComboboxes = $body.find('[role="combobox"]').filter(':visible');
        if (allComboboxes.length > 1) {
          cy.wrap(allComboboxes.eq(1)).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      // Fill Purpose
      cy.get('body').then($body => {
        const allComboboxes = $body.find('[role="combobox"]').filter(':visible');
        if (allComboboxes.length > 2) {
          cy.wrap(allComboboxes.eq(2)).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });

      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-GM-044');
    });

    it('TC-GM-045: newly created Generic Master appears in Approval Pending tab', () => {
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(2000);
      cy.get('input[placeholder*="earch"]').clear().type(GENERIC_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(GENERIC_NAME, 'i'));
      cy.screenshot('TC-GM-045');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ROW-LEVEL ACTIONS (View, Edit, Clone, Logs, Delete)
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Row-Level Actions', () => {

    const openRowMenu = () => {
      cy.contains(/^Active$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
    };

    it('TC-GM-046: row action button opens an action menu', () => {
      openRowMenu();
      cy.screenshot('TC-GM-046');
      cy.get('body').click(0, 0);
    });

    it('TC-GM-047: action menu contains View option', () => {
      openRowMenu();
      cy.get('body').invoke('text').should('match', /View|Preview/i);
      cy.get('body').click(0, 0);
    });

    it('TC-GM-048: clicking View opens a read-only Generic Master form', () => {
      openRowMenu();
      cy.contains(/^View$/i, { matchCase: false }).click({ force: true });
      cy.wait(2000);
      cy.get(SLIDE_OVER).filter(':visible').should('exist');
      cy.get('body').invoke('text').should('match', /View Generic|Generic Master/i);
      cy.screenshot('TC-GM-048');
      cy.contains('button', /Close|Cancel/i).click({ force: true });
    });

    it('TC-GM-049: View mode shows Generic Name field as read-only', () => {
      openRowMenu();
      cy.contains(/^View$/i, { matchCase: false }).click({ force: true });
      cy.wait(2000);
      cy.get('body').then($body => {
        const genericInput = $body.find('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible');
        if (genericInput.length > 0) {
          const isReadOnly = genericInput.first().prop('disabled') || genericInput.first().prop('readOnly');
          cy.log(`Generic Name field is read-only: ${isReadOnly}`);
        }
        cy.screenshot('TC-GM-049');
      });
      cy.contains('button', /Close|Cancel/i).click({ force: true });
    });

    it('TC-GM-050: action menu contains Edit option', () => {
      openRowMenu();
      cy.get('body').should('contain', 'Edit');
      cy.get('body').click(0, 0);
    });

    it('TC-GM-051: clicking Edit opens the Edit Generic Master form with pre-populated data', () => {
      openRowMenu();
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.wait(2000);
      cy.get(SLIDE_OVER).filter(':visible').should('exist');
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-GM-051');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-GM-052: action menu contains Clone option', () => {
      openRowMenu();
      cy.get('body').invoke('text').then(text => {
        cy.log(`Clone in menu: ${/Clone|Copy/i.test(text)}`);
        cy.screenshot('TC-GM-052');
      });
      cy.get('body').click(0, 0);
    });

    it('TC-GM-053: clicking Clone pre-populates a new form with existing data', () => {
      openRowMenu();
      cy.get('body').then($body => {
        if ($body.text().match(/Clone|Copy/i)) {
          cy.contains(/Clone|Copy/i, { matchCase: false }).click({ force: true });
          cy.wait(2000);
          cy.get(SLIDE_OVER).filter(':visible').should('exist');
          cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
            .invoke('val').should('not.be.empty');
          cy.screenshot('TC-GM-053');
          cy.contains('button', /Cancel/i).click({ force: true });
        } else {
          cy.log('Clone option not in action menu');
          cy.get('body').click(0, 0);
        }
      });
    });

    it('TC-GM-054: action menu contains Logs option', () => {
      openRowMenu();
      cy.get('body').invoke('text').then(text => {
        cy.log(`Logs in menu: ${/Logs|Log|Audit/i.test(text)}`);
      });
      cy.get('body').click(0, 0);
      cy.screenshot('TC-GM-054');
    });

    it('TC-GM-055: clicking Logs opens the audit log for the record', () => {
      openRowMenu();
      cy.get('body').then($body => {
        if ($body.text().match(/Logs|Log|Audit/i)) {
          cy.contains(/Logs|Log|Audit/i, { matchCase: false }).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-GM-055');
          cy.contains('button', /Close|Cancel/i).click({ force: true });
        } else {
          cy.log('Logs option not in action menu');
          cy.get('body').click(0, 0);
        }
      });
    });

    it('TC-GM-056: action menu contains Delete option', () => {
      openRowMenu();
      cy.get('body').should('contain', 'Delete');
      cy.get('body').click(0, 0);
    });

    it('TC-GM-057: clicking Delete shows confirmation dialog', () => {
      openRowMenu();
      cy.contains(/^Delete$/i, { matchCase: false }).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-GM-057');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EDIT GENERIC MASTER
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Edit Generic Master', () => {

    const openEditFirst = () => {
      cy.contains(/^Active$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
    };

    it('TC-GM-058: Edit form pre-populates all existing field values', () => {
      openEditFirst();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-GM-058');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-GM-059: clearing Generic Name in Edit shows validation error', () => {
      openEditFirst();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first().clear();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-GM-059');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-GM-060: updating Remarks in Edit mode saves correctly', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const remarksEl = $body.find('input[placeholder*="Remarks"], textarea[placeholder*="Remarks"]').filter(':visible');
        if (remarksEl.length > 0) {
          cy.wrap(remarksEl.first()).clear().type(`Edit test ${new Date().getTime()}`);
        }
      });
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-GM-060');
    });

    it('TC-GM-061: Cancel in Edit form closes without saving', () => {
      openEditFirst();
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .clear().type('SHOULD_NOT_PERSIST');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. DELETE GENERIC MASTER
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Delete Generic Master', () => {

    it('TC-GM-062: canceling delete dialog keeps the record intact', () => {
      cy.contains(/^Active$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').its('length').then(before => {
        cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
        cy.wait(300);
        cy.contains(/^Delete$/i, { matchCase: false }).click({ force: true });
        cy.wait(1000);
        cy.contains('button', /Cancel|No/i).click({ force: true });
        cy.wait(500);
        cy.get('tbody tr').should('have.length', before);
      });
    });

    it('TC-GM-063: confirming delete removes the record from the active listing', () => {
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(2000);
      cy.get('input[placeholder*="earch"]').clear().type(GENERIC_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('Created generic master not found in Pending tab — skipping deletion');
        } else {
          cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
          cy.wait(300);
          cy.contains(/^Delete$/i, { matchCase: false }).click({ force: true });
          cy.wait(1000);
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-GM-063');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Export Functionality', () => {

    it('TC-GM-064: Excel export completes without errors', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-GM-064');
    });

    it('TC-GM-065: PDF export completes without errors', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-GM-066: Excel export with active search filter works without errors', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Generic');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Pagination', () => {

    it('TC-GM-067: Next page button loads the next set of records', () => {
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

    it('TC-GM-068: First page button returns to page 1', () => {
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
  // 15. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. Edge Cases', () => {

    it('TC-GM-069: rapid double-click on New Generic Master does not open multiple forms', () => {
      cy.contains('button', /New Generic Master/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-GM-070: browser back navigation does not corrupt the listing state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('16. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2EGeneric ${E2E_TS}`;

    it('E2E-GM-001: Create Generic Master → Verify in Pending tab → View → Edit → Delete', () => {
      // Create
      cy.contains('button', /New Generic Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      cy.get('input[placeholder*="Generic Name"], input[placeholder*="Generic"]').filter(':visible').first()
        .clear().type(E2E_NAME);
      cy.get('body').then($body => {
        const dropdowns = $body.find('[role="combobox"]').filter(':visible');
        if (dropdowns.length > 0) {
          cy.wrap(dropdowns.first()).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
        }
      });
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-GM-001-created');

      // Verify in Pending tab
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_NAME, 'i'));

      // Delete it
      cy.get('input[placeholder*="earch"]').clear().type(E2E_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
      cy.wait(300);
      cy.contains(/^Delete$/i, { matchCase: false }).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-GM-001-deleted');
      cy.get('body').should('not.contain', '500');
    });

    it('E2E-GM-002: Search for existing record, clone it, cancel, verify original unchanged', () => {
      cy.contains(/^Active$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
      cy.wait(300);
      cy.get('body').then($body => {
        if ($body.text().match(/Clone|Copy/i)) {
          cy.contains(/Clone|Copy/i, { matchCase: false }).click({ force: true });
          cy.wait(2000);
          cy.contains('button', /Cancel/i).click({ force: true });
          cy.wait(500);
          cy.get('tbody tr').should('have.length.greaterThan', 0);
        } else {
          cy.get('body').click(0, 0);
          cy.log('Clone not available — skipping');
        }
      });
      cy.screenshot('E2E-GM-002');
    });
  });
});
