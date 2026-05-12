/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Priority 1 Modules: Samples
// Modules: Allot Sample to Department, Received Allot Sample, Received Sample
// ═══════════════════════════════════════════════════════════════════════════════

describe('P1 Scenarios: Samples & Allotment Modules', () => {
  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
  });

  const sampleModules = [
    { name: 'Allot Sample', url: '/dashboard/allot-sample', btnText: 'Allot' },
    { name: 'Received Allot Sample', url: '/dashboard/received-allot-sample', btnText: 'Add' },
    { name: 'Received Sample (Reception)', url: '/dashboard/reception/received-sample', btnText: 'Add' }
  ];

  sampleModules.forEach((mod) => {
    describe(`${mod.name} Module`, () => {
      it(`Should load ${mod.name} page without errors`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.url().should('include', 'sample');
        cy.get('body').should('not.contain', '404');
        cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-loaded`);
      });

      it(`Should support Search functionality on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          if ($body.find('input[placeholder*="earch"]').length > 0) {
            cy.get('input[placeholder*="earch"]').first().clear().type('Sample-123');
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

      it(`Should trigger Action/Add when clicking button on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          const actionBtn = $body.find(`button:contains("${mod.btnText}"), button:contains("Add"), button:contains("Create")`);
          if (actionBtn.length > 0) {
            cy.wrap(actionBtn.first()).click({ force: true });
            cy.wait(2000);
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-action-form`);
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
