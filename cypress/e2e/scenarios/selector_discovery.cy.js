// cypress/e2e/scenarios/selector_discovery.cy.js
//
// Run this once as admin to discover the real selectors for every module.
// Results are written to cypress/fixtures/discovered_selectors.json
// Copy the captured AddButton / UpdateButton / SaveButton values into app_selectors.json.
//
// Usage:
//   npx cypress run --spec "cypress/e2e/scenarios/selector_discovery.cy.js"
//   (or open Cypress GUI and run this spec)

const MODULES = [
  { key: 'SampleBooking',        url: '/dashboard/samples/booking' },
  { key: 'SampleReceipt',        url: '/dashboard/samples/receipt' },
  { key: 'ClientProfile',        url: '/dashboard/profile/client' },
  { key: 'ProductMaster',        url: '/dashboard/products/master-v2' },
  { key: 'PriceList',            url: '/dashboard/price-list' },
  { key: 'TrfMasterTable',       url: '/dashboard/samples/trf-links' },
  { key: 'ArchiveSamples',       url: '/dashboard/samples/archive' },
  { key: 'SampleDiscarded',      url: '/dashboard/samples/discarded' },
  { key: 'SampleDiscardReport',  url: '/dashboard/samples/discard-report' },
  { key: 'AnalyteMaster',        url: '/dashboard/testing/analyt-master-v2' },
  { key: 'StpMaster',            url: '/dashboard/testing/stp-master-v2' },
  { key: 'GenericMaster',        url: '/dashboard/products/generic-master-v2' },
  { key: 'Quotation',            url: '/dashboard/quotation/client' },
  { key: 'GeneratePO',           url: '/dashboard/purchase/generate-po' },
  { key: 'IndentManage',         url: '/dashboard/purchase/indent' },
  { key: 'CreditApproval',       url: '/dashboard/profile/credit-approval' },
  { key: 'MethodUpload',         url: '/dashboard/method/method-upload' },
  { key: 'MethodValidation',     url: '/dashboard/method/validation-upload' },
  { key: 'MethodDevelopment',    url: '/dashboard/method/development' },
  { key: 'Nabl',                 url: '/dashboard/nabl-scope' },
  { key: 'DeptStpQa',           url: '/dashboard/testing/stp-groups' },
  { key: 'DeptSop',              url: '/dashboard/testing/standard-operating-procedure' },
  { key: 'MapStpMethod',         url: '/dashboard/stp-qa' },
  { key: 'EquipmentPm',          url: '/dashboard/equipment/pm' },
  { key: 'EquipmentOnOff',       url: '/dashboard/equipment/on-off' },
  { key: 'EquipmentAssign',      url: '/dashboard/equipment/equipment' },
  { key: 'EquipmentTransfer',    url: '/dashboard/equipment/transfer' },
  { key: 'MyPendingTest',        url: '/dashboard/analyst' },
  { key: 'MyCompleteTest',       url: '/dashboard/analyst/my-complete-test' },
  { key: 'ReportCompilation',    url: '/dashboard/reports/to-be-compiled' },
  { key: 'ReportPrint',          url: '/dashboard/reports/to-be-printed' },
  { key: 'ReportFinalUpload',    url: '/dashboard/reports/final-report-upload' },
  { key: 'ReportFormB',          url: '/dashboard/nabl-form-b' },
  { key: 'ReportSampleUpdation', url: '/dashboard/reports/view-sample-updation' },
  { key: 'ReportTracking',       url: '/dashboard/reports/to-be-compiled' },
  { key: 'ReportReview',         url: '/dashboard/reports/to-be-reviewed' },
  { key: 'ReportSign',           url: '/dashboard/reports/to-be-signed' },
  { key: 'ReportDispatch',       url: '/dashboard/dispatch/pending' },
  { key: 'OosAnswer',            url: '/dashboard/oos/answer' },
  { key: 'OosQuestion',          url: '/dashboard/oos/question' },
  { key: 'Invoice',              url: '/dashboard/billing/invoice-list' },
  { key: 'Mailer',               url: '/dashboard/mail/inbox' },
  { key: 'Ticket',               url: '/dashboard/support/tickets' },
];

