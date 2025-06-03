/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blueMarine: '#001F54',
        sableClair: '#F4E9D8',
        orangeMorocain: '#FF6B00',
        blancCasse: '#FAFAFA',
        grisClair: '#EDEDED',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        numeric: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '84': '21rem',
        '88': '22rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};