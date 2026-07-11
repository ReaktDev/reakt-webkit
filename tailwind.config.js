/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', '"Nunito Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#08101b',
          800: '#0f172a',
          700: '#172a44',
          600: '#23395f',
        },
        accent: {
          50: '#e7f0ff',
          500: '#4f8cff',
          600: '#2b67e8',
          700: '#1f50bf',
        },
      },
      boxShadow: {
        card: '0 14px 35px -18px rgba(20, 27, 45, 0.65)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 500ms ease-out',
      },
    },
  },
  plugins: [],
};
