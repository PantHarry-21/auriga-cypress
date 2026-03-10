describe("Add Price List - End to End Validations", () => {
  const selectors = {
    // Fields
    nameInput: ':nth-child(1) > :nth-child(2) > :nth-child(1) > .w-full',
    departmentSelect: ':nth-child(1) > :nth-child(2) > :nth-child(2) > .w-full',
    validFromDate: ':nth-child(1) > :nth-child(2) > :nth-child(3) > .w-full',
    validToDate: ':nth-child(1) > :nth-child(2) > :nth-child(4) > .w-full',
    industrySelect: '.pt-4 > .grid > :nth-child(1) > .w-full',
    techniqueSelect: '.pt-4 > .grid > :nth-child(2) > .w-full',
    descriptionInput: 'input[placeholder="Enter description"]',
    priceInputs: 'input[placeholder="0.00"]',

    // Optional listing selectors after save
    searchInput: 'input[placeholder*="Search"], input[type="search"]',
    tableBody: 'table tbody',
  };

  const texts = {
    reportsMenu: 'Reports',
    priceListMenu: 'Price List',
    newPriceListBtn: 'New Price List',
    modalTitle: 'Add Price List',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    applicableLabsBlockText: 'Applicable Labs',
  };

  const messages = {
    successCreate: 'Price list created successfully',

    // Replace with exact app messages if needed
    requiredName: 'Name is required',
    requiredDepartment: 'Department is required',
    requiredValidFrom: 'Valid From Date is required',
    requiredValidTo: 'Valid To Date is required',
    invalidDateRange: 'Valid To Date should be greater than or equal to Valid From Date',
    requiredApplicableLabs: 'At least one lab must be selected',
    requiredIndustry: 'Industry is required',
    requiredTechnique: 'Technique is required',
    requiredDescription: 'Description is required',
    requiredPriceRs: 'Price in Rs is required',
    requiredPriceUsd: 'Price in USD is required',
    invalidDiscount: 'Discount should be between 0 and 100',
    duplicateName: 'Price list name already exists',
  };

  const data = {
    validName: () => `Auto Price List ${Date.now()}`,
    duplicateName: () => `Auto Duplicate ${Date.now()}`,
    validFrom: '2026-09-01',
    validTo: '2026-09-30',
    invalidFrom: '2026-09-30',
    invalidTo: '2026-09-01',
    description: 'Automation test description',
    priceRs: '1500',
    priceUsd: '25',
    discount: '10',
    invalidDiscountHigh: '150',
    invalidDiscountNegative: '-1',
  };

  beforeEach(() => {
    cy.login(Cypress.env("LABTECH_USER"), Cypress.env("LABTECH_PASS"));
    openAddPriceListModal();
  });

  function clickByText(text) {
    cy.contains(text, { timeout: 10000 })
      .should('exist')
      .scrollIntoView()
      .closest('button, a, [role="button"], [role="menuitem"], li, div')
      .click({ force: true });
  }

  function openAddPriceListModal() {
    clickByText(texts.reportsMenu);
    clickByText(texts.priceListMenu);

    cy.contains('button, a, [role="button"]', texts.newPriceListBtn, { timeout: 10000 })
      .should('exist')
      .scrollIntoView()
      .click({ force: true });

    cy.contains(texts.modalTitle, { timeout: 10000 }).should('be.visible');
  }

  function typeName(name) {
    cy.get(selectors.nameInput)
      .should('be.visible')
      .clear()
      .type(name)
      .should('have.value', name);
  }

  function setDepartmentRandom() {
    cy.get(selectors.departmentSelect)
      .should('be.visible')
      .find('option:not([value=""])')
      .then(($options) => {
        expect($options.length, 'department options count').to.be.greaterThan(0);
        const random = Math.floor(Math.random() * $options.length);
        const value = $options[random].value;
        const text = $options[random].text.trim();

        cy.log(`Selected Department: ${text}`);
        cy.get(selectors.departmentSelect).select(value).should('have.value', value);
      });
  }

  function setValidFrom(date) {
    cy.get(selectors.validFromDate)
      .should('be.visible')
      .clear()
      .type(date)
      .should('have.value', date);
  }

  function setValidTo(date) {
    cy.get(selectors.validToDate)
      .should('be.visible')
      .clear()
      .type(date)
      .should('have.value', date);
  }

  function selectRandomLabs(count = 2) {
    cy.contains(texts.applicableLabsBlockText, { timeout: 10000 })
      .should('be.visible')
      .parent()
      .find('label:visible')
      .then(($labs) => {
        expect($labs.length, 'lab count').to.be.greaterThan(count - 1);
        const shuffled = Cypress._.shuffle($labs.toArray());

        for (let i = 0; i < count; i++) {
          cy.wrap(shuffled[i]).scrollIntoView().click({ force: true });
          cy.wrap(shuffled[i]).invoke('text').then((txt) => {
            cy.log(`Selected Lab: ${txt.trim()}`);
          });
        }
      });
  }

  function setIndustryRandom() {
    cy.get(selectors.industrySelect)
      .should('be.visible')
      .find('option:not([value=""])')
      .then(($options) => {
        expect($options.length, 'industry options count').to.be.greaterThan(0);
        const random = Math.floor(Math.random() * $options.length);
        const value = $options[random].value;
        const text = $options[random].text.trim();

        cy.log(`Selected Industry: ${text}`);
        cy.get(selectors.industrySelect).select(value).should('have.value', value);
      });
  }

  function setTechniqueRandom() {
    cy.get(selectors.techniqueSelect)
      .should('be.visible')
      .find('option:not([value=""])')
      .then(($options) => {
        expect($options.length, 'technique options count').to.be.greaterThan(0);
        const random = Math.floor(Math.random() * $options.length);
        const value = $options[random].value;
        const text = $options[random].text.trim();

        cy.log(`Selected Technique: ${text}`);
        cy.get(selectors.techniqueSelect).select(value).should('have.value', value);
      });
  }

  function typeDescription(value) {
    cy.get(selectors.descriptionInput)
      .should('be.visible')
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function typePriceRs(value) {
    cy.get(selectors.priceInputs)
      .eq(0)
      .should('be.visible')
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function typePriceUsd(value) {
    cy.get(selectors.priceInputs)
      .eq(1)
      .should('be.visible')
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function getDiscountInput() {
    return cy.get('input:visible').then(($inputs) => {
      expect($inputs.length, 'visible inputs count').to.be.greaterThan(0);
      return cy.wrap($inputs[$inputs.length - 1]);
    });
  }

  function typeDiscount(value) {
    getDiscountInput()
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function fillValidForm(name = data.validName()) {
    typeName(name);
    setDepartmentRandom();
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    selectRandomLabs(2);
    setIndustryRandom();
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);
  }

  function saveForm() {
    cy.contains('button, [role="button"]', texts.saveBtn)
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });
  }

  function assertValidationMessage(message) {
    cy.contains(message).should('be.visible');
  }

  function assertNoSuccessMessage() {
    cy.contains(messages.successCreate).should('not.exist');
  }

  it("TC01 - should create a price list successfully with valid data", () => {
    const name = data.validName();

    cy.intercept('POST', '**/price-list**').as('createPriceList');

    fillValidForm(name);
    saveForm();

    cy.wait('@createPriceList', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.contains(messages.successCreate).should('be.visible');

    cy.get('body').then(($body) => {
      if ($body.find(selectors.searchInput).length) {
        cy.get(selectors.searchInput).clear().type(name);
        cy.contains(name).should('be.visible');
      }
    });
  });

  it("TC02 - should show validation when Name is blank", () => {
    fillValidForm();
    cy.get(selectors.nameInput).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredName);
    assertNoSuccessMessage();
  });

  it("TC03 - should show validation when Department is not selected", () => {
    typeName(data.validName());
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    selectRandomLabs(2);
    setIndustryRandom();
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    saveForm();

    assertValidationMessage(messages.requiredDepartment);
    assertNoSuccessMessage();
  });

  it("TC04 - should show validation when Valid From Date is blank", () => {
    fillValidForm();
    cy.get(selectors.validFromDate).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredValidFrom);
    assertNoSuccessMessage();
  });

  it("TC05 - should show validation when Valid To Date is blank", () => {
    fillValidForm();
    cy.get(selectors.validToDate).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredValidTo);
    assertNoSuccessMessage();
  });

  it("TC06 - should show validation when Valid To Date is earlier than Valid From Date", () => {
    typeName(data.validName());
    setDepartmentRandom();
    setValidFrom(data.invalidFrom);
    setValidTo(data.invalidTo);
    selectRandomLabs(2);
    setIndustryRandom();
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    saveForm();

    assertValidationMessage(messages.invalidDateRange);
    assertNoSuccessMessage();
  });

  it("TC07 - should show validation when no Applicable Lab is selected", () => {
    typeName(data.validName());
    setDepartmentRandom();
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    setIndustryRandom();
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    saveForm();

    assertValidationMessage(messages.requiredApplicableLabs);
    assertNoSuccessMessage();
  });

  it("TC08 - should show validation when Industry is not selected", () => {
    typeName(data.validName());
    setDepartmentRandom();
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    selectRandomLabs(2);
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    saveForm();

    assertValidationMessage(messages.requiredIndustry);
    assertNoSuccessMessage();
  });

  it("TC09 - should show validation when Technique is not selected", () => {
    typeName(data.validName());
    setDepartmentRandom();
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    selectRandomLabs(2);
    setIndustryRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    saveForm();

    assertValidationMessage(messages.requiredTechnique);
    assertNoSuccessMessage();
  });

  it("TC10 - should show validation when Description is blank", () => {
    fillValidForm();
    cy.get(selectors.descriptionInput).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredDescription);
    assertNoSuccessMessage();
  });

  it("TC11 - should show validation when Price in Rs is blank", () => {
    fillValidForm();
    cy.get(selectors.priceInputs).eq(0).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredPriceRs);
    assertNoSuccessMessage();
  });

  it("TC12 - should show validation when Price in USD is blank", () => {
    fillValidForm();
    cy.get(selectors.priceInputs).eq(1).clear().blur();

    saveForm();

    assertValidationMessage(messages.requiredPriceUsd);
    assertNoSuccessMessage();
  });

  it("TC13 - should show validation when Discount is greater than 100", () => {
    fillValidForm();
    typeDiscount(data.invalidDiscountHigh);

    saveForm();

    assertValidationMessage(messages.invalidDiscount);
    assertNoSuccessMessage();
  });

  it("TC14 - should show validation when Discount is negative", () => {
    fillValidForm();
    typeDiscount(data.invalidDiscountNegative);

    saveForm();

    assertValidationMessage(messages.invalidDiscount);
    assertNoSuccessMessage();
  });

  it("TC15 - should not save duplicate Price List name", () => {
    const name = data.duplicateName();

    cy.intercept('POST', '**/price-list**').as('createPriceList');

    fillValidForm(name);
    saveForm();

    cy.wait('@createPriceList', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    cy.contains(messages.successCreate).should('be.visible');

    openAddPriceListModal();
    fillValidForm(name);
    saveForm();

    assertValidationMessage(messages.duplicateName);
    assertNoSuccessMessage();
  });

  it("TC16 - should close popup on Cancel and should not create record", () => {
    const name = data.validName();

    fillValidForm(name);

    cy.contains('button, [role="button"]', texts.cancelBtn)
      .should('be.visible')
      .click({ force: true });

    cy.contains(texts.modalTitle).should('not.exist');

    cy.get('body').then(($body) => {
      if ($body.find(selectors.searchInput).length) {
        cy.get(selectors.searchInput).clear().type(name);
        cy.contains(name).should('not.exist');
      }
    });
  });

  it("TC17 - should retain entered values before save", () => {
    const name = data.validName();

    typeName(name);
    setDepartmentRandom();
    setValidFrom(data.validFrom);
    setValidTo(data.validTo);
    selectRandomLabs(2);
    setIndustryRandom();
    setTechniqueRandom();
    typeDescription(data.description);
    typePriceRs(data.priceRs);
    typePriceUsd(data.priceUsd);
    typeDiscount(data.discount);

    cy.get(selectors.nameInput).should('have.value', name);
    cy.get(selectors.validFromDate).should('have.value', data.validFrom);
    cy.get(selectors.validToDate).should('have.value', data.validTo);
    cy.get(selectors.descriptionInput).should('have.value', data.description);
    cy.get(selectors.priceInputs).eq(0).should('have.value', data.priceRs);
    cy.get(selectors.priceInputs).eq(1).should('have.value', data.priceUsd);
  });
});