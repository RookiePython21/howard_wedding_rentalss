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
      keyframes: {
        'flash-gold': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(201, 135, 58, 0.55), 0 10px 25px -5px rgba(201, 135, 58, 0.35)',
            transform: 'translateY(0)',
          },
          '50%': {
            boxShadow: '0 0 0 12px rgba(201, 135, 58, 0), 0 18px 35px -5px rgba(201, 135, 58, 0.55)',
            transform: 'translateY(-3px)',
          },
        },
        'pulse-ring-gold': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 4px #c9873a, 0 0 0 10px rgba(201, 135, 58, 0.28), 0 0 24px rgba(201, 135, 58, 0.55)',
            backgroundColor: 'rgba(201, 135, 58, 0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 0 4px #c9873a, 0 0 0 20px rgba(201, 135, 58, 0.0), 0 0 55px rgba(201, 135, 58, 1)',
            backgroundColor: 'rgba(201, 135, 58, 0.32)',
          },
        },
        'halo-ping': {
          '0%':   { transform: 'scale(0.9)', opacity: '0.75' },
          '80%':  { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        'pulse-seat': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(201, 135, 58, 0)',
            borderColor: '#d1d5db',
          },
          '50%': {
            boxShadow: '0 0 0 5px rgba(201, 135, 58, 0.35)',
            borderColor: '#c9873a',
          },
        },
        'announce': {
          '0%':         { opacity: '0', transform: 'translateY(40px) scale(0.94)' },
          '18%, 82%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%':       { opacity: '0', transform: 'translateY(-30px) scale(1.03)' },
        },
        'announce-backdrop': {
          '0%, 100%': { opacity: '0' },
          '18%, 82%': { opacity: '1' },
        },
        'hint-bounce-down': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%':       { transform: 'translateX(-50%) translateY(8px)' },
        },
        'hint-bounce-up': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%':       { transform: 'translateX(-50%) translateY(-8px)' },
        },
      },
      animation: {
        'flash-gold': 'flash-gold 1.4s ease-in-out infinite',
        'pulse-ring-gold': 'pulse-ring-gold 1.5s ease-in-out infinite',
        'halo-ping': 'halo-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
        'pulse-seat': 'pulse-seat 1.6s ease-in-out infinite',
        'announce': 'announce 2.2s ease-in-out forwards',
        'announce-backdrop': 'announce-backdrop 2.2s ease-in-out forwards',
        'hint-bounce-down': 'hint-bounce-down 1.1s ease-in-out infinite',
        'hint-bounce-up':   'hint-bounce-up 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
