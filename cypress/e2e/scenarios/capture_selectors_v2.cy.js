describe('Capture Selectors V2', () => {
  const modules = [
    { name: 'TRF Links', url: '/dashboard/samples/trf-links' },
    { name: 'Archive Samples', url: '/dashboard/samples/archive-samples' },
    { name: 'Sample Discarded', url: '/dashboard/samples/sample-discarded' },
    { name: 'Client Profile', url: '/dashboard/profile/client' },
    { name: 'Product Master', url: '/dashboard/products/master-v2' },
    { name: 'Parameters', url: '/dashboard/testing/analyt-master-v2' },
    { name: 'Price List', url: '/dashboard/price-list' },
    { name: 'Credit Approval', url: '/dashboard/profile/credit-approval' },
    { name: 'Mailer', url: '/dashboard/mail/inbox' },
    { name: 'Ticket', url: '/dashboard/support/tickets' }
  ];

  it('Scans all modules and logs buttons', () => {
    cy.visit('/login');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('Password@123');
    cy.get('.inline-flex').click();
    cy.url().should('not.include', '/login');

    modules.forEach((mod) => {
      cy.visit(mod.url, { failOnStatusCode: false });
      cy.wait(3000); // Wait for load
      
      cy.get('body').then(($body) => {
        const title = $body.find('h2, span.text-xl, .font-bold').first().text().trim();
        const buttons = $body.find('button').map((i, el) => Cypress.$(el).text().trim()).get();
        const addBtn = buttons.find(b => /new|create|add|generate|compose/i.test(b));
        
        cy.log(`MODULE: ${mod.name}`);
        cy.log(`REAL TITLE: ${title}`);
        cy.log(`ADD BUTTON: ${addBtn || 'NOT FOUND'}`);
        
        // Log to console for me to see in terminal output
        console.log(`JSON_RESULT: ${JSON.stringify({ 
          name: mod.name, 
          url: mod.url, 
          title: title, 
          addButton: addBtn,
          allButtons: buttons
        })}`);
      });
    });
  });
});
