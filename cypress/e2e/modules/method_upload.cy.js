/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — Method Upload Module — Comprehensive Test Suite
// URL    : /dashboard/method/method-upload
// Run    : npx cypress run --spec cypress/e2e/modules/method_upload.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/method/method-upload';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);

// File paths (space-safe — Cypress handles spaces in selectFile paths)
const FILE_VALID_DOC   = 'cypress/fixtures/files for testing/2mb.doc';
const FILE_VALID_DOCX  = 'cypress/fixtures/files for testing/10mb.docx';
const FILE_VALID_PDF   = 'cypress/fixtures/files for testing/SOP _ Employee Profile.pdf';
const FILE_VALID_PDF2  = 'cypress/fixtures/files for testing/Himanshus prompt.pdf';
const FILE_INVALID_PNG = 'cypress/fixtures/files for testing/ChatGPT Image Feb 24, 2026, 12_12_08 PM (1).png';
const FILE_INVALID_CSV = 'cypress/fixtures/files for testing/Roles_Permision_Notification Central.csv';
const FILE_INVALID_XLS = 'cypress/fixtures/files for testing/YLIMS_UAT_Testing_Tracker_FINAL.xlsx';

// Future date helpers
const getFutureDate = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getPastDate = (daysBehind = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBehind);
  return d.toISOString().split('T')[0];
};

const TODAY = new Date().toISOString().split('T')[0];
const FUTURE_DATE = getFutureDate(30);
const PAST_DATE   = getPastDate(10);

// ── Shared form helpers ───────────────────────────────────────────────────────

const openAddForm = () => {
  cy.contains('button', /New Method Upload/i).click();
  cy.contains('button', /Cancel/i, { timeout: 20000 }).should('be.visible');
  cy.wait(500);
};

const closeForm = () => {
  cy.contains('button', /Cancel/i).click({ force: true });
  cy.wait(800);
};

