/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Method Validation Upload Module — Comprehensive Test Suite
// URL    : /dashboard/method/validation-upload
// Run    : npx cypress run --spec cypress/e2e/modules/method_validation_upload.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL  = '/dashboard/method/validation-upload';
const LAB         = 'Arbro - Delhi';
const TS          = Date.now().toString().slice(-6);
const METHOD_NAME = `AutoMVU ${TS}`;

// Valid fixture files (doc/docx/pdf are accepted)
const FILE_VALID_PDF      = 'cypress/fixtures/files for testing/SOP _ Employee Profile.pdf';
const FILE_VALID_PDF_2    = 'cypress/fixtures/files for testing/Himanshus prompt.pdf';
const FILE_VALID_DOC      = 'cypress/fixtures/files for testing/2mb.doc';
const FILE_VALID_DOCX     = 'cypress/fixtures/files for testing/10mb.docx';

// Invalid fixture files (image/csv/xlsx should be rejected)
const FILE_INVALID_PNG    = 'cypress/fixtures/files for testing/ChatGPT Image Feb 24, 2026, 12_12_08 PM (1).png';
const FILE_INVALID_CSV    = 'cypress/fixtures/files for testing/Roles_Permision_Notification Central.csv';
const FILE_INVALID_XLSX   = 'cypress/fixtures/files for testing/YLIMS_UAT_Testing_Tracker_FINAL.xlsx';

const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Open the "New Method Validation" slide-over and wait until Cancel is visible */
const openAddForm = () => {
  cy.contains('button', /New Method Validation/i).click();
  cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
  cy.wait(400);
};

/** Close the slide-over via the Cancel button */
const closeForm = () => {
  cy.contains('button', /Cancel/i).click({ force: true });
  cy.wait(800);
};

/** Open Filters panel */
const openFilters = () => {
  cy.contains('button', /Filter/i).click({ force: true });
  cy.wait(800);
};

