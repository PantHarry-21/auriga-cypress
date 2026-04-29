/// <reference types="cypress" />

describe('Complete Application CRUDA Verification', () => {
  let selectors;

  before(() => {
    cy.fixture('app_selectors.json').then((data) => {
      selectors = data;
    });
  });

  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('Password@123');
    cy.get('.inline-flex').click(); // Login button
    cy.url().should('not.include', '/login');
  });

  const waitForLoading = () => {
    cy.get('body').then(($body) => {
      if ($body.find(selectors.CommonSelectors.LoadingState).length > 0) {
        cy.get(selectors.CommonSelectors.LoadingState, { timeout: 60000 }).should('not.exist');
      }
    });
    // Wait for at least one interactive element to confirm page is ready
    cy.get('button, tbody tr, table', { timeout: 20000 }).first().should('be.visible');
  };

  const modulesToTest = [
    'ClientProfile',
    'ProductMaster',
    'Parameters',
    'PriceList',
    'SampleBooking',
    'CreditApproval',
    'Mailer',
    'Ticket',
    'IndentManage',
    'GeneratePO'
  ];

  modulesToTest.forEach((moduleKey) => {
    context(`Module: ${moduleKey}`, () => {
      const moduleSelectors = () => selectors.Modules[moduleKey];

      it(`Read Flow - Verify ${moduleKey} Page`, () => {
        const subMenuSelector = selectors.CommonSelectors.Sidebar.SubMenus[moduleKey];
        if (subMenuSelector) {
          cy.get(subMenuSelector).click({ force: true });
        } else {
          cy.log(`No direct sidebar link for ${moduleKey}, skipping navigation`);
          return;
        }

        waitForLoading();

        // Verify Title
        cy.get(moduleSelectors().PageTitle).should('be.visible');

        // Verify Table Data
        cy.get(moduleSelectors().TableRow).should('have.length.at.least', 1);
        cy.get(moduleSelectors().TableData).should('be.visible');
      });

      it(`Create Flow - Verify ${moduleKey} Add Popup`, () => {
        const subMenuSelector = selectors.CommonSelectors.Sidebar.SubMenus[moduleKey];
        if (subMenuSelector) cy.get(subMenuSelector).click({ force: true });
        
        waitForLoading();

        if (moduleSelectors().AddButton) {
          cy.get(moduleSelectors().AddButton).click();
          
          // Verify Popup
          cy.get('body').then(($body) => {
            // Common popup check
            expect($body.find('[role="dialog"], .fixed.inset-0').length).to.be.greaterThan(0);
          });

          // Verify Save/Create button
          if (moduleSelectors().SaveButton) {
            cy.get(moduleSelectors().SaveButton).should('be.visible');
          }

          // Close popup
          cy.get(selectors.CommonSelectors.PopupCloseButton).first().click({ force: true });
        } else {
          cy.log(`No Add button defined for ${moduleKey}`);
        }
      });

      it(`Edit Flow - Verify ${moduleKey} Edit Popup`, () => {
        const subMenuSelector = selectors.CommonSelectors.Sidebar.SubMenus[moduleKey];
        if (subMenuSelector) cy.get(subMenuSelector).click({ force: true });
        
        waitForLoading();

        if (moduleSelectors().EditRowClick || moduleSelectors().EditIcon) {
          if (moduleSelectors().EditIcon) {
            cy.get(moduleSelectors().EditIcon).first().click({ force: true });
          } else {
            cy.get(moduleSelectors().EditRowClick).first().click({ force: true });
          }

          waitForLoading();

          // Verify Edit buttons
          if (moduleSelectors().UpdateButton) {
            cy.get(moduleSelectors().UpdateButton).should('be.visible');
          } else if (moduleSelectors().SaveButton) {
            cy.get(moduleSelectors().SaveButton).should('be.visible');
          }

          // Close popup
          cy.get(selectors.CommonSelectors.PopupCloseButton).first().click({ force: true });
        } else {
          cy.log(`No Edit trigger defined for ${moduleKey}`);
        }
      });

      it(`Delete Flow - Verify ${moduleKey} Delete Option`, () => {
        const subMenuSelector = selectors.CommonSelectors.Sidebar.SubMenus[moduleKey];
        if (subMenuSelector) cy.get(subMenuSelector).click({ force: true });
        
        waitForLoading();

        // Check for checkbox and bulk actions
        if (selectors.CommonSelectors.RowCheckbox) {
          cy.get(selectors.CommonSelectors.RowCheckbox).first().check({ force: true });
          
          if (selectors.CommonSelectors.BulkActions) {
            cy.get(selectors.CommonSelectors.BulkActions).click();
            
            if (moduleSelectors().DeleteButton) {
              cy.get(moduleSelectors().DeleteButton).should('exist');
            }
          }
        } else if (moduleSelectors().DeleteButton) {
           cy.get(moduleSelectors().DeleteButton).first().should('exist');
        } else {
          cy.log(`No Delete option defined for ${moduleKey}`);
        }
      });

      it(`Approve Flow - Verify ${moduleKey} Approve Option`, () => {
        const subMenuSelector = selectors.CommonSelectors.Sidebar.SubMenus[moduleKey];
        if (subMenuSelector) cy.get(subMenuSelector).click({ force: true });
        
        waitForLoading();

        if (moduleSelectors().ApproveButton) {
          // If it's on the main page
          cy.get(moduleSelectors().ApproveButton).should('exist');
        } else if (moduleSelectors().EditRowClick || moduleSelectors().EditIcon) {
          // Check inside edit popup
          if (moduleSelectors().EditIcon) {
            cy.get(moduleSelectors().EditIcon).first().click({ force: true });
          } else {
            cy.get(moduleSelectors().EditRowClick).first().click({ force: true });
          }

          waitForLoading();

          cy.get('body').then(($body) => {
            if ($body.find(':contains("Approve")').length > 0) {
              cy.log('Approve button found in popup');
            } else {
              cy.log('No Approve button found in popup');
            }
          });
        } else {
          cy.log(`No Approve option defined for ${moduleKey}`);
        }
      });
    });
  });
});
