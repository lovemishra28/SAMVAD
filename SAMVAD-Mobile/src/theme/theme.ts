// mobile/src/theme/theme.ts
// Central design system — change values here to propagate everywhere.

export const colors = {
  primary: '#00A4CE',
  primaryDark: '#008AAD',
  background: '#F6F6FE',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  badgeSuccessBg: '#DCFCE7',
  badgeWarningBg: '#FEF3C7',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const;

export const typography = {
  header: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  micro: {
    fontSize: 11,
    color: colors.textSecondary,
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  button: {
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};