// Keywords that identify an "Add / Create" button vs nav/other buttons
const ADD_KEYWORDS = /^(new|add|create|generate|compose|book|upload|raise|draft|request)/i;
// Keywords that identify a Save button inside a form panel
const SAVE_KEYWORDS = /^(save|submit|create|generate|confirm|add|upload|assign|transfer|book|approve)/i;
// Keywords that identify an Update button inside an edit panel
const UPDATE_KEYWORDS = /^(update|save|submit|confirm|edit)/i;
// Buttons to ignore (never a submit action)
const IGNORE_KEYWORDS = /^(cancel|close|back|discard|reset|no|logout)/i;

const SLIDE_OVER = 'div.animate-slide-in-right, [role="dialog"], .modal';

// ─── Helpers ────────────────────────────────────────────────────────────────

function allButtonTexts($body) {
  return [...$body.find('button')].map(el => el.textContent.trim()).filter(t => t.length > 0);
}

function findButton($body, regex) {
  return [...$body.find('button')].find(el => {
    const t = el.textContent.trim();
    return regex.test(t) && !IGNORE_KEYWORDS.test(t);
  });
}

function closePanelIfOpen($body) {
  const panel = $body.find(SLIDE_OVER).filter((_, el) => Cypress.$(el).is(':visible'));
  if (panel.length > 0) {
    const closeBtn = panel.find('button[aria-label="Close"], .absolute.right-4.top-4').first();
    if (closeBtn.length > 0) {
      Cypress.$(closeBtn).trigger('click');
    } else {
      panel.find('button').filter((_, el) => /close|cancel/i.test(el.textContent.trim())).first().trigger('click');
    }
  }
}

// ─── Main suite ─────────────────────────────────────────────────────────────

