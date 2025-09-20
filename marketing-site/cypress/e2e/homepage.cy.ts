describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load homepage successfully', () => {
    // Check that the page loads
    cy.get('main').should('be.visible')
    
    // Check for proper title
    cy.title().should('contain', 'Marketing Site')
  })

  it('should have proper navigation', () => {
    // Check if navigation exists and is visible
    cy.get('nav').should('be.visible')
    
    // Check for navigation links
    cy.get('nav a').should('have.length.at.least', 1)
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('main').should('be.visible')
    
    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.get('main').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('main').should('be.visible')
  })

  it('should have fast loading performance', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading')
      },
    })
    
    cy.window().then((win) => {
      win.performance.mark('end-loading')
      win.performance.measure('page-load', 'start-loading', 'end-loading')
      
      const measure = win.performance.getEntriesByName('page-load')[0]
      expect(measure.duration).to.be.lessThan(3000)
    })
  })

  it('should have proper SEO elements', () => {
    // Check for meta description
    cy.get('meta[name="description"]').should('exist')
    
    // Check for viewport meta tag
    cy.get('meta[name="viewport"]').should('exist')
    
    // Check for proper heading structure
    cy.get('h1').should('exist')
  })

  it('should be accessible', () => {
    // Check for alt text on images
    cy.get('img').each(($img) => {
Looking at the lint error "Cannot find name 'cy'", this suggests that the Cypress types are not properly imported or configured. The most common fix is to add the proper import at the top of the file, but since you only want me to rewrite the selection, I'll provide a more robust way to handle the image accessibility check: