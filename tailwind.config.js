/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel palette — the identity of Seedling
        seed: {
          purple: '#EDE9FF',
          'purple-mid': '#C4B5FD',
          'purple-dark': '#5B21B6',
          pink:    '#FCE7F3',
          'pink-mid':  '#F9A8D4',
          'pink-dark': '#831843',
          yellow:  '#FEF9C3',
          'yellow-mid':  '#FDE68A',
          'yellow-dark': '#78350F',
          blue:    '#DBEAFE',
          'blue-mid':  '#93C5FD',
          'blue-dark': '#1E3A8A',
          bg:      '#F8F7FF',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
