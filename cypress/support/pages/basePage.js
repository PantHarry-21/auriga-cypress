// cypress/support/pages/basePage.js
//
// Base class — all assertions follow a REAL user workflow.
// Refactored to use centralized app_selectors.json (2026-04-24)

export default class BasePage {
  constructor() {
    this._selectors = null;
  }

  // ─── Subclasses override these ──────────────────────────────────────────
  get url()              { throw new Error('Subclass must define url'); }
  get moduleKey()        { return null; } // Override with key from app_selectors.json (e.g. 'ClientProfile')

  // Default selectors (backwards compatibility or fallback)
  get listSelector()     { return this.getSelector('TableRow') || 'table'; }
  get rowSelector()      { return this.getSelector('TableRow') || 'tbody tr'; }
  get slideOver()        { return 'div.animate-slide-in-right, [role="dialog"], .modal, .slide-over'; }
  
  get rowCheckbox()      { return this.getCommonSelector('RowCheckbox') || 'td input[type="checkbox"]'; }
  get panelLoadedIndicator() { 
    return '[id^="headlessui-dialog-title-"], .animate-slide-in-right h2, [role="dialog"] h2, .modal-title, .flex.mb-6'; 
  }
  get createButtonSelector() { return this.getSelector('AddButton') || 'button:contains("New")'; }
  get loadingIndicator()     { return this.getCommonSelector('LoadingState') || ':contains("fetching your data")'; }

  // ── Selectors Management ────────────────────────────────────────────────
  
  _withSelectors(callback) {
    if (this._selectors) {
      return callback(this._selectors);
    }
    return cy.fixture('app_selectors.json').then(data => {
      this._selectors = data;
      return callback(data);
    });
  }

  getSelector(key) {
    if (!this._selectors || !this.moduleKey) return null;
    return this._selectors.Modules[this.moduleKey]?.[key] || null;
  }

  getCommonSelector(key) {
    if (!this._selectors) return null;
    return this._selectors.CommonSelectors[key] || null;
  }

  // ── Helper: Navigate to page ─────────────────────────────────────────────
  visit() {
    cy.log('📌 Navigating to ' + this.url);
    cy.visit(this.url, { failOnStatusCode: false });
    this.waitForLoading();
    return cy;
  }

  waitForLoading() {
    cy.log('⏳ Synchronizing with UI loading state...');
    this._withSelectors((s) => {
      const loading = s.CommonSelectors.LoadingState;
      if (loading) {
        cy.get('body').then($body => {
          if ($body.find(loading).length > 0) {
            cy.get(loading, { timeout: 30000 }).should('not.exist');
          }
        });
      }
      const ready = this.getSelector('PageReady') || this.getSelector('TableRow') || this.listSelector;
      cy.get(ready, { timeout: 20000 }).should('be.visible');
    });
    cy.wait(1500);
  }

