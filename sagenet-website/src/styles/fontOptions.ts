// Alternative font options for SageNet - more personable yet professional

export const fontOptions = {
  // Option 1: Source Sans Pro - Humanist, friendly, highly readable
  sourceSans: {
    primary: "'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: "Source Sans Pro - Adobe's humanist sans-serif designed for UI. More friendly and approachable than Inter while maintaining excellent readability.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');"
  },

  // Option 2: Open Sans - Neutral, friendly, great for body text
  openSans: {
    primary: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: "Open Sans - Google's most popular font. Optimized for print, web, and mobile. Neutral characteristics with friendly appeal.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');"
  },

  // Option 3: Nunito Sans - Modern, rounded, friendly
  nunitoSans: {
    primary: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: "Nunito Sans - Rounded sans-serif that's modern and friendly. Great for brands that want to appear approachable and innovative.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200;0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;0,6..12,900;1,6..12,200;1,6..12,300;1,6..12,400;1,6..12,500;1,6..12,600;1,6..12,700;1,6..12,800;1,6..12,900&display=swap');"
  },

  // Option 4: DM Sans - Modern, slightly condensed, professional yet warm
  dmSans: {
    primary: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: "DM Sans - Low-contrast, geometric sans-serif. Modern and clean with subtle warmth. Popular for tech/SaaS companies.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100;0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,100;1,9..40,200;1,9..40,300;1,9..40,400;1,9..40,500;1,9..40,600;1,9..40,700;1,9..40,800;1,9..40,900&display=swap');"
  },

  // Option 5: Mixed approach - Friendly heading with professional body
  mixed: {
    primary: "'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // Body text
    heading: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // Headlines
    description: "Mixed approach - Nunito Sans for headings (friendly, approachable) with Source Sans Pro for body text (highly readable). Best of both worlds.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200;0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;0,6..12,900;1,6..12,200;1,6..12,300;1,6..12,400;1,6..12,500;1,6..12,600;1,6..12,700;1,6..12,800;1,6..12,900&display=swap');"
  },

  // Current Inter for comparison
  current: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    description: "Current Inter - Excellent for interfaces but can feel somewhat mechanical/technical. Great readability but less personality.",
    googleFontsImport: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');"
  }
};

// Recommended font option for SageNet
export const recommendedFontOption = fontOptions.sourceSans;

// Instructions for implementing:
/*
1. Add the Google Fonts import to GlobalStyles.tsx or index.html
2. Update the theme.ts file with the new font family
3. The fonts will automatically apply to all components using the theme
*/