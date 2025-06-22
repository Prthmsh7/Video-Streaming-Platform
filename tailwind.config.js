/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New brand colors - Purple/Teal theme
        'primary': '#6366f1', // Indigo
        'primary-dark': '#4f46e5',
        'primary-light': '#818cf8',
        'secondary': '#14b8a6', // Teal
        'secondary-dark': '#0f766e',
        'secondary-light': '#5eead4',
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
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
}