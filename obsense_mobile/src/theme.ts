export const Colors = {
  // Brand - OBSENSE Theme Colors (matching website)
  primary: '#3B82F6', // Blue (primary brand color dari website)
  primaryLight: '#DBEAFE',
  primaryDark: '#2563EB',
  
  secondary: '#10B981', // Green (secondary)
  secondaryLight: '#D1FAE5',
  secondaryDark: '#059669',

  // Tertiary
  tertiary: '#8B5CF6', // Purple (untuk accent)
  tertiaryLight: '#EDE9FE',
  
  teal: '#14B8A6', // Teal (untuk variasi)
  tealLight: '#CCFBF1', // Teal light
  purple: '#8B5CF6', // Purple alias

  // Sidebar color (matching website dark sidebar)
  sidebarDark: '#1E293B', // Dark navy blue
  sidebarActive: '#2563EB', // Active menu item color

  // Semantics
  success: '#10B981', // Green
  successLight: '#D1FAE5',
  danger: '#EF4444', // Red
  dangerLight: '#FEE2E2',
  warning: '#F59E0B', // Orange/amber
  warningLight: '#FEF3C7',
  info: '#3B82F6', // Blue
  infoLight: '#DBEAFE',

  // Neutrals
  white: '#FFFFFF',
  background: '#F9FAFB', // Slight gray background matching website
  backgroundDark: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderFocus: '#3B82F6', // Changed to primary blue

  // Text
  textPrimary: '#111827', // Darker text
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Gradient Colors
  gradientStart: '#3B82F6', // Blue
  gradientMid: '#8B5CF6',   // Purple
  gradientEnd: '#10B981',   // Green
  gradientLight: '#F9FAFB',

  // Badge colors (from website)
  badgeRed: '#EF4444',
  badgeRedLight: '#FEE2E2',
  badgeOrange: '#F97316',
  badgeOrangeLight: '#FFEDD5',
  badgeYellow: '#EAB308',
  badgeYellowLight: '#FEF9C3',
  badgeGreen: '#10B981',
  badgeGreenLight: '#D1FAE5',
  badgeBlue: '#3B82F6',
  badgeBlueLight: '#DBEAFE',

  // Misc
  overlay: 'rgba(17, 24, 39, 0.5)',
  shadow: '#000000',
  sunday: '#EF4444',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
