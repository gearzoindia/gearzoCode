export const colors = {
  primary: '#1B5E20',
  primaryDark: '#0D3311',
  primaryLight: '#388E3C',
  secondary: '#2E7D32',
  accent: '#FFB300',
  accentLight: '#FFE082',
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  warning: '#F59E0B',
  success: '#16A34A',
  info: '#2563EB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 30,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
};

export default theme;
