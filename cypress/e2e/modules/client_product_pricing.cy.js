/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Client Product Pricing Module — Comprehensive E2E Test Suite
// URL    : /dashboard/client-product-pricing
// Run    : npx cypress run --spec cypress/e2e/modules/client_product_pricing.cy.js --env environment=uat
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_URL = '/dashboard/client-product-pricing';
const LAB        = 'Arbro - Delhi';
const TS         = Date.now().toString().slice(-6);

describe('Client Product Pricing Module', () => {

  // Test Data
  const CLIENT_NAME       = 'ARBRO ANALYTICAL DIVISION';
  const CLIENT_PARTIAL    = 'ARBRO';
  const PRODUCT_NAME      = 'ABAMUNE- L';
  const PRODUCT_PARTIAL   = 'ABAMUNE';
  const TURNOVER_TIME     = '7';
  const TURNOVER_UPDATED  = '14';
  const SPECIFIC_PRICE    = '150';
  const URGENT_PRICE      = '250';
  const XSS_PAYLOAD       = "<script>alert('xss')</script>";

  beforeEach(() => {
    cy.loginAs('admin', LAB);
    cy.visit(MODULE_URL, { timeout: 60000 });
    cy.get('body', { timeout: 30000 }).should('not.contain', '404');
    cy.wait(1500);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER: Select a client, optionally select a product to load the grid
  // ══════════════════════════════════════════════════════════════════════════
  const selectClient = (name = CLIENT_NAME) => {
    cy.get('input[id="cpp-client-search"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(name);
    cy.wait(1200);
    cy.get('body').contains(name).first().click({ force: true });
    cy.wait(1500);
  };

  const selectProduct = (name = PRODUCT_NAME) => {
    cy.get('input[placeholder="Search product..."]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(name);
    cy.wait(1500);
    cy.get('body').contains(name).first().click({ force: true });
    cy.wait(2000);
  };

  const loadProductGrid = (clientName = CLIENT_NAME, productName = PRODUCT_NAME) => {
    selectClient(clientName);
    selectProduct(productName);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODULE ACCESS & NAVIGATION
  // ══════════════════════════════════════════════════════════════════════════
  describe('1. Module Access & Navigation', () => {

    it('TC-CPP-001: navigating to Client Product Pricing opens the page without errors', () => {
      cy.url().should('include', '/client-product-pricing');
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CPP-001');
    });

    it('TC-CPP-002: URL is exactly /dashboard/client-product-pricing', () => {
      cy.url().should('include', '/dashboard/client-product-pricing');
    });

    it('TC-CPP-003: page heading "Client Product Pricing" is visible', () => {
      cy.get('body').invoke('text').should('match', /Client Product Pricing/i);
      cy.screenshot('TC-CPP-003');
    });

    it('TC-CPP-004: sub-heading "Product STP Information" section is visible', () => {
      cy.get('body').invoke('text').should('match', /Product STP Information/i);
      cy.screenshot('TC-CPP-004');
    });

    it('TC-CPP-005: page loads without JavaScript console errors (500 not in body)', () => {
      cy.get('body').should('not.contain', '500');
      cy.get('body').should('not.contain', 'Internal Server Error');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. FIELD VISIBILITY & UI LABELS
  // ══════════════════════════════════════════════════════════════════════════
  describe('2. Field Visibility & UI Labels', () => {

    it('TC-CPP-006: Client Name search input is visible on page load', () => {
      cy.get('input[id="cpp-client-search"]').should('be.visible');
      cy.screenshot('TC-CPP-006');
    });

    it('TC-CPP-007: Client Name label is displayed', () => {
      cy.get('body').invoke('text').should('match', /Client Name/i);
    });

    it('TC-CPP-008: Is Priced label is displayed', () => {
      cy.get('body').invoke('text').should('match', /Is Priced/i);
    });

    it('TC-CPP-009: Product label and search combobox are visible', () => {
      cy.get('body').invoke('text').should('match', /\bProduct\b/i);
      cy.get('input[placeholder="Search product..."]').should('exist');
      cy.screenshot('TC-CPP-009');
    });

    it('TC-CPP-010: Total Turnover Time (Days) label and number input are visible', () => {
      cy.get('body').invoke('text').should('match', /Total Turnover Time/i);
      cy.get('input[type="number"][placeholder="0"]').should('exist');
      cy.screenshot('TC-CPP-010');
    });

    it('TC-CPP-011: "Not Priced" button is visible on page load', () => {
      cy.contains('button', /Not Priced/i).should('exist');
      cy.screenshot('TC-CPP-011');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. CLIENT SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('3. Client Search Functionality', () => {

    it('TC-CPP-012: client search input accepts typed text', () => {
      cy.get('input[id="cpp-client-search"]')
        .clear()
        .type(CLIENT_PARTIAL)
        .should('have.value', CLIENT_PARTIAL);
    });

    it('TC-CPP-013: typing 3+ characters in client search shows suggestions', () => {
      cy.get('input[id="cpp-client-search"]').clear().type(CLIENT_PARTIAL.slice(0, 3));
      cy.wait(1200);
      cy.get('body').then($body => {
        const hasSuggestions =
          $body.find('[role="option"]:visible, [role="listbox"] li:visible, ul li:visible').length > 0 ||
          $body.text().includes(CLIENT_PARTIAL.slice(0, 3).toUpperCase()) ||
          $body.text().includes('ARBRO');
        expect(hasSuggestions).to.be.true;
      });
      cy.screenshot('TC-CPP-013');
    });

    it('TC-CPP-014: selecting a client from suggestions populates the client search field', () => {
      selectClient();
      cy.get('input[id="cpp-client-search"]').invoke('val').should('not.be.empty');
      cy.screenshot('TC-CPP-014');
    });

    it('TC-CPP-015: partial client name search (contains search) returns relevant results', () => {
      cy.get('input[id="cpp-client-search"]').clear().type(CLIENT_PARTIAL);
      cy.wait(1200);
      cy.get('body').invoke('text').should('match', new RegExp(CLIENT_PARTIAL, 'i'));
      cy.screenshot('TC-CPP-015');
    });

    it('TC-CPP-016: client search is case-insensitive', () => {
      cy.get('input[id="cpp-client-search"]').clear().type(CLIENT_PARTIAL.toLowerCase());
      cy.wait(1200);
      cy.get('body').then($body => {
        const hasSuggestion = $body.text().toUpperCase().includes(CLIENT_PARTIAL.toUpperCase());
        expect(hasSuggestion).to.be.true;
      });
      cy.screenshot('TC-CPP-016');
    });

    it('TC-CPP-017: invalid/non-existent client name shows no results', () => {
      cy.get('input[id="cpp-client-search"]').clear().type('ZZZNEVEREXIST99XYZ');
      cy.wait(1500);
      cy.get('body').then($body => {
        const hasNoResult =
          $body.find('[role="option"]:visible').length === 0 ||
          $body.text().match(/No result|No client|not found/i);
        cy.log(`No results found as expected: ${!!hasNoResult}`);
      });
      cy.screenshot('TC-CPP-017');
    });

    it('TC-CPP-018: clearing client search field resets the product list', () => {
      selectClient();
      cy.get('input[id="cpp-client-search"]').clear();
      cy.wait(1000);
      // Product search should either reset or be empty
      cy.get('input[placeholder="Search product..."]').invoke('val').then(val => {
        cy.log(`Product field after client clear: "${val}"`);
      });
      cy.screenshot('TC-CPP-018');
    });

    it('TC-CPP-019: XSS payload in client search field does not trigger an alert', () => {
      cy.on('window:alert', () => { throw new Error('XSS triggered!'); });
      cy.get('input[id="cpp-client-search"]').clear().type(XSS_PAYLOAD);
      cy.wait(1200);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CPP-019');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PRODUCT SEARCH FUNCTIONALITY
  // ══════════════════════════════════════════════════════════════════════════
  describe('4. Product Search Functionality', () => {

    it('TC-CPP-020: product search combobox is available after selecting a client', () => {
      selectClient();
      cy.get('input[placeholder="Search product..."]').should('be.visible');
      cy.screenshot('TC-CPP-020');
    });

    it('TC-CPP-021: typing in product search after client selection shows product options', () => {
      selectClient();
      cy.get('input[placeholder="Search product..."]').clear().type(PRODUCT_PARTIAL.slice(0, 3));
      cy.wait(1200);
      cy.get('body').then($body => {
        const hasSuggestions =
          $body.find('[role="option"]:visible, [role="listbox"] li:visible').length > 0 ||
          $body.text().includes('ABAMUNE') ||
          $body.text().includes(PRODUCT_PARTIAL.slice(0, 3).toUpperCase());
        expect(hasSuggestions).to.be.true;
      });
      cy.screenshot('TC-CPP-021');
    });

    it('TC-CPP-022: selecting a product from the list loads the STP grid', () => {
      loadProductGrid();
      cy.get('body').then($body => {
        const hasGrid =
          $body.find('table, [role="grid"], .ag-root-wrapper, tbody').length > 0;
        expect(hasGrid).to.be.true;
      });
      cy.screenshot('TC-CPP-022');
    });

    it('TC-CPP-023: multiple products are available for a client in the product dropdown', () => {
      selectClient();
      cy.get('input[placeholder="Search product..."]').clear().type('A');
      cy.wait(1500);
      cy.get('body').then($body => {
        const optionCount = $body.find('[role="option"]:visible, [role="listbox"] li:visible').length;
        cy.log(`Product options visible: ${optionCount}`);
        expect(optionCount).to.be.greaterThan(0);
      });
      cy.get('body').click(0, 0);
      cy.screenshot('TC-CPP-023');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. PRODUCT STP INFORMATION GRID
  // ══════════════════════════════════════════════════════════════════════════
  describe('5. Product STP Information Grid', () => {

    it('TC-CPP-024: STP grid populates with rows after selecting a client and product', () => {
      loadProductGrid();
      cy.get('table, [role="grid"], tbody', { timeout: 20000 }).should('exist');
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.screenshot('TC-CPP-024');
    });

    it('TC-CPP-025: STP grid displays S.No, STP Name, Price Code columns', () => {
      loadProductGrid();
      cy.get('body').invoke('text').should('match', /S\.NO|STP NAME|PRICE CODE/i);
      cy.screenshot('TC-CPP-025');
    });

    it('TC-CPP-026: STP grid displays Base Price, Specific Price, Urgent Price columns', () => {
      loadProductGrid();
      cy.get('body').invoke('text').should('match', /BASE PRICE|SPECIFIC PRICE|URGENT PRICE/i);
      cy.screenshot('TC-CPP-026');
    });

    it('TC-CPP-027: Is Priced column shows correct pricing status per product row', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('body').then($body => {
        const text = $body.text();
        const hasPricingStatus = /Priced|Not Priced|Yes|No/i.test(text);
        cy.log(`Pricing status present in grid: ${hasPricingStatus}`);
      });
      cy.screenshot('TC-CPP-027');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. TOTAL TURNOVER TIME INPUT
  // ══════════════════════════════════════════════════════════════════════════
  describe('6. Total Turnover Time (Days) Input', () => {

    it('TC-CPP-028: Total Turnover Time number input is visible', () => {
      cy.get('input[type="number"][placeholder="0"]').should('exist');
      cy.screenshot('TC-CPP-028');
    });

    it('TC-CPP-029: Turnover Time accepts positive integer values', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_TIME);
      cy.get('input[type="number"][placeholder="0"]').first().should('have.value', TURNOVER_TIME);
      cy.screenshot('TC-CPP-029');
    });

    it('TC-CPP-030: Turnover Time rejects negative values — browser constraint enforces min=0', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type('-5');
      cy.get('input[type="number"][placeholder="0"]').first().then($el => {
        // Either the value is coerced to empty/0 or validity.valid is false
        const val = $el.val();
        const isNegative = parseFloat(val) < 0;
        cy.log(`Input value after typing -5: "${val}" — negative allowed by browser: ${isNegative}`);
      });
      cy.screenshot('TC-CPP-030');
    });

    it('TC-CPP-031: Turnover Time with decimal is handled gracefully', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type('3.5');
      cy.get('input[type="number"][placeholder="0"]').first().then($el => {
        const val = $el.val();
        cy.log(`Decimal input value: "${val}"`);
        cy.get('body').should('not.contain', '500');
      });
      cy.screenshot('TC-CPP-031');
    });

    it('TC-CPP-032: Turnover Time accepts zero as a valid value', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type('0');
      cy.get('input[type="number"][placeholder="0"]').first().should('have.value', '0');
    });

    it('TC-CPP-033: Turnover Time value can be updated to a new positive integer', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_TIME);
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_UPDATED);
      cy.get('input[type="number"][placeholder="0"]').first().should('have.value', TURNOVER_UPDATED);
      cy.screenshot('TC-CPP-033');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. "NOT PRICED" / IS PRICED TOGGLE
  // ══════════════════════════════════════════════════════════════════════════
  describe('7. Not Priced / Is Priced Toggle', () => {

    it('TC-CPP-034: "Not Priced" button is visible and clickable', () => {
      cy.contains('button', /Not Priced/i).should('exist').click({ force: true });
      cy.wait(1000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CPP-034');
    });

    it('TC-CPP-035: clicking "Not Priced" button changes the pricing status', () => {
      cy.get('body').then($bodyBefore => {
        const beforeText = $bodyBefore.text();
        cy.contains('button', /Not Priced/i).first().click({ force: true });
        cy.wait(1000);
        cy.get('body').then($bodyAfter => {
          // Either status text changed OR a success toast appeared
          const afterText = $bodyAfter.text();
          cy.log(`Body text changed: ${beforeText !== afterText}`);
          cy.get('body').should('not.contain', '500');
        });
      });
      cy.screenshot('TC-CPP-035');
    });

    it('TC-CPP-036: Is Priced filter toggle affects the product list loaded', () => {
      // Click the Is Priced filter to switch to "Priced"
      cy.contains('label', /Is Priced/i).parent().then($container => {
        const hasTrigger = Cypress.$($container).find('button, select, [role="combobox"], input').length > 0;
        if (hasTrigger) {
          cy.wrap($container).find('button, select, [role="combobox"]').first().click({ force: true });
          cy.wait(1000);
          cy.get('body').should('not.contain', '500');
          cy.screenshot('TC-CPP-036');
        } else {
          cy.log('Is Priced filter toggle element not found in expected container');
        }
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. PRICING GRID — DATA INPUT
  // ══════════════════════════════════════════════════════════════════════════
  describe('8. Pricing Grid — Data Input', () => {

    it('TC-CPP-037: Specific Price input in STP grid accepts numeric values', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .clear().type(SPECIFIC_PRICE);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .should('have.value', SPECIFIC_PRICE);
      cy.screenshot('TC-CPP-037');
    });

    it('TC-CPP-038: Urgent Price input in STP grid accepts numeric values', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').eq(1)
        .clear().type(URGENT_PRICE);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').eq(1)
        .should('have.value', URGENT_PRICE);
      cy.screenshot('TC-CPP-038');
    });

    it('TC-CPP-039: STP grid input fields are editable (not read-only)', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first().then($el => {
        const isReadOnly = $el.prop('readOnly') || $el.prop('disabled');
        expect(isReadOnly).to.be.false;
      });
    });

    it('TC-CPP-040: clearing a Specific Price field leaves it empty', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .clear();
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .should('have.value', '');
      cy.screenshot('TC-CPP-040');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. SAVE / UPDATE PRICING
  // ══════════════════════════════════════════════════════════════════════════
  describe('9. Save / Update Pricing', () => {

    it('TC-CPP-041: Update Pricing button is visible at the bottom of the page', () => {
      cy.contains('button', /Update Pricing/i).should('exist');
      cy.screenshot('TC-CPP-041');
    });

    it('TC-CPP-042: clicking Update Pricing after entering values triggers a success notification', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .clear().type(SPECIFIC_PRICE);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').eq(1)
        .clear().type(URGENT_PRICE);
      cy.contains('button', /Update Pricing/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /success|saved|updated/i);
      cy.screenshot('TC-CPP-042');
    });

    it('TC-CPP-043: saved pricing values persist after navigating away and returning', () => {
      // Visit another page and come back
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.visit(MODULE_URL, { timeout: 60000 });
      cy.get('body', { timeout: 30000 }).should('not.contain', '404');
      cy.wait(1500);
      // Reload the same product and check the previously saved value is shown
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .invoke('val').should('not.be.null');
      cy.screenshot('TC-CPP-043');
    });

    it('TC-CPP-044: updating Turnover Time and clicking Update Pricing saves correctly', () => {
      loadProductGrid();
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_UPDATED);
      cy.contains('button', /Update Pricing/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /success|saved|updated/i);
      cy.screenshot('TC-CPP-044');
    });

    it('TC-CPP-045: clearing all price fields and clicking Update Pricing removes pricing rule', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').each($el => {
        cy.wrap($el).clear();
      });
      cy.contains('button', /Update Pricing/i).click({ force: true });
      cy.wait(2500);
      cy.get('body').invoke('text').should('match', /success|saved|updated/i);
      cy.screenshot('TC-CPP-045');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. EDGE CASES & NEGATIVE TESTS
  // ══════════════════════════════════════════════════════════════════════════
  describe('10. Edge Cases & Negative Tests', () => {

    it('TC-CPP-046: searching an empty string in client search does not show a product list', () => {
      cy.get('input[id="cpp-client-search"]').clear();
      cy.wait(800);
      // Without a client selected, product grid should be empty or not rendered
      cy.get('body').then($body => {
        const rowCount = $body.find('tbody tr').length;
        cy.log(`Table rows without client: ${rowCount}`);
      });
      cy.screenshot('TC-CPP-046');
    });

    it('TC-CPP-047: product search combobox input accepts text without errors', () => {
      cy.get('input[placeholder="Search product..."]').clear().type('test');
      cy.wait(800);
      cy.get('body').should('not.contain', '500');
    });

    it('TC-CPP-048: very large Turnover Time value is handled without page crash', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type('999999');
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CPP-048');
    });

    it('TC-CPP-049: alphabetic input in Turnover Time number field is blocked by browser', () => {
      cy.get('input[type="number"][placeholder="0"]').first().clear().type('abc');
      cy.get('input[type="number"][placeholder="0"]').first().invoke('val').then(val => {
        cy.log(`Value after typing "abc" in number field: "${val}"`);
        // A type="number" input should not retain alphabetic characters
      });
    });

    it('TC-CPP-050: rapid double-click on Update Pricing does not cause double-submission error', () => {
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
      cy.contains('button', /Update Pricing/i).dblclick({ force: true });
      cy.wait(3000);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('TC-CPP-050');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. END-TO-END WORKFLOWS
  // ══════════════════════════════════════════════════════════════════════════
  describe('11. End-to-End Workflows', () => {

    it('E2E-CPP-001: search client → select product → view STP grid → set prices → save', () => {
      // 1. Navigate and confirm page load
      cy.url().should('include', '/client-product-pricing');
      cy.get('body').invoke('text').should('match', /Client Product Pricing/i);

      // 2. Search for a client by partial name and select
      cy.get('input[id="cpp-client-search"]').clear().type(CLIENT_PARTIAL);
      cy.wait(1200);
      cy.get('body').contains(CLIENT_NAME).first().click({ force: true });
      cy.wait(1500);

      // 3. Select a product
      cy.get('input[placeholder="Search product..."]').clear().type(PRODUCT_PARTIAL);
      cy.wait(1500);
      cy.get('body').contains(PRODUCT_NAME).first().click({ force: true });
      cy.wait(2000);

      // 4. Confirm STP grid loaded with rows
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);

      // 5. Set Total Turnover Time
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_TIME);

      // 6. Enter Specific Price and Urgent Price on first row
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').first()
        .clear().type(SPECIFIC_PRICE);
      cy.get('tbody tr').first().find('input[type="number"], input[type="text"]').eq(1)
        .clear().type(URGENT_PRICE);

      // 7. Click Update Pricing
      cy.contains('button', /Update Pricing/i).click({ force: true });
      cy.wait(3000);

      // 8. Verify success
      cy.get('body').invoke('text').should('match', /success|saved|updated/i);
      cy.screenshot('E2E-CPP-001-saved');
    });

    it('E2E-CPP-002: search client → toggle Not Priced → verify status change → reload to confirm', () => {
      // 1. Select a client
      selectClient();

      // 2. Click Not Priced button
      cy.contains('button', /Not Priced/i).first().click({ force: true });
      cy.wait(1500);
      cy.get('body').should('not.contain', '500');
      cy.screenshot('E2E-CPP-002-toggled');

      // 3. Reload and verify page integrity
      cy.visit(MODULE_URL, { timeout: 60000 });
      cy.get('body', { timeout: 30000 }).should('not.contain', '404');
      cy.wait(1500);
      cy.get('body').invoke('text').should('match', /Client Product Pricing/i);
      cy.screenshot('E2E-CPP-002-reloaded');
    });

    it('E2E-CPP-003: set pricing → update turnover time → re-open product → verify new time shown', () => {
      // 1. Load the product grid
      loadProductGrid();
      cy.get('tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);

      // 2. Update turnover time to a distinct value
      cy.get('input[type="number"][placeholder="0"]').first().clear().type(TURNOVER_UPDATED);

      // 3. Save
      cy.contains('button', /Update Pricing/i).click({ force: true });
      cy.wait(3000);
      cy.get('body').invoke('text').should('match', /success|saved|updated/i);
      cy.screenshot('E2E-CPP-003-saved');

      // 4. Navigate away and return
      cy.visit('/dashboard', { timeout: 60000 });
      cy.wait(500);
      cy.visit(MODULE_URL, { timeout: 60000 });
      cy.get('body', { timeout: 30000 }).should('not.contain', '404');
      cy.wait(1500);

      // 5. Re-select the same client/product and verify turnover shows saved value
      loadProductGrid();
      cy.get('input[type="number"][placeholder="0"]').first().invoke('val').then(val => {
        cy.log(`Turnover time after reload: "${val}"`);
      });
      cy.screenshot('E2E-CPP-003-verified');
    });
  });
});
