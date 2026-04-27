describe("Login", () => {
  beforeEach(() => {
    cy.login(Cypress.env("LABTECH_USER"), Cypress.env("LABTECH_PASS"));
  });

    it("should add a price list", () => {
        cy.get(':nth-child(19) > :nth-child(1) > .w-full.px-3').click()
        cy.get(':nth-child(19) > :nth-child(1) > .grid > .overflow-hidden > .ml-6 > .relative > .px-3 > .truncate > .flex > span').click()
        cy.wait(1000)
        cy.contains('New Price List').click()
        cy.wait(1000)
        cy.get(':nth-child(1) > :nth-child(2) > :nth-child(1) > .w-full').type('Test Price List')

        cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full')
  .find('option:not([value=""])')
  .then(options => {

    const random = Math.floor(Math.random() * options.length)

    cy.wrap(options[random]).then(option => {
      cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full')
        .select(option.val())
    })

  })

    // Valid From Date
    cy.get('input[placeholder="dd-mm-yyyy"]').eq(0).type('01-09-2026')

    // Valid To Date
    cy.get('input[placeholder="dd-mm-yyyy"]').eq(1).type('30-09-2026')

    // Applicable Labs checkboxes
    cy.contains('Applicable Labs')
  .parent()
  .find('label')
  .then(($labs) => {

    const shuffled = Cypress._.shuffle($labs.toArray())

    cy.wrap(shuffled[0]).click()
    cy.wrap(shuffled[1]).click()

  })

  cy.get('select').eq(1).find('option:not([value=""])').then(($options) => {

  const randomIndex = Math.floor(Math.random() * $options.length)
  const value = $options[randomIndex].value

  cy.get('select').eq(1).select(value)

})

cy.get('select').eq(2).find('option:not([value=""])').then(($options) => {

  const randomIndex = Math.floor(Math.random() * $options.length)
  const value = $options[randomIndex].value

  cy.get('select').eq(2).select(value)

})

// Description of Test
    cy.get('input[placeholder="Enter description"]').type('Automation test description')

    // Price in Rs.
    cy.get('input[placeholder="0.00"]').eq(0).clear().type('1500')

    // Price in USD
    cy.get('input[placeholder="0.00"]').eq(1).clear().type('25')

    // Discount (%)
    cy.get('input').filter(':visible').then(($inputs) => {
      cy.wrap($inputs[$inputs.length - 1]).clear().type('10')
    })

    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Price list created successfully').should('be.visible')
});

});