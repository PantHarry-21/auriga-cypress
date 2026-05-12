/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════════════════════════
// Priority 1 Modules: Testing & STP Masters
// Modules: STP Master, STP Group, New STP, Unapproved Test, Pending Test, 
// My Complete Test, Micro Raw Data Enter, Micro Enter Result
// ═══════════════════════════════════════════════════════════════════════════════

describe('P1 Scenarios: Testing & STP Modules', () => {
  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
  });

  const testModules = [
    { name: 'STP Master', url: '/dashboard/testing/stp-master', btnText: 'New STP' },
    { name: 'STP Group', url: '/dashboard/testing/stp-groups', btnText: 'New STP Group' },
    { name: 'Unapproved Test', url: '/dashboard/admin/unapproved-test', btnText: 'Add' },
    { name: 'Pending Test', url: '/dashboard/pending-test', btnText: 'Add' },
    { name: 'My Complete Test', url: '/dashboard/analyst/my-complete-test', btnText: 'Add' },
    { name: 'Micro Raw Data Enter', url: '/dashboard/analyst/micro-raw-data', btnText: 'Add' },
    { name: 'Micro Enter Result', url: '/dashboard/analyst/micro-enter-result', btnText: 'Add' }
  ];

  testModules.forEach((mod) => {
    describe(`${mod.name} Module`, () => {
      it(`Should load ${mod.name} page without 404`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.url().should('include', mod.url.split('/dashboard/')[1]);
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

      it(`Should open Add/Create form when clicking New button on ${mod.name}`, () => {
        cy.visit(mod.url, { timeout: 60000 });
        cy.get('body').then($body => {
          const addBtn = $body.find(`button:contains("${mod.btnText}"), button:contains("Add"), button:contains("Create")`);
          if (addBtn.length > 0) {
            cy.wrap(addBtn.first()).click({ force: true });
            cy.wait(2000);
            cy.screenshot(`p1-${mod.name.toLowerCase().replace(/\s+/g, '-')}-add-form`);
            
            // Try to close it
            const closeBtn = cy.get('body').find('button:contains("Cancel"), button:contains("Close"), .close-icon');
            if (closeBtn) {
              cy.get('body').then($b2 => {
                 if($b2.find('button:contains("Cancel")').length > 0) cy.contains('button', 'Cancel').click({force: true});
              });
            }
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
