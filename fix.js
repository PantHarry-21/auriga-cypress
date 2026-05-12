const fs = require('fs');
const file = 'd:/Harry/OneDrive/Desktop/Auriga Cypress/cypress/e2e/employee-profile/employee_profile.cy.js';
let content = fs.readFileSync(file, 'utf8');

const editReplacement = `cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Edit$/i).click({ force: true });`;

const deleteReplacement = `cy.get('tbody input[type="checkbox"]').first().check({ force: true });
      cy.contains('button', /Actions|Action/i).click({ force: true });
      cy.get('body').contains(/^Delete$/i).click({ force: true });`;

content = content.replace(/cy\.get\('tbody tr'\)\.first\(\)\.find\('button'\)\.eq\(0\)\.click\(\{\s*force:\s*true\s*\}\);/g, editReplacement);
content = content.replace(/cy\.get\('tbody tr'\)\.first\(\)\.find\('button'\)\.last\(\)\.click\(\{\s*force:\s*true\s*\}\);/g, deleteReplacement);

fs.writeFileSync(file, content);
console.log('Fixed selectors successfully');
