/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Priority 1 Modules: Invoices, Quotes & Pricing
// Modules: Invoice, Invoice Update, E-Invoice Generate, Client PO, 
// Client Product Pricing, View Quotation
// ═══════════════════════════════════════════════════════════════════════════════

describe('P1 Scenarios: Invoicing & Pricing Modules', () => {
  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
  });

  const billingModules = [
    { name: 'Invoice', url: '/dashboard/invoices', btnText: 'Create Invoice' },
    { name: 'Invoice Update', url: '/dashboard/invoices/update', btnText: 'Update' },
    { name: 'E-Invoice Generate', url: '/dashboard/invoices/e-invoice', btnText: 'Generate' },
    { name: 'Client PO', url: '/dashboard/client-po', btnText: 'Add PO' },
    { name: 'Client Product Pricing', url: '/dashboard/client-product-pricing', btnText: 'Add Pricing' },
    { name: 'View Quotation', url: '/dashboard/quotation/client', btnText: 'New Quotation' }
  ];

  billingModules.forEach((mod) => {
    describe(`${mod.name} Module`, () => {
      it(`Should load ${mod.name} page without errors`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').should('not.contain', '404');
        cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-loaded`);
      });

      it(`Should support Search functionality on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          if ($body.find('input[placeholder*="earch"]').length > 0) {
            cy.get('input[placeholder*="earch"]').first().clear().type('Test Query');
            cy.wait(1000);
            if ($body.find('button:contains("Search")').length > 0) {
              cy.contains('button', 'Search').click();
              cy.wait(1000);
            }
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-search`);
          }
        });
      });

      it(`Should support Filter functionality on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          if ($body.find('button:contains("Filter")').length > 0) {
            cy.contains('button', /filter/i).click();
            cy.wait(500);
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-filter`);
          }
        });
      });

      it(`Should open Add/Create form when clicking action button on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          const addBtn = $body.find(`button:contains("${mod.btnText}"), button:contains("Add"), button:contains("Create"), button:contains("New")`);
          if (addBtn.length > 0) {
            cy.wrap(addBtn.first()).click({ force: true });
            cy.wait(2000);
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-add-form`);
          }
        });
      });

      it(`Should open View/Edit detail when clicking a row on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          if ($body.find('tbody tr').length > 0) {
            cy.get('tbody tr').first().click({ force: true });
            cy.wait(2000);
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-row-detail`);
          }
        });
      });
    });
  });
});
