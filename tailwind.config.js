/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skool: {
          navy: '#05354d',
          gray: '#72787d',
          dark: '#191c1b',
          bg: '#e5e5e5',
          card: '#ffffff',
          school: '#1b6775',
          inclass: '#719b50',
          occasion: '#b71aba',
          danger: '#c94c4c',
          success: '#27845b',
          lightgray: '#d9d9d9',
          offwhite: '#f3f4f2',
          redsoft: '#f8c4c4',
        }
      },
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

