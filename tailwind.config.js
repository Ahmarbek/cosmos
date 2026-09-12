/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        ink: '#04050A',
        smoke: 'rgba(234,234,242,0.62)',
        bone: '#EAEAF2',
        violet: '#7C5CFF',
        cyan: '#5BC8FF',
        ember: '#FFB877',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: { mega: '0.42em', wide2: '0.22em' },
      transitionTimingFunction: { cine: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};
