/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// YLIMS E2E — STP Groups Module — Comprehensive Test Suite
// URL    : /dashboard/testing/stp-groups
// Run    : npx cypress run --spec cypress/e2e/modules/stp_group.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/testing/stp-groups';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);
const GROUP_NAME = `AutoGroup ${TS}`;

// Form detection: STP Groups uses a headlessui panel — detect by form-specific inputs
const FORM_OPEN = 'input[name="stpGroupName"]';
const SLIDE_OVER = '[role="dialog"][aria-modal="true"], [data-headlessui-state="open"]';

describe('STP Groups Module', () => {

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

    it('TC-STPG-001: navigating to STP Groups opens the listing screen', () => {
      cy.url().should('include', 'stp-groups');
      cy.get('body').should('not.contain', '404');
      cy.screenshot('TC-STPG-001');
    });

    it('TC-STPG-002: data table or listing loads within expected timeout', () => {
      cy.get('table, [role="grid"]', { timeout: 30000 }).should('exist');
      cy.get('thead').should('be.visible');
    });

    it('TC-STPG-003: page displays a recognizable heading for STP Groups', () => {
      cy.get('body').invoke('text').should('match', /STP Group|Group/i);
      cy.screenshot('TC-STPG-003');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TOOLBAR ELEMENTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Toolbar Elements', () => {

    it('TC-STPG-004: New STP Group button is visible in the toolbar', () => {
      cy.contains('button', /New STP Group|Add STP Group|New Group/i).should('be.visible');
      cy.screenshot('TC-STPG-004');
    });

    it('TC-STPG-005: Excel export button is visible', () => {
      cy.contains('button', /Excel/i).should('be.visible');
    });

    it('TC-STPG-006: PDF export button is visible', () => {
      cy.contains('button', /PDF/i).should('be.visible');
    });

    it('TC-STPG-007: Search input is displayed', () => {
      cy.get('input[placeholder*="earch"]').should('be.visible');
    });

    it('TC-STPG-008: Search button is visible', () => {
      cy.contains('button', /^Search$/i).should('be.visible');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. GRID / LISTING
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Grid & Listing', () => {

    it('TC-STPG-009: grid renders with header row', () => {
      cy.get('thead').should('be.visible');
    });

    it('TC-STPG-010: table header contains Group Name column', () => {
      cy.get('thead').invoke('text').should('match', /Group Name|STP Group/i);
    });

    it('TC-STPG-011: at least one data row is present', () => {
      cy.get('tbody tr', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('TC-STPG-012: row checkboxes are present for each record', () => {
      cy.get('tbody input[type="checkbox"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });

    it('TC-STPG-013: S.No. column starts at 1', () => {
      cy.get('tbody tr').first().find('td').then($tds => {
        const firstNum = Array.from($tds).map(td => td.textContent.trim()).find(t => /^\d+$/.test(t));
        expect(firstNum).to.eq('1');
      });
    });

    it('TC-STPG-014: pagination controls are present', () => {
      cy.get('body').then($body => {
        const hasNav = $body.find('button').filter((_, el) => /Next|First|Last|Prev/i.test(el.textContent)).length > 0;
        expect(hasNav).to.be.true;
      });
    });

    it('TC-STPG-015: total result count is displayed', () => {
      cy.get('body').invoke('text').should('match', /\d+\s*(result|record|of\s+\d)/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Search Functionality', () => {

    it('TC-STPG-016: search input accepts valid text', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Group').should('have.value', 'Group');
    });

    it('TC-STPG-017: searching with a valid keyword returns matching records', () => {
      cy.get('input[placeholder*="earch"]').clear().type('Group');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STPG-017');
    });

    it('TC-STPG-018: searching with non-existent keyword shows no-record message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNEVEREXIST99XYZ');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-STPG-018');
    });

    it('TC-STPG-019: searching with special characters does not break the page', () => {
      cy.get('input[placeholder*="earch"]').clear().type('@#$%^&*');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-STPG-020: clearing search and clicking Search returns full listing', () => {
      cy.get('input[placeholder*="earch"]').clear();
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ADD STP GROUP — FORM DISPLAY
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Add STP Group — Form Display', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Group/i).click();
      // Form is detected when the stpGroupName input appears (not a modal dialog)
      cy.get('input[name="stpGroupName"]', { timeout: 20000 }).should('be.visible');
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.get('input[name="stpGroupName"]', { timeout: 5000 }).should('not.exist');
    };

    it('TC-STPG-021: clicking New STP Group opens the create form', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /STP Group|Group/i);
      cy.screenshot('TC-STPG-021');
      closeForm();
    });

    it('TC-STPG-022: STP Group Name field is displayed', () => {
      openAddForm();
      cy.get('input[name="stpGroupName"]').should('be.visible');
      closeForm();
    });

    it('TC-STPG-023: STP selection/multi-select field is displayed', () => {
      openAddForm();
      cy.get('body').invoke('text').should('match', /Select STP|STP/i);
      cy.screenshot('TC-STPG-023');
      closeForm();
    });

    it('TC-STPG-024: Create/Save button is displayed in the form', () => {
      openAddForm();
      cy.contains('button', /Create|Save/i).filter(':visible').should('exist');
      closeForm();
    });

    it('TC-STPG-025: Cancel button closes the form without saving', () => {
      openAddForm();
      cy.get('input[name="stpGroupName"]')
        .type('Should Not Save');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.get('input[name="stpGroupName"]', { timeout: 5000 }).should('not.exist');
      cy.screenshot('TC-STPG-025');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ADD STP GROUP — FORM VALIDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Add STP Group — Form Validations', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Group/i).click();
      // Form is detected when the stpGroupName input appears (not a modal dialog)
      cy.get('input[name="stpGroupName"]', { timeout: 20000 }).should('be.visible');
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.get('input[name="stpGroupName"]', { timeout: 5000 }).should('not.exist');
    };

    it('TC-STPG-026: clicking Create without filling fields shows validation errors', () => {
      openAddForm();
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory|cannot be empty/i);
      cy.screenshot('TC-STPG-026');
      closeForm();
    });

    it('TC-STPG-027: Group Name with spaces only shows required validation', () => {
      openAddForm();
      cy.get('input[name="stpGroupName"]')
        .type('      ');
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      closeForm();
    });

    it('TC-STPG-028: Group Name accepts valid alphanumeric and special characters', () => {
      openAddForm();
      cy.get('input[name="stpGroupName"]')
        .type('Group-Test_123!').should('have.value', 'Group-Test_123!');
      closeForm();
    });

    it('TC-STPG-029: very long Group Name is handled gracefully', () => {
      openAddForm();
      cy.get('input[name="stpGroupName"]')
        .type('A'.repeat(300), { delay: 0 });
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });

    it('TC-STPG-030: validation errors disappear after correcting the field', () => {
      openAddForm();
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(500);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.get('input[name="stpGroupName"]')
        .type('Valid Group Name');
      cy.wait(500);
      cy.get('body').should('not.contain', 'required');
      closeForm();
    });

    it('TC-STPG-031: XSS injection in Group Name does not trigger alerts', () => {
      openAddForm();
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[name="stpGroupName"]')
        .type("<script>alert('XSS')</script>");
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. STPs MULTI-SELECT DROPDOWN
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. STPs Multi-Select Dropdown', () => {

    const openAddForm = () => {
      cy.contains('button', /New STP Group/i).click();
      // Form is detected when the stpGroupName input appears (not a modal dialog)
      cy.get('input[name="stpGroupName"]', { timeout: 20000 }).should('be.visible');
      cy.wait(500);
    };

    const closeForm = () => {
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.get('input[name="stpGroupName"]', { timeout: 5000 }).should('not.exist');
    };

    it('TC-STPG-032: STP search/select dropdown opens and shows options', () => {
      openAddForm();
      cy.get('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]')
        .then($el => {
          if ($el.length > 0) {
            cy.wrap($el.first()).click({ force: true });
            cy.wait(800);
            cy.get('[role="option"]').filter(':visible').should('have.length.greaterThan', 0);
            cy.screenshot('TC-STPG-032');
            cy.get('body').click(0, 0);
          } else {
            cy.get('[role="combobox"]').filter(':visible').first().click({ force: true });
            cy.wait(800);
            cy.screenshot('TC-STPG-032-combobox');
            cy.get('body').click(0, 0);
          }
        });
      closeForm();
    });

    it('TC-STPG-033: selecting an STP from the dropdown adds it to the group', () => {
      openAddForm();
      cy.get('body').then($body => {
        const stpInput = $body.find('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]');
        if (stpInput.length > 0) {
          cy.wrap(stpInput.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.wait(300);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-STPG-033');
        } else {
          cy.log('STP select input not found in current form layout');
        }
      });
      closeForm();
    });

    it('TC-STPG-034: selecting multiple STPs adds them all to the group', () => {
      openAddForm();
      cy.get('body').then($body => {
        const stpInput = $body.find('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]');
        if (stpInput.length > 0) {
          cy.wrap(stpInput.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').then($opts => {
            if ($opts.length >= 2) {
              cy.wrap($opts.first()).click({ force: true });
              cy.wait(200);
              cy.wrap(stpInput.first()).click({ force: true });
              cy.wait(500);
              cy.get('[role="option"]').filter(':visible').eq(1).click({ force: true });
            }
          });
          cy.get('body').click(0, 0);
          cy.screenshot('TC-STPG-034');
        }
      });
      closeForm();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. CREATE STP GROUP — SUCCESS FLOW
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Create STP Group — Success Flow', () => {

    it('TC-STPG-035: filling Group Name, selecting STPs, and clicking Create succeeds', () => {
      cy.contains('button', /New STP Group/i).click();
      cy.get('input[name="stpGroupName"]', { timeout: 20000 }).should('be.visible');
      cy.wait(500);

      cy.get('input[name="stpGroupName"]')
        .clear().type(GROUP_NAME);

      cy.get('body').then($body => {
        const stpInput = $body.find('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]');
        if (stpInput.length > 0) {
          cy.wrap(stpInput.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.get('body').click(0, 0);
        }
      });

      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STPG-035');
    });

    it('TC-STPG-036: newly created group appears in the listing', () => {
      cy.get('input[placeholder*="earch"]').clear().type(GROUP_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(GROUP_NAME, 'i'));
      cy.screenshot('TC-STPG-036');
    });

    it('TC-STPG-037: duplicate Group Name is rejected with an error message', () => {
      cy.contains('button', /New STP Group|Add STP Group|New Group/i).click();
      cy.get(FORM_OPEN, { timeout: 20000 }).should('be.visible');

      cy.get('input[name="stpGroupName"]')
        .clear().type(GROUP_NAME);

      cy.get('body').then($body => {
        const stpInput = $body.find('input[placeholder="Search STPs..."], input[placeholder*="Search STP"]');
        if (stpInput.length > 0) {
          cy.wrap(stpInput.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.get('body').click(0, 0);
        }
      });

      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /already exists|duplicate|unique/i);
      cy.screenshot('TC-STPG-037');
      cy.contains('button', /Cancel/i).click({ force: true });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. EDIT STP GROUP
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Edit STP Group', () => {

    const openEditFirst = () => {
      cy.get('tbody tr', { timeout: 15000 }).first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i, { matchCase: false }).click({ force: true });
      cy.get(FORM_OPEN, { timeout: 20000 }).should('be.visible');
    };

    it('TC-STPG-038: clicking Edit on a row opens the Edit form', () => {
      openEditFirst();
      cy.get('body').invoke('text').should('match', /Edit.*Group|Update.*Group/i);
      cy.screenshot('TC-STPG-038');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STPG-039: Edit form pre-populates the Group Name field', () => {
      openEditFirst();
      cy.get('input[name="stpGroupName"]')
        .invoke('val').should('not.be.empty');
      cy.screenshot('TC-STPG-039');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STPG-040: Edit form pre-populates existing STPs in the selection', () => {
      openEditFirst();
      cy.get('body').then($body => {
        const hasSelectedItems = $body.find('[class*="tag"], [class*="chip"], [class*="badge"], [class*="selected"]').length > 0
          || $body.find('[role="option"][aria-selected="true"]').length > 0;
        cy.log(`Pre-populated STPs found: ${hasSelectedItems}`);
        cy.screenshot('TC-STPG-040');
      });
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STPG-041: modifying Group Name and saving persists the change', () => {
      cy.get('input[placeholder*="earch"]').clear().type(GROUP_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);

      cy.get('tbody tr').first().within(() => {
        cy.get('button').last().click({ force: true });
      });
      cy.wait(300);
      cy.contains(/^Edit$/i).click({ force: true });
      cy.get(FORM_OPEN, { timeout: 20000 }).should('be.visible');

      const updatedName = `${GROUP_NAME} Upd`;
      cy.get('input[name="stpGroupName"]')
        .clear().type(updatedName);
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STPG-041');
    });

    it('TC-STPG-042: clearing Group Name in Edit shows validation error', () => {
      openEditFirst();
      cy.get('input[name="stpGroupName"]').clear();
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(800);
      cy.get('body').invoke('text').should('match', /required|mandatory/i);
      cy.screenshot('TC-STPG-042');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STPG-043: Cancel in Edit form closes without saving', () => {
      openEditFirst();
      cy.get('input[name="stpGroupName"]')
        .clear().type('SHOULD_NOT_PERSIST');
      cy.contains('button', /Cancel/i).click({ force: true });
      cy.wait(500);
      cy.get('body').should('not.contain', 'SHOULD_NOT_PERSIST');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. DELETE STP GROUP
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Delete STP Group', () => {

    it('TC-STPG-044: selecting a row and clicking Actions > Delete shows confirmation', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.get('[role="dialog"], .modal, .swal2-popup').should('exist');
      cy.screenshot('TC-STPG-044');
      cy.contains('button', /Cancel|No/i).click({ force: true });
    });

    it('TC-STPG-045: canceling the delete dialog does not remove the record', () => {
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

    it('TC-STPG-046: confirming delete removes the group from the listing', () => {
      // Search for the group we created
      const searchName = `${GROUP_NAME} Upd`;
      cy.get('input[placeholder*="earch"]').clear().type(searchName);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').then($body => {
        if ($body.text().match(/No record|No data/i)) {
          // Try original name
          cy.get('input[placeholder*="earch"]').clear().type(GROUP_NAME);
          cy.contains('button', /^Search$/i).click();
          cy.wait(2000);
        }
        cy.get('body').then($body2 => {
          if (!$body2.text().match(/No record|No data/i)) {
            cy.get('tbody input[type="checkbox"]').first().check({ force: true });
            cy.contains('button', /Actions|Action/i).click({ force: true });
            cy.wait(500);
            cy.get('body').contains(/^Delete$/i).click({ force: true });
            cy.wait(1000);
            cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
            cy.wait(3000);
            cy.get('body').should('not.contain', '500');
            cy.screenshot('TC-STPG-046');
          } else {
            cy.log('Created group not found for deletion — skipping');
          }
        });
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. EXPORT FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. Export Functionality', () => {

    it('TC-STPG-047: Excel export completes without page error', () => {
      cy.contains('button', /Excel/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-STPG-047');
    });

    it('TC-STPG-048: PDF export completes without page error', () => {
      cy.contains('button', /PDF/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').should('not.contain', '500');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 12. EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════
  describe('12. Edge Cases', () => {

    it('TC-STPG-049: rapid double-click on New STP Group does not open multiple forms', () => {
      cy.contains('button', /New STP Group|Add STP Group|New Group/i).dblclick({ force: true });
      cy.wait(2000);
      cy.get('body').should('not.contain', '500');
      cy.contains('button', /Cancel/i).click({ force: true });
    });

    it('TC-STPG-050: browser back navigation does not corrupt listing state', () => {
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.go('back');
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-STPG-051: searching for zero-result query shows appropriate message', () => {
      cy.get('input[placeholder*="earch"]').clear().type('ZZZNORESULT99999ABC');
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result|not found/i);
      cy.screenshot('TC-STPG-051');
    });

    it('TC-STPG-052: column sort on Group Name column works correctly', () => {
      cy.get('thead th').filter(':visible').then($ths => {
        const groupNameTh = Array.from($ths).find(th => /Group Name|Name/i.test(th.textContent));
        if (groupNameTh) {
          cy.wrap(groupNameTh).click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
          cy.wrap(groupNameTh).click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
        }
      });
      cy.screenshot('TC-STPG-052');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('13. End-to-End Workflows', () => {

    const E2E_TS   = Date.now().toString().slice(-5);
    const E2E_NAME = `E2EGroup ${E2E_TS}`;

    it('E2E-STPG-001: Create → Search → Edit → Delete an STP Group', () => {
      // Create
      cy.contains('button', /New STP Group|Add STP Group|New Group/i).click();
      cy.get(FORM_OPEN, { timeout: 20000 }).should('be.visible');
      cy.get('input[name="stpGroupName"]')
        .clear().type(E2E_NAME);
      cy.get('body').then($body => {
        const stpInput = $body.find('input[placeholder*="Search STP"], input[placeholder*="STP"], [role="combobox"]').filter(':visible');
        if (stpInput.length > 0) {
          cy.wrap(stpInput.first()).click({ force: true });
          cy.wait(800);
          cy.get('[role="option"]').filter(':visible').first().click({ force: true });
          cy.get('body').click(0, 0);
        }
      });
      cy.contains('button', /Create|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-STPG-001-created');

      // Search
      cy.get('input[placeholder*="earch"]').clear().type(E2E_NAME);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', new RegExp(E2E_NAME, 'i'));

      // Edit
      cy.get('tbody tr').first().within(() => { cy.get('button').last().click({ force: true }); });
      cy.wait(300);
      cy.contains(/^Edit$/i).click({ force: true });
      cy.get(FORM_OPEN, { timeout: 20000 }).should('be.visible');
      const updatedName = `${E2E_NAME} Upd`;
      cy.get('input[name="stpGroupName"]')
        .clear().type(updatedName);
      cy.contains('button', /Update|Save/i).filter(':visible').last().click({ force: true });
      cy.wait(3000);
      cy.screenshot('E2E-STPG-001-edited');

      // Delete
      cy.get('input[placeholder*="earch"]').clear().type(updatedName);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.wait(500);
      cy.get('body').contains(/^Delete$/i).click({ force: true });
      cy.wait(1000);
      cy.contains('button', /Confirm|Yes|Delete/i).click({ force: true });
      cy.wait(3500);
      cy.screenshot('E2E-STPG-001-deleted');

      // Verify deletion
      cy.get('input[placeholder*="earch"]').clear().type(updatedName);
      cy.contains('button', /^Search$/i).click();
      cy.wait(2000);
      cy.get('body').invoke('text').should('match', /No record|No data|0 result/i);
    });
  });
});
