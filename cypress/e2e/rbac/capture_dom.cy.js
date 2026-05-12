/// <reference types="cypress" />
// Capture DOM structure of key module pages for building CRUD tests
describe('Capture Module DOM', () => {
  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
  });

  const pagesToCapture = [
    '/dashboard/price-list',
    '/dashboard/allot-sample',
    '/dashboard/block-sample',
    '/dashboard/equipment/transfer',
    '/dashboard/equipment/pm',
    '/dashboard/products/generic-master',
    '/dashboard/roles',
    '/dashboard/invoices',
  ];

  pagesToCapture.forEach(url => {
    it(`Captures DOM from ${url}`, () => {
      cy.visit(url, { timeout: 60000 });
      cy.wait(3000);
      
      cy.get('body').then($body => {
        const slug = url.replace(/\//g, '_').replace(/^_dashboard_/, '');
        
        // Capture buttons
        const buttons = [];
        $body.find('button').each((_, el) => {
          const text = el.textContent.trim().substring(0, 60);
          if (text) buttons.push(text);
        });

        // Capture input fields
        const inputs = [];
        $body.find('input, select, textarea').each((_, el) => {
          inputs.push({
            tag: el.tagName,
            type: el.getAttribute('type') || '',
            name: el.getAttribute('name') || '',
            placeholder: el.getAttribute('placeholder') || '',
          });
        });

        // Capture table headers
        const tableHeaders = [];
        $body.find('th').each((_, el) => {
          const text = el.textContent.trim();
          if (text) tableHeaders.push(text);
        });

        // Check for table row action buttons (edit/delete icons in rows)
        const hasEditInRow = $body.find('tbody button:has(svg), tbody a:has(svg)').length > 0;
        const hasCheckboxes = $body.find('tbody input[type="checkbox"]').length > 0;
        
        // Check for slide-over or modal
        const addBtn = $body.find('button:contains("Add"), button:contains("Create"), button:contains("New")');

        const result = {
          url,
          buttons: buttons.slice(0, 30),
          inputs,
          tableHeaders,
          hasEditInRow,
          hasCheckboxes,
          hasAddButton: addBtn.length > 0,
          addButtonText: addBtn.length > 0 ? addBtn.first().text().trim() : '',
        };
        
        cy.writeFile(`cypress/reports/dom_${slug}.json`, JSON.stringify(result, null, 2));
      });

      // Now click add button if exists to capture form
      cy.get('body').then($body => {
        const addBtn = $body.find('button:contains("Add"), button:contains("Create"), button:contains("New")');
        if (addBtn.length > 0) {
          cy.wrap(addBtn.first()).click({ force: true });
          cy.wait(2000);
          
          const slug = url.replace(/\//g, '_').replace(/^_dashboard_/, '');
          cy.get('body').then($body2 => {
            const formInputs = [];
            $body2.find('form input, form select, form textarea, [role="dialog"] input, [role="dialog"] select, [class*="slide"] input, [class*="slide"] select').each((_, el) => {
              formInputs.push({
                tag: el.tagName,
                type: el.getAttribute('type') || '',
                name: el.getAttribute('name') || '',
                placeholder: el.getAttribute('placeholder') || '',
                label: '',
              });
            });
            
            const formButtons = [];
            $body2.find('form button, [role="dialog"] button, [class*="slide"] button').each((_, el) => {
              formButtons.push(el.textContent.trim().substring(0, 40));
            });

            cy.writeFile(`cypress/reports/form_${slug}.json`, JSON.stringify({ formInputs, formButtons }, null, 2));
          });
          
          cy.screenshot(`form-${slug}`);
        }
      });
    });
  });
});
