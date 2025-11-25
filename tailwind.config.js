/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Terminal Design System Colors
        terminal: {
          bg: '#0A0E14',       // Deep navy-black background
          panel: '#0F1419',    // Panel background
          border: '#1C2127',   // Dark borders
        },
        text: {
          primary: '#F8F8F2',    // Cream white text
          secondary: '#B4B8C5',  // Light gray text
        },
        accent: {
          yellow: '#FFD866',     // Warm yellow accent
          // Legacy orange accent (keep for gradual migration)
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        discipline: {
          swim: '#00D4FF',       // Cyan for swim
          bike: '#FF6B35',       // Coral for bike
          run: '#4ECDC4',        // Turquoise for run
        },
        // Legacy colors (keep for gradual migration)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Courier New', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}