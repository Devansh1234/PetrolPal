/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Petrol Pal teal (primary). teal-700 = #0F766E
        pal: { 50: '#E7F3F1', 100: '#CCE7E3', 600: '#0D9488', 700: '#0F766E', 800: '#115E59' },
        vary: '#7C8DB5',
      },
    },
  },
  plugins: [],
};
