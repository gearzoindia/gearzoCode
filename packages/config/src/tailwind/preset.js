/**
 * NativeWind / Tailwind CSS Preset for GearZo applications.
 * Primary Brand Green: #1B5E20
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        gearzo: {
          primary: {
            DEFAULT: '#1B5E20', // Forest Green
            light: '#2E7D32',
            dark: '#0D3811',
            50: '#E8F5E9',
            100: '#C8E6C9',
            200: '#A5D6A7',
            300: '#81C784',
            400: '#66BB6A',
            500: '#4CAF50',
            600: '#43A047',
            700: '#388E3C',
            800: '#2E7D32',
            900: '#1B5E20',
          },
          secondary: {
            DEFAULT: '#0277BD', // Deep Sky Blue
            light: '#039BE5',
            dark: '#01579B',
            50: '#E1F5FE',
            100: '#B3E5FC',
            200: '#81D4FA',
            300: '#4FC3F7',
            400: '#29B6F6',
            500: '#03A9F4',
            600: '#039BE5',
            700: '#0288D1',
            800: '#0277BD',
            900: '#01579B',
          },
          accent: {
            DEFAULT: '#F57C00', // Amber Orange
            light: '#FF9800',
            dark: '#E65100',
            50: '#FFF3E0',
            100: '#FFE0B2',
            200: '#FFCC80',
            300: '#FFB74D',
            400: '#FFA726',
            500: '#FF9800',
            600: '#FB8C00',
            700: '#F57C00',
            800: '#EF6C00',
            900: '#E65100',
          },
          neutral: {
            50: '#F8F9FA',
            100: '#F1F3F5',
            200: '#E9ECEF',
            300: '#DEE2E6',
            400: '#CED4DA',
            500: '#ADB5BD',
            600: '#6C757D',
            700: '#495057',
            800: '#343A40',
            900: '#212529',
          },
          status: {
            success: '#2E7D32',
            warning: '#F57C00',
            error: '#C62828',
            info: '#0277BD',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
