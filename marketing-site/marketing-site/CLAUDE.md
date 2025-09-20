# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based marketing website for Kinetic Brand Partners, a professional marketing consultancy. The site is a single-page application focused on conversion optimization and professional presentation.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm start               # Start production server
npm run build           # Build for production

# Code Quality
npm run lint            # Run ESLint

# Testing
npm test                # Run Jest unit tests
npm run test:watch      # Run Jest in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run Cypress end-to-end tests
npm run test:e2e:open   # Open Cypress GUI
npm run test:playwright # Run Playwright tests
npm run test:playwright:ui # Run Playwright with UI
npm run test:all        # Run all test suites
npm run test:ci         # Run all tests for CI environment
```

## Architecture

### Technology Stack
- **Framework**: Next.js 15.3.4 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Jest + Testing Library, Cypress, Playwright
- **Development**: Turbopack for fast builds

### Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (renders PersonalSite)
│   └── globals.css         # Global styles
└── components/
    └── PersonalSite.tsx    # Main site component with all sections
```

### Key Design Patterns

**Single Component Architecture**: The entire site is built as one large `PersonalSite.tsx` component with embedded section components. This approach provides:
- Complete control over scroll behavior and state management
- Simplified navigation with intersection observer
- Consistent styling and responsive behavior

**Section-Based Navigation**: Uses intersection observer to track active sections and smooth scrolling for navigation. All sections are defined within the main component with stable refs.

**Professional Marketing Focus**: The codebase follows marketing best practices with:
- Conversion-focused CTAs and messaging
- Professional color palette (blues, greens, oranges)
- Trust-building elements (credentials, metrics, testimonials)
- Mobile-first responsive design

## Styling Guidelines

The project uses comprehensive `.cursorrules` that define:
- Professional color palette: Primary blues (#1e40af, #3b82f6), trust greens (#059669, #10b981), accent oranges (#ea580c, #f97316)
- Typography: Modern sans-serif fonts (Inter, Poppins)
- Consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design principles

## Key Features

- **Intersection Observer Navigation**: Automatically updates active navigation based on scroll position
- **Smooth Scrolling**: All navigation uses smooth scroll behavior
- **Mobile Menu**: Responsive navigation with mobile toggle
- **Professional Sections**: Hero, Services, About, Experience, Contact with conversion-focused content
- **Performance Optimized**: Uses Next.js Image component and modern web practices

## Testing Strategy

The project is set up for comprehensive testing:
- **Unit Tests**: Jest with Testing Library for component testing
- **E2E Tests**: Both Cypress and Playwright for cross-browser testing
- **Coverage**: Jest coverage reporting
- **CI Ready**: Dedicated CI test command with headless execution

## Content Management

The site content is hardcoded within the component for maximum performance and control. Key content areas:
- Hero section with value proposition and metrics
- Services section with detailed service offerings
- About section with professional credibility elements
- Experience section with case studies and achievements
- Contact section with clear call-to-action

## Development Notes

- The site uses client-side rendering (`"use client"`) for interactive features
- All images should be placed in the `public/` directory
- The site is optimized for professional marketing conversion goals
- Follows the comprehensive style guide defined in `.cursorrules`
- Uses TypeScript for type safety throughout