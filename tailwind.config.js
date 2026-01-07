/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: '#CCFF00',
        zinc: {
          850: '#1f1f22',
          950: '#09090b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
