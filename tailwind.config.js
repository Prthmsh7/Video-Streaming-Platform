/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New brand colors - WeTube Red theme
        'primary': '#E50914', // WeTube Red (Netflix-like)
        'primary-dark': '#B20710',
        'primary-light': '#FF1F1F',
        'secondary': '#FF4500', // Orange-Red highlight
        'secondary-dark': '#CC3700',
        'secondary-light': '#FF6A33',
        'accent': '#f59e0b', // Amber
        'accent-dark': '#d97706',

        // Dark theme colors
        'dark-bg': '#0a0a0f', // Very dark blue-black
        'dark-surface': '#1a1a2e', // Dark blue-purple
        'dark-card': '#16213e', // Darker blue
        'dark-hover': '#2a2d5a', // Purple-blue hover
        'dark-border': '#374151', // Gray border

        // Text colors
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(229, 9, 20, 0.3)',
        'glow-teal': '0 0 20px rgba(255, 69, 0, 0.3)',
      },
    },
  },
  plugins: [],
}