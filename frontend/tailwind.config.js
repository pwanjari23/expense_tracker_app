/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",           // Scans your HTML & JS files
    "./public/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        tealSoft: {
          50:  '#f0fdfa',   // very light
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#34d399',
          500: '#14b8a6',   // main button color
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
}