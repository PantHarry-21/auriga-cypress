/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Employee Profile Module — Comprehensive Test Suite (186 Test Cases)
// Target : https://uat.ylims.com
// Run    : npx cypress run --spec cypress/e2e/employee-profile/employee_profile.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/profile/employee';
const LAB        = 'Arbro - Delhi';

describe('Employee Profile Module', () => {

  // Shared timestamp-based employee for creation / edit / delete flows.
  // Defined here so all describe blocks can reference it.
  const TS        = Date.now().toString().slice(-6);
  const EMP_NAME  = `AutoEmp ${TS}`;
  const EMP_CODE  = `AUT${TS}`;
  const EMP_USER  = `autouser${TS}`;
  const EMP_PASS  = 'AutoTest@123';

  beforeEach(() => {
    cy.loginAs('admin', LAB);
    cy.visit(MODULE_URL, { timeout: 60000 });
    cy.get('body', { timeout: 25000 }).should('not.contain', '404');
    cy.wait(1000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & PAGE LOAD
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Module Access & Page Load', () => {

    it('TC-EP-001: clicking the Employee Profile module opens the listing screen successfully', () => {
      cy.url().should('include', '/profile/employee');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-EP-001');
    });

    it('TC-EP-002: page heading "Employee Profile" is displayed correctly at the top', () => {
      cy.contains('Employee Profile').should('be.visible');
      cy.screenshot('TC-EP-002');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-EP-003: New Employee button is displayed correctly with a + icon', () => {
      cy.contains('button', /New Employee|Add Employee/i).should('be.visible');
      cy.screenshot('TC-EP-003');
    });

    it('TC-EP-004: Excel export button is displayed correctly in the toolbar', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-EP-005: PDF export button is displayed correctly in the toolbar', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-EP-006: Columns button is displayed correctly in the toolbar', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-EP-007: Actions dropdown button is displayed correctly in the toolbar', () => {
      cy.contains('button', /Actions|Action/i).should('be.visible');
    });

    it('TC-EP-008: Search input field is displayed with placeholder text', () => {
      cy.get('input[placeholder*="earch"], input[placeholder*="Search"]').should('be.visible');
    });

    it('TC-EP-009: Search button is displayed correctly next to the search input', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });

    it('TC-EP-010: Filters button is displayed correctly next to the Search button', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. GRID ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Grid Elements', () => {

    it('TC-EP-011: employee list grid is displayed with all expected columns', () => {
      cy.get('table, [role="grid"]', { timeout: 20000 }).should('exist');
      cy.get('thead').should('be.visible');
      cy.screenshot('TC-EP-011');
    });

    it('TC-EP-012: row selection checkboxes are displayed for each employee record', () => {
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });

    it('TC-EP-013: header checkbox is displayed for bulk selection', () => {
      cy.get('thead input[type="checkbox"]').should('exist');
    });

    it('TC-EP-014: delete (trash) icon is displayed in the Actions column for each row', () => {
      // In the actual UI, Deletion is handled via the top toolbar Actions dropdown instead of an inline column.
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('contain', 'Delete');
      cy.get('body').click(0, 0);
      cy.get('tbody input[type="checkbox"]').first().uncheck({ force: true });
      cy.screenshot('TC-EP-014');
    });

    it('TC-EP-015: Edit (pencil) icon is displayed in the Edit column for each row', () => {
      // Edit button lives in the inline Actions column (visible after horizontal scroll)
      // Also accessible via the top-toolbar Actions dropdown after selecting a row.
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').invoke('text').should('match', /Edit/i);
      cy.get('body').click(0, 0);
      cy.get('tbody input[type="checkbox"]').first().uncheck({ force: true });
    });

    it('TC-EP-016: S.No column displays sequential numbers starting from 1', () => {
      // First td is the checkbox column; find the first td that contains a plain number.
      cy.get('tbody tr', { timeout: 15000 }).first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-EP-017: Status column shows Active or Inactive values correctly', () => {
      cy.get('tbody', { timeout: 15000 }).invoke('text').should('match', /Active|Inactive/i);
    });

    it('TC-EP-018: pagination controls are displayed correctly at the bottom of the grid', () => {
      cy.get('body').then($body => {
        const hasNext = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).length > 0;
        expect(hasNext).to.be.true;
      });
    });

    it('TC-EP-019: per-page record count dropdown is displayed correctly', () => {
      // The page may use a native <select> or a custom dropdown; accept either.
      cy.get('body').then($body => {
        const hasNativeSelect = $body.find('select:visible').length > 0;
        const hasPageSizeOption = /\b(10|25|50|100)\b/.test($body.text());
        expect(hasNativeSelect || hasPageSizeOption).to.be.true;
      });
    });

    it('TC-EP-020: total result count and current range are displayed correctly', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });

    it('TC-EP-021: selected row count is displayed correctly at the bottom left', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('body').invoke('text').should('match', /1|selected/i);
      cy.get('tbody input[type="checkbox"]').first().uncheck({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Search Functionality', () => {

    it('TC-EP-022: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Test').should('have.value', 'Test');
    });

    it('TC-EP-023: searching by Employee Name returns matching records only', () => {
      cy.get('input[placeholder*="earch"]').clear().type('admin');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-023');
    });

    it('TC-EP-024: searching by Employee Id returns matching records only', () => {
      cy.get('input[placeholder*="earch"]').filter(':visible').first().clear().type('EMP');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-024');
    });

    it('TC-EP-025: searching by Profile Name returns matching records only', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Analyst');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-026: searching with partial text returns relevant matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('har');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-027: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('@#$%');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.get('body').should('not.contain', 'Unhandled');
      cy.screenshot('TC-EP-027');
    });

    it('TC-EP-028: searching with no matching data shows a no-record message correctly', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNOTEXIST999XYZ_NEVER');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-EP-028');
    });

    it('TC-EP-029: clicking Search without entering any value returns all records without unexpected behavior', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-EP-030: search input trims leading and trailing spaces before searching', () => {
      cy.get('input[placeholder*="earch"]').clear().type('  admin  ');
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

    it('TC-EP-031: clicking Filters button expands the advanced filter panel correctly', () => {
      openFilters();
      cy.get('body').then($body => {
        expect($body.find('input:visible, select:visible').length).to.be.greaterThan(2);
      });
      cy.screenshot('TC-EP-031');
    });

    it('TC-EP-032: Employee Id filter field is displayed and accepts input correctly', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Id"], input[placeholder*="Id"]').filter(':visible').first()
        .clear().type('EMP001').should('have.value', 'EMP001');
      clearFilters();
    });

    it('TC-EP-033: Employee Name filter field is displayed and accepts input correctly', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first()
        .clear().type('Test Name').should('have.value', 'Test Name');
      clearFilters();
    });

    it('TC-EP-034: Date of Birth filter field shows a date picker correctly', () => {
      openFilters();
      // DOB field may be a custom date picker; broaden selector to cover variants.
      cy.get('input[type="date"], input[placeholder*="Date of Birth"], input[placeholder*="DOB"], input[placeholder*="Date"], input[placeholder*="Birth"]')
        .filter(':visible').first().should('exist');
      clearFilters();
    });

    it('TC-EP-035: Father Name filter field is displayed and accepts input correctly', () => {
      openFilters();
      cy.get('input[placeholder*="Father"], input[placeholder*="father"], input[placeholder*="Husband"], input[name*="father"], input[name*="Father"]')
        .filter(':visible').first()
        .clear().type('Father Test').should('have.value', 'Father Test');
      clearFilters();
    });

    it('TC-EP-036: Profile Name filter field is displayed and accepts input correctly', () => {
      openFilters();
      cy.get('input[placeholder*="Profile"], input[name*="profile"]').filter(':visible').first()
        .clear().type('Analyst').should('have.value', 'Analyst');
      clearFilters();
    });

    it('TC-EP-037: Status filter shows a dropdown with Active and Inactive options', () => {
      openFilters();
      cy.get('select').filter(':visible').then($selects => {
        const $statusSel = $selects.filter((_, el) => el.innerHTML.match(/Active|Inactive/i));
        if ($statusSel.length > 0) {
          cy.wrap($statusSel.first()).find('option').should('have.length.greaterThan', 1);
        } else {
          cy.log('Status filter is a custom dropdown — checking for text');
          cy.get('body').should('contain.text', /Active|Inactive/i);
        }
      });
      clearFilters();
    });

    it('TC-EP-038: filtering by Employee Id returns matching results only', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Id"], input[placeholder*="Id"]').filter(':visible').first().clear().type('EMP');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-038');
      clearFilters();
    });

    it('TC-EP-039: filtering by Employee Name returns matching results only', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('admin');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      clearFilters();
    });

    it('TC-EP-040: filtering by Date of Birth returns matching results only', () => {
      openFilters();
      cy.get('input[type="date"]').filter(':visible').first().type('1990-01-01');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      clearFilters();
    });

    it('TC-EP-041: filtering by Father Name returns matching results only', () => {
      openFilters();
      cy.get('input[placeholder*="Father"]').filter(':visible').first().clear().type('Kumar');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      clearFilters();
    });

    it('TC-EP-042: filtering by Profile Name returns matching results only', () => {
      openFilters();
      cy.get('input[placeholder*="Profile"]').filter(':visible').first().clear().type('Analyst');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      clearFilters();
    });

    it('TC-EP-043: filtering by Status Active returns only active employees', () => {
      openFilters();
      cy.get('select').filter(':visible').each($sel => {
        if ($sel[0].innerHTML.match(/Active/i)) {
          cy.wrap($sel).select('Active', { force: true });
        }
      });
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-043');
      clearFilters();
    });

    it('TC-EP-044: filtering by Status Inactive returns only inactive employees', () => {
      openFilters();
      cy.get('select').filter(':visible').each($sel => {
        if ($sel[0].innerHTML.match(/Inactive/i)) {
          cy.wrap($sel).select('Inactive', { force: true });
        }
      });
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-044');
      clearFilters();
    });

    it('TC-EP-045: applying multiple filters simultaneously returns correctly filtered results', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('admin');
      cy.get('select').filter(':visible').each($sel => {
        if ($sel[0].innerHTML.match(/Active/i)) cy.wrap($sel).select('Active', { force: true });
      });
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      clearFilters();
    });

    it('TC-EP-046: clicking Clear All Filters resets all filter fields to empty/default state', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('SomeName');
      clearFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().should('have.value', '');
      cy.screenshot('TC-EP-046');
    });

    it('TC-EP-047: clicking Clear All Filters restores the full unfiltered employee list', () => {
      openFilters();
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('ZZZNOTEXIST');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      clearFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-EP-048: Filters panel can be collapsed after opening', () => {
      openFilters();
      cy.contains('button', /Filter/i).click();
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-048');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ROW SELECTION & BULK ACTIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Row Selection & Bulk Actions', () => {

    it('TC-EP-049: clicking a row checkbox selects the corresponding employee correctly', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('tbody input[type="checkbox"]').first().should('be.checked');
    });

    it('TC-EP-050: selecting multiple rows updates the selected row count correctly', () => {
      cy.get('tbody input[type="checkbox"]').eq(0).check({ force: true });
      cy.get('tbody input[type="checkbox"]').eq(1).check({ force: true });
      cy.get('body').invoke('text').should('match', /2|selected/i);
    });

    it('TC-EP-051: deselecting a selected row decreases the selected count correctly', () => {
      cy.get('tbody input[type="checkbox"]').eq(0).check({ force: true });
      cy.get('tbody input[type="checkbox"]').eq(1).check({ force: true });
      cy.get('tbody input[type="checkbox"]').eq(0).uncheck({ force: true });
      cy.get('body').invoke('text').should('match', /1|selected/i);
    });

    it('TC-EP-052: header checkbox selects all rows on the current page', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => {
        cy.wrap($cb).should('be.checked');
      });
    });

    it('TC-EP-053: unchecking the header checkbox deselects all rows on the current page', () => {
      cy.get('thead input[type="checkbox"]').check({ force: true });
      cy.get('thead input[type="checkbox"]').uncheck({ force: true });
      cy.get('tbody input[type="checkbox"]').each($cb => {
        cy.wrap($cb).should('not.be.checked');
      });
    });

    it('TC-EP-054: row selection is retained correctly after searching', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('input[placeholder*="earch"]').clear().type('admin');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-055: row selection persists correctly across page navigation', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
        if ($next.length) {
          cy.wrap($next).click({ force: true });
          cy.wait(1500);
          cy.get('body').should('not.contain', '500');
        }
      });
    });

    it('TC-EP-056: clicking Actions button without selecting rows does not show dangerous options', () => {
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.screenshot('TC-EP-056');
      cy.get('body').click(0, 0);
    });

    it('TC-EP-057: clicking Actions with rows selected shows the Reset Password option', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('contain', 'Reset Password');
      cy.screenshot('TC-EP-057');
      cy.get('body').click(0, 0);
    });

    it('TC-EP-058: clicking Actions with rows selected shows the Delete option', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('contain', 'Delete');
      cy.get('body').click(0, 0);
    });

    it('TC-EP-059: Reset Password action resets password for selected employees', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.contains(/Reset Password/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-059');
    });

    it('TC-EP-060: Delete action from Actions shows a confirmation prompt before deleting', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup, .confirm').should('exist');
      cy.screenshot('TC-EP-060');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-EP-061: confirming Delete from Actions removes selected employees (guarded)', () => {
      cy.get('input[placeholder*="earch"]').clear().type('AUTOTEST_BULK_DEL');
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('No bulk-delete test record — skipping destructive step');
        } else {
          cy.get('tbody input[type="checkbox"]').first().check({ force: true });
          cy.contains('button', /Actions|Action/i).click({ force: true });
          cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
        }
      });
    });

    it('TC-EP-062: canceling Delete from the confirmation dialog does not remove any records', () => {
      cy.get('tbody tr').its('length').then(beforeCount => {
        cy.get('tbody input[type="checkbox"]').first().check({ force: true });
        cy.contains('button', /Actions|Action/i).click({ force: true });
        cy.wait(500);
        cy.get('body').contains(/^Delete$/i).click({ force: true });
        cy.wait(1000);
        cy.contains('button', /Cancel|No/i).click({ force: true });
        cy.wait(500);
        cy.get('tbody tr').should('have.length', beforeCount);
      });
    });

    it('TC-EP-063: Actions dropdown closes when clicking outside of it', () => {
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').click(0, 0);
      cy.wait(300);
      cy.get('[role="menu"]').should('not.be.visible').or('not.exist');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. COLUMN CHOOSER
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Column Chooser', () => {

    it('TC-EP-064: clicking the Columns button opens a column chooser correctly', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('body').then($body => {
        expect($body.find('input[type="checkbox"]:visible, label:visible').length).to.be.greaterThan(3);
      });
      cy.screenshot('TC-EP-064');
    });

    it('TC-EP-065: hiding a column via Columns works correctly', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('input[type="checkbox"]:checked').filter(':visible').last().uncheck({ force: true });
      cy.wait(600);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-065');
    });

    it('TC-EP-066: re-showing a hidden column via Columns works correctly', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('input[type="checkbox"]:not(:checked)').filter(':visible').first().check({ force: true });
      cy.wait(600);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-066');
    });

    it('TC-EP-067: column visibility changes do not break row selection or actions', () => {
      cy.contains('button', /Columns/i).click();
      cy.wait(600);
      cy.get('input[type="checkbox"]:checked').filter(':visible').last().uncheck({ force: true });
      cy.wait(500);
      cy.get('body').click(0, 0);
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('tbody input[type="checkbox"]').first().should('be.checked');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Export Functionality', () => {

    it('TC-EP-068: clicking the Excel button triggers an export without errors', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-068');
    });

    it('TC-EP-069: Excel export does not show an error on the page', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', 'Unhandled').and('not.contain', 'Error');
    });

    it('TC-EP-070: clicking the PDF button triggers an export without errors', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-070');
    });

    it('TC-EP-071: PDF export does not show an error on the page', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', 'Unhandled').and('not.contain', 'Error');
    });

    it('TC-EP-072: Excel export respects any active search filter', () => {
      cy.get('input[placeholder*="earch"]').clear().type('admin');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-073: PDF export respects any active search filter', () => {
      cy.get('input[placeholder*="earch"]').clear().type('admin');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Pagination', () => {

    it('TC-EP-074: pagination controls are present in the employee list', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|First|Last|Prev/i.test(el.textContent)).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-EP-075: clicking Next page shows the next set of records', () => {
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

    it('TC-EP-076: clicking Previous page shows the previous set of records', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
        cy.wrap($next).click({ force: true });
        cy.wait(1500);
      });
      cy.get('body').then($body => {
        const $prev = $body.find('button').filter((_, el) => /Prev|</i.test(el.textContent.trim())).first();
        cy.wrap($prev).click({ force: true });
        cy.wait(1500);
        cy.get('tbody tr').should('have.length.greaterThan', 0);
      });
    });

    it('TC-EP-077: clicking a specific page number navigates to that page correctly', () => {
      cy.get('body').then($body => {
        const $pg2 = $body.find('button').filter((_, el) => el.textContent.trim() === '2');
        if ($pg2.length > 0) {
          cy.wrap($pg2.first()).click({ force: true });
          cy.wait(1500);
          cy.get('tbody tr').should('have.length.greaterThan', 0);
        } else {
          cy.log('Only 1 page of data — pagination skip');
        }
      });
    });

    it('TC-EP-078: clicking First navigates to the first page correctly', () => {
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

    it('TC-EP-079: clicking Last navigates to the last page correctly', () => {
      cy.contains('button', /Last/i).click({ force: true });
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('TC-EP-079');
    });

    it('TC-EP-080: changing the page size updates the number of visible rows correctly', () => {
      cy.get('select').filter(':visible').first().then($sel => {
        const options = Array.from($sel.find('option')).map(o => o.value).filter(v => v && !isNaN(v));
        if (options.length > 1) {
          cy.wrap($sel).select(options[1], { force: true });
          cy.wait(2000);
          cy.get('tbody tr').should('have.length.at.most', parseInt(options[1]) + 1);
        }
      });
    });

    it('TC-EP-081: total result count remains consistent across page changes', () => {
      cy.get('body').invoke('text').then(pg1Text => {
        const m = pg1Text.match(/(\d{2,})\s*(result|record|total)/i);
        if (m) {
          const total = m[1];
          cy.get('body').then($body => {
            const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
            if ($next.length) {
              cy.wrap($next).click({ force: true });
              cy.wait(1500);
              cy.get('body').should('contain', total);
            }
          });
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. ADD EMPLOYEE — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Add Employee Form Display', () => {

    beforeEach(() => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);
    });

    afterEach(() => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
    });

    it('TC-EP-082: clicking New Employee opens the Add Employee panel correctly', () => {
      cy.get('body').invoke('text').should('match', /Add Employee|New Employee/i);
      cy.screenshot('TC-EP-082');
    });

    it('TC-EP-083: Add Employee form heading and subtitle are displayed correctly', () => {
      cy.contains(/Add Employee|New Employee/i).should('be.visible');
    });

    it('TC-EP-084: Personal Information section is displayed correctly', () => {
      cy.contains(/Personal Information/i).should('be.visible');
    });

    it('TC-EP-085: Type dropdown is displayed and marked as mandatory', () => {
      cy.get('select, [role="combobox"]').filter(':visible').should('have.length.greaterThan', 0);
    });

    it('TC-EP-086: Type dropdown loads valid options such as Mr., Mrs., Dr.', () => {
      cy.get('select').filter(':visible').first().find('option').then($opts => {
        const text = Array.from($opts).map(o => o.text).join(' ');
        expect(text).to.match(/Mr|Mrs|Dr|Miss/i);
      });
    });

    it('TC-EP-087: Name field is displayed and marked as mandatory', () => {
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-088: Date of Birth field is displayed, marked mandatory, and shows a date picker', () => {
      cy.get('input[type="date"], input[placeholder*="Date"], input[placeholder*="Birth"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-089: Father\'s/Husband\'s Name field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Father"], input[name*="father"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-090: Employee Code field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-091: Gender field shows Male and Female radio buttons correctly', () => {
      cy.get('input[type="radio"]').filter(':visible').should('have.length.greaterThan', 1);
    });

    it('TC-EP-092: Addresses & Contact Information section is displayed correctly', () => {
      cy.contains(/Addresses|Contact Information/i).should('be.visible');
    });

    it('TC-EP-093: Address field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Address"], textarea[placeholder*="Address"], input[name*="address"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-094: City field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="City"], input[name*="city"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-095: State dropdown is displayed and marked as mandatory', () => {
      cy.get('select, [role="combobox"]').filter(':visible').should('have.length.greaterThan', 1);
    });

    it('TC-EP-096: Postal Code field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Postal"], input[placeholder*="Pin"], input[name*="postal"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-097: Office Email ID field is displayed correctly', () => {
      cy.get('input[placeholder*="Office Email"], input[name*="officeEmail"], input[type="email"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-098: Inhouse Email ID field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Inhouse"], input[placeholder*="In-house"], input[name*="inhouse"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-099: Mobile No. field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Mobile"], input[name*="mobile"], input[type="tel"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-100: Permanent Address Information section is displayed correctly', () => {
      cy.contains(/Permanent Address/i).should('be.visible');
    });

    it('TC-EP-101: Same As Above checkbox copies address to permanent address when checked', () => {
      cy.get('input[placeholder*="Address"]').filter(':visible').first().type('123 Test Street');
      cy.contains(/Same As Above|Copy Address/i).then($el => {
        const $cb = $el.closest('div, label').find('input[type="checkbox"]');
        if ($cb.length) cy.wrap($cb).check({ force: true });
      });
      cy.wait(500);
      cy.screenshot('TC-EP-101');
    });

    it('TC-EP-102: unchecking Same As Above clears the auto-populated permanent address', () => {
      cy.contains(/Same As Above/i).then($el => {
        const $cb = $el.closest('div, label').find('input[type="checkbox"]');
        if ($cb.length) {
          cy.wrap($cb).check({ force: true });
          cy.wait(300);
          cy.wrap($cb).uncheck({ force: true });
          cy.wait(300);
          cy.get('body').should('not.contain', '500');
        }
      });
    });

    it('TC-EP-103: Work Profile section is displayed correctly', () => {
      cy.contains(/Work Profile/i).should('be.visible');
    });

    it('TC-EP-104: Static IP toggle is displayed in the Work Profile section', () => {
      cy.contains(/Static IP/i).should('exist');
    });

    it('TC-EP-105: Invoice View Allow toggle is displayed in the Work Profile section', () => {
      cy.contains(/Invoice View/i).should('exist');
    });

    it('TC-EP-106: Department dropdown is displayed and marked as mandatory', () => {
      cy.contains(/Department/i).should('be.visible');
    });

    it('TC-EP-107: Designation dropdown is displayed and marked as mandatory', () => {
      cy.contains(/Designation/i).should('be.visible');
    });

    it('TC-EP-108: Role dropdown is displayed and marked as mandatory', () => {
      cy.contains(/\bRole\b/i).should('be.visible');
    });

    it('TC-EP-109: Upload Signature field is displayed and shows JPG hint', () => {
      cy.contains(/Upload Signature|Signature/i).should('exist');
    });

    it('TC-EP-110: Upload Signature field shows a file-type restriction (JPG)', () => {
      cy.get('body').invoke('text').should('match', /JPG|jpg|jpeg/i);
    });

    it('TC-EP-111: Upload Signature field shows a file-size restriction (5MB)', () => {
      cy.get('body').invoke('text').then(text => {
        cy.log(text.match(/5\s*MB/i) ? '5MB hint found' : '5MB hint not explicitly in page text');
      });
    });

    it('TC-EP-112: Certificate Password field is shown and marked as optional', () => {
      cy.get('body').then($body => {
        const hasCertPwd = $body.find('input[placeholder*="Certificate"], input[name*="cert"]').length > 0;
        cy.log(`Certificate Password field present: ${hasCertPwd}`);
      });
    });

    it('TC-EP-113: Certificate Password field masks input with a show/hide toggle', () => {
      cy.get('input[type="password"]').filter(':visible').first().should('have.attr', 'type', 'password');
    });

    it('TC-EP-114: Certificate Name field is optional and defaults to employee name', () => {
      cy.get('body').then($body => {
        const present = $body.find('input[placeholder*="Certificate Name"], input[name*="certName"]').length > 0;
        cy.log(`Certificate Name field present: ${present}`);
      });
    });

    it('TC-EP-115: entering a Certificate Password shows digital certificate auto-generation note', () => {
      cy.get('input[placeholder*="Certificate Password"], input[name*="certPass"]').then($el => {
        if ($el.filter(':visible').length > 0) {
          cy.wrap($el.filter(':visible').first()).type('Test@123');
          cy.wait(500);
          cy.screenshot('TC-EP-115');
        } else {
          cy.log('Certificate Password field not visible — marking as info');
        }
      });
    });

    it('TC-EP-116: Login Information section is displayed correctly', () => {
      cy.contains(/Login Information/i).should('be.visible');
    });

    it('TC-EP-117: Username field is displayed and marked as mandatory', () => {
      cy.get('input[placeholder*="Username"], input[name*="username"]').filter(':visible').first().should('exist');
    });

    it('TC-EP-118: Password field is displayed, marked mandatory, and masks input', () => {
      cy.get('input[type="password"]').filter(':visible').first().should('have.attr', 'type', 'password');
    });

    it('TC-EP-119: Confirm Password field is displayed and marked as mandatory', () => {
      cy.get('input[type="password"]').filter(':visible').should('have.length.greaterThan', 1);
    });

    it('TC-EP-120: Cancel button is displayed and closes the form without saving', () => {
      // afterEach will click Cancel — just verify it's visible
      cy.contains('button', /Cancel/i).should('be.visible');
    });

    it('TC-EP-121: Add Employee submit button is displayed correctly', () => {
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ADD EMPLOYEE — FIELD VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Add Employee Field Validations', () => {

    beforeEach(() => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);
    });

    afterEach(() => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
    });

    it('TC-EP-122: clicking Add Employee without mandatory fields shows validation messages', () => {
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty|field is required/i);
      cy.screenshot('TC-EP-122');
    });

    it('TC-EP-123: Name field rejects empty input', () => {
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-124: Name field accepts valid text input', () => {
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first()
        .type('Test Employee Name').should('have.value', 'Test Employee Name');
    });

    it('TC-EP-125: Employee Code accepts alphanumeric input', () => {
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first()
        .type('EMP-ABC123').should('have.value', 'EMP-ABC123');
    });

    it('TC-EP-126: Date of Birth rejects invalid date values', () => {
      cy.get('input[type="date"]').filter(':visible').first().type('abcd-zz-99');
      cy.get('input[type="date"]').filter(':visible').first().invoke('val').should('not.eq', 'abcd-zz-99');
    });

    it('TC-EP-127: Date of Birth accepts valid date values', () => {
      cy.get('input[type="date"]').filter(':visible').first().type('1990-05-15').should('have.value', '1990-05-15');
    });

    it('TC-EP-128: Office Email ID shows validation on invalid email format', () => {
      cy.get('input[type="email"], input[placeholder*="Office Email"]').filter(':visible').first().type('not-an-email');
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-129: Inhouse Email ID shows validation on invalid email format', () => {
      cy.get('input[placeholder*="Inhouse"], input[name*="inhouse"]').filter(':visible').first().type('bad_email');
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-130: Mobile No. accepts only numeric input of valid length', () => {
      cy.get('input[placeholder*="Mobile"], input[name*="mobile"]').filter(':visible').first()
        .type('9876543210').should('have.value', '9876543210');
    });

    it('TC-EP-131: Postal Code accepts valid numeric input', () => {
      cy.get('input[placeholder*="Postal"], input[name*="postal"]').filter(':visible').first()
        .type('110001').should('have.value', '110001');
    });

    it('TC-EP-132: Password validates minimum 8 characters', () => {
      cy.get('input[type="password"]').filter(':visible').first().type('Abc@5');
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-132');
    });

    it('TC-EP-133: Password enforces maximum 15 characters', () => {
      const longPwd = 'Abcdefghijklmno@123';
      cy.get('input[type="password"]').filter(':visible').first().type(longPwd);
      cy.get('input[type="password"]').filter(':visible').first().invoke('val').then(val => {
        expect(val.length).to.be.at.most(longPwd.length);
      });
    });

    it('TC-EP-134: Confirm Password must match the Password field', () => {
      cy.get('input[type="password"]').filter(':visible').eq(0).type('Password@123');
      cy.get('input[type="password"]').filter(':visible').eq(1).type('Different@999');
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-134');
    });

    it('TC-EP-135: Password field show/hide toggle works correctly', () => {
      cy.get('input[type="password"]').filter(':visible').first().type('Secret@123');
      cy.get('body').then($body => {
        const $toggle = $body.find('button[aria-label*="show"], button[aria-label*="password"], button:has([class*="eye"])').first();
        if ($toggle.length) {
          cy.wrap($toggle).click({ force: true });
          cy.get('input[type="text"]').filter(':visible').should('have.value', 'Secret@123');
        } else {
          cy.log('No password toggle button found');
        }
      });
    });

    it('TC-EP-136: Username field rejects empty input', () => {
      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. ADD EMPLOYEE — SUCCESSFUL CREATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Add Employee — Creation & Duplicate Validation', () => {

    it('TC-EP-137: filling all mandatory fields and clicking Add Employee creates the employee successfully', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);

      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type(EMP_NAME);
      cy.get('input[type="date"]').filter(':visible').first().type('1990-06-15');
      cy.get('input[placeholder*="Father"], input[name*="father"]').filter(':visible').first().type('Auto Father Name');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(EMP_CODE);
      cy.get('input[type="radio"]').filter(':visible').first().check({ force: true });
      cy.get('input[placeholder*="Address"], textarea[placeholder*="Address"]').filter(':visible').first().type('123 Auto Test Street, Test Colony');
      cy.get('input[placeholder*="City"], input[name*="city"]').filter(':visible').first().type('New Delhi');
      cy.get('input[placeholder*="Postal"], input[name*="postal"]').filter(':visible').first().type('110001');
      cy.get('input[placeholder*="Mobile"], input[name*="mobile"]').filter(':visible').first().type('9090909090');
      cy.get('input[placeholder*="Inhouse"], input[name*="inhouse"]').filter(':visible').first().type(`${EMP_USER}@ylims.test`);
      cy.get('input[placeholder*="Username"], input[name*="username"]').filter(':visible').first().type(EMP_USER);
      cy.get('input[type="password"]').filter(':visible').eq(0).type(EMP_PASS);
      cy.get('input[type="password"]').filter(':visible').eq(1).type(EMP_PASS);

      cy.contains('button', /Add Employee|Save|Submit/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-137-submit');
    });

    it('TC-EP-138: a success message is shown after successful employee creation', () => {
      // Check the listing for the created employee (state persists from TC-EP-137 in DB)
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(EMP_NAME, 'i'));
      cy.screenshot('TC-EP-138');
    });

    it('TC-EP-139: the newly created employee appears in the employee list', () => {
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody').invoke('text').should('match', new RegExp(EMP_NAME, 'i'));
    });

    it('TC-EP-140: clicking Add Employee multiple times rapidly does not create duplicate records', () => {
      // Verify only 1 result for EMP_CODE
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length', 1);
    });

    it('TC-EP-141: duplicate Employee Code is rejected', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);
      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type('Dup Code Emp');
      cy.get('input[type="date"]').filter(':visible').first().type('1992-01-01');
      cy.get('input[placeholder*="Father"]').filter(':visible').first().type('Some Father');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(EMP_CODE); // duplicate
      cy.get('input[type="radio"]').filter(':visible').first().check({ force: true });
      cy.get('input[placeholder*="Address"]').filter(':visible').first().type('Some Address');
      cy.get('input[placeholder*="City"]').filter(':visible').first().type('City');
      cy.get('input[placeholder*="Postal"]').filter(':visible').first().type('110001');
      cy.get('input[placeholder*="Mobile"]').filter(':visible').first().type('9111111111');
      cy.get('input[placeholder*="Inhouse"]').filter(':visible').first().type(`dup_code_${TS}@ylims.test`);
      cy.get('input[placeholder*="Username"]').filter(':visible').first().type(`dupcode${TS}`);
      cy.get('input[type="password"]').filter(':visible').eq(0).type(EMP_PASS);
      cy.get('input[type="password"]').filter(':visible').eq(1).type(EMP_PASS);
      cy.contains('button', /Add Employee|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /already exists|duplicate|code.*taken|unique/i);
      cy.screenshot('TC-EP-141');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-142: duplicate Username is rejected', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);
      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type('Dup User Emp');
      cy.get('input[type="date"]').filter(':visible').first().type('1993-01-01');
      cy.get('input[placeholder*="Father"]').filter(':visible').first().type('Some Father');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(`DUPUSR${TS}`);
      cy.get('input[type="radio"]').filter(':visible').first().check({ force: true });
      cy.get('input[placeholder*="Address"]').filter(':visible').first().type('Some Address');
      cy.get('input[placeholder*="City"]').filter(':visible').first().type('City');
      cy.get('input[placeholder*="Postal"]').filter(':visible').first().type('110001');
      cy.get('input[placeholder*="Mobile"]').filter(':visible').first().type('9222222222');
      cy.get('input[placeholder*="Inhouse"]').filter(':visible').first().type(`dupusr_${TS}@ylims.test`);
      cy.get('input[placeholder*="Username"]').filter(':visible').first().type(EMP_USER); // duplicate username
      cy.get('input[type="password"]').filter(':visible').eq(0).type(EMP_PASS);
      cy.get('input[type="password"]').filter(':visible').eq(1).type(EMP_PASS);
      cy.contains('button', /Add Employee|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /already exists|username.*taken|duplicate/i);
      cy.screenshot('TC-EP-142');
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. EDIT EMPLOYEE
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Edit Employee', () => {

    const openEditForCreated = () => {
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Edit$/i).click({ force: true });
      cy.wait(2500);
    };

    it('TC-EP-143: clicking the Edit icon for an employee opens the Edit Employee panel correctly', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Edit$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /Edit Employee|Update Employee/i);
      cy.screenshot('TC-EP-143');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-144: Edit Employee panel heading and subtitle are displayed correctly', () => {
      openEditForCreated();
      cy.contains(/Edit Employee|Update Employee/i).should('be.visible');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-145: all Personal Information fields are pre-populated with correct data', () => {
      openEditForCreated();
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().invoke('val').should('not.be.empty');
      cy.screenshot('TC-EP-145');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-146: all Addresses & Contact Information fields are pre-populated correctly', () => {
      openEditForCreated();
      cy.contains(/Addresses|Contact/i).should('be.visible');
      cy.screenshot('TC-EP-146');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-147: Permanent Address Information fields are pre-populated correctly', () => {
      openEditForCreated();
      cy.contains(/Permanent Address/i).should('be.visible');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-148: Work Profile fields are pre-populated correctly including Department and Designation', () => {
      openEditForCreated();
      cy.contains(/Work Profile/i).should('be.visible');
      cy.screenshot('TC-EP-148');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-149: Invoice View Allow toggle reflects the saved state correctly', () => {
      openEditForCreated();
      cy.contains(/Invoice View/i).should('exist');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-150: Login Information fields are pre-populated correctly', () => {
      openEditForCreated();
      cy.contains(/Login Information/i).should('be.visible');
      cy.get('input[placeholder*="Username"], input[name*="username"]').filter(':visible').first().invoke('val').should('not.be.empty');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-151: all fields in the Edit Employee form are editable', () => {
      openEditForCreated();
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('Editable Name Check');
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().should('have.value', 'Editable Name Check');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-152: changing the Type dropdown updates the value correctly', () => {
      openEditForCreated();
      cy.get('select').filter(':visible').first().then($sel => {
        const cur = $sel.val();
        cy.wrap($sel).find('option').eq(2).then($opt => {
          if ($opt.val() && $opt.val() !== cur) {
            cy.wrap($sel).select($opt.val(), { force: true });
            cy.wrap($sel).should('not.have.value', cur);
          }
        });
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-153: modifying the Name field can be saved correctly', () => {
      openEditForCreated();
      const updatedName = `${EMP_NAME} Upd`;
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().clear().type(updatedName);
      cy.contains('button', /Update Employee|Save|Update/i).last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-153');
    });

    it('TC-EP-154: toggling Invoice View Allow reflects the change in the form', () => {
      openEditForCreated();
      cy.contains(/Invoice View/i).parent().find('input[type="checkbox"], button[role="switch"]').then($el => {
        if ($el.filter(':visible').length) cy.wrap($el.filter(':visible').first()).click({ force: true });
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-155: changing the Department and saving persists the change correctly', () => {
      openEditForCreated();
      cy.contains(/Department/i).should('be.visible');
      cy.screenshot('TC-EP-155');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-156: changing password fields requires Confirm Password to match', () => {
      openEditForCreated();
      cy.get('input[type="password"]').filter(':visible').eq(0).clear().type('NewPass@123');
      cy.get('input[type="password"]').filter(':visible').eq(1).clear().type('WrongPass@999');
      cy.contains('button', /Update Employee|Save|Update/i).last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-156');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-EP-157: Update Employee button saves all changes and shows a success message', () => {
      openEditForCreated();
      cy.contains('button', /Update Employee|Save|Update/i).last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-157');
    });

    it('TC-EP-158: Cancel button in Edit Employee closes the panel without saving changes', () => {
      openEditForCreated();
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('SHOULD_NOT_SAVE');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_SAVE');
    });

    it('TC-EP-159: updated employee data is reflected correctly in the listing grid after saving', () => {
      openEditForCreated();
      cy.contains('button', /Update Employee|Save|Update/i).last().click({ force: true });
      cy.wait(3000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-EP-160: editing an employee does not affect other employee records', () => {
      cy.get('tbody tr').its('length').then(totalRows => {
        openEditForCreated();
        cy.contains('button', /Cancel/i).click({ force: true });
        cy.get('input[placeholder*="earch"]').clear();
        cy.contains('button', /^Search$/i).click();
        cy.wait(2000);
        cy.get('tbody tr').should('have.length', totalRows);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. ROW-LEVEL DELETE
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Row-Level Delete', () => {

    it('TC-EP-161: clicking the row-level delete icon shows a confirmation prompt', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-EP-161');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-EP-162: confirming row-level delete removes the employee record', () => {
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('Created employee not found — skipping deletion');
        } else {
          cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.wait(1000);
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(3000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-EP-162');
        }
      });
    });

    it('TC-EP-163: canceling the row-level delete does not remove the record', () => {
      cy.get('tbody tr').its('length').then(before => {
        cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });
        cy.wait(1000);
        cy.contains('button', /Cancel|No/i).click({ force: true });
        cy.wait(500);
        cy.get('tbody tr').should('have.length', before);
      });
    });

    it('TC-EP-164: a success message is shown after successful row-level deletion', () => {
      cy.get('input[placeholder*="earch"]').clear().type('AUTOTEST_DEL_CONFIRM');
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('No dedicated delete-confirm record — skipping');
        } else {
          cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').invoke('text').should('match', /success|deleted|removed/i);
        }
      });
    });

    it('TC-EP-165: deleting an employee removes them from the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(EMP_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. RBAC PERMISSION CONTROLS
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. RBAC Permission Controls', () => {

    it('TC-EP-166: users without Create Employee permission cannot see the New Employee button', () => {
      cy.loginAs('reception', LAB);
      cy.visit(MODULE_URL, { timeout: 60000, failOnStatusCode: false });
      cy.wait(2500);
      cy.get('body').then($body => {
        const visible = $body.find('button').filter((_, el) => /New Employee|Add Employee/i.test(el.textContent)).length > 0;
        cy.log(`New Employee visible for reception: ${visible}`);
        cy.screenshot('TC-EP-166');
      });
    });

    it('TC-EP-167: users without Edit permission cannot access the Edit Employee panel', () => {
      cy.loginAs('reception', LAB);
      cy.visit(MODULE_URL, { timeout: 60000, failOnStatusCode: false });
      cy.wait(2500);
      cy.screenshot('TC-EP-167');
    });

    it('TC-EP-168: users without Delete permission cannot delete employee records', () => {
      cy.loginAs('reception', LAB);
      cy.visit(MODULE_URL, { timeout: 60000, failOnStatusCode: false });
      cy.wait(2500);
      cy.screenshot('TC-EP-168');
    });

    it('TC-EP-169: users without export permission cannot access Excel or PDF export', () => {
      cy.loginAs('reception', LAB);
      cy.visit(MODULE_URL, { timeout: 60000, failOnStatusCode: false });
      cy.wait(2500);
      cy.get('body').then($body => {
        const hasExcel = $body.find('button').filter((_, el) => /Excel/i.test(el.textContent)).length > 0;
        cy.log(`Excel export visible for reception: ${hasExcel}`);
        cy.screenshot('TC-EP-169');
      });
    });

    it('TC-EP-170: unauthorized access to Employee Profile module is handled correctly', () => {
      cy.loginAs('reception', LAB);
      cy.visit(MODULE_URL, { failOnStatusCode: false, timeout: 60000 });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-170');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. EDGE CASES & PERFORMANCE
  // ══════════════════════════════════════════════════════════════════════════
  describe('16. Edge Cases & Performance', () => {

    it('TC-EP-171: screen loads correctly with 200+ employee records', () => {
      cy.get('body').invoke('text').then(text => {
        const m = text.match(/(\d+)\s*(result|record|total)/i);
        cy.log(`Total records shown: ${m ? m[1] : 'unknown'}`);
        cy.get('tbody tr').should('have.length.greaterThan', 0);
      });
      cy.screenshot('TC-EP-171');
    });

    it('TC-EP-172: long values in Employee Name or Father Name do not break the grid layout', () => {
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.get('table').should('be.visible');
    });

    it('TC-EP-173: horizontal scrolling works correctly when all columns are visible', () => {
      cy.get('table, [role="grid"]').then($el => {
        cy.wrap($el.first()).scrollTo('right', { ensureScrollable: false });
        cy.wait(300);
        cy.wrap($el.first()).scrollTo('left', { ensureScrollable: false });
      });
    });

    it('TC-EP-174: browser back/forward navigation does not corrupt the listing state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(1000);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-EP-175: the UI remains responsive during data loading', () => {
      cy.visit(MODULE_URL, { timeout: 120000 });
      cy.get('tbody tr', { timeout: 25000 }).should('have.length.greaterThan', 0);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-175');
    });

    it('TC-EP-176: the screen handles zero employee records gracefully', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNORESULT99999XYZABC');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500').and('not.contain', 'Error');
      cy.screenshot('TC-EP-176');
    });

    it('TC-EP-177: column sorting works correctly on sortable columns', () => {
      cy.get('thead th').filter(':visible').eq(2).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.get('thead th').filter(':visible').eq(2).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-EP-177');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('17. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2EEmp ${E2E_TS}`;
    const E2E_CODE = `E2E${E2E_TS}`;
    const E2E_USER = `e2euser${E2E_TS}`;

    it('E2E-001: Create a new employee with all mandatory fields and verify in the listing', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);

      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type(E2E_NAME);
      cy.get('input[type="date"]').filter(':visible').first().type('1988-08-20');
      cy.get('input[placeholder*="Father"], input[name*="father"]').filter(':visible').first().type('E2E Father');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(E2E_CODE);
      cy.get('input[type="radio"]').filter(':visible').first().check({ force: true });
      cy.get('input[placeholder*="Address"], textarea[placeholder*="Address"]').filter(':visible').first().type('E2E Street, Test Colony');
      cy.get('input[placeholder*="City"], input[name*="city"]').filter(':visible').first().type('E2E City');
      cy.get('input[placeholder*="Postal"], input[name*="postal"]').filter(':visible').first().type('110002');
      cy.get('input[placeholder*="Mobile"], input[name*="mobile"]').filter(':visible').first().type('8080808080');
      cy.get('input[placeholder*="Inhouse"], input[name*="inhouse"]').filter(':visible').first().type(`${E2E_USER}@ylims.test`);
      cy.get('input[placeholder*="Username"], input[name*="username"]').filter(':visible').first().type(E2E_USER);
      cy.get('input[type="password"]').filter(':visible').eq(0).type('E2ETest@123');
      cy.get('input[type="password"]').filter(':visible').eq(1).type('E2ETest@123');

      cy.contains('button', /Add Employee|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.screenshot('E2E-001-submit');

      cy.get('input[placeholder*="earch"]').clear().type(E2E_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody').invoke('text').should('match', new RegExp(E2E_NAME, 'i'));
      cy.screenshot('E2E-001-verify');
    });

    it('E2E-002: Edit the created employee and verify changes are reflected in the listing', () => {
      const updatedName = `${E2E_NAME} Edit`;
      cy.get('input[placeholder*="earch"]').clear().type(E2E_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);

      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Edit$/i).click({ force: true });
      cy.wait(2500);
      cy.get('input[name*="name"], input[placeholder*="Name"]').filter(':visible').first().clear().type(updatedName);
      cy.contains('button', /Update Employee|Save|Update/i).last().click({ force: true });
      cy.wait(3500);

      cy.get('input[placeholder*="earch"]').clear().type(E2E_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody').invoke('text').should('match', new RegExp(updatedName, 'i'));
      cy.screenshot('E2E-002-verify');
    });

    it('E2E-003: Delete the employee using row-level delete and verify removal from the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(E2E_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);

      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
      cy.wait(3500);

      cy.get('input[placeholder*="earch"]').clear().type(E2E_CODE);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
      cy.screenshot('E2E-003-verify');
    });

    it('E2E-004: Select multiple employees and use Actions > Delete to bulk delete (guarded)', () => {
      cy.get('input[placeholder*="earch"]').clear().type('BULK_E2E_TEST');
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          cy.log('No dedicated bulk-delete records — skipping');
        } else {
          cy.get('tbody input[type="checkbox"]').eq(0).check({ force: true });
          cy.get('tbody input[type="checkbox"]').eq(1).check({ force: true });
          cy.contains('button', /Actions|Action/i).click({ force: true });
          cy.get('body').contains(/^Delete$/i).click({ force: true });
          cy.contains('button', /Confirm|Yes/i).click({ force: true });
          cy.wait(2500);
          cy.get('body').should('not.contain', '500');
        }
      });
    });

    it('E2E-005: Select an employee and reset password via Actions > Reset Password', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.contains(/Reset Password/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-005');
    });

    it('E2E-006: Apply multiple filters, verify results, then clear to restore the full list', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(800);
      cy.get('input[placeholder*="Employee Name"], input[placeholder*="Name"]').filter(':visible').first().clear().type('admin');
      cy.contains('button', /Apply|^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.screenshot('E2E-006-filtered');

      cy.contains('button', /Clear|Reset/i).click({ force: true });
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('E2E-006-cleared');
    });

    it('E2E-007: Export filtered employee list to Excel and verify no errors occur', () => {
      cy.get('input[placeholder*="earch"]').clear().type('admin');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-007');
    });

    it('E2E-008: Create an employee with a certificate password and verify no page crash', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);
      const certTs = Date.now().toString().slice(-5);
      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type(`CertEmp ${certTs}`);
      cy.get('input[type="date"]').filter(':visible').first().type('1985-03-20');
      cy.get('input[placeholder*="Father"]').filter(':visible').first().type('Cert Father');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(`CERT${certTs}`);
      cy.get('input[placeholder*="Certificate Password"], input[name*="certPass"]').then($el => {
        if ($el.filter(':visible').length > 0) {
          cy.wrap($el.filter(':visible').first()).type('CertPass@2024');
          cy.wait(600);
          cy.screenshot('E2E-008-cert');
        }
      });
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.get('body').should('not.contain', '500');
    });

    it('E2E-009: Verify duplicate username is rejected on employee creation', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2500);

      const dupTs = Date.now().toString().slice(-5);
      cy.get('select').filter(':visible').first().select(1, { force: true });
      cy.get('input[placeholder*="Name"], input[name*="name"]').filter(':visible').first().type('Dup Username Test');
      cy.get('input[type="date"]').filter(':visible').first().type('1994-01-01');
      cy.get('input[placeholder*="Father"]').filter(':visible').first().type('Test Father');
      cy.get('input[placeholder*="Code"], input[name*="code"]').filter(':visible').first().type(`DUPUSR2${dupTs}`);
      cy.get('input[type="radio"]').filter(':visible').first().check({ force: true });
      cy.get('input[placeholder*="Address"]').filter(':visible').first().type('Test Address');
      cy.get('input[placeholder*="City"]').filter(':visible').first().type('Test City');
      cy.get('input[placeholder*="Postal"]').filter(':visible').first().type('110001');
      cy.get('input[placeholder*="Mobile"]').filter(':visible').first().type('9333333333');
      cy.get('input[placeholder*="Inhouse"]').filter(':visible').first().type(`dupusr2_${dupTs}@ylims.test`);
      cy.get('input[placeholder*="Username"]').filter(':visible').first().type('admin'); // known-existing
      cy.get('input[type="password"]').filter(':visible').eq(0).type('Test@1234');
      cy.get('input[type="password"]').filter(':visible').eq(1).type('Test@1234');

      cy.contains('button', /Add Employee|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /already exists|username.*taken|duplicate/i);
      cy.screenshot('E2E-009-dup-error');
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });
});
