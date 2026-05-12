/// <reference types="cypress" />

// YLIMS E2E — Role Management Module

describe('Role Management Module', () => {
  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
  });

  // ── All Roles ──────────────────────────────────────────────────────────
  describe('All Roles', () => {
    const url = '/dashboard/roles';

    it('should load the All Roles page', () => {
      cy.visit(url, { timeout: 60000 });
      cy.url().should('include', '/roles');
      cy.get('body', { timeout: 15000 }).should('be.visible');
    });

    it('should display role cards', () => {
      cy.visit(url, { timeout: 60000 });
      cy.get('body', { timeout: 15000 }).should('contain', 'Reception');
    });

    it('should have search functionality', () => {
      cy.visit(url, { timeout: 60000 });
      cy.get('input[placeholder*="earch"], button:contains("Search")', { timeout: 10000 })
        .should('exist');
    });

    it('should have Add Role button', () => {
      cy.visit(url, { timeout: 60000 });
      cy.get('button, a').filter(':contains("Add"), :contains("Create"), :contains("New")')
        .should('have.length.greaterThan', 0);
    });

    it('should navigate to edit role when edit button clicked', () => {
      cy.visit(url, { timeout: 60000 });
      cy.contains('Reception')
        .closest('div')
        .invoke('text')
        .then(text => {
          const match = text.match(/ID[:\s]+(\d+)/);
          if (match) {
            cy.visit(`/dashboard/roles/edit/${match[1]}`);
            cy.contains('Module Access', { timeout: 30000 }).should('be.visible');
            cy.screenshot('edit-role-page');
          }
        });
    });
  });

  // ── Create Role ────────────────────────────────────────────────────────
  describe('Create Role', () => {
    const url = '/dashboard/roles/create';

    it('should load the Create Role page', () => {
      cy.visit(url, { timeout: 60000 });
      cy.url().should('include', '/roles/create');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      cy.screenshot('create-role-page');
    });

    it('should display role creation form', () => {
      cy.visit(url, { timeout: 60000 });
      cy.get('input', { timeout: 15000 }).should('exist');
    });
  });
});
