// ============================================================================
// Design System Tokens (Token Architecture: Primitive & Semantic)
// Following frontend-designer skill principles
// ============================================================================

export const primitives = {
  // Brand & Accent Colors
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue900: '#1E3A8A',

  // Neutrals (Slate Scale)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // Semantics / Feedback
  green50: '#F0FDF4',
  green600: '#16A34A',
  green700: '#15803D',
  amber50: '#FFFBEB',
  amber600: '#D97706',
  red50: '#FEF2F2',
  red600: '#DC2626',

  // Geometry
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 9999,
} as const;

export const semanticTokens = {
  palette: {
    primary: primitives.blue600,
    primaryHover: primitives.blue700,
    primarySurface: primitives.blue50,
    primaryBorder: primitives.blue100,

    backgroundDefault: primitives.slate50,
    backgroundPaper: '#FFFFFF',
    backgroundSubtle: primitives.slate100,

    textPrimary: primitives.slate900,
    textSecondary: primitives.slate500,
    textMuted: primitives.slate400,

    borderSubtle: primitives.slate200,
    borderStrong: primitives.slate300,

    success: primitives.green600,
    successSurface: primitives.green50,
    warning: primitives.amber600,
    warningSurface: primitives.amber50,
    error: primitives.red600,
    errorSurface: primitives.red50,
  },
  shadows: {
    card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
    cardHover: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
  },
} as const;
