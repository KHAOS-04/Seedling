/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#EDE9FF',
          100: '#D4CCFF',
          200: '#C4B5FD',
          400: '#A78BFA',
          600: '#7C3AED',
          700: '#5B21B6',
          900: '#2E1065',
        },
        pink: {
          50:  '#FCE7F3',
          100: '#FBCFE8',
          200: '#F9A8D4',
          400: '#F472B6',
          700: '#BE185D',
          900: '#831843',
        },
        yellow: {
          50:  '#FEF9C3',
          100: '#FEF08A',
          200: '#FDE68A',
          400: '#FACC15',
          700: '#A16207',
          900: '#78350F',
        },
        blue: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}