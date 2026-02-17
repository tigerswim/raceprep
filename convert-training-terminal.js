const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/training.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Remove the imports we don't need
content = content.replace(/import \{ useTerminalModeToggle \} from [^\n]+\n/, '');
content = content.replace(/import \{ getTerminalModeState \} from [^\n]+\n/, '');

// Helper function to replace ternary expressions keeping only terminal style
function replaceAll(str, patterns) {
  let result = str;
  for (const [pattern, replacement] of patterns) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// Replacements - simple inline ternaries in className
content = content.replace(/className=\{useTerminal\s*\?\s*"([^"]+)"\s*:\s*"[^"]+"\}/g, 'className="$1"');

// Replacements - simple inline ternaries in text content
content = content.replace(/\{useTerminal\s*\?\s*"([^"]+)"\s*:\s*"[^"]+"\}/g, '"$1"');

// Replacements - template literal ternaries like ${useTerminal ? "MI" : "miles"}
content = content.replace(/\$\{useTerminal\s*\?\s*"([^"]+)"\s*:\s*"[^"]+"\}/g, '$1');

// Replacements - style ternaries
content = content.replace(/style=\{useTerminal\s*\?\s*(\{[^}]+\})\s*:\s*undefined\}/g, 'style={$1}');

// Remove specific multi-line className ternaries - these need manual handling
// We'll do a simple pass for now
const lines = content.split('\n');
const output = [];
let skipUntil = -1;
let inTernary = false;
let ternaryStart = -1;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip useTerminal/setUseTerminal state and effect
  if (line.includes('const [useTerminal, setUseTerminal]')) {
    skipUntil = i;
    // Skip until we find the closing of this state declaration
    while (i < lines.length && !lines[i].includes('});')) {
      i++;
    }
    continue;
  }

  if (line.includes('useEffect(() => {') && i < lines.length - 5 && lines[i+1].includes('handleTerminalModeChange')) {
    // Skip the entire useEffect for terminal mode
    let depth = 0;
    while (i < lines.length) {
      if (lines[i].includes('{')) depth++;
      if (lines[i].includes('}')) depth--;
      i++;
      if (depth === 0 && lines[i-1].includes('}, []);')) break;
    }
    i--; // Back up one since loop will increment
    continue;
  }

  output.push(line);
}

content = output.join('\n');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Conversion complete! Processed training.tsx');
console.log('Note: Some complex multi-line ternaries may need manual review.');
