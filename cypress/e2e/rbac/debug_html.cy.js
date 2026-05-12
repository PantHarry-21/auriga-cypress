/// <reference types="cypress" />
import { adminRolePage } from '../../support/pages/adminPages/AdminRolePage';

describe('Debug HTML', () => {
  it('Save Edit Role HTML', () => {
    cy.freshLoginAs('admin', 'Arbro - Delhi');
    adminRolePage.navigateToEdit('Reception');
    
    // Wait for page to load
    cy.contains('Module Access', { timeout: 30000 }).should('be.visible');
    
    // Enable "Price List"
    adminRolePage.toggleSubModule('Sample Management', 'Price List', true);
    
    // Take screenshot
    cy.screenshot('edit-role-before-step3');
    
    // Save HTML
    cy.get('body').then($body => {
      cy.writeFile('cypress/reports/edit_role.html', $body.html());
    });
  });
});