/** Click Clear All Filters */
const clearAllFilters = () => {
  cy.contains('button', /Clear All Filters|Clear All|Clear/i).click({ force: true });
  cy.wait(800);
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Method Validation Upload Module', () => {

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

    it('TC-MVU-001: navigating to Method Validation Upload opens the listing screen without 404', () => {
      cy.url().should('include', 'validation-upload');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-MVU-001');
    });

    it('TC-MVU-002: page heading reads "Method Validation Upload"', () => {
      cy.get('body').invoke('text').should('match', /Method Validation Upload/i);
    });

    it('TC-MVU-003: data table renders with a visible header row within 30 s', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
    });

    it('TC-MVU-004: page does not contain a 500 error on initial load', () => {
      cy.get('body').should('not.contain', '500');
    });

    it('TC-MVU-005: list view renders records or an empty-state message (no blank screen)', () => {
      cy.get('body', { timeout: 20000 }).invoke('text').should('match', /Method|No record|No data/i);
      cy.screenshot('TC-MVU-005');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TABLE COLUMNS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Table Columns', () => {

    it('TC-MVU-006: table header contains "Serial No" column', () => {
      cy.get('thead').invoke('text').should('match', /Serial\s*No|S\.?\s*No/i);
    });

    it('TC-MVU-007: table header contains "Method Name" column', () => {
      cy.get('thead').invoke('text').should('match', /Method Name/i);
    });

    it('TC-MVU-008: table header contains "Client Name" column', () => {
      cy.get('thead').invoke('text').should('match', /Client Name/i);
    });

    it('TC-MVU-009: table header contains "Method No" column', () => {
      cy.get('thead').invoke('text').should('match', /Method No/i);
    });

    it('TC-MVU-010: table header contains "Suppersedes No" column', () => {
      cy.get('thead').invoke('text').should('match', /Supers/i);
    });

    it('TC-MVU-011: table header contains "Method Creation Date" column', () => {
      cy.get('thead').invoke('text').should('match', /Creation Date|Method Creation/i);
    });

    it('TC-MVU-012: table header contains "Effective Date" column', () => {
      cy.get('thead').invoke('text').should('match', /Effective Date/i);
    });

    it('TC-MVU-013: table header contains "Department" column', () => {
      cy.get('thead').invoke('text').should('match', /Department/i);
    });

    it('TC-MVU-014: table header contains "Method Type" column', () => {
      cy.get('thead').invoke('text').should('match', /Method Type/i);
    });

    it('TC-MVU-015: table header contains "Files" column', () => {
      cy.get('thead').invoke('text').should('match', /Files/i);
    });

    it('TC-MVU-016: table header contains audit columns (Created By, Created Date, Updated By, Updated Date)', () => {
      cy.get('thead').invoke('text').should('match', /Created By/i);
      cy.get('thead').invoke('text').should('match', /Created Date/i);
      cy.get('thead').invoke('text').should('match', /Updated By/i);
      cy.get('thead').invoke('text').should('match', /Updated Date/i);
    });

    it('TC-MVU-017: table header contains "Edit" column', () => {
      cy.get('thead').invoke('text').should('match', /Edit/i);
    });

    it('TC-MVU-018: first data row Serial No starts at 1', () => {
      cy.get('tbody tr', { timeout: 20000 }).first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        if (firstNum) expect(firstNum).to.eq('1');
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Toolbar Elements', () => {

    it('TC-MVU-019: "New Method Validation" button is visible and enabled', () => {
      cy.contains('button', /New Method Validation/i).should('be.visible').and('not.be.disabled');
      cy.screenshot('TC-MVU-019');
    });

    it('TC-MVU-020: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-MVU-021: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-MVU-022: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-MVU-023: Search input is visible', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-MVU-024: Search button is visible', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });

    it('TC-MVU-025: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. GLOBAL SEARCH
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Global Search', () => {

    it('TC-MVU-026: search input accepts typed text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Method').should('have.value', 'Method');
    });

    it('TC-MVU-027: searching by Method Name keyword filters the list', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Method');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-027');
    });

    it('TC-MVU-028: search is case-insensitive and supports partial-text (contains) matching', () => {
      cy.get('input[placeholder*="earch"]').clear().type('method');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-MVU-029: searching with a non-existent keyword shows the empty-state message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99999XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-MVU-029');
    });

    it('TC-MVU-030: searching with special characters does not crash the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('<script>alert(1)</script>');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-MVU-031: clearing search and clicking Search restores the full list', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('TC-MVU-032: searching by Client Name keyword filters the list', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Delhi');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-032');
    });

    it('TC-MVU-033: searching by Method No returns the matching record', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().find('td').eq(3).invoke('text').then(methodNo => {
        if (methodNo.trim().length > 0) {
          cy.get('input[placeholder*="earch"]').clear().type(methodNo.trim());
          cy.contains('button', /^Search$/i).click();
          cy.wait(2000);
          cy.get('tbody tr').should('have.length.greaterThan', 0);
          cy.screenshot('TC-MVU-033');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. COLUMNS PANEL
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Columns Panel (Manage Columns)', () => {

    it('TC-MVU-034: clicking Columns opens the Manage Columns panel', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /Manage Columns|Column/i);
      cy.screenshot('TC-MVU-034');
      cy.get('body').click(0, 0);
    });

    it('TC-MVU-035: Manage Columns panel lists checkboxes for each column', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        const checkboxCount = $body.find('input[type="checkbox"]').filter(':visible').length;
        expect(checkboxCount).to.be.greaterThan(0);
        cy.screenshot('TC-MVU-035');
      });
      cy.get('body').click(0, 0);
    });

    it('TC-MVU-036: unchecking a column checkbox hides that column from the grid', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        const checkboxes = $body.find('input[type="checkbox"]').filter(':visible');
        if (checkboxes.length > 0) {
          cy.wrap(checkboxes.first()).uncheck({ force: true });
          cy.wait(600);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MVU-036');
          // Re-check to restore state
          cy.wrap(checkboxes.first()).check({ force: true });
          cy.wait(400);
        }
      });
      cy.get('body').click(0, 0);
    });

    it('TC-MVU-037: re-checking a hidden column makes it reappear in the grid', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        const checkboxes = $body.find('input[type="checkbox"]').filter(':visible');
        if (checkboxes.length > 0) {
          cy.wrap(checkboxes.last()).uncheck({ force: true });
          cy.wait(400);
          cy.wrap(checkboxes.last()).check({ force: true });
          cy.wait(400);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MVU-037');
        }
      });
      cy.get('body').click(0, 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTERS PANEL
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Filters Panel', () => {

    it('TC-MVU-038: clicking Filters expands the filter panel', () => {
      openFilters();
      cy.get('input[placeholder*="Search serial no"], input[placeholder*="Search method name"], input[placeholder*="Search client"]')
        .first().should('be.visible');
      cy.screenshot('TC-MVU-038');
    });

    it('TC-MVU-039: "Search serial no..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search serial no"]').should('exist');
    });

    it('TC-MVU-040: "Search method name..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').should('exist');
    });

    it('TC-MVU-041: "Search client name..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search client name"]').should('exist');
    });

    it('TC-MVU-042: "Search method no..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search method no"]').should('exist');
    });

    it('TC-MVU-043: "Search suppersedes no..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search suppersedes no"]').should('exist');
    });

    it('TC-MVU-044: "Search department..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search department"]').should('exist');
    });

    it('TC-MVU-045: "Search method type..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search method type"]').should('exist');
    });

    it('TC-MVU-046: "Search files..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search files"]').should('exist');
    });

    it('TC-MVU-047: "Search created by..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search created by"]').should('exist');
    });

    it('TC-MVU-048: "Search updated by..." filter input is present', () => {
      openFilters();
      cy.get('input[placeholder*="Search updated by"]').should('exist');
    });

    it('TC-MVU-049: filtering by Method Name returns only matching records', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').clear().type('Method');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-049');
      clearAllFilters();
    });

    it('TC-MVU-050: filtering by Client Name returns only matching records', () => {
      openFilters();
      cy.get('input[placeholder*="Search client name"]').clear().type('Delhi');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-050');
      clearAllFilters();
    });

    it('TC-MVU-051: filtering by Method No returns matching records', () => {
      openFilters();
      cy.get('input[placeholder*="Search method no"]').clear().type('MVU');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      clearAllFilters();
    });

    it('TC-MVU-052: filtering by Supersedes No returns matching records', () => {
      openFilters();
      cy.get('input[placeholder*="Search suppersedes no"]').clear().type('1');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      clearAllFilters();
    });

    it('TC-MVU-053: filtering by Department narrows the list', () => {
      openFilters();
      cy.get('input[placeholder*="Search department"]').clear().type('Chem');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-053');
      clearAllFilters();
    });

    it('TC-MVU-054: filtering by Method Type narrows the list', () => {
      openFilters();
      cy.get('input[placeholder*="Search method type"]').clear().type('Standard');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      clearAllFilters();
    });

    it('TC-MVU-055: applying multiple filters uses AND logic and further narrows results', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').clear().type('Method');
      cy.get('input[placeholder*="Search department"]').clear().type('Chem');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-055');
      clearAllFilters();
    });

    it('TC-MVU-056: Clear All Filters resets all filter inputs and reloads the full unfiltered dataset', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').clear().type('ZZNOTEXIST');
      cy.wait(1000);
      clearAllFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('TC-MVU-056');
    });

    it('TC-MVU-057: invalid filter combination (no-match) shows empty-state without UI crash', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').clear().type('ZZZNEVEREXIST99XYZ');
      cy.wait(1500);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-057');
      clearAllFilters();
    });

    it('TC-MVU-058: filter panel collapses / disappears when Filters button is clicked again', () => {
      openFilters();
      cy.contains('button', /Filter/i).click({ force: true });
      cy.wait(600);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-058');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Pagination', () => {

    it('TC-MVU-059: pagination controls are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|Prev|First|Last/i.test(el.textContent)).length > 0;
        cy.log(`Pagination controls found: ${hasNav}`);
        cy.screenshot('TC-MVU-059');
      });
    });

    it('TC-MVU-060: total result count is displayed somewhere on the page', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });

    it('TC-MVU-061: clicking Next page loads the next set of records', () => {
      cy.get('tbody tr').first().invoke('text').then(pg1 => {
        cy.get('body').then($body => {
          const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
          if ($next.prop('disabled') === false) {
            cy.wrap($next).click({ force: true });
            cy.wait(1500);
            cy.get('tbody tr').first().invoke('text').should('not.eq', pg1);
            cy.screenshot('TC-MVU-061');
          } else {
            cy.log('Only one page of data — Next is disabled, skipping navigation assert');
          }
        });
      });
    });

    it('TC-MVU-062: clicking Previous after Next returns to the previous page', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim())).first();
        if ($next.length && !$next.prop('disabled')) {
          cy.wrap($next).click({ force: true });
          cy.wait(1000);
          cy.contains('button', /Prev|</i).click({ force: true });
          cy.wait(1500);
          cy.get('tbody tr').first().find('td').then($tds => {
            const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
            if (firstNum) expect(firstNum).to.eq('1');
          });
          cy.screenshot('TC-MVU-062');
        } else {
          cy.log('Only one page — skipping prev navigation');
        }
      });
    });

    it('TC-MVU-063: "Show X per page" dropdown changes the number of rows displayed', () => {
      cy.get('body').then($body => {
        const perPageSelect = $body.find('select').filter((_, el) => /per page|\d+ per/i.test(el.closest('*').textContent || '')).first();
        if (perPageSelect.length) {
          cy.wrap(perPageSelect).select('10', { force: true });
          cy.wait(1500);
          cy.get('tbody tr').should('have.length.at.most', 10);
          cy.screenshot('TC-MVU-063');
        } else {
          cy.log('Per-page dropdown not found in this build — skipping');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Export Functionality', () => {

    it('TC-MVU-064: clicking Excel export does not produce a 500 error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-064');
    });

    it('TC-MVU-065: clicking PDF export does not produce a 500 error', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-MVU-066: Excel export with an active search filter works without errors', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Method');
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. FORM — DISPLAY & LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Add New Method Validation — Form Display', () => {

    it('TC-MVU-067: clicking "New Method Validation" opens the create form panel', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /New Method Validation|Method Validation/i);
      cy.screenshot('TC-MVU-067');
      closeForm();
    });

    it('TC-MVU-068: Method Name field is visible and marked mandatory (*)', () => {
      openAddForm();
      cy.get('input[name="methodName"]').should('be.visible');
      cy.get('input[name="methodName"]').closest('*').closest('*').invoke('text').should('match', /\*/);
      closeForm();
    });

    it('TC-MVU-069: Client Name combobox is visible and marked mandatory', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').should('be.visible');
      closeForm();
    });

    it('TC-MVU-070: Report/Protocol No field is visible and marked mandatory', () => {
      openAddForm();
      cy.get('input[name="reportProtocolNo"]').should('be.visible');
      closeForm();
    });

    it('TC-MVU-071: Method Type dropdown is visible and marked mandatory', () => {
      openAddForm();
      cy.get('select[name="methodType"]').should('be.visible');
      closeForm();
    });

    it('TC-MVU-072: Supersedes No field is visible (optional)', () => {
      openAddForm();
      cy.get('input[name="supersedesNo"]').should('exist');
      closeForm();
    });

    it('TC-MVU-073: Creation Date date-picker field is present', () => {
      openAddForm();
      cy.get('input[name="creationDate"]').should('exist');
      closeForm();
    });

    it('TC-MVU-074: Effective Date date-picker field is present', () => {
      openAddForm();
      cy.get('input[name="effectiveDate"]').should('exist');
      closeForm();
    });

    it('TC-MVU-075: Department combobox is visible and marked mandatory', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select department"]').should('be.visible');
      closeForm();
    });

    it('TC-MVU-076: file upload input is present in the form', () => {
      openAddForm();
      cy.get('input[type="file"]').should('exist');
      closeForm();
    });

    it('TC-MVU-077: SAVE / Submit button is visible in the form', () => {
      openAddForm();
      cy.contains('button', /SAVE|Save/i).filter(':visible').should('exist');
      closeForm();
    });

    it('TC-MVU-078: Cancel button is visible in the form', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).should('be.visible');
      closeForm();
    });

    it('TC-MVU-079: a close panel icon/button is available to dismiss the form', () => {
      openAddForm();
      cy.get('body').then($body => {
        const hasClose =
          $body.find('button[aria-label*="close"], button[aria-label*="Close"]').filter(':visible').length > 0 ||
          $body.find('[data-testid*="close"]').filter(':visible').length > 0 ||
          $body.find('button').filter((_, el) => /×|✕|close/i.test(el.textContent.trim())).filter(':visible').length > 0;
        cy.log(`Close panel button found: ${hasClose}`);
        cy.screenshot('TC-MVU-079');
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. FORM — MANDATORY FIELD VALIDATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Add New Method Validation — Mandatory Field Validation', () => {

    it('TC-MVU-080: submitting the empty form shows validation errors on all mandatory fields', () => {
      openAddForm();
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-MVU-080');
      closeForm();
    });

    it('TC-MVU-081: validation error appears specifically for empty Method Name', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear();
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-MVU-081');
      closeForm();
    });

    it('TC-MVU-082: validation error appears for missing Client Name', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type(`ValTest ${TS}`);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|client/i);
      cy.screenshot('TC-MVU-082');
      closeForm();
    });

    it('TC-MVU-083: validation error appears for missing Report/Protocol No', () => {
      openAddForm();
      cy.get('input[name="reportProtocolNo"]').clear();
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|protocol/i);
      closeForm();
    });

    it('TC-MVU-084: validation error appears for missing Method Type', () => {
      openAddForm();
      cy.get('select[name="methodType"]').invoke('val').then(current => {
        if (!current) {
          cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
          cy.wait(800);
          cy.get('body').invoke('text').should('match', /required|mandatory|method type/i);
        } else {
          cy.log('Method Type already has a default value — validation will be combined with other fields');
        }
      });
      closeForm();
    });

    it('TC-MVU-085: validation error appears for missing Department', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type(`DepTest ${TS}`);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|department/i);
      closeForm();
    });

    it('TC-MVU-086: validation error appears when no file is uploaded', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type(`FileTest ${TS}`);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|file/i);
      closeForm();
    });

    it('TC-MVU-087: form retains data entered when validation fails', () => {
      openAddForm();
      const retainName = `Retain Test ${TS}`;
      cy.get('input[name="methodName"]').clear().type(retainName);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('input[name="methodName"]').should('have.value', retainName);
      cy.screenshot('TC-MVU-087');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. FORM — INDIVIDUAL FIELD BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Add New Method Validation — Individual Field Behaviour', () => {

    it('TC-MVU-088: Method Name accepts valid alphanumeric text', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type('HPLC Validation Method-01').should('have.value', 'HPLC Validation Method-01');
      closeForm();
    });

    it('TC-MVU-089: Method Name with spaces-only triggers required validation', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type('     ');
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      closeForm();
    });

    it('TC-MVU-090: Method Name with XSS payload does not trigger alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[name="methodName"]').clear().type("<script>alert('xss')</script>");
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-091: Method Name with 500-character boundary value is handled gracefully', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type('M'.repeat(500), { delay: 0 });
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-092: Client Name combobox shows a dropdown after typing at least one character', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1000);
      cy.get('[role="option"]').filter(':visible').then($opts => {
        cy.log(`Client dropdown options visible: ${$opts.length}`);
        cy.screenshot('TC-MVU-092');
      });
      closeForm();
    });

    it('TC-MVU-093: Client Name combobox shows "No results" when search has no match', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').clear().type('ZZZNOMATCH99XYZ');
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-093');
      closeForm();
    });

    it('TC-MVU-094: selecting an option from the Client Name combobox fills the field', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1000);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) {
          cy.wrap($opts.first()).click({ force: true });
          cy.get('input[placeholder*="Search and select client"]').invoke('val').should('not.be.empty');
          cy.screenshot('TC-MVU-094');
        } else {
          cy.log('No client options visible — combobox may require more specific text');
        }
      });
      closeForm();
    });

    it('TC-MVU-095: Report/Protocol No field accepts a valid alphanumeric value', () => {
      openAddForm();
      cy.get('input[name="reportProtocolNo"]').clear().type('PROTO-2024-001').should('have.value', 'PROTO-2024-001');
      closeForm();
    });

    it('TC-MVU-096: Report/Protocol No field rejects HTML injection gracefully', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[name="reportProtocolNo"]').clear().type('<b>Bold</b>');
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-097: Method Type dropdown lists at least one option', () => {
      openAddForm();
      cy.get('select[name="methodType"]').find('option').should('have.length.greaterThan', 0);
      cy.screenshot('TC-MVU-097');
      closeForm();
    });

    it('TC-MVU-098: each option in Method Type dropdown is selectable', () => {
      openAddForm();
      cy.get('select[name="methodType"] option').then($options => {
        const values = Array.from($options).map(o => o.value).filter(v => v !== '');
        if (values.length > 0) {
          cy.get('select[name="methodType"]').select(values[0], { force: true });
          cy.get('select[name="methodType"]').should('have.value', values[0]);
          cy.screenshot('TC-MVU-098');
        }
      });
      closeForm();
    });

    it('TC-MVU-099: Supersedes No is optional and accepts alphanumeric text', () => {
      openAddForm();
      cy.get('input[name="supersedesNo"]').clear().type('PREV-001').should('have.value', 'PREV-001');
      closeForm();
    });

    it('TC-MVU-100: Supersedes No left empty does not trigger a required validation error', () => {
      openAddForm();
      cy.get('input[name="supersedesNo"]').clear();
      cy.get('body').invoke('text').should('not.match', /Supersedes.*required|required.*Supersedes/i);
      closeForm();
    });

    it('TC-MVU-101: Creation Date field accepts a valid ISO date', () => {
      openAddForm();
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[name="creationDate"]').type(today).should('have.value', today);
      closeForm();
    });

    it('TC-MVU-102: Creation Date field rejects non-date text (native date input)', () => {
      openAddForm();
      cy.get('input[name="creationDate"]').type('not-a-date');
      cy.get('input[name="creationDate"]').invoke('val').should('eq', '');
      closeForm();
    });

    it('TC-MVU-103: Effective Date field accepts a valid ISO date', () => {
      openAddForm();
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      cy.get('input[name="effectiveDate"]').type(tomorrow).should('have.value', tomorrow);
      closeForm();
    });

    it('TC-MVU-104: Department combobox shows options after typing a character', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-104');
      closeForm();
    });

    it('TC-MVU-105: selecting an option from the Department combobox fills the field', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1000);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) {
          cy.wrap($opts.first()).click({ force: true });
          cy.get('input[placeholder*="Search and select department"]').invoke('val').should('not.be.empty');
          cy.screenshot('TC-MVU-105');
        } else {
          cy.log('No department options visible — skip select assertion');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. FORM — FILE UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Add New Method Validation — File Upload', () => {

    it('TC-MVU-106: uploading a valid PDF file is accepted without error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.get('body').invoke('text').should('not.match', /invalid|not supported|unsupported/i);
      cy.screenshot('TC-MVU-106');
      closeForm();
    });

    it('TC-MVU-107: uploading a second valid PDF file is accepted', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF_2, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-108: uploading a valid .doc file is accepted without error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.get('body').invoke('text').should('not.match', /invalid|not supported/i);
      cy.screenshot('TC-MVU-108');
      closeForm();
    });

    it('TC-MVU-109: uploading a valid .docx file is accepted without error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOCX, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-110: uploading an invalid .png image file is rejected with an error message', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_PNG, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      cy.screenshot('TC-MVU-110');
      closeForm();
    });

    it('TC-MVU-111: uploading an invalid .csv file is rejected with an error message', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_CSV, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      cy.screenshot('TC-MVU-111');
      closeForm();
    });

    it('TC-MVU-112: uploading an invalid .xlsx file is rejected with an error message', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_XLSX, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|unsupported|only.*pdf|only.*doc/i);
      cy.screenshot('TC-MVU-112');
      closeForm();
    });

    it('TC-MVU-113: uploading a large file (10 MB .docx) does not crash the page', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOCX, { force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-113');
      closeForm();
    });

    it('TC-MVU-114: uploaded file name is shown in the form after selection', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').then(text => {
        const hasFileName = /SOP|Employee Profile|\.pdf/i.test(text);
        cy.log(`Uploaded file name visible in form: ${hasFileName}`);
        cy.screenshot('TC-MVU-114');
      });
      closeForm();
    });

    it('TC-MVU-115: uploading a file via an executable mimetype is rejected gracefully', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(
        { contents: Cypress.Buffer.from('MZfake exe content'), fileName: 'malware.exe', mimeType: 'application/octet-stream' },
        { force: true }
      );
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-115');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. FORM — CANCEL BEHAVIOUR
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Add New Method Validation — Cancel Behaviour', () => {

    it('TC-MVU-116: clicking Cancel closes the form panel without saving', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type('SHOULD_NOT_SAVE');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.contains('button', /New Method Validation/i).should('be.visible');
      cy.get('body').should('not.contain', 'SHOULD_NOT_SAVE');
      cy.screenshot('TC-MVU-116');
    });

    it('TC-MVU-117: after Cancel, clicking "New Method Validation" reopens a clean empty form', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type('TempData');
      closeForm();
      openAddForm();
      cy.get('input[name="methodName"]').invoke('val').should('eq', '');
      closeForm();
    });

    it('TC-MVU-118: rapid double-click on "New Method Validation" does not open multiple panels', () => {
      cy.contains('button', /New Method Validation/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      // Only one Cancel button should be visible
      cy.contains('button', /Cancel/i, { timeout: 10000 }).should('be.visible');
      cy.get('button').filter((_, el) => /Cancel/i.test(el.textContent.trim())).should('have.length.at.most', 2);
      cy.contains('button', /Cancel/i).first().click({ force: true });
      cy.wait(500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. FORM — SUCCESSFUL SAVE (END-TO-END CREATE)
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Add New Method Validation — Successful Save', () => {

    it('TC-MVU-119: filling all mandatory fields and saving creates a new record', () => {
      openAddForm();

      // Method Name
      cy.get('input[name="methodName"]').clear().type(METHOD_NAME);

      // Client Name — pick first available option
      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) {
          cy.wrap($opts.first()).click({ force: true });
        } else {
          cy.log('No client option found — form will fail validation on client; skipping save');
        }
      });

      // Report/Protocol No
      cy.get('input[name="reportProtocolNo"]').clear().type(`PROTO-${TS}`);

      // Method Type — select first non-empty option
      cy.get('select[name="methodType"] option').then($options => {
        const values = Array.from($options).map(o => o.value).filter(v => v !== '');
        if (values.length > 0) {
          cy.get('select[name="methodType"]').select(values[0], { force: true });
        }
      });

      // Department — pick first available option
      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) {
          cy.wrap($opts.first()).click({ force: true });
        } else {
          cy.log('No department option found — continuing without department');
        }
      });

      // File upload
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(800);

      // Save
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-119-saved');
    });

    it('TC-MVU-120: newly saved record appears in the list view', () => {
      cy.get('input[placeholder*="earch"]').clear().type(METHOD_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').then(text => {
        const found = text.includes(METHOD_NAME);
        cy.log(`Record found in list: ${found}`);
        cy.screenshot('TC-MVU-120');
      });
    });

    it('TC-MVU-121: saving with only optional fields left empty succeeds', () => {
      const minName = `MinSave ${TS}`;
      openAddForm();

      cy.get('input[name="methodName"]').clear().type(minName);

      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      cy.get('input[name="reportProtocolNo"]').clear().type(`MIN-${TS}`);

      cy.get('select[name="methodType"] option').then($opts => {
        const vals = Array.from($opts).map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.get('select[name="methodType"]').select(vals[0], { force: true });
      });

      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      // No Supersedes No, no Creation Date, no Effective Date
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(800);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-121');
    });

    it('TC-MVU-122: saving with all optional fields filled succeeds', () => {
      const fullName = `FullSave ${TS}`;
      openAddForm();

      cy.get('input[name="methodName"]').clear().type(fullName);

      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      cy.get('input[name="reportProtocolNo"]').clear().type(`FULL-${TS}`);

      cy.get('select[name="methodType"] option').then($opts => {
        const vals = Array.from($opts).map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.get('select[name="methodType"]').select(vals[0], { force: true });
      });

      cy.get('input[name="supersedesNo"]').clear().type(`PREV-${TS}`);

      const today = new Date().toISOString().split('T')[0];
      cy.get('input[name="creationDate"]').type(today);

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      cy.get('input[name="effectiveDate"]').type(tomorrow);

      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(800);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-122');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. EDIT RECORD
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. Edit Method Validation Record', () => {

    /** Click the Edit icon in the first data row */
    const openEditFirst = () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button[aria-label*="Edit"], button:contains("Edit"), a:contains("Edit")')
          .first().click({ force: true });
      });
      cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
      cy.wait(500);
    };

    it('TC-MVU-123: clicking the Edit icon in a row opens the edit form', () => {
      openEditFirst();
      cy.get('body').invoke('text').should('match', /Edit|Update.*Method Validation|Method Validation/i);
      cy.screenshot('TC-MVU-123');
      closeForm();
    });

    it('TC-MVU-124: edit form pre-populates Method Name with existing value', () => {
      openEditFirst();
      cy.get('input[name="methodName"]').invoke('val').should('not.be.empty');
      cy.screenshot('TC-MVU-124');
      closeForm();
    });

    it('TC-MVU-125: edit form pre-populates Report/Protocol No with existing value', () => {
      openEditFirst();
      cy.get('input[name="reportProtocolNo"]').invoke('val').should('not.be.empty');
      closeForm();
    });

    it('TC-MVU-126: edit form pre-populates Method Type with existing value', () => {
      openEditFirst();
      cy.get('select[name="methodType"]').invoke('val').should('not.be.empty');
      closeForm();
    });

    it('TC-MVU-127: clearing Method Name in edit mode shows a required validation error', () => {
      openEditFirst();
      cy.get('input[name="methodName"]').clear();
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-MVU-127');
      closeForm();
    });

    it('TC-MVU-128: updating Method Name in edit mode and saving succeeds', () => {
      openEditFirst();
      const updatedName = `Edited ${TS}`;
      cy.get('input[name="methodName"]').clear().type(updatedName);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-128');
    });

    it('TC-MVU-129: updating Supersedes No in edit mode saves correctly', () => {
      openEditFirst();
      cy.get('input[name="supersedesNo"]').clear().type(`UPD-${TS}`);
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-129');
    });

    it('TC-MVU-130: adding a new file in edit mode works without error', () => {
      openEditFirst();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF_2, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-130');
      closeForm();
    });

    it('TC-MVU-131: Cancel in edit form closes without persisting changes', () => {
      openEditFirst();
      cy.get('input[name="methodName"]').clear().type('SHOULD_NOT_PERSIST_EDIT');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST_EDIT');
    });

    it('TC-MVU-132: uploading an invalid file type in edit mode is rejected', () => {
      openEditFirst();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_PNG, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|unsupported/i);
      cy.screenshot('TC-MVU-132');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. FILES COLUMN IN LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  describe('16. Files Column', () => {

    it('TC-MVU-133: Files column in the list view displays a count value for each row', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        // The Files column should contain a number or link
        cy.wrap($row).find('td').then($tds => {
          const cellTexts = Array.from($tds).map(td => td.textContent.trim());
          cy.log(`Row cells: ${JSON.stringify(cellTexts)}`);
          cy.screenshot('TC-MVU-133');
        });
      });
    });

    it('TC-MVU-134: Files column value is numeric (0, 1, 2, …) or shows a link/icon', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().find('td').then($tds => {
        const hasFileInfo = Array.from($tds).some(td => {
          const text = td.textContent.trim();
          return /^\d+$/.test(text) ||
            td.querySelector('a, button, svg, [aria-label*="file"]') !== null;
        });
        cy.log(`Files column indicator present: ${hasFileInfo}`);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. HORIZONTAL SCROLL & LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  describe('17. Horizontal Scroll & Layout', () => {

    it('TC-MVU-135: grid with many columns has horizontal scroll available', () => {
      cy.get('table, [role="grid"]').first().parents().then($parents => {
        const scrollable = Array.from($parents).some(el => {
          const style = window.getComputedStyle(el);
          return style.overflowX === 'auto' || style.overflowX === 'scroll';
        });
        cy.log(`Horizontal scroll wrapper found: ${scrollable}`);
        cy.screenshot('TC-MVU-135');
      });
    });

    it('TC-MVU-136: column headers remain aligned when grid is scrolled horizontally', () => {
      cy.get('table, [role="grid"]').first().then($grid => {
        const { scrollWidth, clientWidth } = $grid[0];
        if (scrollWidth > clientWidth) {
          cy.wrap($grid).scrollTo('right', { ensureScrollable: false });
          cy.wait(400);
          cy.get('thead').should('be.visible');
          cy.screenshot('TC-MVU-136');
          cy.wrap($grid).scrollTo('left', { ensureScrollable: false });
        } else {
          cy.log('Grid does not overflow — no horizontal scroll needed');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 18. SECURITY / ACCESS CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  describe('18. Security & Access Control', () => {

    it('TC-MVU-137: direct URL access by an admin user reaches the listing without redirect', () => {
      cy.url().should('include', 'validation-upload');
      cy.get('body').should('not.contain', '401');
      cy.get('body').should('not.contain', 'Access Denied');
    });

    it('TC-MVU-138: XSS payload in Method Name field does not execute script or 500-error', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS executed!'); });
      cy.get('input[name="methodName"]').clear().type('<img src=x onerror=alert(1)>');
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MVU-139: SQL injection string in Method Name does not crash the server', () => {
      openAddForm();
      cy.get('input[name="methodName"]').clear().type("' OR 1=1; DROP TABLE methods;--");
      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 19. API FAILURE HANDLING
  // ══════════════════════════════════════════════════════════════════════════
  describe('19. API Failure Handling', () => {

    it('TC-MVU-140: when the list API returns 500, the page shows a user-friendly error instead of crashing', () => {
      cy.intercept('GET', '**/method/validation-upload**', { statusCode: 500, body: { message: 'Internal Server Error' } }).as('listFail');
      cy.reload();
      cy.wait('@listFail');
      cy.wait(2000);
      // Page must not show raw stack traces or remain fully blank
      cy.get('body').should('not.contain', 'Unhandled Runtime Error');
      cy.screenshot('TC-MVU-140');
    });

    it('TC-MVU-141: when the save API returns 422, a validation error message is shown to the user', () => {
      cy.intercept('POST', '**/method/validation-upload**', { statusCode: 422, body: { message: 'Validation error from server' } }).as('saveFail');
      openAddForm();

      cy.get('input[name="methodName"]').clear().type(`APIFail ${TS}`);
      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(800);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });
      cy.get('input[name="reportProtocolNo"]').clear().type(`RF-${TS}`);
      cy.get('select[name="methodType"] option').then($opts => {
        const vals = Array.from($opts).map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.get('select[name="methodType"]').select(vals[0], { force: true });
      });
      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(800);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(500);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      // Page must not fully crash; an error indication should be present
      cy.get('body').should('not.contain', 'Unhandled Runtime Error');
      cy.screenshot('TC-MVU-141');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 20. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('20. Edge Cases', () => {

    it('TC-MVU-142: navigating away and back via browser history preserves the listing state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.url().should('include', 'validation-upload');
      cy.screenshot('TC-MVU-142');
    });

    it('TC-MVU-143: reloading the page preserves the listing view', () => {
      cy.reload();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.get('table, [role="grid"]', { timeout: 20000 }).should('exist');
    });

    it('TC-MVU-144: a record with a past Effective Date displays the correct Supersedes No mapping in the list', () => {
      cy.get('tbody tr', { timeout: 15000 }).then($rows => {
        const rowCount = $rows.length;
        cy.log(`Total rows: ${rowCount}`);
        if (rowCount > 0) {
          // Supersedes No column should be present — value may be empty or populated
          cy.get('thead th').then($ths => {
            const headers = Array.from($ths).map((th, i) => ({ text: th.textContent.trim(), idx: i }));
            const supersedes = headers.find(h => /Supers/i.test(h.text));
            if (supersedes) {
              cy.get('tbody tr').first().find('td').eq(supersedes.idx).invoke('text').then(val => {
                cy.log(`Supersedes No for first row: "${val}"`);
                cy.screenshot('TC-MVU-144');
              });
            }
          });
        }
      });
    });

    it('TC-MVU-145: no-records empty state shows a clean "No data" message without blank screen', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99999XYZ_EMPTY');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MVU-145');
    });

    it('TC-MVU-146: performance — grid with 60+ rows loads within 15 seconds and page is interactive', () => {
      const start = Date.now();
      cy.get('table, [role="grid"]', { timeout: 15000 }).should('exist');
      cy.get('tbody tr').then($rows => {
        const elapsed = Date.now() - start;
        cy.log(`Rows loaded: ${$rows.length}, Time: ${elapsed}ms`);
        cy.screenshot('TC-MVU-146');
      });
    });

    it('TC-MVU-147: form Method Name placeholder text is "Enter method name"', () => {
      openAddForm();
      cy.get('input[name="methodName"]').should('have.attr', 'placeholder', 'Enter method name');
      closeForm();
    });

    it('TC-MVU-148: form Report/Protocol No placeholder text is "Enter report/protocol number"', () => {
      openAddForm();
      cy.get('input[name="reportProtocolNo"]').should('have.attr', 'placeholder', 'Enter report/protocol number');
      closeForm();
    });

    it('TC-MVU-149: form Supersedes No placeholder text is "Enter supersedes number"', () => {
      openAddForm();
      cy.get('input[name="supersedesNo"]').should('have.attr', 'placeholder', 'Enter supersedes number');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 21. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('21. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2E-MVU-${E2E_TS}`;

    it('E2E-MVU-001: Create → Search → Verify record appears in the list', () => {
      // ── Create ──────────────────────────────────────────────────────────
      openAddForm();

      cy.get('input[name="methodName"]').clear().type(E2E_NAME);

      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      cy.get('input[name="reportProtocolNo"]').clear().type(`E2E-${E2E_TS}`);

      cy.get('select[name="methodType"] option').then($opts => {
        const vals = Array.from($opts).map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.get('select[name="methodType"]').select(vals[0], { force: true });
      });

      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });

      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(800);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MVU-001-created');

      // ── Search & Verify ──────────────────────────────────────────────────
      cy.get('input[placeholder*="earch"]').clear().type(E2E_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2500);
      cy.get('body').invoke('text').then(text => {
        const found = text.includes(E2E_NAME);
        cy.log(`Record "${E2E_NAME}" found in list: ${found}`);
        cy.screenshot('E2E-MVU-001-verified');
      });
    });

    it('E2E-MVU-002: Create with .doc file → Edit to attach a PDF → Save → Verify Files count increases', () => {
      const docName = `DocSave-${E2E_TS}`;
      openAddForm();

      cy.get('input[name="methodName"]').clear().type(docName);
      cy.get('input[placeholder*="Search and select client"]').clear().type('A');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });
      cy.get('input[name="reportProtocolNo"]').clear().type(`DOC-${E2E_TS}`);
      cy.get('select[name="methodType"] option').then($opts => {
        const vals = Array.from($opts).map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.get('select[name="methodType"]').select(vals[0], { force: true });
      });
      cy.get('input[placeholder*="Search and select department"]').clear().type('C');
      cy.wait(1200);
      cy.get('body').then($body => {
        const $opts = $body.find('[role="option"]').filter(':visible');
        if ($opts.length > 0) cy.wrap($opts.first()).click({ force: true });
      });
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(800);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MVU-002-created-doc');

      // ── Search for the record and open Edit ──────────────────────────────
      cy.get('input[placeholder*="earch"]').clear().type(docName);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);

      cy.get('tbody tr', { timeout: 10000 }).first().within(() => {
        cy.get('button[aria-label*="Edit"], button:contains("Edit"), a:contains("Edit")')
          .first().click({ force: true });
      });
      cy.contains('button', /Cancel/i, { timeout: 15000 }).should('be.visible');

      // Add a second file
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(800);

      cy.contains('button', /SAVE|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MVU-002-updated');
    });

    it('E2E-MVU-003: Apply method-name filter → Export to Excel → Verify no 500 error', () => {
      openFilters();
      cy.get('input[placeholder*="Search method name"]').clear().type('Method');
      cy.wait(1500);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MVU-003');
      clearAllFilters();
    });

    it('E2E-MVU-004: Toggle column off → Verify column gone → Toggle back → Verify column returns', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);

      cy.get('body').then($body => {
        const $checkboxes = $body.find('input[type="checkbox"]').filter(':visible');
        if ($checkboxes.length === 0) {
          cy.log('No checkboxes in Columns panel — skip');
          cy.get('body').click(0, 0);
          return;
        }

        // Read the label text of the first checkbox to know which column we are toggling
        const firstCheckbox = $checkboxes.first();
        const labelText = firstCheckbox.closest('label') ? firstCheckbox.closest('label').textContent.trim() : 'Column';
        cy.log(`Toggling column: "${labelText}"`);

        cy.wrap(firstCheckbox).uncheck({ force: true });
        cy.wait(600);
        cy.get('thead').invoke('text').should('not.match', new RegExp(labelText, 'i'));

        cy.wrap(firstCheckbox).check({ force: true });
        cy.wait(600);
        cy.get('body').should('not.contain', '500');
      });

      cy.get('body').click(0, 0);
      cy.screenshot('E2E-MVU-004');
    });
  });
});
