export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#faf7f3',
          100: '#f5ede0',
          200: '#e8d9c3',
          300: '#d9c0a1',
          400: '#c8a47e',
          500: '#b8906a',
          600: '#a87d5a',
          700: '#8d674b',
          800: '#745641',
          900: '#5f4636',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#ccdbcc',
          300: '#a8c0a8',
          400: '#7ea07e',
          500: '#5d855d',
          600: '#496a49',
          700: '#3c553c',
          800: '#334633',
          900: '#2c3c2c',
        },
        terracotta: {
          50: '#fef5f3',
          100: '#fde8e4',
          200: '#fbd5cd',
          300: '#f7b6a8',
          400: '#f28d75',
          500: '#ec6a4c',
          600: '#db4d2e',
          700: '#b73d23',
          800: '#973521',
          900: '#7d3220',
        },
        moss: {
          50: '#f6f7f2',
          100: '#eaede0',
          200: '#d5dcc2',
          300: '#b8c49a',
          400: '#9caa75',
          500: '#7d8c5a',
          600: '#616f47',
          700: '#4c5738',
          800: '#404831',
          900: '#383e2c',
        },
      },
      borderRadius: {
        'organic': '2rem',
        'organic-lg': '3rem',
      },
      fontFamily: {
        'organic': ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'flow': 'flow 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
