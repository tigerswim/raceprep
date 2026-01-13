# RacePrep Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented to improve PageSpeed scores from **Mobile: 59 / Desktop: 75** to target scores of **Mobile: 90+ / Desktop: 95+**.

## Issues Identified

### Critical Issues
1. **5.1MB JavaScript Bundle** - Monolithic bundle with no code splitting
2. **No Asset Compression** - Missing gzip/brotli compression
3. **Blocking Font Loading** - Fonts loaded synchronously, blocking render
4. **No Lazy Loading** - All routes and components loaded upfront
5. **Heavy Dependencies** - React Native Web, Redux loaded immediately
6. **Suboptimal Caching** - Missing cache headers for `_expo/static/` paths

### Performance Metrics Before Optimization
- **Mobile PageSpeed Score**: 59/100
- **Desktop PageSpeed Score**: 75/100
- **Initial Bundle Size**: 5.1MB
- **LCP (Largest Contentful Paint)**: Poor (likely > 4s)
- **CLS (Cumulative Layout Shift)**: Unknown
- **FID/INP (Interaction)**: Unknown

## Optimizations Implemented

### 1. Metro Bundler Optimization ✅

**File**: `metro.config.js`

**Changes**:
- Enabled dead code elimination (`drop_console`, `dead_code`, `unused`)
- Enabled minification with top-level mangling
- Removed comments in production builds
- Enabled better tree shaking with `unstable_enablePackageExports`

**Expected Impact**: 30-40% reduction in bundle size

### 2. Font Loading Optimization ✅

**Files**: `app/_layout.tsx`, `global.css`

**Changes**:
- Removed blocking render while fonts load
- Added `font-display: swap` to prevent FOIT (Flash of Invisible Text)
- Fonts now load asynchronously with system font fallback

**Expected Impact**: 1-2s improvement in LCP

### 3. Asset Compression ✅

**File**: `scripts/optimize-build.js`

**Changes**:
- Created post-build script to gzip all JS/CSS files
- Generates `.gz` files for Netlify to serve
- Provides compression report during build

**Expected Impact**: 70-80% reduction in transfer size

### 4. Caching Headers Optimization ✅

**File**: `netlify.toml`

**Changes**:
- Added cache headers for `/_expo/static/*` (1 year immutable)
- Added cache headers for fonts (1 year immutable)
- Added cache headers for images/assets (1 year immutable)
- Maintained no-cache for HTML

**Expected Impact**: Faster repeat visits, improved caching score

### 5. Resource Hints ✅

**File**: `scripts/optimize-build.js`

**Changes**:
- Automatically adds `<link rel="preload">` for critical CSS/JS
- Adds `<link rel="dns-prefetch">` for Supabase
- Adds `<link rel="preconnect">` for external APIs

**Expected Impact**: Faster resource loading, reduced connection time

### 6. Production Build Pipeline ✅

**File**: `package.json`

**Changes**:
- Created `build:web:production` script
- Sets `NODE_ENV=production` for maximum optimization
- Runs optimization script automatically
- Updated Netlify to use production build

**Command**: `npm run build:web:production`

## Build Process

### Development Build
```bash
npm run build:web
```
- Standard Expo export
- No compression
- Includes debug info
- Fast build time

### Production Build (Use for Deployment)
```bash
npm run build:web:production
```
- Full optimization enabled
- Assets compressed
- Resource hints added
- Bundle size report
- Ready for deployment

## Deployment

### Netlify Configuration

The `netlify.toml` has been updated to:
- Use production build command: `npm run build:web:production`
- Apply optimal cache headers
- Serve pre-compressed `.gz` files automatically

### Deploy Steps

1. **Local Testing**:
   ```bash
   npm run build:web:production
   npm run preview:web
   ```
   Visit http://localhost:3000 to test

