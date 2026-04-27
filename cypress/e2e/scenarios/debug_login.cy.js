describe('Debug', () => {
  it('test login session', () => {
    cy.fixture('users').then((users) => {
      const cred = users['Accountant (Admin)'];
      cy.login(cred.username, cred.password);
    });
  });
});
