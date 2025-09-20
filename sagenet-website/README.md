# SageNet Website

A modern, responsive website for SageNet's digital signage and managed network services, built with React, TypeScript, and styled-components.

## Features

- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Interactive ROI Calculator**: Advanced calculator with service differentiation (Digital/Network/Combined) and PDF report generation
- **Image Showcase**: Real implementation photos across different retail environments
- **Professional Branding**: Updated with 2023 SageNet logo and consistent visual identity
- **Performance Optimized**: Fast loading with optimized images and efficient animations

## Tech Stack

- **React 18** with TypeScript
- **styled-components** for CSS-in-JS styling
- **Framer Motion** for animations and transitions
- **React Router v6** for navigation
- **jsPDF** for ROI report generation
- **Open Sans** typography via Google Fonts

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Header, Footer)
│   └── sections/        # Page sections (Hero, ROI Calculator, etc.)
├── pages/              # Route-level components (Home, Marketing, IT, Contact)
├── styles/             # Theme configuration and global styles
├── utils/              # Utilities (PDF generation, calculations)
└── App.tsx            # Main app component with routing
```

## Key Components

### Image Assets
- **Logo**: `/public/images/logo/sagenet-logo-2023.webp`
- **Signage Photos**: Real implementation photos in `/public/images/signage/`
- **NOC Photos**: Network Operations Center images in `/public/images/NOC/`

### Core Features
- **Hero Section**: Showcases solutions with real implementation photos
- **ROI Calculator**: Comprehensive business calculator with industry-specific logic
- **Solutions Showcase**: Visual gallery of different retail environments
- **NOC Infrastructure**: Professional operations center presentation

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## Development Notes

- Images are served from `/public/images/` and referenced with absolute paths
- Theme configuration in `src/styles/theme.ts` provides consistent design tokens
- ROI calculations use industry-validated assumptions from digital signage research
- All navigation routes are properly configured in `App.tsx`

## Deployment

The site is configured for deployment on Netlify with proper routing support for single-page applications.
