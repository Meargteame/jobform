/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['"Hanken Grotesk"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: '#0B0B0C',
        paper: '#F2F1EC',
        'paper-2': '#E7E6DF',
        signal: '#13E884',
        muted: '#6B6A63',
        'muted-dark': '#8E8D85',
        line: 'rgba(11, 11, 12, 0.13)',
        'line-dark': 'rgba(242, 241, 236, 0.12)',
        primary: {
          50: '#F2F1EC',
          100: '#E7E6DF',
          200: '#cbd5e1',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#13E884',
          600: '#0ca85f',
          700: '#064e3b',
          800: '#1b1b1d',
          900: '#0B0B0C',
          950: '#050506',
        }
      },
      borderRadius: {
        'input': '8px',
        'card': '12px',
        'hero': '48px',
      }
    },
  },
  plugins: [],
}