describe('Selector Discovery (Admin)', { testIsolation: false }, () => {
  const results = {};

  before(() => {
    cy.session('admin_discovery', () => {
      cy.intercept('**/stimulsoft*.js', { body: '/* stubbed */' });
      cy.visit('/login', { timeout: 120000 });
      cy.get('[name="username"]', { timeout: 30000 }).should('be.visible').clear().type(Cypress.env('ADMIN_USERNAME'));
      cy.get('[name="password"]').should('be.visible').clear().type(Cypress.env('ADMIN_PASSWORD'));

      // Step 1: submit credentials
      cy.get('.inline-flex').click();

      // Step 2: after POST 200, the location selector appears — click it and pick first option
      cy.get('.w-full > .flex', { timeout: 15000 }).should('be.visible').click();
      cy.get(':nth-child(4) > .block').click(); // Select "Auriga Delhi" location — adjust if this changes
      cy.get('.inline-flex').click(); // Login button

      // cy.get('[role="option"], [role="listbox"] li, ul[role="listbox"] li, .select__option', { timeout: 8000 })
      //   .first().click({ force: true });

      cy.url({ timeout: 60000 }).should('not.include', '/login');
    });
  });

  MODULES.forEach((mod) => {
    it(`Discovers: ${mod.key}`, () => {
      const entry = { url: mod.url, allButtons: [], selectors: {} };
      results[mod.key] = entry;

      cy.intercept('**/stimulsoft*.js', { body: '/* stubbed */' });
      cy.visit(mod.url, { failOnStatusCode: false });

      // Wait for heavy SPA to settle
      cy.get('body').then($body => {
        const loading = $body.find("div:contains('Scientist is fetching your data')");
        if (loading.length > 0) {
          cy.contains('Scientist is fetching your data', { timeout: 30000 }).should('not.exist');
        }
      });
      // Wait for page to be interactive — at least one button or data row must be visible
      cy.get('button, tbody tr', { timeout: 20000 }).first().should('be.visible');

      // ── Phase 1: Table + page-level buttons ──
      cy.get('body').then($body => {
        const buttons = allButtonTexts($body);
        entry.allButtons = buttons;

        // TableRow
        if ($body.find('tbody tr').length > 0) {
          entry.selectors.TableRow = 'tbody tr';
        }

        // Page title
        const title = $body.find('h1, h2, span.text-xl, .font-bold, .text-2xl').first().text().trim();
        if (title) entry.pageTitle = title;

        // EditIcon (row-level pencil)
        if ($body.find('button[title="Edit"]').length > 0) {
          entry.selectors.EditIcon = 'button[title="Edit"]';
        }

        // AddButton
        const addEl = findButton($body, ADD_KEYWORDS);
        if (addEl) {
          const text = addEl.textContent.trim();
          entry.selectors.AddButton = `button:contains('${text}')`;
          entry.addButtonText = text;
          cy.log(`ADD BUTTON → "${text}"`);
        } else {
          cy.log('ADD BUTTON → not found');
        }
      });

      // ── Phase 2: Click Add, capture Save button ──
      cy.get('body').then($body => {
        if (!entry.addButtonText) return;
        const addEl = findButton($body, ADD_KEYWORDS);
        if (!addEl) return;

        cy.wrap(addEl).click({ force: true });
        // Wait for the create panel to appear before inspecting it
        cy.get(SLIDE_OVER, { timeout: 10000 }).filter(':visible').should('have.length.gt', 0);

        cy.get('body').then($panelBody => {
          const panel = $panelBody.find(SLIDE_OVER).filter((_, el) => Cypress.$(el).is(':visible'));
          if (panel.length === 0) {
            cy.log('CREATE PANEL → did not open');
            return;
          }

          const saveEl = findButton(Cypress.$(panel[0]), SAVE_KEYWORDS);
          if (saveEl) {
            const text = saveEl.textContent.trim();
            entry.selectors.SaveButton = `button:contains('${text}')`;
            cy.log(`SAVE BUTTON → "${text}"`);
          } else {
            cy.log('SAVE BUTTON → not found in panel');
          }

          // Close panel and wait for it to dismiss
          cy.get('body').type('{esc}');
          cy.get(SLIDE_OVER).should('not.be.visible');
        });
      });

      // ── Phase 3: Click first row, capture Update / Approve buttons ──
      cy.get('body').then($body => {
        if ($body.find('tbody tr').length === 0) return;

        const rows = $body.find('tbody tr');
        cy.intercept({ method: 'GET', url: /\/api\// }).as('rowLoad');
        cy.wrap(rows.first()).click({ force: true });
        cy.wait('@rowLoad', { timeout: 8000 });

        cy.get('body').then($panelBody => {
          const panel = $panelBody.find(SLIDE_OVER).filter((_, el) => Cypress.$(el).is(':visible'));
          if (panel.length === 0) {
            cy.log('EDIT PANEL → did not open on row click');
            return;
          }

          const updateEl = findButton(Cypress.$(panel[0]), UPDATE_KEYWORDS);
          if (updateEl) {
            const text = updateEl.textContent.trim();
            entry.selectors.UpdateButton = `button:contains('${text}')`;
            cy.log(`UPDATE BUTTON → "${text}"`);
          }

          const approveEl = [...Cypress.$(panel[0]).find('button')].find(el =>
            /approve/i.test(el.textContent.trim())
          );
          if (approveEl) {
            const text = approveEl.textContent.trim();
            entry.selectors.ApproveButton = `button:contains('${text}')`;
            cy.log(`APPROVE BUTTON → "${text}"`);
          }

          // Log all buttons in panel
          const panelBtns = allButtonTexts(Cypress.$(panel[0]));
          entry.panelButtons = panelBtns;
          cy.log(`PANEL BUTTONS → ${panelBtns.join(' | ')}`);

          // Close panel and wait for it to dismiss
          cy.get('body').type('{esc}');
          cy.get(SLIDE_OVER).should('not.be.visible');
        });
      });
    });
  });

  after(() => {
    cy.writeFile('cypress/fixtures/discovered_selectors.json', JSON.stringify(results, null, 2));
    cy.log('✅ Results saved to cypress/fixtures/discovered_selectors.json');
  });
});
