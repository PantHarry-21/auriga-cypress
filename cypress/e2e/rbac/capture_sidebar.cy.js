/// <reference types="cypress" />
// Capture sidebar structure and save to a JSON file for test generation
describe('Capture Sidebar Structure', () => {
  it('Captures all sidebar categories and sub-modules', () => {
    cy.loginAs('admin', 'Arbro - Delhi');
    cy.visit('/dashboard', { timeout: 120000 });
    cy.wait(3000);

    // Expand the sidebar by clicking the toggle button
    cy.get('button').then($buttons => {
      // Look for the sidebar expand toggle (chevron icon)
      const expandBtn = $buttons.filter((_, el) => {
        const svg = el.querySelector('svg path');
        return svg && svg.getAttribute('d') && svg.getAttribute('d').includes('m8.25 4.5 7.5 7.5');
      });
      if (expandBtn.length > 0) {
        cy.wrap(expandBtn.first()).click({ force: true });
        cy.wait(1000);
      }
    });

    // Now capture the sidebar HTML
    cy.get('nav').first().then($nav => {
      cy.writeFile('cypress/reports/sidebar_nav.html', $nav.html());
    });

    // Also capture the full body sidebar structure
    cy.get('body').then($body => {
      // Find all sidebar category buttons and their links
      const categories = [];
      // Look for buttons with data-state attribute in the sidebar area
      const navButtons = $body.find('nav button, [class*="sidebar"] button');
      navButtons.each((_, btn) => {
        const text = btn.textContent.trim();
        if (text && text.length > 1 && text.length < 50) {
          categories.push(text);
        }
      });
      
      // Find all navigation links
      const links = [];
      const navLinks = $body.find('nav a, [class*="sidebar"] a');
      navLinks.each((_, link) => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href') || '';
        if (text && href) {
          links.push({ text, href });
        }
      });

      const result = { categories, links };
      cy.writeFile('cypress/reports/sidebar_structure.json', JSON.stringify(result, null, 2));
    });

    // Now click each category to expand and capture sub-links
    cy.get('nav button[data-state]').each(($btn, index) => {
      cy.wrap($btn).click({ force: true });
      cy.wait(500);
    });

    cy.wait(1000);

    // Capture expanded state
    cy.get('body').then($body => {
      const links = [];
      $body.find('a[href*="/dashboard"]').each((_, link) => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href') || '';
        if (text && href && href.includes('/dashboard')) {
          links.push({ text, href });
        }
      });
      cy.writeFile('cypress/reports/sidebar_links_expanded.json', JSON.stringify(links, null, 2));
    });

    // Take screenshot
    cy.screenshot('sidebar-expanded-all');
  });

  it('Visits each major module page and captures page structure', () => {
    cy.loginAs('admin', 'Arbro - Delhi');
    
    const moduleUrls = [
      { name: 'Price List', url: '/dashboard/price-list' },
      { name: 'Sample Booking', url: '/dashboard/sample-booking' },
      { name: 'Barcode Generation', url: '/dashboard/barcode' },
      { name: 'Reception Received Sample', url: '/dashboard/reception-received-sample' },
      { name: 'Allot Sample', url: '/dashboard/allot-sample' },
      { name: 'TRF Links', url: '/dashboard/trf-links' },
      { name: 'Block Sample', url: '/dashboard/block-sample' },
      { name: 'Archive Samples', url: '/dashboard/archive-samples' },
      { name: 'Sample Discarded', url: '/dashboard/sample-discarded' },
      { name: 'Cancel Sample', url: '/dashboard/cancel-sample' },
      { name: 'Upload Weight Slip', url: '/dashboard/upload-weight-slip' },
      { name: 'Booking Queue', url: '/dashboard/booking-queue' },
      { name: 'Client Profile', url: '/dashboard/client-profile' },
      { name: 'Credit Approval', url: '/dashboard/credit-approval' },
      { name: 'Client Activation', url: '/dashboard/client-activation' },
      { name: 'Indent Manage', url: '/dashboard/indent' },
      { name: 'Generate PO', url: '/dashboard/generate-po' },
      { name: 'Generic Master', url: '/dashboard/products/generic-master-v2' },
      { name: 'Equipment PM', url: '/dashboard/equipment/pm' },
      { name: 'Equipment Transfer', url: '/dashboard/equipment/transfer' },
      { name: 'Roles', url: '/dashboard/roles' },
      { name: 'Employees', url: '/dashboard/employees' },
      { name: 'Mailer', url: '/dashboard/mailer' },
      { name: 'Ticket', url: '/dashboard/ticket' },
    ];

    const results = [];
    
    moduleUrls.forEach(mod => {
      cy.visit(mod.url, { failOnStatusCode: false, timeout: 60000 });
      cy.wait(2000);
      cy.url().then(currentUrl => {
        cy.get('body').then($body => {
          const hasTable = $body.find('table').length > 0;
          const hasAddButton = $body.find('button:contains("Add"), button:contains("Create"), button:contains("New")').length > 0;
          const hasSearchButton = $body.find('button:contains("Search"), input[placeholder*="search"], input[placeholder*="Search"]').length > 0;
          const hasFilterButton = $body.find('button:contains("Filter")').length > 0;
          const redirected = !currentUrl.includes(mod.url);
          
          results.push({
            name: mod.name,
            url: mod.url,
            actualUrl: currentUrl,
            redirected,
            hasTable,
            hasAddButton,
            hasSearchButton,
            hasFilterButton,
          });
        });
      });
    });

    cy.then(() => {
      cy.writeFile('cypress/reports/module_capabilities.json', JSON.stringify(results, null, 2));
    });
  });
});
