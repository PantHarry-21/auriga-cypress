describe('Capture Selectors', () => {
  const modules = [
    { name: 'Client Profile', url: '/customer-relation-management/client-profile' },
    { name: 'Sample Reception', url: '/sample-management/reception/receive-sample' },
    { name: 'Book Sample', url: '/sample-management/book-sample' },
    { name: 'Analyte Master', url: '/masters-library/analyte-master' },
    { name: 'Product Master', url: '/sample-management/product-master' }
  ];

  beforeEach(() => {
    cy.visit('https://dev.ylims.com/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('Password@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  modules.forEach((mod) => {
    it(`Captures selectors for ${mod.name}`, () => {
      cy.visit(`https://dev.ylims.com${mod.url}`);
      
      // Wait for loading to finish
      cy.contains('fetching your data', { timeout: 30000 }).should('not.exist');
      cy.get('table', { timeout: 30000 }).should('be.visible');

      cy.log(`--- SELECTORS FOR ${mod.name} ---`);
      
      // Capture Add Button
      cy.get('button').contains(/Add|Create|New/i).then($btn => {
        cy.log(`Add Button Selector: ${$btn.attr('class')}`);
      });

      // Capture Row Checkbox
      cy.get('input[type="checkbox"]').first().then($chk => {
        cy.log(`Checkbox Selector: ${$chk.attr('class')}`);
      });

      // Capture Actions Button
      cy.get('button').contains('Actions').then($btn => {
        cy.log(`Actions Button Selector: ${$btn.attr('class')}`);
      });

      // Open Add Popup
      cy.get('button').contains(/Add|Create|New/i).first().click();
      cy.get('div.animate-slide-in-right, [role="dialog"]').should('be.visible').then($popup => {
        cy.log(`Popup Container: ${$popup.attr('class')}`);
        cy.wrap($popup).find('button').contains(/Save|Submit|Create/i).then($save => {
          cy.log(`Save Button Selector: ${$save.attr('class')}`);
        });
      });

      // Close Popup
      cy.get('body').type('{esc}');
      cy.wait(1000);

      // Open Edit Popup
      cy.get('tbody tr').first().click();
      cy.get('div.animate-slide-in-right, [role="dialog"]').should('be.visible').then($popup => {
        cy.wrap($popup).find('button').contains(/Update|Save/i).then($update => {
          cy.log(`Update Button Selector: ${$update.attr('class')}`);
        });
        cy.wrap($popup).then($p => {
          const $approve = $p.find('button:contains("Approve")');
          if ($approve.length > 0) {
            cy.log(`Approve Button Selector: ${$approve.attr('class')}`);
          } else {
            cy.log('Approve Button: Not Found');
          }
        });
      });
    });
  });
});
