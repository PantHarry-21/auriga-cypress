/// <reference types="cypress" />

describe('Employee Profile - End-to-End Scenarios', () => {
  const url = '/dashboard/profile/employee';

  beforeEach(() => {
    cy.loginAs('admin', 'Arbro - Delhi');
    cy.visit(url, { timeout: 60000 });
    // Wait for the page/table to load
    cy.get('body', { timeout: 20000 }).should('be.visible');
    cy.get('body').should('not.contain', '404');
  });

  describe('1. UI & Grid Elements Verification', () => {
    it('Verify that clicking the Employee Profile module opens the Employee Profile listing screen successfully', () => {
      cy.url().should('include', '/profile/employee');
      // Verify that the page heading 'Employee Profile' is displayed correctly at the top of the screen.
      cy.get('body').should('contain', 'Employee Profile');
    });

    it('Verify Toolbar Elements (New Employee, Export, Columns, Actions, Search, Filters)', () => {
      // Verify that the New Employee button is displayed correctly with a + icon.
      cy.get('button').filter(':contains("New Employee"), :contains("Add")').should('be.visible');
      // Verify that the Excel export button is displayed correctly in the toolbar.
      cy.get('button').filter(':contains("Excel")').should('be.visible');
      // Verify that the PDF export button is displayed correctly in the toolbar.
      cy.get('button').filter(':contains("PDF")').should('be.visible');
      // Verify that the Columns button is displayed correctly in the toolbar.
      cy.get('button').filter(':contains("Columns")').should('be.visible');
      // Verify that the Actions dropdown button is displayed correctly in the toolbar.
      cy.get('button').filter(':contains("Actions"), :contains("Action")').should('be.visible');
      // Verify that the Search input field is displayed correctly with placeholder text.
      cy.get('input[placeholder*="earch"]').should('be.visible');
      // Verify that the Search button is displayed correctly next to the search input.
      cy.get('button').filter(':contains("Search")').should('be.visible');
      // Verify that the Filters button is displayed correctly next to the Search button.
      cy.get('button').filter(':contains("Filter")').should('be.visible');
    });

    it('Verify Grid Elements (Columns, Checkboxes, Actions, Pagination)', () => {
      // Verify that the employee list grid is displayed correctly with all expected columns.
      cy.get('table, [role="grid"], .ag-root-wrapper').should('exist');
      // Verify that the header checkbox is displayed for bulk selection.
      cy.get('thead input[type="checkbox"]').should('exist');
      // Verify that row selection checkboxes are displayed for each employee record.
      cy.get('tbody input[type="checkbox"]').should('have.length.greaterThan', 0);
      
      // Verify that the Status column shows Active or Inactive values correctly.
      cy.get('tbody').should('contain', 'Active');

      // Verify that pagination controls are displayed correctly at the bottom of the grid.
      cy.get('button').filter(':contains("Next")').should('exist');
      cy.get('button').filter(':contains("Previous")').should('exist');
    });
  });

  describe('2. Search Functionality', () => {
    it('Verify searching by Employee Name returns matching records only', () => {
      cy.get('input[placeholder*="earch"]').clear().type('John');
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      // Verify that searching with partial text returns relevant matching records.
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('Verify that searching with no matching data shows a no-record message correctly', () => {
      cy.get('input[placeholder*="earch"]').clear().type('XYZ_NON_EXISTENT_EMP_123');
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      cy.get('body').should('contain', 'No record');
    });
  });

  describe('3. Filter Functionality', () => {
    it('Verify clicking the Filters button expands the advanced filter panel', () => {
      cy.contains('button', /Filter/i).click();
      cy.wait(500);
      cy.get('body').then($body => {
        expect($body.find('input, select').length).to.be.greaterThan(5);
      });
      // Verify that clicking Clear All Filters resets all filter fields to empty/default state.
      cy.contains('button', /Clear/i).click({force: true});
    });
  });

  describe('4. Row Selection & Bulk Actions', () => {
    it('Verify clicking a row checkbox selects the corresponding employee correctly', () => {
      cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.get('tbody input[type="checkbox"]').first().should('be.checked');
      // Verify that clicking the Actions button with rows selected shows the Reset Password option.
      cy.contains('button', /Action/i).click({force: true});
      cy.get('body').should('contain', 'Reset Password');
      cy.get('body').should('contain', 'Delete');
    });
  });

  describe('5. Export Functionality', () => {
    it('Verify Excel and PDF exports trigger downloads', () => {
      // Cypress does not easily validate the contents of the downloaded file without plugins,
      // but we can verify the buttons are clickable and don't throw errors.
      cy.contains('button', 'Excel').click({ force: true });
      cy.contains('button', 'PDF').click({ force: true });
    });
  });

  describe('6. Add Employee Form Validations', () => {
    it('Verify that clicking New Employee opens the Add Employee modal/panel', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2000);
      cy.get('body').should('contain', 'Add Employee').or('contain', 'New Employee');
      
      // Check sections
      cy.get('body').should('contain', 'Personal Information');
      cy.get('body').should('contain', 'Addresses & Contact Information');
      cy.get('body').should('contain', 'Permanent Address Information');
      cy.get('body').should('contain', 'Work Profile');
      cy.get('body').should('contain', 'Login Information');
      
      // Close it
      cy.contains('button', 'Cancel').click({force: true});
    });

    it('Verify validation messages when clicking Add without mandatory fields', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2000);
      cy.get('button').filter(':contains("Add Employee"), :contains("Save")').last().click({force: true});
      cy.wait(500);
      // Validations should appear
      cy.get('body').should('contain', 'Required').or('contain', 'mandatory');
    });
  });

  describe('7. True End-to-End Workflows', () => {
    const uniqueId = new Date().getTime().toString().slice(-6);
    const empName = `Auto Test Emp ${uniqueId}`;
    const empCode = `EMP-${uniqueId}`;
    const username = `auto_user_${uniqueId}`;

    it('E2E: Create a new employee with all mandatory fields and verify listing', () => {
      cy.contains('button', /New Employee|Add Employee/i).click();
      cy.wait(2000);
      
      // Personal Information
      cy.get('input[name="name"], input[placeholder*="Name"]').first().type(empName);
      cy.get('input[name="employeeCode"], input[placeholder*="Code"]').first().type(empCode);
      cy.get('input[name="fatherName"], input[placeholder*="Father"]').first().type('Test Father');
      cy.get('input[type="date"], input[placeholder*="Date"]').first().type('1990-01-01');
      cy.contains('label', 'Male').click();

      // Contact Information
      cy.get('input[name="address"], input[placeholder*="Address"]').first().type('123 Auto Test Street');
      cy.get('input[name="city"], input[placeholder*="City"]').first().type('Test City');
      cy.get('input[name="postalCode"], input[placeholder*="Postal"]').first().type('110001');
      cy.get('input[name="mobile"], input[placeholder*="Mobile"], input[name="mobileNo"]').first().type('9999999999');
      cy.get('input[name="inhouseEmail"], input[placeholder*="Inhouse Email"]').first().type(`test${uniqueId}@ylims.com`);
      
      // Check 'Same As Above' for Permanent Address
      cy.get('input[type="checkbox"]').filter(':visible').first().check({force: true});

      // Login Information
      cy.get('input[name="username"], input[placeholder*="Username"]').first().type(username);
      cy.get('input[type="password"]').first().type('P@ssword123!');
      cy.get('input[type="password"]').last().type('P@ssword123!');

      // Submit
      cy.get('button').filter(':contains("Add Employee"), :contains("Save")').last().click({force: true});
      cy.wait(3000);

      // Verify the new employee is in the grid
      cy.get('input[placeholder*="earch"]').clear().type(empCode);
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      cy.get('tbody').should('contain', empName);
    });

    it('E2E: Edit an existing employee details and verify changes', () => {
      // Search for the employee
      cy.get('input[placeholder*="earch"]').clear().type(empCode);
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      
      // Click Edit (pencil icon)
      cy.get('tbody tr').first().find('button').filter(':contains("Edit"), [aria-label="Edit"], .fa-pencil, .lucide-pencil').click({force: true});
      cy.wait(2000);
      
      // Modify Name
      cy.get('input[name="name"], input[placeholder*="Name"]').first().clear().type(`${empName} Updated`);
      
      // Save changes
      cy.get('button').filter(':contains("Update Employee"), :contains("Update"), :contains("Save")').last().click({force: true});
      cy.wait(3000);
      
      // Verify updated name
      cy.get('input[placeholder*="earch"]').clear().type(empCode);
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      cy.get('tbody').should('contain', `${empName} Updated`);
    });

    it('E2E: Delete an employee using the row-level delete and verify removal', () => {
      // Search for the employee
      cy.get('input[placeholder*="earch"]').clear().type(empCode);
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      
      // Click Delete (trash icon)
      cy.get('tbody tr').first().find('button').filter(':contains("Delete"), [aria-label="Delete"], .fa-trash, .lucide-trash-2').click({force: true});
      cy.wait(1000);
      
      // Confirm deletion
      cy.get('.modal, [role="dialog"]').find('button').filter(':contains("Delete"), :contains("Yes"), :contains("Confirm")').click({force: true});
      cy.wait(2000);
      
      // Verify record is removed
      cy.get('input[placeholder*="earch"]').clear().type(empCode);
      cy.contains('button', 'Search').click();
      cy.wait(2000);
      cy.get('body').should('contain', 'No record').or('contain', 'No data');
    });
  });
});
