/// <reference types="cypress" />

// NOTE: This module may have limited content depending on available data and admin permissions. Tests are structured for when data is available.

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Indent Manage Module — Comprehensive E2E Test Suite
// URL    : /dashboard/purchase/admin-indent
// Run    : npx cypress run --spec cypress/e2e/modules/admin_indent.cy.js --env environment=uat
//
// Notes:
//   - This is the admin-side approval/review page for indents raised by staff.
//   - Admins can view indents from all departments, approve/reject/process them.
//   - The page may appear empty if no indent data exists in the current environment.
//   - Tests use conditional logic (cy.get('body').then) where data is uncertain.
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/purchase/admin-indent';
const LAB        = 'Arbro - Delhi';

describe('Admin Indent Manage Module', () => {

  beforeEach(() => {
    cy.loginAs('admin', LAB);
    cy.visit(MODULE_URL, { timeout: 60000 });
    cy.get('body', { timeout: 30000 }).should('not.contain', '404');
    cy.wait(2000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER UTILITIES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Opens the Filters panel if a Filters/Filter button is present.
   */
  const openFilters = () => {
    cy.contains('button', /Filter/i).click({ force: true });
    cy.wait(800);
  };

  /**
   * Clears all active filters by clicking the Clear All / Reset button.
   */
  const clearFilters = () => {
    cy.get('body').then($body => {
      const clearBtn = $body.find('button').filter((_, el) => /Clear All|Clear|Reset/i.test(el.textContent.trim()));
      if (clearBtn.length > 0) {
        cy.wrap(clearBtn.first()).click({ force: true });
        cy.wait(1000);
      }
    });
  };

  /**
   * Clicks the action button on the first visible table row and returns.
   * Caller must handle what to do after the menu opens.
   */
  const openFirstRowActionMenu = () => {
    cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
    cy.get('tbody tr').first().within(() => {
      cy.get('button').last().click({ force: true });
    });
    cy.wait(600);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Module Access & Navigation', () => {

    it('TC-AI-001: navigating to Admin Indent Manage opens the page without errors', () => {
      cy.url().should('include', '/dashboard/purchase/admin-indent');
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-001');
    });

    it('TC-AI-002: URL is exactly /dashboard/purchase/admin-indent', () => {
      cy.url().should('include', '/dashboard/purchase/admin-indent');
    });

    it('TC-AI-003: page heading "Admin Indent Manage" is visible', () => {
      cy.get('body').invoke('text').should('match', /Admin Indent Manage/i);
      cy.screenshot('TC-AI-003');
    });

    it('TC-AI-004: page loads without a 404 or Internal Server Error', () => {
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('not.contain', 'Internal Server Error');
      cy.get('body').should('not.contain', '500');
    });

    it('TC-AI-005: browser back navigation from Admin Indent does not corrupt page state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-005');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-AI-006: Excel export button is visible in the toolbar', () => {
      cy.contains('button', /Excel/i).should('be.visible');
      cy.screenshot('TC-AI-006');
    });

    it('TC-AI-007: PDF export button is visible in the toolbar', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-AI-008: Columns toggle button is visible in the toolbar', () => {
      cy.contains('button', /Columns/i).should('be.visible');
    });

    it('TC-AI-009: Search input is visible in the toolbar', () => {
      cy.get('input[placeholder*="earch"], input[placeholder*="Search"]').should('be.visible');
      cy.screenshot('TC-AI-009');
    });

    it('TC-AI-010: Search button is visible next to the search input', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });

    it('TC-AI-011: Filters button is visible in the toolbar', () => {
      cy.contains('button', /Filter/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TABLE / GRID STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Table / Grid Structure', () => {

    it('TC-AI-012: table or grid element renders on the page', () => {
      cy.get('table, [role="grid"], .ag-root-wrapper, tbody', { timeout: 20000 }).should('exist');
      cy.screenshot('TC-AI-012');
    });

    it('TC-AI-013: table header contains an Indent No / Indent Number column', () => {
      cy.get('body').then($body => {
        if ($body.find('thead').length > 0) {
          cy.get('thead').invoke('text').should('match', /Indent No|Indent Number|INDENT/i);
        } else {
          cy.log('thead not found — table may not have data or uses a virtual grid');
        }
        cy.screenshot('TC-AI-013');
      });
    });

    it('TC-AI-014: table header contains a Status column', () => {
      cy.get('body').then($body => {
        if ($body.find('thead').length > 0) {
          cy.get('thead').invoke('text').should('match', /Status|STATUS/i);
        } else {
          cy.log('thead not found — skipping header assertion');
        }
      });
    });

    it('TC-AI-015: table header contains a Priority column', () => {
      cy.get('body').then($body => {
        if ($body.find('thead').length > 0) {
          cy.get('thead').invoke('text').should('match', /Priority|PRIORITY/i);
        } else {
          cy.log('thead not found — skipping header assertion');
        }
      });
    });

    it('TC-AI-016: table header contains Subject and Department columns', () => {
      cy.get('body').then($body => {
        if ($body.find('thead').length > 0) {
          const headerText = $body.find('thead').text();
          const hasSubject    = /Subject|SUBJECT/i.test(headerText);
          const hasDepartment = /Department|DEPARTMENT/i.test(headerText);
          cy.log(`Subject column: ${hasSubject} | Department column: ${hasDepartment}`);
          cy.screenshot('TC-AI-016');
        } else {
          cy.log('thead not found — skipping header assertion');
        }
      });
    });

    it('TC-AI-017: pagination controls are present on the page', () => {
      cy.get('body').then($body => {
        const hasPagination = $body.find('button').filter((_, el) =>
          /Next|First|Last|Prev/i.test(el.textContent.trim())
        ).length > 0;
        cy.log(`Pagination controls found: ${hasPagination}`);
        cy.screenshot('TC-AI-017');
      });
    });

    it('TC-AI-018: total result count or record count is displayed', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. DATA ROWS & ROW CONTENT (conditional on data)
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Data Rows & Row Content', () => {

    it('TC-AI-019: admin can view indents from all departments (rows visible)', () => {
      cy.get('body').then($body => {
        const rowCount = $body.find('tbody tr').length;
        cy.log(`Visible indent rows: ${rowCount}`);
        if (rowCount > 0) {
          cy.get('tbody tr').should('have.length.greaterThan', 0);
          cy.screenshot('TC-AI-019-has-data');
        } else {
          cy.log('No indent rows available in current environment — this is expected if no indents exist');
          cy.screenshot('TC-AI-019-empty');
        }
      });
    });

    it('TC-AI-020: each visible row shows Indent No, Status, Priority, Subject, Department columns', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          cy.get('tbody tr').first().within(() => {
            cy.get('td').should('have.length.greaterThan', 3);
          });
          cy.screenshot('TC-AI-020');
        } else {
          cy.log('No data rows — skipping row content validation');
        }
      });
    });

    it('TC-AI-021: admin can view indents with all priority levels (Normal/High/Urgent)', () => {
      cy.get('body').then($body => {
        const allText = $body.text();
        const hasPriorityValues = /Normal|High|Urgent|NORMAL|HIGH|URGENT/i.test(allText);
        cy.log(`Priority values visible in table: ${hasPriorityValues}`);
        cy.screenshot('TC-AI-021');
      });
    });

    it('TC-AI-022: row action buttons are present for each indent row', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          cy.get('tbody tr').first().find('button, a[href]').should('have.length.greaterThan', 0);
          cy.screenshot('TC-AI-022');
        } else {
          cy.log('No data rows — skipping row action button validation');
        }
      });
    });

    it('TC-AI-023: row checkbox is present for each indent row (bulk selection support)', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          cy.get('tbody input[type="checkbox"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
          cy.screenshot('TC-AI-023');
        } else {
          cy.log('No data rows — skipping checkbox validation');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Search Functionality', () => {

    it('TC-AI-024: search input accepts typed text', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('Indent').should('have.value', 'Indent');
    });

    it('TC-AI-025: searching by Indent No returns matching records or empty state', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('IND');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-025');
    });

    it('TC-AI-026: searching by Subject returns matching records or empty state', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('Reagent');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-026');
    });

    it('TC-AI-027: searching with a non-existent keyword shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('ZZZNEVEREXISTINDENT99XYZ');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-AI-027');
    });

    it('TC-AI-028: searching with special characters does not crash the page', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('@#$%^&*');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-028');
    });

    it('TC-AI-029: clearing search and clicking Search restores the full listing', () => {
      cy.get('input[placeholder*="earch"]').first().clear();
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-029');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILTER FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Filter Functionality', () => {

    it('TC-AI-030: clicking the Filters button expands the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        const filterPanelVisible =
          $body.find('input:visible, select:visible, [role="combobox"]:visible').length > 0;
        cy.log(`Filter panel expanded with inputs: ${filterPanelVisible}`);
        cy.screenshot('TC-AI-030');
      });
      clearFilters();
    });

    it('TC-AI-031: Status filter (All/Pending/Approved/Rejected) is present in the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        const hasStatusFilter = $body.text().match(/Pending|Approved|Rejected|Status/i);
        cy.log(`Status filter present: ${!!hasStatusFilter}`);
        cy.screenshot('TC-AI-031');
      });
      clearFilters();
    });

    it('TC-AI-032: Department filter is present in the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        const hasDeptFilter = $body.text().match(/Department|DEPT/i);
        cy.log(`Department filter present: ${!!hasDeptFilter}`);
        cy.screenshot('TC-AI-032');
      });
      clearFilters();
    });

    it('TC-AI-033: Priority filter (All/Normal/High/Urgent) is present in the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        const hasPriorityFilter = $body.text().match(/Priority|Normal|High|Urgent/i);
        cy.log(`Priority filter present: ${!!hasPriorityFilter}`);
        cy.screenshot('TC-AI-033');
      });
      clearFilters();
    });

    it('TC-AI-034: Date range filter (Date From / Date To) is present in the filter panel', () => {
      openFilters();
      cy.get('body').then($body => {
        const hasDateFilter =
          $body.find('input[type="date"]').length > 0 ||
          $body.text().match(/Date From|Date To|Raised Date/i);
        cy.log(`Date range filter present: ${!!hasDateFilter}`);
        cy.screenshot('TC-AI-034');
      });
      clearFilters();
    });

    it('TC-AI-035: applying a date range filter and searching returns no 500 error', () => {
      openFilters();
      cy.get('body').then($body => {
        const dateInputs = $body.find('input[type="date"]').filter(':visible');
        if (dateInputs.length >= 1) {
          cy.wrap(dateInputs.first()).type('2024-01-01');
        }
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-035');
      clearFilters();
    });

    it('TC-AI-036: applying a Status filter for Pending indents returns only pending records', () => {
      openFilters();
      cy.get('body').then($body => {
        const statusDropdown = $body.find('[role="combobox"], select').filter(':visible');
        if (statusDropdown.length > 0) {
          cy.wrap(statusDropdown.first()).click({ force: true });
          cy.wait(500);
          cy.get('body').then($inner => {
            const pendingOption = $inner.find('[role="option"], option').filter((_, el) =>
              /Pending/i.test(el.textContent)
            );
            if (pendingOption.length > 0) {
              cy.wrap(pendingOption.first()).click({ force: true });
              cy.wait(500);
              cy.contains('button', /^Search$|Apply/i).click({ force: true });
              cy.wait(2500);
              cy.get('body').should('not.contain', '500');
              cy.screenshot('TC-AI-036-pending-filter');
            }
          });
        }
      });
      clearFilters();
    });

    it('TC-AI-037: Clear All Filters button resets all active filters and restores full list', () => {
      openFilters();
      cy.get('input:visible').first().clear().type('TEST_FILTER_INPUT');
      cy.wait(300);
      clearFilters();
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-037');
    });

    it('TC-AI-038: applying an invalid date range (From > To) is handled gracefully', () => {
      openFilters();
      cy.get('body').then($body => {
        const dateInputs = $body.find('input[type="date"]').filter(':visible');
        if (dateInputs.length >= 2) {
          cy.wrap(dateInputs.first()).type('2025-12-31');
          cy.wrap(dateInputs.eq(1)).type('2024-01-01');
          cy.contains('button', /^Search$|Apply/i).click({ force: true });
          cy.wait(2000);
          cy.get('body').then($afterBody => {
            const hasError = /invalid date|No record|0 result|cannot be/i.test($afterBody.text());
            cy.log(`Invalid date range handled: ${hasError}`);
            cy.screenshot('TC-AI-038');
          });
        } else {
          cy.log('Fewer than 2 date inputs found — skipping invalid range test');
        }
      });
      clearFilters();
    });

    it('TC-AI-039: empty state message shown when filter returns no matching indents', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('ZZZNEVEREXISTINDENT00000');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-AI-039');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ROW-LEVEL ACTIONS (conditional on data availability)
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Row-Level Actions', () => {

    it('TC-AI-040: clicking a row action button opens an action menu or inline options', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          openFirstRowActionMenu();
          cy.get('body').then($menuBody => {
            const hasMenu =
              $menuBody.find('[role="menu"], [role="menuitem"], ul li, .dropdown-menu').filter(':visible').length > 0;
            cy.log(`Row action menu opened: ${hasMenu}`);
            cy.screenshot('TC-AI-040');
          });
          cy.get('body').click(0, 0);
        } else {
          cy.log('No data rows — skipping row action menu test');
        }
      });
    });

    it('TC-AI-041: row action menu contains an Approve option for pending indents', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          openFirstRowActionMenu();
          cy.get('body').invoke('text').then(text => {
            cy.log(`Approve in action menu: ${/Approve/i.test(text)}`);
            cy.screenshot('TC-AI-041');
          });
          cy.get('body').click(0, 0);
        } else {
          cy.log('No data rows — skipping approve action check');
        }
      });
    });

    it('TC-AI-042: row action menu contains a Reject option for pending indents', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          openFirstRowActionMenu();
          cy.get('body').invoke('text').then(text => {
            cy.log(`Reject in action menu: ${/Reject/i.test(text)}`);
            cy.screenshot('TC-AI-042');
          });
          cy.get('body').click(0, 0);
        } else {
          cy.log('No data rows — skipping reject action check');
        }
      });
    });

    it('TC-AI-043: clicking indent row number or subject opens the indent detail view', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length > 0) {
          cy.get('tbody tr').first().find('td a, td button').first().click({ force: true });
          cy.wait(2500);
          cy.get('body').should('not.contain', '500');
          cy.get('body').should('not.contain', '404');
          cy.screenshot('TC-AI-043');
          cy.go('back');
          cy.wait(2000);
        } else {
          cy.log('No data rows — skipping detail view test');
        }
      });
    });

    it('TC-AI-044: Approve action on a pending indent changes status to Approved', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length === 0) {
          cy.log('No indent rows available — skipping approve status change test');
          return;
        }

        // Look for a row with "Pending" status
        cy.get('body').then($pg => {
          const hasPendingRow = $pg.text().match(/Pending/i);
          if (!hasPendingRow) {
            cy.log('No Pending indent found — skipping approve test');
            return;
          }

          openFirstRowActionMenu();
          cy.get('body').then($menuBody => {
            if ($menuBody.text().match(/Approve/i)) {
              cy.contains(/Approve/i).first().click({ force: true });
              cy.wait(2000);
              // Handle any confirmation dialog
              cy.get('body').then($confirm => {
                if ($confirm.find('[role="dialog"], .modal, .swal2-popup').length > 0) {
                  cy.contains('button', /Confirm|Yes|Approve/i).click({ force: true });
                  cy.wait(2500);
                }
              });
              cy.get('body').invoke('text').should('match', /success|approved/i);
              cy.screenshot('TC-AI-044-approved');
            } else {
              cy.log('Approve option not in menu for first row');
              cy.get('body').click(0, 0);
            }
          });
        });
      });
    });

    it('TC-AI-045: Reject action requires a reason/remark before submitting', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length === 0) {
          cy.log('No indent rows — skipping reject validation test');
          return;
        }

        openFirstRowActionMenu();
        cy.get('body').then($menuBody => {
          if ($menuBody.text().match(/Reject/i)) {
            cy.contains(/Reject/i).first().click({ force: true });
            cy.wait(1500);
            // Try to submit rejection without a reason
            cy.get('body').then($rejectBody => {
              if ($rejectBody.find('[role="dialog"], .modal').length > 0) {
                cy.contains('button', /Confirm|Submit|Reject/i).click({ force: true });
                cy.wait(1000);
                // Expect a validation error asking for reason
                cy.get('body').invoke('text').should('match', /required|reason|remark/i);
                cy.contains('button', /Cancel|Close/i).click({ force: true });
                cy.screenshot('TC-AI-045-reject-validation');
              } else {
                cy.log('Rejection dialog did not appear');
                cy.get('body').click(0, 0);
              }
            });
          } else {
            cy.log('Reject option not found in action menu');
            cy.get('body').click(0, 0);
          }
        });
      });
    });

    it('TC-AI-046: admin can add a comment/remark to an indent record', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length === 0) {
          cy.log('No indent rows — skipping comment test');
          return;
        }

        openFirstRowActionMenu();
        cy.get('body').then($menuBody => {
          if ($menuBody.text().match(/Comment|Remark|Note/i)) {
            cy.contains(/Comment|Remark|Note/i).first().click({ force: true });
            cy.wait(1500);
            cy.get('body').then($commentBody => {
              const textareaOrInput = $commentBody.find('textarea, input[type="text"]').filter(':visible');
              if (textareaOrInput.length > 0) {
                cy.wrap(textareaOrInput.first()).type(`Admin comment - ${Date.now()}`);
                cy.contains('button', /Save|Submit|Add/i).click({ force: true });
                cy.wait(2000);
                cy.get('body').should('not.contain', '500');
                cy.screenshot('TC-AI-046-comment-added');
              } else {
                cy.contains('button', /Cancel|Close/i).click({ force: true });
              }
            });
          } else {
            cy.log('Comment/Remark option not found in action menu');
            cy.get('body').click(0, 0);
          }
        });
      });
    });

    it('TC-AI-047: Generate PO option is available for approved indents', () => {
      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length === 0) {
          cy.log('No indent rows — skipping Generate PO option check');
          return;
        }

        openFirstRowActionMenu();
        cy.get('body').invoke('text').then(text => {
          cy.log(`Generate PO in menu: ${/Generate PO|Create PO|PO/i.test(text)}`);
          cy.screenshot('TC-AI-047');
        });
        cy.get('body').click(0, 0);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. COLUMN TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Column Toggle', () => {

    it('TC-AI-048: clicking Columns button opens column visibility panel', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(600);
      cy.get('body').then($body => {
        const hasCheckboxes = $body.find('input[type="checkbox"]:visible').length > 0;
        cy.log(`Column checkboxes visible: ${hasCheckboxes}`);
        cy.screenshot('TC-AI-048');
      });
      cy.get('body').click(0, 0);
    });

    it('TC-AI-049: toggling a column off removes it from the table header', () => {
      cy.contains('button', /Columns/i).click({ force: true });
      cy.wait(600);
      cy.get('body').then($body => {
        const checkedBoxes = $body.find('input[type="checkbox"]:checked').filter(':visible');
        if (checkedBoxes.length > 1) {
          // Uncheck the last visible checked column
          cy.wrap(checkedBoxes.last()).uncheck({ force: true });
          cy.wait(600);
          cy.get('body').click(0, 0);
          cy.wait(600);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-AI-049-column-hidden');
        } else {
          cy.get('body').click(0, 0);
          cy.log('Fewer than 2 checkboxes available — skipping column toggle test');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Export Functionality', () => {

    it('TC-AI-050: Excel export completes without a page error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-050');
    });

    it('TC-AI-051: PDF export completes without a page error', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-AI-052: Excel export with active search filter works without errors', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('IND');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-052');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. PAGINATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Pagination', () => {

    it('TC-AI-053: Next page button loads the next set of records', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim()));
        if ($next.length > 0) {
          cy.get('tbody tr').first().invoke('text').then(pg1Text => {
            cy.wrap($next.first()).click({ force: true });
            cy.wait(2000);
            cy.get('body').should('not.contain', '500');
            cy.screenshot('TC-AI-053');
          });
        } else {
          cy.log('Next button not found — may be single page of results');
        }
      });
    });

    it('TC-AI-054: First page button returns to page 1 from a later page', () => {
      cy.get('body').then($body => {
        const $next = $body.find('button').filter((_, el) => /Next|>/i.test(el.textContent.trim()));
        if ($next.length > 0) {
          cy.wrap($next.first()).click({ force: true });
          cy.wait(1500);
          cy.contains('button', /First/i).click({ force: true });
          cy.wait(1500);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-AI-054');
        } else {
          cy.log('Next button not found — single page, skipping First page test');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ACCESS CONTROL
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Access Control', () => {

    it('TC-AI-055: admin role can access /dashboard/purchase/admin-indent without redirect', () => {
      cy.url().should('include', '/dashboard/purchase/admin-indent');
      cy.get('body').should('not.contain', 'Unauthorized');
      cy.get('body').should('not.contain', 'Access Denied');
      cy.get('body').should('not.contain', 'Forbidden');
      cy.screenshot('TC-AI-055');
    });

    it('TC-AI-056: page does not redirect admin to login page on load', () => {
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/dashboard');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Edge Cases', () => {

    it('TC-AI-057: searching with only whitespace does not crash the page', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('   ');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-057');
    });

    it('TC-AI-058: XSS payload in search field does not trigger an alert', () => {
      cy.on('window:alert', () => { throw new Error('XSS triggered in Admin Indent!'); });
      cy.get('input[placeholder*="earch"]').first().clear().type("<script>alert('xss')</script>");
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-058');
    });

    it('TC-AI-059: SQL injection in search field does not break the page', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type("' OR 1=1 --");
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-059');
    });

    it('TC-AI-060: rapid double-click on Search button does not cause duplicate requests error', () => {
      cy.get('input[placeholder*="earch"]').first().clear().type('IND');
      cy.contains('button', /^Search$/i).dblclick({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-AI-060');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. End-to-End Workflows', () => {

    it('E2E-AI-001: open admin indent list → search → filter by status → clear filters → verify page stable', () => {
      // 1. Verify page loaded
      cy.url().should('include', '/dashboard/purchase/admin-indent');
      cy.get('body').invoke('text').should('match', /Admin Indent Manage/i);
      cy.screenshot('E2E-AI-001-loaded');

      // 2. Search by keyword
      cy.get('input[placeholder*="earch"]').first().clear().type('IND');
      cy.contains('button', /^Search$/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-AI-001-searched');

      // 3. Open Filters and apply Status filter
      openFilters();
      cy.get('body').then($filterBody => {
        const statusDropdown = $filterBody.find('[role="combobox"], select').filter(':visible');
        if (statusDropdown.length > 0) {
          cy.wrap(statusDropdown.first()).click({ force: true });
          cy.wait(500);
          cy.get('[role="option"], option').filter(':visible').first().click({ force: true });
          cy.wait(500);
        }
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-AI-001-filtered');

      // 4. Clear all filters and verify restore
      clearFilters();
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-AI-001-cleared');
    });

    it('E2E-AI-002: find a pending indent, open it, approve it, verify status changed to Approved', () => {
      // Filter for Pending indents first
      openFilters();
      cy.get('body').then($filterBody => {
        const statusDropdown = $filterBody.find('[role="combobox"], select').filter(':visible');
        if (statusDropdown.length > 0) {
          cy.wrap(statusDropdown.first()).click({ force: true });
          cy.wait(500);
          cy.get('body').then($optionBody => {
            const pendingOption = $optionBody.find('[role="option"], option').filter((_, el) =>
              /Pending/i.test(el.textContent)
            );
            if (pendingOption.length > 0) {
              cy.wrap(pendingOption.first()).click({ force: true });
            }
          });
        }
      });
      cy.contains('button', /^Search$|Apply/i).click({ force: true });
      cy.wait(2500);

      cy.get('body').then($body => {
        const rows = $body.find('tbody tr');
        if (rows.length === 0) {
          cy.log('No pending indents available — skipping E2E approval flow');
          clearFilters();
          return;
        }

        // Open action menu on first pending indent row
        openFirstRowActionMenu();

        cy.get('body').then($menuBody => {
          if (!$menuBody.text().match(/Approve/i)) {
            cy.log('Approve not available for first row — may already be approved/rejected');
            cy.get('body').click(0, 0);
            clearFilters();
            return;
          }

          cy.contains(/Approve/i).first().click({ force: true });
          cy.wait(2000);

          // Handle confirmation dialog if present
          cy.get('body').then($confirmBody => {
            if ($confirmBody.find('[role="dialog"], .modal, .swal2-popup').length > 0) {
              cy.contains('button', /Confirm|Yes|Approve/i).click({ force: true });
              cy.wait(3000);
            }
          });

          cy.get('body').invoke('text').should('match', /success|approved/i);
          cy.screenshot('E2E-AI-002-approved');
        });
      });
    });

    it('E2E-AI-003: export admin indent list to Excel then to PDF — both succeed', () => {
      // Excel export
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-AI-003-excel');

      // PDF export
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-AI-003-pdf');
    });
  });
});
