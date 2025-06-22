/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'youtube-red': '#FF0000',
        'dark-bg': '#0f0f0f',
        'dark-secondary': '#272727',
        'dark-hover': '#3f3f3f',
      },
      fontFamily: {
        'roboto': ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}