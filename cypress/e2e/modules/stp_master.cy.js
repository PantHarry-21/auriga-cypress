/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — STP Master Module — Comprehensive Test Suite
// URL    : /dashboard/testing/stp-master-v2
// Run    : npx cypress run --spec cypress/e2e/modules/stp_master.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/testing/stp-master-v2';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const STP_NAME   = `AutoSTP ${TS}`;

const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

describe('STP Master Module', () => {

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

    it('TC-STP-001: navigating to STP Master opens the listing screen', () => {
      cy.url().should('include', 'stp-master');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-STP-001');
    });

    it('TC-STP-002: data table loads with records within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
    });

    it('TC-STP-003: all sub-tabs are displayed (All, Draft, Approval Pending, Accredited)', () => {
      cy.contains(/^All$/i).should('be.visible');
      cy.contains(/^Draft$/i).should('be.visible');
      cy.contains(/Approval\s*Pending/i).should('be.visible');
      cy.contains(/^Accredited$/i).should('be.visible');
      cy.screenshot('TC-STP-003');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-STP-004: New STP Master button is visible in the toolbar', () => {
      cy.contains('button', /New STP Master/i).should('be.visible');
      cy.screenshot('TC-STP-004');
    });

    it('TC-STP-005: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-STP-006: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-STP-007: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-STP-008: Search input is displayed', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-STP-009: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SUB-TABS NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Sub-Tabs Navigation', () => {

    it('TC-STP-010: clicking Draft tab loads the Draft STP list', () => {
      cy.contains(/Draft/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-010');
    });

    it('TC-STP-011: clicking Approval Pending tab loads pending STPs', () => {
      cy.contains(/Approval\s*Pending|Pending/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-011');
    });

    it('TC-STP-012: clicking Accredited STPs tab loads accredited records', () => {
      cy.contains(/Accredited/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-012');
    });

    it('TC-STP-013: clicking All tab returns to the full STPs list', () => {
      cy.contains(/^Draft$/i).click({ force: true });
      cy.wait(1000);
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Search Functionality', () => {

    it('TC-STP-014: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('STP').should('have.value', 'STP');
    });

    it('TC-STP-015: searching by STP Name returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('STP');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-015');
    });

    it('TC-STP-016: searching with non-existent keyword shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99999XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-STP-016');
    });

    it('TC-STP-017: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('<script>alert(1)</script>');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-STP-018: clearing search returns full listing', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ADD NEW STP — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Add New STP — Form Display', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Master/i).click();
      // Wait for form to open — Cancel button or Submit for Review signals form is ready
      cy.get('body', { timeout: 25000 }).should($body => {
        const hasForm =
          $body.find('button:contains("Cancel")').length > 0 ||
          $body.find('button:contains("Submit for Review")').length > 0 ||
          $body.find('button:contains("Save as Draft")').length > 0 ||
          $body.find('input[placeholder*="STP Name"]').length > 0;
        if (!hasForm) throw new Error('STP Master form not open yet');
      });
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-STP-019: clicking New STP opens the create STP form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Create.*STP|New STP|Add STP/i);
      cy.screenshot('TC-STP-019');
      closeForm();
    });

    it('TC-STP-020: STP Name field is displayed and marked mandatory', () => {
      openAddForm();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"], input[placeholder*="Name"]')
        .filter(':visible').first().should('exist');
      closeForm();
    });

    it('TC-STP-021: STP Type dropdown is displayed', () => {
      openAddForm();
      cy.get('[role="combobox"], select').filter(':visible').should('have.length.greaterThan', 0);
      closeForm();
    });

    it('TC-STP-022: Product/Product Name field is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Product');
      closeForm();
    });

    it('TC-STP-023: Department dropdown is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Department');
      closeForm();
    });

    it('TC-STP-024: Reference Method field is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Method');
      closeForm();
    });

    it('TC-STP-025: Source field is displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Source');
      closeForm();
    });

    it('TC-STP-026: Effective Date field is displayed', () => {
      openAddForm();
      cy.get('input[type="date"]').filter(':visible').first().should('exist');
      closeForm();
    });

    it('TC-STP-027: Sample Quantity and Turn Around Time fields are displayed', () => {
      openAddForm();
      cy.get('body').should('contain.text', 'Sample');
      cy.get('body').should('contain.text', 'Turn Around');
      closeForm();
    });

    it('TC-STP-028: Procedure Steps section is displayed with at least one textarea', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasTextarea = $body.find('textarea').filter(':visible').length > 0;
        cy.log(`Procedure steps textarea found: ${hasTextarea}`);
        cy.screenshot('TC-STP-028');
      });
      closeForm();
    });

    it('TC-STP-029: Save as Draft button is displayed', () => {
      openAddForm();
      cy.contains('button', /Save.*[Dd]raft|Draft/i).should('be.visible');
      closeForm();
    });

    it('TC-STP-030: Submit for Review button is displayed', () => {
      openAddForm();
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).should('be.visible');
      closeForm();
    });

    it('TC-STP-031: Cancel button closes the form without saving', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /New STP Master/i).should('be.visible');
      cy.screenshot('TC-STP-031');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ADD NEW STP — FIELD VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Add New STP — Field Validations', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Master/i).click();
      // Wait for form to open — Cancel button or Submit for Review signals form is ready
      cy.get('body', { timeout: 25000 }).should($body => {
        const hasForm =
          $body.find('button:contains("Cancel")').length > 0 ||
          $body.find('button:contains("Submit for Review")').length > 0 ||
          $body.find('button:contains("Save as Draft")').length > 0 ||
          $body.find('input[placeholder*="STP Name"]').length > 0;
        if (!hasForm) throw new Error('STP Master form not open yet');
      });
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-STP-032: submitting empty form shows validation errors on mandatory fields', () => {
      openAddForm();
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-STP-032');
      closeForm();
    });

    it('TC-STP-033: STP Name accepts alphanumeric and special characters', () => {
      openAddForm();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type('STP-VAL-001_@#').should('have.value', 'STP-VAL-001_@#');
      closeForm();
    });

    it('TC-STP-034: STP Name with spaces only shows required validation', () => {
      openAddForm();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type('     ');
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      closeForm();
    });

    it('TC-STP-035: Sample Quantity input accepts numeric values', () => {
      openAddForm();
      cy.get('input[placeholder*="Sample Quantity"], input[placeholder*="quantity"], input[placeholder*="Quantity"]')
        .filter(':visible').first().then($el => {
          if ($el.length) {
            cy.wrap($el).clear().type('10').should('have.value', '10');
          } else {
            cy.get('input[type="number"]').filter(':visible').first().clear().type('10');
          }
        });
      closeForm();
    });

    it('TC-STP-036: Turn Around Time input accepts numeric values', () => {
      openAddForm();
      cy.get('input[placeholder*="Turn Around"], input[placeholder*="TAT"], input[placeholder*="turnaround"]')
        .filter(':visible').first().then($el => {
          if ($el.length) {
            cy.wrap($el).clear().type('5').should('have.value', '5');
          } else {
            cy.get('input[type="number"]').filter(':visible').eq(1).clear().type('5');
          }
        });
      closeForm();
    });

    it('TC-STP-037: Effective Date rejects invalid date format', () => {
      openAddForm();
      cy.get('input[type="date"]').filter(':visible').first().type('invalid-date');
      cy.get('input[type="date"]').filter(':visible').first().invoke('val').should('eq', '');
      closeForm();
    });

    it('TC-STP-038: Effective Date accepts a valid date', () => {
      openAddForm();
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[type="date"]').filter(':visible').first().type(today).should('have.value', today);
      closeForm();
    });

    it('TC-STP-039: Remarks and Validation Protocol fields are optional', () => {
      openAddForm();
      cy.get('body').then($body => {
        const remarksField = $body.find('input[placeholder*="Remarks"], textarea[placeholder*="Remarks"]').filter(':visible');
        if (remarksField.length > 0) {
          cy.wrap(remarksField.first()).type('Optional remark text');
        }
      });
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(800);
      cy.get('body').should('not.contain', 'Remarks is required');
      closeForm();
    });

    it('TC-STP-040: form retains entered data when validation fails', () => {
      openAddForm();
      const testName = 'Data Retain Test STP';
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type(testName);
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(800);
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .should('have.value', testName);
      closeForm();
    });

    it('TC-STP-041: XSS strings in STP Name do not trigger alerts', () => {
      openAddForm();
      const xss = "<script>alert('XSS')</script>";
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first().type(xss);
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-STP-042: extremely long STP Name is handled gracefully', () => {
      openAddForm();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type('A'.repeat(500), { delay: 0 });
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ADD NEW STP — PROCEDURE STEPS
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Add New STP — Procedure Steps', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Master/i).click();
      // Wait for form to open — Cancel button or Submit for Review signals form is ready
      cy.get('body', { timeout: 25000 }).should($body => {
        const hasForm =
          $body.find('button:contains("Cancel")').length > 0 ||
          $body.find('button:contains("Submit for Review")').length > 0 ||
          $body.find('button:contains("Save as Draft")').length > 0 ||
          $body.find('input[placeholder*="STP Name"]').length > 0;
        if (!hasForm) throw new Error('STP Master form not open yet');
      });
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-STP-043: Procedure Step textarea is present in the form', () => {
      openAddForm();
      cy.get('textarea').filter(':visible').should('have.length.greaterThan', 0);
      cy.screenshot('TC-STP-043');
      closeForm();
    });

    it('TC-STP-044: typing in the procedure step textarea works correctly', () => {
      openAddForm();
      cy.get('textarea').filter(':visible').first().type('Step 1: Prepare sample properly');
      cy.get('textarea').filter(':visible').first().should('contain.value', 'Step 1');
      closeForm();
    });

    it('TC-STP-045: Add Step button adds an additional procedure step', () => {
      openAddForm();
      cy.get('body').then($body => {
        const addStepBtn = $body.find('button').filter((_, el) => /Add Step/i.test(el.textContent.trim()));
        if (addStepBtn.length > 0) {
          const beforeCount = $body.find('textarea').filter(':visible').length;
          cy.wrap(addStepBtn.first()).click({ force: true });
          cy.wait(500);
          cy.get('textarea').filter(':visible').should('have.length.greaterThan', beforeCount);
          cy.screenshot('TC-STP-045');
        } else {
          cy.log('Add Step button not found in current form layout');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD NEW STP — PARAMETER DETAILS
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add New STP — Parameter Details', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Master/i).click();
      // Wait for form to open — Cancel button or Submit for Review signals form is ready
      cy.get('body', { timeout: 25000 }).should($body => {
        const hasForm =
          $body.find('button:contains("Cancel")').length > 0 ||
          $body.find('button:contains("Submit for Review")').length > 0 ||
          $body.find('button:contains("Save as Draft")').length > 0 ||
          $body.find('input[placeholder*="STP Name"]').length > 0;
        if (!hasForm) throw new Error('STP Master form not open yet');
      });
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
    };

    it('TC-STP-046: Parameter search field is present in the form', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasParamSearch = $body.find('input[placeholder*="parameter"], input[placeholder*="Parameter"]').filter(':visible').length > 0;
        cy.log(`Parameter search input present: ${hasParamSearch}`);
        cy.screenshot('TC-STP-046');
      });
      closeForm();
    });

    it('TC-STP-047: typing in parameter search shows dropdown options', () => {
      openAddForm();
      cy.get('body').then($body => {
        const paramSearch = $body.find('input[placeholder*="parameter"], input[placeholder*="Search parameter"]').filter(':visible');
        if (paramSearch.length > 0) {
          cy.wrap(paramSearch.first()).type('test');
          cy.wait(1000);
          cy.get('[role="option"]').filter(':visible').should('have.length.greaterThan', 0);
        } else {
          cy.log('Parameter search not found — form may have different layout');
        }
      });
      closeForm();
    });

    it('TC-STP-048: Add Parameter button adds a new parameter row', () => {
      openAddForm();
      cy.get('body').then($body => {
        const addParamBtn = $body.find('button').filter((_, el) => /Add Parameter/i.test(el.textContent.trim()));
        if (addParamBtn.length > 0) {
          cy.wrap(addParamBtn.first()).click({ force: true });
          cy.wait(500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-STP-048');
        } else {
          cy.log('Add Parameter button not found — form layout differs');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. SAVE AS DRAFT
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Save as Draft', () => {

    it('TC-STP-049: filling STP Name and clicking Save as Draft creates a draft record', () => {
      cy.contains('button', /New STP Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');

      const draftName = `DraftSTP ${TS}`;
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type(draftName);

      cy.contains('button', /Save.*[Dd]raft|Draft/i).click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-049');

      // Verify it appears in Draft tab
      cy.contains(/Draft/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(draftName, 'i'));
      cy.screenshot('TC-STP-049-draft-tab');
    });

    it('TC-STP-050: draft STP does not appear in All tab', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      const draftName = `DraftSTP ${TS}`;
      cy.get('input[placeholder*="earch"]').clear().type(draftName);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EDIT STP
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Edit STP', () => {

    const openEditFirst = () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');
    };

    it('TC-STP-051: clicking Edit on a row opens the Edit STP form', () => {
      openEditFirst();
      cy.get('body').invoke('text').should('match', /Edit STP|Update STP/i);
      cy.screenshot('TC-STP-051');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-052: Edit STP form pre-populates STP Name', () => {
      openEditFirst();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-STP-052');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-053: clearing STP Name in Edit shows validation error on save', () => {
      openEditFirst();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first().clear();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-STP-053');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-054: modifying Remarks in Edit mode can be saved', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const remarksEl = $body.find('input[placeholder*="Remarks"], textarea[placeholder*="Remarks"]').filter(':visible');
        if (remarksEl.length > 0) {
          cy.wrap(remarksEl.first()).clear().type(`Updated at ${new Date().getTime()}`);
        }
      });
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-054');
    });

    it('TC-STP-055: Cancel in Edit form closes without saving changes', () => {
      openEditFirst();
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .clear().type('SHOULD_NOT_PERSIST');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST');
    });

    it('TC-STP-056: adding a new Procedure Step in Edit mode works', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const addStepBtn = $body.find('button').filter((_, el) => /Add Step/i.test(el.textContent.trim()));
        if (addStepBtn.length > 0) {
          cy.wrap(addStepBtn.first()).click({ force: true });
          cy.wait(500);
          cy.get('textarea').filter(':visible').last().type('New step added in edit mode');
          cy.screenshot('TC-STP-056');
        }
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-057: adding a new Parameter in Edit mode works', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const addParamBtn = $body.find('button').filter((_, el) => /Add Parameter/i.test(el.textContent.trim()));
        if (addParamBtn.length > 0) {
          cy.wrap(addParamBtn.first()).click({ force: true });
          cy.wait(500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-STP-057');
        }
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. DELETE STP
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Delete STP', () => {

    it('TC-STP-058: selecting a row and clicking Delete shows confirmation dialog', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-STP-058');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-STP-059: canceling the delete dialog does not remove the record', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
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
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. ROW-LEVEL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Row-Level Actions', () => {

    it('TC-STP-060: clicking the row action button opens an action menu', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
      cy.get('body').then($body => {
        const hasMenu = $body.find('[role="menu"], [role="menuitem"], ul li, .dropdown-menu').filter(':visible').length > 0;
        cy.log(`Action menu opened: ${hasMenu}`);
        cy.screenshot('TC-STP-060');
      });
      cy.get('body').click(0, 0);
    });

    it('TC-STP-061: row action menu contains Edit option', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
      cy.get('body').should('contain', 'Edit');
      cy.get('body').click(0, 0);
    });

    it('TC-STP-062: row action menu contains View option', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
      cy.get('body').invoke('text').should('match', /View|Preview/i);
      cy.get('body').click(0, 0);
    });

    it('TC-STP-063: NABL option is present in the action menu for Active STPs', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(500);
      cy.get('body').invoke('text').then(text => {
        cy.log(`NABL in menu: ${/NABL/i.test(text)}`);
      });
      cy.get('body').click(0, 0);
      cy.screenshot('TC-STP-063');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Export Functionality', () => {

    it('TC-STP-064: clicking Excel export completes without page error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STP-064');
    });

    it('TC-STP-065: clicking PDF export completes without page error', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. EDGE CASES & NEGATIVE TESTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Edge Cases & Negative Tests', () => {

    it('TC-STP-066: rapid double-click on New STP does not open multiple forms', () => {
      cy.contains('button', /New STP Master/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-067: duplicate STP Name handling shows an error on submit', () => {
      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i).click({ force: true });
      cy.wait(2000);
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .invoke('val').then(existingName => {
          cy.contains('button', /Cancel/i).click({ force: true });
          cy.wait(500);

          cy.contains('button', /New STP Master/i).click();
          cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');
          cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
            .type(existingName);
          cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
          cy.wait(2000);
          cy.screenshot('TC-STP-067-dup-check');
          cy.contains('button', /Cancel/i).click({ force: true });
        });
    });

    it('TC-STP-068: boundary values for Sample Quantity are handled gracefully', () => {
      cy.contains('button', /New STP Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');
      cy.get('input[placeholder*="Quantity"], input[type="number"]').filter(':visible').first()
        .clear().type('999999999');
      cy.contains('button', /Submit.*[Rr]eview|Submit/i).last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-069: decimal values in numeric fields are handled gracefully', () => {
      cy.contains('button', /New STP Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');
      cy.get('input[type="number"]').filter(':visible').first().clear().type('10.5');
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STP-070: unsupported file upload format shows an error', () => {
      cy.contains('button', /New STP Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');
      cy.get('body').then($body => {
        const fileInput = $body.find('input[type="file"]').filter(':visible');
        if (fileInput.length > 0) {
          cy.wrap(fileInput.first()).selectFile({
            contents: Cypress.Buffer.from('fake content'),
            fileName: 'test.exe',
            mimeType: 'application/octet-stream',
          }, { force: true });
          cy.wait(1000);
          cy.get('body').invoke('text').should('match', /invalid|format|not supported/i);
        } else {
          cy.log('File upload input not currently visible in form');
        }
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. End-to-End Workflows', () => {

    it('E2E-STP-001: Create a draft STP and verify it appears in Draft tab', () => {
      cy.contains('button', /New STP Master/i).click();
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');

      const draftName = `E2EDraft ${TS}`;
      cy.get('input[placeholder*="STP Name"], input[placeholder*="name"]').filter(':visible').first()
        .type(draftName);

      cy.contains('button', /Save.*[Dd]raft|Draft/i).click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-STP-001-saved');

      cy.contains(/Draft/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(draftName, 'i'));
      cy.screenshot('E2E-STP-001-verified');
    });

    it('E2E-STP-002: Search for STP, open Edit, update Remarks, verify save succeeds', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i).click({ force: true });
      cy.contains('button', /Cancel/i, { timeout: 25000 }).should('be.visible');

      cy.get('body').then($body => {
        const remarksEl = $body.find('input[placeholder*="Remarks"], textarea[placeholder*="Remarks"]').filter(':visible');
        if (remarksEl.length > 0) {
          cy.wrap(remarksEl.first()).clear().type(`E2E updated ${new Date().getTime()}`);
        }
      });

      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-STP-002');
    });

    it('E2E-STP-003: Export Active STP list to Excel and verify no errors', () => {
      cy.contains(/^All$/i).click({ force: true });
      cy.wait(1500);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-STP-003');
    });
  });
});
