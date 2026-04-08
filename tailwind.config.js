/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ee',
          100: '#f9eed3',
          200: '#f2d9a2',
          300: '#e8be6a',
          400: '#dfa040',
          500: '#c9873a',
          600: '#b06a2f',
          700: '#8d5029',
          800: '#734028',
          900: '#5f3624',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#faf7ef',
          200: '#f5edd8',
          300: '#ecd9b4',
          400: '#e0c284',
          500: '#d4a85a',
        },
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/pew1.jpg')",
      },
    },
  },
  plugins: [],
}
