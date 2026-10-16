/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        gearzo: {
          primary: '#1B5E20',
          'primary-dark': '#0D3311',
          'primary-light': '#388E3C',
          secondary: '#2E7D32',
          accent: '#FFB300',
          'accent-light': '#FFE082',
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          text: '#1A1A1A',
          'text-muted': '#6B7280',
          border: '#E5E7EB',
          error: '#DC2626',
          warning: '#F59E0B',
          success: '#16A34A',
          info: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
