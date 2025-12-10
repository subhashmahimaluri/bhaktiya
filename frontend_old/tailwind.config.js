// tailwind.config.js - Scoped configuration for Home page only
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Only scan Home page and its specific components
  content: [
    './pages/index.tsx',
    './components/home/**/*.{js,ts,jsx,tsx}',
    './components/LazyImage.tsx',
  ],
  // Prefix all Tailwind classes with 'tw-' to avoid conflicts with Bootstrap
  prefix: 'tw-',
  // Important selector to ensure Tailwind styles take precedence within Home page
  important: '#home-page-root',
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#004e89',
        background: '#f8f9fa',
        dark: '#1a1a1a',
      },
      spacing: {
        '25': '6.25rem',
      },
      boxShadow: {
        '1': '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
        '2': '0 0.5rem 1rem rgba(0,0,0,0.15)',
      },
      screens: {
        'xs': '480px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1400px',
      },
    },
  },
  plugins: [],
  // Disable preflight to avoid global style reset that would affect other pages
  corePlugins: {
    preflight: false,
  },
};
