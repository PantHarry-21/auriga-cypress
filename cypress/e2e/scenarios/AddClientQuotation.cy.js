describe("Login", () => {
  beforeEach(() => {
    cy.login(Cypress.env("LABTECH_USER"), Cypress.env("LABTECH_PASS"));
  });

  it("should add a client quotation", () => {

    cy.get(':nth-child(18) > :nth-child(1) > .w-full.px-3 > .truncate').click()
    cy.get(':nth-child(18) > :nth-child(1) > .grid > .overflow-hidden > .ml-6 > .relative > .px-3 > .truncate > .flex > span').click()
    cy.wait(1000)
    cy.get('.border-b-0 > .flex > .sm\:px-4').click()
    cy.get('[name="quotationSubject"]').type('Test Client Quotation')

    cy.get(':nth-child(1) > :nth-child(2) > .relative > .w-full')
    .find('option:not([value=""])')
  .then(options => {

    const random = Math.floor(Math.random() * options.length)

    cy.wrap(options[random]).then(option => {
      cy.get(':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full')
        .select(option.val())
    })

  })

  cy.get('#headlessui-dialog-panel-«r6» > form > div.flex-1.overflow-y-auto.overflow-x-hidden > div.space-y-6.py-4.sm\:py-6.px-4.sm\:px-6 > div.grid.grid-cols-1.sm\:grid-cols-2.gap-4 > div:nth-child(2) > div > input').eq(0).type('01-02-2026')

  cy.get(':nth-child(1) > [name="productType"]').click()

cy.get('#headlessui-combobox-input-«ra»').find('option:not([value=""])').then(options => {

  const random = Math.floor(Math.random() * options.length)

  cy.wrap(options[random]).then(option => {
    cy.get('#headlessui-combobox-input-«ra»').select(option.val())
  })

  cy.get('div.mb-4 > .gap-2 > .bg-\[\#00a6fb\]').click()

cy.get('#headlessui-combobox-input-«rd»').find('option:not([value=""])').then(options => {

  const random = Math.floor(Math.random() * options.length)
  cy.wrap(options[random]).then(option => {
    cy.get('#headlessui-combobox-input-«rd»').select(option.val())
  })

  cy.get('.w-10 > .flex > .h-4').click()
  cy.get('.justify-end > .inline-flex').click()

  cy.get('.gap-x-4 > .bg-\[\#00a6fb\]').click()

  })  })






  })
});