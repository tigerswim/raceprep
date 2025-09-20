# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the SageNet Website - a modern React TypeScript application showcasing digital signage and managed network services for multi-site retail businesses. Built with Create React App and focuses on marketing and IT decision-makers in QSR, convenience stores, and retail chains.

## Development Commands

- `npm start` - Start development server (runs on http://localhost:3000)
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (one-way operation)

## Architecture & Structure

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Styling**: styled-components with comprehensive theme system
- **Routing**: React Router v6 with full navigation support
- **Animation**: Framer Motion for smooth transitions and interactions
- **Typography**: Open Sans font via Google Fonts
- **PDF Generation**: jsPDF with autoTable for ROI reports
- **Build Tool**: Create React App (react-scripts)

### Key Architectural Patterns

**Theme System**: Centralized theme in `src/styles/theme.ts` with design tokens:
- Color palette (primary navy #1e3a8a, secondary orange #ea580c, accent colors)
- Typography scale using Open Sans font family
- Comprehensive spacing system, responsive breakpoints, shadow definitions
- Theme provided via styled-components ThemeProvider

**Component Structure**:
- `src/components/common/` - Reusable UI components (Header, Footer, Button)
- `src/components/sections/` - Modular page sections (Hero, ROI Calculator, Solutions Showcase, etc.)
- `src/pages/` - Route-level page components (Home, Marketing, IT, Contact)
- `src/utils/` - Utility functions (PDF generation, ROI calculations)

**Routing Structure**: Complete navigation system in App.tsx with routes for:
- `/` - Homepage with comprehensive sections
- `/marketing` - Marketing-focused solutions and ROI messaging
- `/it` - IT infrastructure and NOC showcase
- `/contact` - Contact form with business profile inputs
- `/about` - Company information (placeholder)
- `/resources` - Knowledge base and documentation (placeholder)

**Image Management**: Organized asset structure:
- `/public/images/logo/` - SageNet branding assets (2023 WebP logo)
- `/public/images/signage/` - Real implementation photos across retail environments
- `/public/images/NOC/` - Network Operations Center photography
- `/public/images/customers/` - Customer logos and brand assets

## Key Features & Components

### Advanced ROI Calculator (`src/components/sections/AdvancedROICalculator.tsx`)
- Service differentiation (Digital Signage / Network Services / Combined)
- Industry-specific calculations with validated assumptions
- Comprehensive business input form with progressive disclosure
- PDF report generation with detailed financial projections
- Integration with white paper data and industry benchmarks

### Solutions Showcase (`src/components/sections/SolutionsShowcase.tsx`)
- Visual gallery of real implementations
- Industry-specific metrics and success stories
- Interactive cards with hover effects and animations
- Call-to-action integration with ROI calculator

### Professional Imagery Integration
- Hero section with convenience store digital menu boards
- Marketing page with implementation-specific photos
- IT page with NOC infrastructure showcase
- Enhanced image overlays with optimized contrast

### Enhanced User Experience
- Mobile-first responsive design
- Smooth scroll navigation and anchor linking
- Professional typography with Open Sans
- Consistent branding with 2023 SageNet logo
- Optimized loading performance

## Development Notes

### Current State
- Main development branch: `development`
- Production-ready codebase with comprehensive testing
- All navigation routes properly configured and functional
- Image assets optimized and properly referenced

### Code Patterns
- TypeScript with strict typing throughout
- styled-components with theme-based styling
- Framer Motion for consistent animations
- Component composition with section-based architecture
- Utility-first approach with shared functions

### Business Context Integration
- ROI calculations based on industry research and white paper data
- Target audience: Marketing leaders and IT decision-makers
- Focus on multi-site retail: QSR, C-stores, retail chains
- Emphasis on measurable business outcomes and professional credibility

### Image and Asset Guidelines
- All images served from `/public/images/` with absolute paths
- WebP format preferred for logos and graphics
- High-quality photography for implementation showcases
- Consistent alt text for accessibility compliance
- Responsive image handling across all breakpoints

## Testing & Quality Assurance

- Development server compiles with warnings only (no errors)
- TypeScript strict mode enabled with comprehensive type checking
- ESLint configuration for code quality standards
- Responsive design tested across all major breakpoints
- PDF generation functionality verified and working

This documentation reflects the current state as of the comprehensive image integration and enhancement work completed in the latest development cycle.