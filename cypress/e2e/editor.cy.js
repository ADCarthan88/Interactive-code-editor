describe('Code Editor E2E Tests', () => {
    beforeEach(() => {
       cy.get('/');
    });

    it('should load the editor interface', () => {
        cy.get('#code-editor').should('be.visible');
    });

    it('should allow typing and running code', () => {
       cy.get('#code-editor').type('console.log("Hello World");');
       cy.get('#run-btn').click();
       cy.get('#console-content').should('contain', 'Hello World');
    });

    it('should save and load files', () => {
        cy.get('#code-editor').type('const test = true;');
        cy.get('#save-btn').click();
        cy.get('#file-name').should('not.contain', 'untitled');
    });
    });