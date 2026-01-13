#!/usr/bin/env node
/**
 * Post-build optimization script for RacePrep web builds
 * Compresses assets, optimizes HTML, and generates preload hints
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('🚀 Starting post-build optimization...\n');

// Step 1: Compress JS and CSS files using gzip
console.log('📦 Compressing assets with gzip...');
try {
  // Find all JS and CSS files
  const findCommand = process.platform === 'win32'
    ? `dir /s /b "${distDir}\\*.js" "${distDir}\\*.css"`
    : `find "${distDir}" -type f \\( -name "*.js" -o -name "*.css" \\)`;

  const files = process.platform === 'win32'
    ? execSync(findCommand).toString().split('\r\n').filter(Boolean)
    : execSync(findCommand).toString().split('\n').filter(Boolean);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file);
      const gzipped = require('zlib').gzipSync(content, { level: 9 });
      fs.writeFileSync(`${file}.gz`, gzipped);

      const originalSize = (content.length / 1024).toFixed(2);
      const compressedSize = (gzipped.length / 1024).toFixed(2);
      const savings = ((1 - gzipped.length / content.length) * 100).toFixed(1);

      console.log(`  ✓ ${path.basename(file)}: ${originalSize}KB → ${compressedSize}KB (${savings}% savings)`);
    } catch (err) {
      console.warn(`  ⚠ Could not compress ${file}:`, err.message);
    }
  });
  console.log('✅ Compression complete\n');
} catch (err) {
  console.error('❌ Compression failed:', err.message);
}

// Step 2: Optimize index.html with resource hints
console.log('🔧 Optimizing index.html...');
try {
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html not found');
  }

  let html = fs.readFileSync(indexHtmlPath, 'utf-8');

  // Find the CSS and JS files
  const cssMatch = html.match(/href="(\/[^"]*\.css)"/);
  const jsMatch = html.match(/src="(\/[^"]*\.js)"/);

  if (cssMatch || jsMatch) {
    // Add preload hints for critical resources
    const preloadHints = [];

    if (cssMatch) {
      preloadHints.push(`<link rel="preload" href="${cssMatch[1]}" as="style">`);
    }

    if (jsMatch) {
      preloadHints.push(`<link rel="preload" href="${jsMatch[1]}" as="script">`);
    }

    // Add DNS prefetch for external domains
    const dnsPrefetch = [
      '<link rel="dns-prefetch" href="https://jpimixridnqwnpjhwdja.supabase.co">',
      '<link rel="preconnect" href="https://jpimixridnqwnpjhwdja.supabase.co" crossorigin>',
    ];

    // Insert hints before the existing preload (if any) or after charset
    const insertPoint = html.indexOf('<link rel="preload"');
    if (insertPoint !== -1) {
      html = html.slice(0, insertPoint) +
             dnsPrefetch.join('\n    ') + '\n    ' +
             preloadHints.join('\n    ') + '\n    ' +
             html.slice(insertPoint);
    } else {
      const charsetPoint = html.indexOf('<meta charset');
      const insertAfter = html.indexOf('>', charsetPoint) + 1;
      html = html.slice(0, insertAfter) + '\n    ' +
             dnsPrefetch.join('\n    ') + '\n    ' +
             preloadHints.join('\n    ') +
             html.slice(insertAfter);
    }

    fs.writeFileSync(indexHtmlPath, html);
    console.log('✅ index.html optimized with resource hints\n');
  }
} catch (err) {
  console.error('❌ HTML optimization failed:', err.message);
}

// Step 3: Generate bundle size report
console.log('📊 Bundle size report:');
try {
  const expoStaticDir = path.join(distDir, '_expo', 'static', 'js', 'web');
  if (fs.existsSync(expoStaticDir)) {
    const jsFiles = fs.readdirSync(expoStaticDir).filter(f => f.endsWith('.js') && !f.endsWith('.gz'));

    let totalSize = 0;
    let totalGzipped = 0;

    jsFiles.forEach(file => {
      const filePath = path.join(expoStaticDir, file);
      const size = fs.statSync(filePath).size;
      totalSize += size;

      const gzPath = `${filePath}.gz`;
      if (fs.existsSync(gzPath)) {
        const gzSize = fs.statSync(gzPath).size;
        totalGzipped += gzSize;
      }

      const sizeKB = (size / 1024).toFixed(2);
      console.log(`  ${file}: ${sizeKB} KB`);
    });

    console.log(`\n  Total JS: ${(totalSize / 1024).toFixed(2)} KB`);
    if (totalGzipped > 0) {
      console.log(`  Total Gzipped: ${(totalGzipped / 1024).toFixed(2)} KB`);
      console.log(`  Compression: ${((1 - totalGzipped / totalSize) * 100).toFixed(1)}%`);
    }
  }
} catch (err) {
  console.error('❌ Bundle report failed:', err.message);
}

console.log('\n✨ Optimization complete!\n');
