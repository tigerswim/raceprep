# Testing Guide for Marketing Consultant Website

This guide covers the comprehensive testing setup for your marketing consultant website, including unit tests, component tests, E2E tests, and performance testing.

## 🧪 Testing Stack

- **Jest + React Testing Library**: Unit and component testing
- **Cypress**: E2E testing with visual feedback
- **Playwright**: Cross-browser E2E testing
- **Coverage**: Code coverage reporting

## 📋 Available Test Scripts

```bash
# Unit and component tests
npm run test              # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report

# E2E tests with Cypress
npm run test:e2e          # Run Cypress tests headlessly
npm run test:e2e:open     # Open Cypress UI for interactive testing

# E2E tests with Playwright
npm run test:playwright   # Run Playwright tests
npm run test:playwright:ui # Open Playwright UI

# Run all tests
npm run test:all          # Run unit, Cypress, and Playwright tests

# CI/CD testing
npm run test:ci           # Run all tests with coverage for CI
```

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Run unit tests:**
   ```bash
   npm run test
   ```

3. **Run E2E tests:**
   ```bash
   npm run test:e2e
   ```

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── components/          # Component tests
│   │   └── Button.test.tsx
│   └── utils/              # Utility function tests
│       └── formatDate.test.ts
tests/
└── e2e/                    # Playwright E2E tests
    └── homepage.spec.ts
cypress/
├── e2e/                    # Cypress E2E tests
│   └── homepage.cy.ts
└── support/                # Cypress support files
```

## 🧩 Unit Testing (Jest + React Testing Library)

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Utility Testing Example

```typescript
describe('formatDate', () => {
  it('formats a valid date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('throws error for invalid date', () => {
    expect(() => formatDate('invalid-date')).toThrow('Invalid date provided')
  })
})
```

## 🌐 E2E Testing

### Cypress Tests

Cypress provides visual feedback and is great for:
- User journey testing
- Visual regression testing
- Performance testing
- Accessibility testing

```typescript
describe('Homepage', () => {
  it('should load homepage successfully', () => {
    cy.visit('/')
    cy.get('main').should('be.visible')
    cy.title().should('contain', 'Marketing Site')
  })

  it('should be responsive', () => {
    cy.viewport('iphone-x')
    cy.get('main').should('be.visible')
  })
})
```

### Playwright Tests

Playwright is excellent for:
- Cross-browser testing
- Mobile testing
- Performance testing
- Visual comparison

```typescript
import { test, expect } from '@playwright/test'

test('should load homepage successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Marketing Site/)
  await expect(page.locator('main')).toBeVisible()
})
```

## 📊 Coverage Requirements

The project is configured with 70% coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

Run coverage report:
```bash
npm run test:coverage
```

## 🔍 Testing Best Practices

### 1. Test Structure
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test one thing per test case
- Use meaningful assertions

### 2. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility features
- Mock external dependencies

### 3. E2E Testing
- Test critical user journeys
- Test across different devices and browsers
- Test performance and accessibility
- Use realistic test data

### 4. Marketing Website Specific Tests

#### SEO Testing
```typescript
it('should have proper SEO meta tags', () => {
  cy.get('meta[name="description"]').should('exist')
  cy.get('meta[name="viewport"]').should('exist')
  cy.get('h1').should('exist')
})
```

#### Performance Testing
```typescript
it('should have fast loading times', () => {
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
```

#### Accessibility Testing
```typescript
it('should be accessible', () => {
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt')
  })
  
  cy.get('a, button').first().focus()
  cy.get('a, button').first().should('be.focused')
})
```

## 🚀 Pre-deployment Testing Checklist

Before pushing your website live, run this complete test suite:

1. **Unit Tests:**
   ```bash
   npm run test:coverage
   ```

2. **E2E Tests:**
   ```bash
   npm run test:e2e
   npm run test:playwright
   ```

3. **Manual Testing:**
   - Test on different browsers (Chrome, Firefox, Safari, Edge)
   - Test on mobile devices
   - Test all forms and interactions
   - Check loading performance
   - Verify SEO elements

4. **Accessibility Testing:**
   - Use browser dev tools accessibility audit
   - Test with screen readers
   - Check keyboard navigation
   - Verify color contrast

## 🔧 Troubleshooting

### Common Issues

1. **Tests failing due to missing dependencies:**
   ```bash
   npm install
   ```

2. **Cypress tests failing:**
   - Ensure dev server is running (`npm run dev`)
   - Check if port 3000 is available

3. **Playwright tests failing:**
   - Install browsers: `npx playwright install`
   - Check if dev server is running

4. **Coverage not generating:**
   - Clear Jest cache: `npm run test -- --clearCache`
   - Check Jest configuration

### Debug Mode

Run tests in debug mode for more information:
```bash
npm run test -- --verbose
npm run test:e2e -- --headed
npm run test:playwright -- --debug
```

## 📈 Continuous Integration

For CI/CD pipelines, use:
```bash
npm run test:ci
```

This command:
- Runs unit tests with coverage
- Runs Cypress tests headlessly
- Runs Playwright tests with HTML reporter
- Fails if coverage thresholds aren't met

## 🎯 Next Steps

1. Write tests for your specific components
2. Add tests for critical user journeys
3. Set up visual regression testing
4. Configure performance monitoring
5. Set up automated accessibility testing

Remember: Good tests are an investment in your website's reliability and maintainability! 