/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
    transitionProperty: {
      'bg': 'background-color',
      'colors': 'color, background-color',
    }
  },
  },
  plugins: [],
  darkMode: 'class',
}

