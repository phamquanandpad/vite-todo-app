import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#aa3bff',
          dark: '#c084fc',
          muted: 'rgba(170,59,255,0.1)',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#16171d',
          subtle: '#f4f3ec',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)',
      },
    },
  },
  darkMode: 'media',
  plugins: [],
} satisfies Config;