2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "perf: Optimize web bundle and improve PageSpeed scores"
   git push origin main
   ```

3. **Netlify Auto-Deploy**: Netlify will automatically build and deploy

4. **Verify**: Test at https://raceprep.kineticbrandpartners.com

## Additional Optimizations (Future)

### Image Optimization (Not Yet Implemented)
- Convert PNG images to WebP format
- Implement responsive images with `srcset`
- Add lazy loading for images below the fold
- Use Expo Image component with blurhash

**To implement**:
```bash
# Install sharp for image optimization
npm install --save-dev sharp

# Convert images
node scripts/optimize-images.js
```

### Code Splitting (Advanced)
- Implement route-based code splitting
- Lazy load heavy components (Charts, Maps)
- Use React.lazy() and Suspense
- Dynamic imports for features

**Example**:
```jsx
const RacesScreen = lazy(() => import('./screens/RacesScreen'));

<Suspense fallback={<LoadingSpinner />}>
  <RacesScreen />
</Suspense>
```

### Service Worker / PWA
- Add service worker for offline support
- Implement app shell caching
- Pre-cache critical assets
- Background sync for data

### Further Bundle Optimization
- Analyze bundle with `@expo/webpack-config` analyzer
- Remove unused dependencies
- Use lighter alternatives (e.g., date-fns instead of moment)
- Tree-shake icon libraries

## Testing Performance

### Local Testing with Lighthouse
```bash
# Build production version
npm run build:web:production

# Serve locally
npm run preview:web

# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select "Mobile" and "Performance"
# 4. Click "Generate report"
```

### Online Testing
1. **PageSpeed Insights**: https://pagespeed.web.dev
   - Enter: https://raceprep.kineticbrandpartners.com
   - Test both Mobile and Desktop

2. **WebPageTest**: https://www.webpagetest.org
   - More detailed performance metrics
   - Filmstrip view of loading

3. **GTmetrix**: https://gtmetrix.com
   - Comprehensive performance analysis
   - Historical tracking

## Expected Results

### Bundle Size
- **Before**: 5.1 MB (uncompressed JS)
- **After**: ~1.5-2 MB (uncompressed), ~300-500 KB (gzipped)
- **Improvement**: 70-80% reduction in transfer size

### PageSpeed Scores (Target)
- **Mobile**: 85-90+ (from 59)
- **Desktop**: 95+ (from 75)

### Core Web Vitals (Target)
- **LCP (Largest Contentful Paint)**: < 2.5s (Good)
- **FID (First Input Delay)**: < 100ms (Good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good)

## Monitoring

### Ongoing Performance Monitoring
1. Set up automated PageSpeed testing in CI/CD
2. Monitor bundle size in pull requests
3. Track Core Web Vitals in production
4. Set performance budgets

### Recommended Tools
- **Bundle Analyzer**: `@expo/webpack-config` analyzer
- **Performance Monitoring**: Sentry Performance
- **Real User Monitoring**: Google Analytics (Web Vitals)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf dist/ node_modules/.cache
npm run build:web:production
```

### Compression Not Working
- Check that `scripts/optimize-build.js` is executable
- Verify Node.js version >= 18
- Check Netlify build logs for errors

### Images Still Large
- Manually optimize images using https://squoosh.app
- Convert to WebP format
- Resize to appropriate dimensions (max 2x display size)

### Bundle Still Large
- Run bundle analyzer to identify large dependencies
- Check for duplicate dependencies in package.json
- Consider lazy loading heavy features

## Resources

- [Expo Web Performance](https://docs.expo.dev/guides/web-performance/)
- [React Native Web Performance](https://necolas.github.io/react-native-web/docs/performance/)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

## Changelog

- **2025-01-12**: Initial performance optimization implementation
  - Metro bundler optimization
  - Font loading optimization
  - Asset compression
  - Caching headers
  - Resource hints
  - Production build pipeline

---

**Status**: ✅ Ready for Testing
**Next Steps**: Build, deploy, and test PageSpeed improvements