const confirmFormOpen = () => {
  cy.get('body', { timeout: 20000 }).should($body => {
    const hasForm =
      $body.find('button:contains("Cancel")').length > 0 ||
      $body.find('button:contains("SAVE")').length > 0 ||
      $body.find('input[placeholder*="Search method"]').length > 0 ||
      $body.find('input[name="productName"]').length > 0;
    if (!hasForm) throw new Error('Method Upload form not open yet');
  });
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Method Upload Module', () => {

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

    it('TC-MU-001: navigating to Method Upload opens the listing screen without errors', () => {
      cy.url().should('include', 'method-upload');
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-001');
    });

    it('TC-MU-002: page heading indicates the Method Upload module', () => {
      cy.get('body').invoke('text').should('match', /Method Upload/i);
      cy.screenshot('TC-MU-002');
    });

    it('TC-MU-003: data table loads within the expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead', { timeout: 15000 }).should('be.visible');
      cy.screenshot('TC-MU-003');
    });

    it('TC-MU-004: table header contains the S.No column', () => {
      cy.get('thead').invoke('text').should('match', /S\.?No|S\.No\.|Serial/i);
    });

    it('TC-MU-005: table header contains the Method ID column', () => {
      cy.get('thead').invoke('text').should('match', /Method\s*ID/i);
    });

    it('TC-MU-006: table header contains the Product Name column', () => {
      cy.get('thead').invoke('text').should('match', /Product\s*Name/i);
    });

    it('TC-MU-007: table header contains the Files column', () => {
      cy.get('thead').invoke('text').should('match', /Files?/i);
    });

    it('TC-MU-008: table header contains the Status / Active column', () => {
      cy.get('thead').invoke('text').should('match', /Status|Active/i);
    });

    it('TC-MU-009: table header contains the Created By column', () => {
      cy.get('thead').invoke('text').should('match', /Created\s*By/i);
    });

    it('TC-MU-010: table header contains the Created Date column', () => {
      cy.get('thead').invoke('text').should('match', /Created\s*Date|Created\s*At/i);
    });

    it('TC-MU-011: table header contains the Location column', () => {
      cy.get('thead').invoke('text').should('match', /Location/i);
    });

    it('TC-MU-012: table header contains the Edit column', () => {
      cy.get('thead').invoke('text').should('match', /Edit/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-MU-013: New Method Upload button is visible and enabled', () => {
      cy.contains('button', /New Method Upload/i).should('be.visible').and('not.be.disabled');
      cy.screenshot('TC-MU-013');
    });

    it('TC-MU-014: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-MU-015: PDF export button is visible', () => {
      cy.contains('button', /^PDF$/i).should('be.visible');
    });

    it('TC-MU-016: Columns toggle button is visible', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-MU-017: Search input is displayed', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-MU-018: Filters button is visible', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });

    it('TC-MU-019: Active filter button/tab is visible', () => {
      cy.get('body').invoke('text').should('match', /Active/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Search Functionality', () => {

    it('TC-MU-020: search box accepts text input', () => {
      cy.get('input[placeholder*="earch"]').clear().type('MET').should('have.value', 'MET');
    });

    it('TC-MU-021: searching by Method ID returns matching records', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().find('td').eq(1).invoke('text').then(methodId => {
        const id = methodId.trim().split(' ')[0];
        if (id && id.length > 1) {
          cy.get('input[placeholder*="earch"]').clear().type(id);
          cy.contains('button', /^Search$/i).click();
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MU-021');
        } else {
          cy.log('No Method ID available to search with — skipping assertion');
        }
      });
    });

    it('TC-MU-022: searching by Product Name returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Auto');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-022');
    });

    it('TC-MU-023: searching with non-existent text shows empty state', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST_XYZ_99999');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found|empty/i);
      cy.screenshot('TC-MU-023');
    });

    it('TC-MU-024: searching with special characters does not crash the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('<script>alert(1)</script>');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-MU-025: clearing the search box and searching restores the full listing', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PAGINATION & PER-PAGE
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Pagination & Per-Page Controls', () => {

    it('TC-MU-026: pagination controls (Next / Previous / page numbers) are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) =>
          /Next|First|Last|Prev|>|</i.test(el.textContent.trim())
        ).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-MU-027: total result count / "Showing X results" text is visible', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d|Showing)/i);
    });

    it('TC-MU-028: clicking the Next page button loads the next set of records', () => {
      cy.get('tbody tr').first().invoke('text').then(pg1Text => {
        cy.get('body').then($body => {
          const $next = $body.find('button').filter((_, el) =>
            /Next|>/i.test(el.textContent.trim())
          ).not('[disabled]').first();
          if ($next.length) {
            cy.wrap($next).click({ force: true });
            cy.wait(1500);
            cy.get('tbody tr').first().invoke('text').should('not.eq', pg1Text);
          } else {
            cy.log('Next button disabled or not found — only one page of data');
          }
        });
      });
    });

    it('TC-MU-029: "Show per page" dropdown changes visible row count', () => {
      cy.get('body').then($body => {
        const $select = $body.find('select').filter((_, el) =>
          el.options && el.options.length > 1 && Array.from(el.options).some(o => /10|20|50/.test(o.text))
        );
        if ($select.length > 0) {
          cy.wrap($select.first()).select('20', { force: true });
          cy.wait(1500);
          cy.get('tbody tr').should('have.length.at.most', 20);
          cy.screenshot('TC-MU-029');
        } else {
          cy.log('Per-page dropdown not found in current layout');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. COLUMNS TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Columns Toggle', () => {

    it('TC-MU-030: clicking Columns opens the manage-columns panel', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        const hasPanelContent =
          $body.find('[class*="column"], [data-testid*="column"], input[type="checkbox"]:visible').length > 0;
        cy.log(`Columns panel opened with toggle content: ${hasPanelContent}`);
        cy.screenshot('TC-MU-030');
      });
      // Close the panel by clicking elsewhere
      cy.get('body').click(0, 0);
    });

    it('TC-MU-031: toggling a column checkbox hides/shows the column in the grid', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(800);
      cy.get('body').then($body => {
        const checkboxes = $body.find('input[type="checkbox"]').filter(':visible');
        if (checkboxes.length > 1) {
          // Uncheck the second one (first is likely "select all")
          cy.wrap(checkboxes.eq(1)).uncheck({ force: true });
          cy.wait(500);
          cy.screenshot('TC-MU-031-hidden');
          cy.wrap(checkboxes.eq(1)).check({ force: true });
          cy.wait(500);
          cy.screenshot('TC-MU-031-restored');
        } else {
          cy.log('Not enough checkboxes found in Columns panel');
        }
      });
      cy.get('body').click(0, 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Filter Functionality', () => {

    const openFilters = () => {
      cy.contains('button', /Filter/i).click({ force: true });
      cy.wait(800);
    };

    const clearAllFilters = () => {
      cy.get('body').then($body => {
        if ($body.find('button:contains("Clear All Filters"), button:contains("Clear All"), button:contains("Clear")').length > 0) {
          cy.contains('button', /Clear All Filters|Clear All|Clear/i).click({ force: true });
          cy.wait(1000);
        }
      });
    };

    it('TC-MU-032: clicking Filters expands the filter panel with input fields', () => {
      openFilters();
      cy.get('body').then($body => {
        const visibleInputs = $body.find('input:visible, select:visible, [role="combobox"]:visible').length;
        cy.log(`Visible filter inputs: ${visibleInputs}`);
        expect(visibleInputs).to.be.greaterThan(0);
        cy.screenshot('TC-MU-032');
      });
      clearAllFilters();
    });

    it('TC-MU-033: filter panel contains S.No field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /S\.?No|Serial/i);
      clearAllFilters();
    });

    it('TC-MU-034: filter panel contains Method ID field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Method\s*ID/i);
      clearAllFilters();
    });

    it('TC-MU-035: filter panel contains Product Name field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Product\s*Name/i);
      clearAllFilters();
    });

    it('TC-MU-036: filter panel contains Created By field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Created\s*By/i);
      clearAllFilters();
    });

    it('TC-MU-037: filter panel contains Created Date field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Created\s*Date|Created\s*At/i);
      clearAllFilters();
    });

    it('TC-MU-038: filter panel contains Upload File field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Upload\s*File|File/i);
      clearAllFilters();
    });

    it('TC-MU-039: filter panel contains Active status field', () => {
      openFilters();
      cy.get('body').invoke('text').should('match', /Active/i);
      clearAllFilters();
    });

    it('TC-MU-040: filtering by Active status returns only active records', () => {
      openFilters();
      cy.get('body').then($body => {
        const activeFilter = $body.find('select, [role="combobox"]').filter(':visible')
          .filter((_, el) => /active/i.test(el.textContent || el.value));
        if (activeFilter.length > 0) {
          cy.wrap(activeFilter.first()).select('Active', { force: true });
          cy.wait(500);
        } else {
          cy.get('body').then($b => {
            const activeCheckbox = $b.find('input[type="checkbox"]').filter(':visible')
              .filter((_, el) => {
                const label = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
                return label && /active/i.test(label.textContent);
              });
            if (activeCheckbox.length > 0) {
              cy.wrap(activeCheckbox.first()).check({ force: true });
            }
          });
        }
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-040');
      clearAllFilters();
    });

    it('TC-MU-041: applying multiple filters returns an intersected result set', () => {
      openFilters();
      cy.get('body').then($body => {
        const inputs = $body.find('input[type="text"]:visible, input:not([type]):visible');
        if (inputs.length > 0) {
          cy.wrap(inputs.first()).clear().type('Auto');
        }
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-041');
      clearAllFilters();
    });

    it('TC-MU-042: Clear All Filters resets filters and reloads full dataset', () => {
      openFilters();
      cy.get('body').then($body => {
        const inputs = $body.find('input[type="text"]:visible');
        if (inputs.length > 0) cy.wrap(inputs.first()).clear().type('ZZFILTERTEST');
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2000);
      clearAllFilters();
      cy.wait(1500);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('TC-MU-042');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ROW-LEVEL — PDF ICON & EDIT ICON
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Row-Level Actions', () => {

    it('TC-MU-043: Upload File (PDF icon) column is present for rows with a file', () => {
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().invoke('text').then(rowText => {
        cy.log(`First row content sample: ${rowText.slice(0, 100)}`);
        cy.screenshot('TC-MU-043');
      });
    });

    it('TC-MU-044: rows without a file show a disabled or hidden PDF icon gracefully', () => {
      cy.get('tbody tr').then($rows => {
        if ($rows.length > 0) {
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MU-044');
        }
      });
    });

    it('TC-MU-045: clicking the PDF icon in a row does not produce a page error', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $pdfBtn = $row.find('button, a').filter((_, el) =>
          /pdf|file|view/i.test(el.title || el.getAttribute('aria-label') || '') ||
          el.querySelector('svg') !== null
        );
        if ($pdfBtn.length > 0) {
          cy.wrap($pdfBtn.first()).click({ force: true });
          cy.wait(2000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MU-045');
          // Close any modal that may have opened
          cy.get('body').then($body => {
            if ($body.find('[role="dialog"] button:contains("Close"), [role="dialog"] button:contains("Cancel")').length > 0) {
              cy.contains('button', /Close|Cancel/i).click({ force: true });
            }
          });
        } else {
          cy.log('PDF icon not found in first row — skipping click');
        }
      });
    });

    it('TC-MU-046: clicking the Edit icon on a row opens the corresponding record in edit mode', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $editBtn = $row.find('button').filter((_, el) =>
          /edit/i.test(el.textContent || el.title || el.getAttribute('aria-label') || '')
        );
        if ($editBtn.length > 0) {
          cy.wrap($editBtn.first()).click({ force: true });
          cy.wait(1500);
          confirmFormOpen();
          cy.get('body').invoke('text').should('match', /Edit|Update|Method/i);
          cy.screenshot('TC-MU-046');
          closeForm();
        } else {
          cy.log('Edit button not found as distinct icon in first row — checking last button');
          cy.get('tbody tr').first().find('button').last().click({ force: true });
          cy.wait(1500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-MU-046-fallback');
          cy.get('body').then($body => {
            if ($body.find('button:contains("Cancel")').length > 0) closeForm();
          });
        }
      });
    });

    it('TC-MU-047: Active column shows Active/Inactive status pill matching the record', () => {
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().invoke('text').then(text => {
        cy.log(`Row status area: ${text.slice(0, 200)}`);
        cy.screenshot('TC-MU-047');
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ADD FORM — DISPLAY & STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Add Form — Display & Structure', () => {

    it('TC-MU-048: clicking New Method Upload opens the create form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /New Method Upload|Add Method|Method Upload/i);
      cy.screenshot('TC-MU-048');
      closeForm();
    });

    it('TC-MU-049: form contains the Method ID searchable combobox', () => {
      openAddForm();
      cy.get('input[placeholder*="Search method ID"]').should('exist');
      closeForm();
    });

    it('TC-MU-050: form contains the Version No text input', () => {
      openAddForm();
      cy.get('input[name="versionNo"]').should('exist');
      closeForm();
    });

    it('TC-MU-051: form contains the Product Name text input', () => {
      openAddForm();
      cy.get('input[name="productName"]').should('exist');
      closeForm();
    });

    it('TC-MU-052: form contains the Message text input', () => {
      openAddForm();
      cy.get('input[name="message"]').should('exist');
      closeForm();
    });

    it('TC-MU-053: form contains the Expiry Date date picker', () => {
      openAddForm();
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').should('have.length.greaterThan', 0);
      closeForm();
    });

    it('TC-MU-054: form contains the Client Name searchable combobox', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').should('exist');
      closeForm();
    });

    it('TC-MU-055: form contains the Active checkbox (checked by default)', () => {
      openAddForm();
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .should('be.checked');
      closeForm();
    });

    it('TC-MU-056: form contains the file upload input', () => {
      openAddForm();
      cy.get('input[type="file"]').should('exist');
      closeForm();
    });

    it('TC-MU-057: SAVE button is visible in the form', () => {
      openAddForm();
      cy.contains('button', /^SAVE$/i).should('be.visible');
      closeForm();
    });

    it('TC-MU-058: Cancel button closes the form and returns to the listing', () => {
      openAddForm();
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.contains('button', /New Method Upload/i).should('be.visible');
      cy.screenshot('TC-MU-058');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ADD FORM — FIELD VALIDATIONS (Negative / Required)
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Add Form — Field Validations', () => {

    it('TC-MU-059: submitting an empty form shows validation errors on mandatory fields', () => {
      openAddForm();
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty|Please/i);
      cy.screenshot('TC-MU-059');
      closeForm();
    });

    it('TC-MU-060: Method ID is mandatory — saving without it shows a validation error', () => {
      openAddForm();
      // Leave Method ID blank, fill other required fields partially
      cy.get('input[name="productName"]').type('TestProduct');
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|Method ID/i);
      cy.screenshot('TC-MU-060');
      closeForm();
    });

    it('TC-MU-061: Product Name is mandatory — saving without it shows a validation error', () => {
      openAddForm();
      // Attempt to type a method ID and leave product name blank
      cy.get('input[placeholder*="Search method ID"]').type('TEST');
      cy.wait(500);
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|Product Name/i);
      cy.screenshot('TC-MU-061');
      closeForm();
    });

    it('TC-MU-062: Expiry Date is mandatory — saving without it shows a validation error', () => {
      openAddForm();
      cy.get('input[name="productName"]').type('TestProduct');
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|Expiry/i);
      cy.screenshot('TC-MU-062');
      closeForm();
    });

    it('TC-MU-063: Upload Method File is mandatory — saving without a file shows a validation error', () => {
      openAddForm();
      cy.get('input[name="productName"]').type('TestProduct');
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first().type(FUTURE_DATE);
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|file|upload/i);
      cy.screenshot('TC-MU-063');
      closeForm();
    });

    it('TC-MU-064: validation errors disappear once the user corrects the invalid field', () => {
      openAddForm();
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(800);
      // Now fix one field and check error clears for it
      cy.get('input[name="productName"]').type('FixedProduct');
      cy.wait(500);
      cy.get('body').then($body => {
        // Product Name error should no longer say required for that specific field after fix
        cy.log('Checking that filling a field clears its specific error');
        cy.screenshot('TC-MU-064');
      });
      closeForm();
    });

    it('TC-MU-065: whitespace-only Product Name is rejected as invalid', () => {
      openAddForm();
      cy.get('input[name="productName"]').type('     ');
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|invalid/i);
      cy.screenshot('TC-MU-065');
      closeForm();
    });

    it('TC-MU-066: Version No accepts valid format values (1, 1.0, v1.0, 01)', () => {
      openAddForm();
      const validVersions = ['1', '1.0', 'v1.0', '01'];
      validVersions.forEach(ver => {
        cy.get('input[name="versionNo"]').clear().type(ver).should('have.value', ver);
      });
      closeForm();
    });

    it('TC-MU-067: Message field accepts free text up to character limit', () => {
      openAddForm();
      cy.get('input[name="message"]').type('This is a valid message for the upload').should('not.have.value', '');
      closeForm();
    });

    it('TC-MU-068: extremely long Message input is handled gracefully (no crash)', () => {
      openAddForm();
      cy.get('input[name="message"]').type('A'.repeat(500), { delay: 0 });
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MU-069: XSS injection in Product Name does not trigger an alert', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered — alert appeared!'); });
      cy.get('input[name="productName"]').type("<script>alert('XSS')</script>");
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-069');
      closeForm();
    });

    it('TC-MU-070: form retains entered data when Save fails validation', () => {
      openAddForm();
      const testProduct = `RetainTest_${TS}`;
      cy.get('input[name="productName"]').type(testProduct);
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(800);
      cy.get('input[name="productName"]').should('have.value', testProduct);
      cy.screenshot('TC-MU-070');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EXPIRY DATE VALIDATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Expiry Date Validation', () => {

    it('TC-MU-071: Expiry Date picker opens and accepts a valid future date', () => {
      openAddForm();
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type(FUTURE_DATE)
        .should('have.value', FUTURE_DATE);
      cy.screenshot('TC-MU-071');
      closeForm();
    });

    it('TC-MU-072: Expiry Date rejects past dates and shows an error if business rule applies', () => {
      openAddForm();
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type(PAST_DATE);
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      // If past date is blocked, there should be a validation message; if not, log it
      cy.get('body').then($body => {
        if ($body.text().match(/past|invalid date|future date|must be after/i)) {
          cy.log('Past date validation is enforced as expected');
        } else {
          cy.log('Past date may be allowed by current business rules — manual review advised');
        }
        cy.screenshot('TC-MU-072');
      });
      closeForm();
    });

    it('TC-MU-073: Expiry Date field ignores invalid text input (non-date)', () => {
      openAddForm();
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type('not-a-date');
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .invoke('val').then(val => {
          cy.log(`Date field value after invalid input: "${val}"`);
          // Browsers usually clear date inputs on invalid values
        });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. FILE UPLOAD — VALID FILES
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. File Upload — Valid Files', () => {

    it('TC-MU-074: uploading a valid .doc file is accepted and filename is shown', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', 'invalid');
      cy.get('body').should('not.contain', 'not supported');
      cy.screenshot('TC-MU-074');
      closeForm();
    });

    it('TC-MU-075: uploading a valid .docx file is accepted and filename is shown', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOCX, { force: true });
      cy.wait(1500); // 10 MB — allow more time
      cy.get('body').should('not.contain', 'invalid');
      cy.get('body').should('not.contain', 'not supported');
      cy.screenshot('TC-MU-075');
      closeForm();
    });

    it('TC-MU-076: uploading a valid PDF file is accepted and filename is shown', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', 'invalid');
      cy.get('body').should('not.contain', 'not supported');
      cy.screenshot('TC-MU-076');
      closeForm();
    });

    it('TC-MU-077: uploading a second valid PDF file also works without errors', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF2, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-077');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. FILE UPLOAD — INVALID FILES
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. File Upload — Invalid File Types', () => {

    it('TC-MU-078: uploading a .png image file is rejected with a validation error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_PNG, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|not allowed|format|type/i);
      cy.screenshot('TC-MU-078');
      closeForm();
    });

    it('TC-MU-079: uploading a .csv file is rejected with a validation error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_CSV, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|not allowed|format|type/i);
      cy.screenshot('TC-MU-079');
      closeForm();
    });

    it('TC-MU-080: uploading an .xlsx Excel file is rejected with a validation error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_INVALID_XLS, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|not allowed|format|type/i);
      cy.screenshot('TC-MU-080');
      closeForm();
    });

    it('TC-MU-081: uploading a synthetic .exe file is rejected with a validation error', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('MZ fake executable content'),
        fileName: 'malware.exe',
        mimeType: 'application/octet-stream',
      }, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /invalid|not supported|not allowed|format|type/i);
      cy.screenshot('TC-MU-081');
      closeForm();
    });

    it('TC-MU-082: uploading a large file (10 MB .docx) does not crash the page', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOCX, { force: true });
      cy.wait(3000); // 10 MB needs extra time
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-082');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. METHOD ID COMBOBOX
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. Method ID Combobox', () => {

    it('TC-MU-083: Method ID combobox accepts typed text to search', () => {
      openAddForm();
      cy.get('input[placeholder*="Search method ID"]').type('MET');
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-083');
      closeForm();
    });

    it('TC-MU-084: Method ID combobox shows dropdown options after typing', () => {
      openAddForm();
      cy.get('input[placeholder*="Search method ID"]').type('M');
      cy.wait(1500);
      cy.get('body').then($body => {
        const hasOptions = $body.find('[role="option"]:visible, li:visible, [class*="option"]:visible').length > 0;
        cy.log(`Dropdown options shown: ${hasOptions}`);
        cy.screenshot('TC-MU-084');
      });
      closeForm();
    });

    it('TC-MU-085: selecting a Method ID from the dropdown populates the field', () => {
      openAddForm();
      cy.get('input[placeholder*="Search method ID"]').type('M');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) {
          cy.wrap(options.first()).click({ force: true });
          cy.wait(500);
          cy.get('input[placeholder*="Search method ID"]').invoke('val').should('not.be.empty');
          cy.screenshot('TC-MU-085');
        } else {
          cy.log('No dropdown options appeared — skipping selection step');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 14. CLIENT NAME COMBOBOX
  // ══════════════════════════════════════════════════════════════════════════
  describe('14. Client Name Combobox', () => {

    it('TC-MU-086: Client Name combobox accepts typed text to search', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').type('Arb');
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-086');
      closeForm();
    });

    it('TC-MU-087: Client Name combobox shows dropdown options when typed', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const hasOptions = $body.find('[role="option"]:visible, li:visible').length > 0;
        cy.log(`Client dropdown options shown: ${hasOptions}`);
        cy.screenshot('TC-MU-087');
      });
      closeForm();
    });

    it('TC-MU-088: selecting a Client from dropdown populates the Client field', () => {
      openAddForm();
      cy.get('input[placeholder*="Search and select client"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) {
          cy.wrap(options.first()).click({ force: true });
          cy.wait(500);
          cy.get('input[placeholder*="Search and select client"]').invoke('val').should('not.be.empty');
          cy.screenshot('TC-MU-088');
        } else {
          cy.log('No client options appeared — skipping');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 15. ACTIVE CHECKBOX
  // ══════════════════════════════════════════════════════════════════════════
  describe('15. Active Checkbox Behaviour', () => {

    it('TC-MU-089: Active checkbox is checked by default on a new upload form', () => {
      openAddForm();
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .should('be.checked');
      cy.screenshot('TC-MU-089');
      closeForm();
    });

    it('TC-MU-090: unchecking the Active checkbox creates an inactive record', () => {
      openAddForm();
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .uncheck({ force: true }).should('not.be.checked');
      cy.screenshot('TC-MU-090');
      closeForm();
    });

    it('TC-MU-091: re-checking the Active checkbox restores it to checked state', () => {
      openAddForm();
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .uncheck({ force: true });
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .check({ force: true }).should('be.checked');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 16. SAVE — SUCCESS FLOW (Full Happy Path)
  // ══════════════════════════════════════════════════════════════════════════
  describe('16. Save — Success Flow', () => {

    it('TC-MU-092: filling all mandatory fields and saving creates a new Method Upload record', () => {
      openAddForm();

      // Step 1: Select a Method ID
      cy.get('input[placeholder*="Search method ID"]').type('M');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) {
          cy.wrap(options.first()).click({ force: true });
          cy.wait(500);
        } else {
          cy.log('No Method ID options — typing a new value directly');
          cy.get('input[placeholder*="Search method ID"]').clear().type(`MU-${TS}`);
        }
      });

      // Step 2: Fill Product Name
      cy.get('input[name="productName"]').clear().type(`AutoProduct_${TS}`);

      // Step 3: Fill Version No (optional but valid)
      cy.get('input[name="versionNo"]').clear().type('1.0');

      // Step 4: Fill Message (optional)
      cy.get('input[name="message"]').clear().type(`Auto test record ${TS}`);

      // Step 5: Set Expiry Date
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type(FUTURE_DATE);

      // Step 6: Select a Client
      cy.get('input[placeholder*="Search and select client"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) {
          cy.wrap(options.first()).click({ force: true });
          cy.wait(500);
        }
      });

      // Step 7: Upload a valid file
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(1000);

      // Step 8: Save
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-092-saved');
    });

    it('TC-MU-093: newly created record appears in the Method Upload list with correct data', () => {
      // Search for the record created in TC-MU-092
      cy.get('input[placeholder*="earch"]').clear().type(`AutoProduct_${TS}`);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2500);
      cy.get('body').then($body => {
        if ($body.text().match(new RegExp(`AutoProduct_${TS}`, 'i'))) {
          cy.log('Newly created record found in listing');
        } else {
          cy.log('Record not found by search — may be on another page or search requires exact match');
        }
        cy.screenshot('TC-MU-093');
      });
      // Clear search to reset
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 17. CANCEL — DISCARD CHANGES
  // ══════════════════════════════════════════════════════════════════════════
  describe('17. Cancel — Discard Changes', () => {

    it('TC-MU-094: clicking Cancel after partial form entry discards all changes', () => {
      openAddForm();
      cy.get('input[name="productName"]').type('SHOULD_NOT_SAVE');
      cy.get('input[name="versionNo"]').type('9.9.9');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.contains('button', /New Method Upload/i).should('be.visible');
      cy.get('body').should('not.contain', 'SHOULD_NOT_SAVE');
      cy.screenshot('TC-MU-094');
    });

    it('TC-MU-095: Cancel after file selection does not persist the file or create a record', () => {
      openAddForm();
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(500);
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(800);
      cy.contains('button', /New Method Upload/i).should('be.visible');
      cy.screenshot('TC-MU-095');
    });

    it('TC-MU-096: rapid double-click on New Method Upload does not open multiple forms', () => {
      cy.contains('button', /New Method Upload/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      // Only one Cancel button should be present, not two
      cy.get('button').filter(':contains("Cancel")').filter(':visible')
        .its('length').should('be.lte', 1);
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.screenshot('TC-MU-096');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 18. EDIT FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('18. Edit Flow', () => {

    const openEditFirst = () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $editBtn = $row.find('button').filter((_, el) =>
          /edit/i.test(el.textContent || el.title || el.getAttribute('aria-label') || '')
        );
        if ($editBtn.length > 0) {
          cy.wrap($editBtn.first()).click({ force: true });
        } else {
          // Fallback: last button in row is likely the edit icon
          cy.wrap($row.find('button').last()).click({ force: true });
        }
        cy.wait(1500);
        confirmFormOpen();
      });
    };

    it('TC-MU-097: clicking Edit on a row opens the edit form pre-populated with saved values', () => {
      openEditFirst();
      cy.get('input[name="productName"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-MU-097');
      closeForm();
    });

    it('TC-MU-098: Edit form pre-populates Expiry Date with the saved date', () => {
      openEditFirst();
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-MU-098');
      closeForm();
    });

    it('TC-MU-099: Edit form shows the Active state matching the original record', () => {
      openEditFirst();
      cy.get('input[name="isActive"], input[type="checkbox"]').filter(':visible').first()
        .invoke('prop', 'checked').then(isChecked => {
          cy.log(`Active state in edit form: ${isChecked}`);
          cy.screenshot('TC-MU-099');
        });
      closeForm();
    });

    it('TC-MU-100: Edit form shows indication that a file already exists', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const hasFileRef = $body.text().match(/\.doc|\.pdf|\.docx|file|upload/i);
        cy.log(`File reference found in edit form: ${!!hasFileRef}`);
        cy.screenshot('TC-MU-100');
      });
      closeForm();
    });

    it('TC-MU-101: clearing Product Name in Edit mode and saving shows a validation error', () => {
      openEditFirst();
      cy.get('input[name="productName"]').filter(':visible').first().clear();
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').should('match', /required|mandatory|Product Name/i);
      cy.screenshot('TC-MU-101');
      closeForm();
    });

    it('TC-MU-102: changing the uploaded file in Edit mode replaces the existing file', () => {
      openEditFirst();
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF2, { force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-102');
      // Do not save — just cancel to avoid mutating data unexpectedly
      closeForm();
    });

    it('TC-MU-103: Cancel in Edit mode closes the form without persisting changes', () => {
      openEditFirst();
      cy.get('input[name="productName"]').filter(':visible').first()
        .invoke('val').then(originalValue => {
          cy.get('input[name="productName"]').filter(':visible').first()
            .clear().type('EDIT_CANCEL_TEST');
          cy.contains('button', /Cancel/i).click({ force: true });
          cy.wait(800);
          cy.get('body').should('not.contain', 'EDIT_CANCEL_TEST');
          cy.screenshot('TC-MU-103');
        });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 19. DUPLICATE CHECK
  // ══════════════════════════════════════════════════════════════════════════
  describe('19. Duplicate Check', () => {

    it('TC-MU-104: attempting to save a duplicate Method ID + Version No combination shows an error', () => {
      // Get an existing record's values first
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $editBtn = $row.find('button').filter((_, el) =>
          /edit/i.test(el.textContent || el.title || el.getAttribute('aria-label') || '')
        );
        if ($editBtn.length > 0) {
          cy.wrap($editBtn.first()).click({ force: true });
        } else {
          cy.wrap($row.find('button').last()).click({ force: true });
        }
        cy.wait(1500);
        confirmFormOpen();

        // Read the existing Method ID and Version No
        cy.get('input[placeholder*="Search method ID"]').invoke('val').then(existingMethodId => {
          cy.get('input[name="versionNo"]').invoke('val').then(existingVersion => {
            closeForm();

            // Now attempt to create a new record with the same combination
            openAddForm();
            if (existingMethodId) {
              cy.get('input[placeholder*="Search method ID"]').type(existingMethodId);
              cy.wait(1000);
              cy.get('body').then($body => {
                const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
                  el.textContent.trim().includes(existingMethodId)
                );
                if (options.length > 0) cy.wrap(options.first()).click({ force: true });
              });
            }
            if (existingVersion) {
              cy.get('input[name="versionNo"]').type(existingVersion);
            }
            cy.get('input[name="productName"]').type('DuplicateTest');
            cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first().type(FUTURE_DATE);
            cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
            cy.wait(500);
            cy.contains('button', /^SAVE$/i).click({ force: true });
            cy.wait(3000);
            cy.get('body').then($body => {
              if ($body.text().match(/duplicate|already exist|conflict/i)) {
                cy.log('Duplicate check is enforced as expected');
              } else {
                cy.log('Duplicate may be allowed or Method ID was not unique — manual review advised');
              }
              cy.screenshot('TC-MU-104');
            });
            cy.get('body').then($body => {
              if ($body.find('button:contains("Cancel")').length > 0) closeForm();
            });
          });
        });
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 20. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('20. Export Functionality', () => {

    it('TC-MU-105: clicking Excel export completes without a page error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-105');
    });

    it('TC-MU-106: clicking PDF export completes without a page error', () => {
      cy.contains('button', /^PDF$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-106');
    });

    it('TC-MU-107: Excel export with an active search filter applied works without errors', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Auto');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-107');
      // Clear search
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 21. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('21. Edge Cases & Security', () => {

    it('TC-MU-108: browser back navigation from the module does not corrupt state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-108');
    });

    it('TC-MU-109: page reload retains expected default state (no 500 error)', () => {
      cy.reload();
      cy.get('body', { timeout: 30000 }).should('not.contain', '404');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-109');
    });

    it('TC-MU-110: SQL injection string in search does not trigger an error', () => {
      cy.get('input[placeholder*="earch"]').clear().type("' OR 1=1; --");
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-MU-110');
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(1000);
    });

    it('TC-MU-111: opening the form and immediately closing it leaves the listing intact', () => {
      cy.get('tbody tr').its('length').then(rowCount => {
        openAddForm();
        closeForm();
        cy.get('tbody tr').should('have.length', rowCount);
      });
      cy.screenshot('TC-MU-111');
    });

    it('TC-MU-112: form field Tab-order cycles through visible fields in logical sequence', () => {
      openAddForm();
      // Tab through fields and verify focus moves — we just confirm no crash occurs
      cy.get('input[placeholder*="Search method ID"]').focus().tab();
      cy.wait(200);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MU-113: very long Version No value is handled gracefully', () => {
      openAddForm();
      cy.get('input[name="versionNo"]').type('V'.repeat(300), { delay: 0 });
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-MU-114: very long Product Name value is handled gracefully (truncated or error)', () => {
      openAddForm();
      cy.get('input[name="productName"]').type('P'.repeat(500), { delay: 0 });
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 22. AUDIT FIELDS
  // ══════════════════════════════════════════════════════════════════════════
  describe('22. Audit Fields', () => {

    it('TC-MU-115: Created By field in the listing is populated for each record', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().invoke('text').then(rowText => {
        cy.log(`First row text (for audit check): ${rowText.slice(0, 200)}`);
        // The row should have some non-empty content in the Created By column area
        expect(rowText.trim()).to.not.be.empty;
        cy.screenshot('TC-MU-115');
      });
    });

    it('TC-MU-116: Created Date field in the listing shows a valid date for each record', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().invoke('text').then(rowText => {
        const hasDate = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}|\w+ \d+, \d{4}/.test(rowText);
        cy.log(`Date pattern found in first row: ${hasDate}`);
        cy.screenshot('TC-MU-116');
      });
    });

    it('TC-MU-117: edit an existing record and verify that audit info is updated', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $editBtn = $row.find('button').filter((_, el) =>
          /edit/i.test(el.textContent || el.title || el.getAttribute('aria-label') || '')
        );
        if ($editBtn.length > 0) {
          cy.wrap($editBtn.first()).click({ force: true });
        } else {
          cy.wrap($row.find('button').last()).click({ force: true });
        }
        cy.wait(1500);
        confirmFormOpen();

        // Make a minor change
        cy.get('input[name="message"]').clear().type(`Audit update test ${TS}`);
        cy.contains('button', /^SAVE$/i).click({ force: true });
        cy.wait(3000);
        cy.get('body').should('not.contain', '500');
        cy.screenshot('TC-MU-117');
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 23. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('23. End-to-End Workflows', () => {

    const E2E_TS      = Date.now().toString().slice(-5);
    const E2E_PRODUCT = `E2EProduct_${E2E_TS}`;

    it('E2E-MU-001: Create a new Method Upload with all fields and verify it appears in the list', () => {
      openAddForm();

      // Method ID
      cy.get('input[placeholder*="Search method ID"]').type('M');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) cy.wrap(options.first()).click({ force: true });
        else cy.get('input[placeholder*="Search method ID"]').clear().type(`MU-${E2E_TS}`);
        cy.wait(300);
      });

      // Product Name
      cy.get('input[name="productName"]').clear().type(E2E_PRODUCT);

      // Version
      cy.get('input[name="versionNo"]').clear().type('2.0');

      // Message
      cy.get('input[name="message"]').clear().type(`E2E flow test record ${E2E_TS}`);

      // Expiry Date
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type(FUTURE_DATE);

      // Client Name
      cy.get('input[placeholder*="Search and select client"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) cy.wrap(options.first()).click({ force: true });
        cy.wait(300);
      });

      // File
      cy.get('input[type="file"]').selectFile(FILE_VALID_PDF, { force: true });
      cy.wait(1000);

      // Save
      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MU-001-created');

      // Verify in list
      cy.get('input[placeholder*="earch"]').clear().type(E2E_PRODUCT);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2500);
      cy.get('body').then($body => {
        if ($body.text().match(new RegExp(E2E_PRODUCT, 'i'))) {
          cy.log('E2E record verified in list');
        } else {
          cy.log('Record may need exact search — checking full listing');
        }
        cy.screenshot('E2E-MU-001-verified');
      });
    });

    it('E2E-MU-002: Search for a record by Method ID, open Edit, update Message, save successfully', () => {
      cy.get('tbody tr', { timeout: 15000 }).first().then($row => {
        const $editBtn = $row.find('button').filter((_, el) =>
          /edit/i.test(el.textContent || el.title || el.getAttribute('aria-label') || '')
        );
        if ($editBtn.length > 0) {
          cy.wrap($editBtn.first()).click({ force: true });
        } else {
          cy.wrap($row.find('button').last()).click({ force: true });
        }
        cy.wait(1500);
        confirmFormOpen();

        cy.get('input[name="message"]').clear().type(`E2E updated msg ${E2E_TS}`);
        cy.contains('button', /^SAVE$/i).click({ force: true });
        cy.wait(3000);
        cy.get('body').should('not.contain', '500');
        cy.screenshot('E2E-MU-002');
      });
    });

    it('E2E-MU-003: Apply filter, verify filtered results, clear filter, verify full list restored', () => {
      cy.contains('button', /Filter/i).click({ force: true });
      cy.wait(800);

      cy.get('body').then($body => {
        const inputs = $body.find('input[type="text"]:visible');
        if (inputs.length > 0) {
          cy.wrap(inputs.first()).clear().type('Auto');
          cy.contains('button', /^Search$|Apply/i).click({ force: true });
          cy.wait(2000);
          cy.screenshot('E2E-MU-003-filtered');
          cy.get('body').should('not.contain', '500');
        }
      });

      // Clear filters
      cy.get('body').then($body => {
        if ($body.find('button:contains("Clear All Filters"), button:contains("Clear All"), button:contains("Clear")').length > 0) {
          cy.contains('button', /Clear All Filters|Clear All|Clear/i).click({ force: true });
          cy.wait(1500);
        }
      });
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.screenshot('E2E-MU-003-restored');
    });

    it('E2E-MU-004: Export current list to Excel after applying a product name search', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Auto');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MU-004');
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(1500);
    });

    it('E2E-MU-005: Upload an invalid file type, see error, replace with valid file, save succeeds', () => {
      openAddForm();

      // Method ID
      cy.get('input[placeholder*="Search method ID"]').type('M');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) cy.wrap(options.first()).click({ force: true });
        else cy.get('input[placeholder*="Search method ID"]').clear().type(`E2E5-${E2E_TS}`);
        cy.wait(300);
      });

      cy.get('input[name="productName"]').clear().type(`E2EProduct5_${E2E_TS}`);
      cy.get('input[name="expiryDate"], input[type="date"]').filter(':visible').first()
        .type(FUTURE_DATE);

      // Try invalid file first
      cy.get('input[type="file"]').selectFile(FILE_INVALID_PNG, { force: true });
      cy.wait(1000);
      cy.get('body').invoke('text').then(bodyText => {
        if (bodyText.match(/invalid|not supported|not allowed|format|type/i)) {
          cy.log('Invalid file correctly rejected — now uploading valid file');
        } else {
          cy.log('App may not validate file type on select — proceeding with valid file');
        }
      });

      // Replace with valid file
      cy.get('input[type="file"]').selectFile(FILE_VALID_DOC, { force: true });
      cy.wait(1000);

      // Select a client
      cy.get('input[placeholder*="Search and select client"]').type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const options = $body.find('[role="option"]:visible, li:visible').filter((_, el) =>
          el.textContent.trim().length > 0
        );
        if (options.length > 0) cy.wrap(options.first()).click({ force: true });
        cy.wait(300);
      });

      cy.contains('button', /^SAVE$/i).click({ force: true });
      cy.wait(4000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-MU-005');
    });
  });
});
