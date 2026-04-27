describe('List All Routes', () => {
  it('Logins as admin and extracts all sidebar routes', () => {
    cy.visit('https://dev.ylims.com/');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('Password@123');
    cy.get('.inline-flex').click();
    cy.url().should('include', '/dashboard');
    cy.wait(5000);

    // Expand all menus to see sub-links
    // Some buttons might be hidden or nested
    cy.get('nav button').each(($btn) => {
      cy.wrap($btn).click({ force: true });
      cy.wait(500);
    });

    // Extract all unique routes from the sidebar
    const routes = [];
    cy.get('nav a').each(($a) => {
      const text = $a.text().trim();
      const href = $a.attr('href');
      if (href && href.startsWith('/') && !routes.find(r => r.href === href)) {
         routes.push({ text, href });
         cy.log(`ROUTE_FOUND: ${text} | ${href}`);
      }
    }).then(() => {
       cy.writeFile('cypress/fixtures/discovered_routes.json', routes);
       console.log('DISCOVERED_ROUTES:', JSON.stringify(routes, null, 2));
    });
  });
});
