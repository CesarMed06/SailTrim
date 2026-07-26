/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f4f7',
          100: '#c3e5ec',
          200: '#9bd3de',
          300: '#72c1d0',
          400: '#4eb0c2',
          500: '#2a9fb4',
          600: '#1a7d8f',
          700: '#0e5c6b',
          800: '#073d48',
          900: '#032129',
          950: '#011319',
        },
        navy: {
          50: '#e8edf3',
          100: '#c5d1e1',
          200: '#9eb3cc',
          300: '#7795b7',
          400: '#5077a2',
          500: '#2a5a8d',
          600: '#1e4371',
          700: '#142d55',
          800: '#0b1a3a',
          900: '#040c1f',
          950: '#010612',
        },
        sail: {
          50: '#fefefe',
          100: '#fcfcfc',
          200: '#fafaf9',
          300: '#f7f7f5',
          400: '#f0f0ec',
          500: '#e8e6e0',
          600: '#d4d0c4',
          700: '#b8b2a0',
          800: '#8c8778',
          900: '#5c5850',
        },
        wind: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
        alert: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