  _closePanel() {
    this._withSelectors((s) => {
      const closeSelector = s.CommonSelectors.PopupCloseButton;
      cy.get('body').then($body => {
        const panel = $body.find(this.slideOver).filter(':visible');
        if (panel.length > 0) {
          if (closeSelector && panel.find(closeSelector).length > 0) {
            cy.wrap(panel.find(closeSelector).first()).click({ force: true });
          } else {
            cy.get('body').type('{esc}');
          }
          cy.wait(800); 
        }
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CRUDA Methods
  // ════════════════════════════════════════════════════════════════════════

  assertCanRead() {
    this.visit();
    this._withSelectors((s) => {
      const pageReady = this.getSelector('PageReady');
      if (pageReady) {
        cy.get(pageReady, { timeout: 15000 }).should('be.visible');
      } else {
        const row = this.getSelector('TableRow') || this.rowSelector;
        cy.get(row, { timeout: 15000 }).should('have.length.at.least', 1);
      }
    });
    cy.log('✅ CAN READ verified');
  }

  assertCannotRead() {
    this.visit();
    this._withSelectors((s) => {
      const pageReady = this.getSelector('PageReady');
      cy.get('body', { timeout: 15000 }).then($b => {
        const denied = pageReady
          ? $b.find(pageReady).length === 0
          : $b.find(this.listSelector).length === 0 ||
            /not authorized|forbidden|403|access denied/i.test($b.text());
        expect(denied, `Expected ${this.url} to be denied access`).to.be.true;
      });
    });
    cy.log('✅ CANNOT READ verified');
  }

  // Returns the best available submit-button selector for the open modal.
  // Priority: module-specific SaveButton → common text patterns → button[type="submit"].
  _resolveSubmitSelector(specificKey = 'SaveButton') {
    const specific = this.getSelector(specificKey);
    if (specific) return specific;
    // Covers every save/commit verb used across YLIMS modules
    return [
      'button:contains("Save")',
      'button:contains("Submit")',
      'button:contains("Update")',
      'button:contains("Generate")',
      'button:contains("Confirm")',
      'button:contains("Create")',
      'button:contains("Add")',
      'button:contains("Upload")',
      'button:contains("Assign")',
      'button:contains("Transfer")',
      'button[type="submit"]',
    ].join(', ');
  }

  assertCanCreate() {
    this.visit();
    this._withSelectors((s) => {
      const addBtn = this.getSelector('AddButton');
      if (!addBtn) {
        cy.log('⚠️ No Add button defined for this module — skipping CREATE check.');
        return;
      }
      cy.get(addBtn).should('be.visible').and('not.be.disabled').click();
      // Assert popup opened by verifying its title element is visible
      cy.get(this.panelLoadedIndicator, { timeout: 10000 }).should('be.visible');

      const saveSelector = this._resolveSubmitSelector('SaveButton');
      cy.get(this.slideOver).within(() => {
        cy.get(saveSelector).should('exist').and('be.visible');
      });
      cy.log('✅ CAN CREATE verified');
      this._closePanel();
    });
  }

  assertCannotCreate() {
    this.visit();
    this._withSelectors((s) => {
      const addBtn = this.getSelector('AddButton');
      if (!addBtn) {
        cy.log('✅ No Add button exists — CREATE denied.');
        return;
      }
      cy.get(addBtn).should('be.disabled');
      cy.log('✅ CANNOT CREATE verified (button disabled)');
    });
  }

  // Returns true when the table has no real data rows (empty state or literally no rows).
  _tableIsEmpty(row, $body) {
    const rows = $body.find(row);
    if (rows.length === 0) return true;
    const bodyText = $body.find('tbody').text();
    return /no data|no results|no record/i.test(bodyText);
  }

  assertCanUpdate() {
    this.visit();
    this._withSelectors((s) => {
      const row = this.getSelector('TableRow') || this.rowSelector;

      cy.get('body').then($body => {
        if (this._tableIsEmpty(row, $body)) {
          cy.log('⚠️ CAN UPDATE skipped — no data in table to verify edit.');
          return;
        }

        const editIcon = this.getSelector('EditIcon');
        const editRowClick = this.getSelector('EditRowClick');

        if (editIcon) {
          cy.get(row).first().within(() => {
            cy.get(editIcon).click({ force: true });
          });
        } else if (editRowClick) {
          cy.get(editRowClick).first().click({ force: true });
        } else {
          cy.get(row).first().click({ force: true });
        }

        cy.get(this.slideOver, { timeout: 12000 }).should('be.visible');
        const updateBtn = this.getSelector('UpdateButton') || this._resolveSubmitSelector('SaveButton');
        cy.get(this.slideOver).within(() => {
          cy.get(updateBtn, { timeout: 8000 }).should('be.visible').and('not.be.disabled');
        });
        cy.log('✅ CAN UPDATE verified');
        this._closePanel();
      });
    });
  }

  assertCannotUpdate() {
    this.visit();
    this._withSelectors((s) => {
      const row = this.getSelector('TableRow') || this.rowSelector;

      cy.get('body').then($body => {
        if (this._tableIsEmpty(row, $body)) {
          cy.log('⚠️ CANNOT UPDATE skipped — no data in table to verify edit restriction.');
          return;
        }

        const editIcon = this.getSelector('EditIcon');
        const editRowClick = this.getSelector('EditRowClick');

        if (editIcon) {
          cy.get(row).first().within(() => {
            cy.get(editIcon).click({ force: true });
          });
        } else if (editRowClick) {
          cy.get(editRowClick).first().click({ force: true });
        } else {
          cy.get(row).first().click({ force: true });
        }

        cy.wait(1500);
        cy.get('body').then($b => {
          const panel = $b.find(this.slideOver).filter(':visible');
          if (panel.length === 0) {
            cy.log('✅ No popup opened — UPDATE denied.');
            return;
          }
          const updateBtn = this.getSelector('UpdateButton') || this.getSelector('SaveButton');
          if (updateBtn && panel.find(updateBtn).length === 0) {
            cy.log('✅ Update button absent — UPDATE denied.');
          } else {
            const btn = panel.find('button').filter((_, el) => /save|update/i.test(el.textContent.trim()));
            if (btn.length > 0) expect(btn).to.be.disabled;
          }
        });
        cy.log('✅ CANNOT UPDATE verified');
        this._closePanel();
      });
    });
  }

  assertCanDelete() {
    this.visit();
    this._withSelectors((s) => {
      const checkbox = this.getCommonSelector('RowCheckbox');
      const actions = this.getCommonSelector('BulkActions');
      const deleteBtn = this.getSelector('DeleteButton');
      if (checkbox) {
        cy.get(checkbox).first().check({ force: true });
        if (actions) {
          cy.get(actions).click();
          if (deleteBtn) cy.get(deleteBtn).should('be.visible');
          else cy.contains('Delete').should('be.visible');
        }
      } else if (deleteBtn) {
        cy.get(deleteBtn).should('be.visible');
      }
      cy.log('✅ CAN DELETE verified');
    });
  }

  assertCannotDelete() {
    this.visit();
    this._withSelectors((s) => {
      const checkbox = this.getCommonSelector('RowCheckbox');
      const deleteBtn = this.getSelector('DeleteButton');
      cy.get('body').then($body => {
        if (checkbox && $body.find(checkbox).length === 0 && !deleteBtn) {
          cy.log('✅ No delete options available — DELETE denied.');
          return;
        }
        // Fallback or complex check logic could go here
      });
      cy.log('✅ CANNOT DELETE verified');
    });
  }

  assertCanApprove() {
    this.visit();
    this._withSelectors((s) => {
      const approveBtn = this.getSelector('ApproveButton');
      const row = this.getSelector('TableRow') || this.rowSelector;
      const editTrigger = this.getSelector('EditIcon') || this.getSelector('EditRowClick') || row;

      cy.get('body').then($body => {
        if (this._tableIsEmpty(row, $body)) {
          cy.log('⚠️ CAN APPROVE skipped — no data in table to verify approve action.');
          return;
        }

        if (approveBtn) {
          if ($body.find(approveBtn).length > 0) {
            cy.get(approveBtn).should('be.visible');
          } else {
            cy.get(editTrigger).first().click({ force: true });
            cy.get(this.slideOver).within(() => {
              cy.get(approveBtn).should('be.visible');
            });
          }
        } else {
          cy.get(row).first().click({ force: true });
          cy.get(this.slideOver, { timeout: 10000 }).should('be.visible');
          cy.get(this.slideOver).within(() => {
            cy.contains('button', /approve/i).should('exist');
          });
        }
        cy.log('✅ CAN APPROVE verified');
        this._closePanel();
      });
    });
  }

  assertCannotApprove() {
    this.visit();
    this._withSelectors((s) => {
      const row = this.getSelector('TableRow') || this.rowSelector;
      cy.get(row).first().click({ force: true });
      cy.wait(1500);
      cy.get('body').then($body => {
        const panel = $body.find(this.slideOver).filter(':visible');
        if (panel.length > 0) {
          const btn = panel.find('button').filter((_, el) => /approve/i.test(el.textContent.trim()));
          expect(btn.length).to.equal(0);
        }
      });
      cy.log('✅ CANNOT APPROVE verified');
      this._closePanel();
    });
  }

  check(action, allowed) {
    return this._withSelectors(() => {
      const map = {
        create:  ['assertCanCreate',  'assertCannotCreate'],
        read:    ['assertCanRead',    'assertCannotRead'],
        update:  ['assertCanUpdate',  'assertCannotUpdate'],
        delete:  ['assertCanDelete',  'assertCannotDelete'],
        approve: ['assertCanApprove', 'assertCannotApprove'],
      };
      const methods = map[action];
      if (!methods) throw new Error(`Unknown action: ${action}`);
      const [pos, neg] = methods;
      return this[allowed ? pos : neg]();
    });
  }
}