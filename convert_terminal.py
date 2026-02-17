#!/usr/bin/env python3
"""
Convert training.tsx to terminal-only design by removing all conditional styling.
"""

import re
import sys

def convert_to_terminal_only(content):
    """Remove all useTerminal conditional patterns and keep only terminal styles."""

    # Pattern 1: className with ternary in block form
    # className={
    #   useTerminal
    #     ? "terminal-style"
    #     : "legacy-style"
    # }
    pattern1 = r'className=\{\s*useTerminal\s*\?\s*(["\'])([^"\']+)\1\s*:\s*(["\'])[^"\']+\3\s*\}'
    content = re.sub(pattern1, r'className="\2"', content)

    # Pattern 2: className with inline ternary
    # className={useTerminal ? "terminal-style" : "legacy-style"}
    pattern2 = r'className=\{useTerminal\s*\?\s*(["\'])([^"\']+)\1\s*:\s*(["\'])[^"\']+\3\}'
    content = re.sub(pattern2, r'className="\2"', content)

    # Pattern 3: style with ternary
    # style={useTerminal ? { borderRadius: 0 } : undefined}
    pattern3 = r'style=\{useTerminal\s*\?\s*(\{[^}]+\})\s*:\s*undefined\}'
    content = re.sub(pattern3, r'style={\1}', content)

    # Pattern 4: Text content with ternary (simple strings)
    # {useTerminal ? "TERMINAL" : "Legacy"}
    pattern4 = r'\{useTerminal\s*\?\s*(["\'])([^"\']+)\1\s*:\s*(["\'])[^"\']+\3\}'
    content = re.sub(pattern4, r'"\2"', content)

    # Pattern 5: Complex multi-line className ternary
    pattern5 = r'className=\{\s*\n\s*useTerminal\s*\n\s*\?\s*(["\'])([^"\']+)\1\s*\n\s*:\s*(["\'])[^"\']+\3\s*\n\s*\}'
    content = re.sub(pattern5, r'className="\2"', content, flags=re.MULTILINE)

    # Pattern 6: Inline ternary inside template literals or expressions
    # `${useTerminal ? "MI" : "miles"}`
    pattern6 = r'\$\{useTerminal\s*\?\s*(["\'])([^"\']+)\1\s*:\s*(["\'])[^"\']+\3\}'
    content = re.sub(pattern6, r'\2', content)

    # Pattern 7: Complex ternary expressions in JSX
    # {useTerminal
    #   ? expression1
    #   : expression2}

    return content

def main():
    file_path = "/Users/danhoeller/Website Development/kineticbrandpartners/RacePrep/app/(tabs)/training.tsx"

    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Convert to terminal-only
    converted = convert_to_terminal_only(content)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(converted)

    print(f"Converted {file_path} to terminal-only design")

if __name__ == "__main__":
    main()
