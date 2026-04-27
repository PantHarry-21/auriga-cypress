# RBAC Cypress starter

## Files
- `cypress/fixtures/roles-permissions.fixture.json`
- `cypress/support/pageMap.js`
- `cypress/support/commands.js`
- `cypress/e2e/rbac/roles-access.cy.js`
- `cypress/e2e/rbac/permission-actions.cy.js`
- `cypress.env.json`

## Before you run
1. Copy the files into your Cypress project.
2. Import `./commands` from `cypress/support/e2e.js` if your project uses Cypress v10+:
   ```js
   import "./commands";