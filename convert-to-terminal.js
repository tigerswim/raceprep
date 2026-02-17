#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function convertFileToTerminal(filePath) {
  console.log(`\nConverting: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let replacementCount = 0;

  // Pattern 1: Remove terminal mode state and listeners
  const terminalModePattern = /  \/\/ Terminal mode\s+useTerminalModeToggle\(\);\s+const \[useTerminal, setUseTerminal\] = useState\(\(\) => \{[^}]+\}\);\s+\/\/ Listen for terminal mode changes\s+useEffect\(\(\) => \{[^}]+\}, \[\]\);/gs;
  if (terminalModePattern.test(content)) {
    content = content.replace(terminalModePattern, '  // Terminal mode - always enabled\n  useTerminalModeToggle();');
    console.log('  ✓ Removed terminal mode state and listeners');
  }

  // Pattern 2: className conditionals - extract terminal version
  const classNamePattern = /className=\{useTerminal \?\s*"([^"]+)" :\s*"[^"]+"\}/g;
  let matches = content.match(classNamePattern);
  if (matches) {
    matches.forEach(() => {
      content = content.replace(classNamePattern, 'className="$1"');
      replacementCount++;
    });
    console.log(`  ✓ Converted ${matches.length} className conditionals`);
  }

  // Pattern 3: style conditionals - replace with terminal version or remove
  const stylePattern1 = /style=\{useTerminal \? \{ borderRadius: 0 \} : undefined\}/g;
  matches = content.match(stylePattern1);
  if (matches) {
    content = content.replace(stylePattern1, 'style={{ borderRadius: 0 }}');
    console.log(`  ✓ Converted ${matches.length} style conditionals`);
    replacementCount += matches.length;
  }

  // Pattern 4: Text conditionals in JSX - single quotes
  const textPattern1 = /\{useTerminal \? '([^']+)' : '[^']+'\}/g;
  matches = content.match(textPattern1);
  if (matches) {
    matches.forEach(() => {
      content = content.replace(textPattern1, "'$1'");
      replacementCount++;
    });
    console.log(`  ✓ Converted ${matches.length} text conditionals (single quotes)`);
  }

  // Pattern 5: Text conditionals in JSX - backticks/template literals
  const textPattern2 = /\{useTerminal \?\s*`([^`]+)` :\s*`[^`]+`\}/g;
  matches = content.match(textPattern2);
  if (matches) {
    matches.forEach(() => {
      content = content.replace(textPattern2, '`$1`');
      replacementCount++;
    });
    console.log(`  ✓ Converted ${matches.length} text conditionals (backticks)`);
  }

  // Pattern 6: Complex conditionals with ternary (mode === 'create' ? ...)
  const complexPattern1 = /\{useTerminal \?\s*\(([^)]+\?[^:]+:[^)]+)\) :\s*\([^)]+\?[^:]+:[^)]+\)\}/g;
  matches = content.match(complexPattern1);
  if (matches) {
    matches.forEach(() => {
      content = content.replace(complexPattern1, '{($1)}');
      replacementCount++;
    });
    console.log(`  ✓ Converted ${matches.length} complex conditionals`);
  }

  // Pattern 7: Standalone ternary inside JSX
  const standalonePattern = /\{useTerminal \? ([^:]+) : [^}]+\}/g;
  matches = content.match(standalonePattern);
  if (matches) {
    matches.forEach(() => {
      content = content.replace(standalonePattern, '{$1}');
      replacementCount++;
    });
    console.log(`  ✓ Converted ${matches.length} standalone ternary conditionals`);
  }

  // Write the file if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Total replacements: ${replacementCount}`);
    console.log(`  📝 File updated successfully`);
    return replacementCount;
  } else {
    console.log(`  ℹ️  No changes needed`);
    return 0;
  }
}

// Main execution
const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('Usage: node convert-to-terminal.js <file1> [file2] [file3] ...');
  process.exit(1);
}

let totalReplacements = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    totalReplacements += convertFileToTerminal(file);
  } else {
    console.error(`❌ File not found: ${file}`);
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✨ Conversion complete!`);
console.log(`📊 Total replacements across all files: ${totalReplacements}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
