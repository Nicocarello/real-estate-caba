// ============================================================================
// MUI 5 Custom Theme Configuration
// Implements typography scale, spacing unit (8px), and component styleOverrides
// ============================================================================

import { createTheme } from '@mui/material/styles';
import { primitives, semanticTokens } from './tokens';

export const appTheme = createTheme({
  spacing: 8,
  shape: {
    borderRadius: primitives.radiusMd,
  },
  palette: {
    mode: 'light',
    primary: {
      main: semanticTokens.palette.primary,
      light: primitives.blue500,
      dark: semanticTokens.palette.primaryHover,
      contrastText: '#FFFFFF',
    },
    success: {
      main: semanticTokens.palette.success,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: semanticTokens.palette.warning,
      contrastText: '#FFFFFF',
    },
    error: {
      main: semanticTokens.palette.error,
      contrastText: '#FFFFFF',
    },
    background: {
      default: semanticTokens.palette.backgroundDefault,
      paper: semanticTokens.palette.backgroundPaper,
    },
    text: {
      primary: semanticTokens.palette.textPrimary,
      secondary: semanticTokens.palette.textSecondary,
      disabled: semanticTokens.palette.textMuted,
    },
    divider: semanticTokens.palette.borderSubtle,
  },
  typography: {
    fontFamily: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: semanticTokens.palette.textPrimary,
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: semanticTokens.palette.textPrimary,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      color: semanticTokens.palette.textPrimary,
    },
    subtitle1: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      color: semanticTokens.palette.textSecondary,
    },
    body1: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      color: semanticTokens.palette.textPrimary,
    },
    body2: {
      fontSize: '0.8125rem', // 13px
      fontWeight: 400,
      lineHeight: 1.45,
      color: semanticTokens.palette.textSecondary,
    },
    caption: {
      fontSize: '0.6875rem', // 11px
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: semanticTokens.palette.textSecondary,
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: semanticTokens.palette.textSecondary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: semanticTokens.palette.backgroundDefault,
          color: semanticTokens.palette.textPrimary,
          margin: 0,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${semanticTokens.palette.borderSubtle}`,
          borderRadius: primitives.radiusMd,
          boxShadow: semanticTokens.shadows.card,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: primitives.radiusSm,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 18px',
          transition: 'all 0.15s ease-in-out',
        },
        contained: {
          backgroundColor: semanticTokens.palette.primary,
          '&:hover': {
            backgroundColor: semanticTokens.palette.primaryHover,
          },
        },
        outlined: {
          borderColor: semanticTokens.palette.borderSubtle,
          color: semanticTokens.palette.textPrimary,
          '&:hover': {
            borderColor: semanticTokens.palette.primary,
            backgroundColor: semanticTokens.palette.primarySurface,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: primitives.radiusSm,
          fontSize: '0.875rem',
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: semanticTokens.palette.borderSubtle,
            transition: 'border-color 0.15s ease',
          },
          '&:hover fieldset': {
            borderColor: primitives.slate400,
          },
          '&.Mui-focused fieldset': {
            borderColor: semanticTokens.palette.primary,
            borderWidth: 2,
          },
        },
        input: {
          padding: '10px 14px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: primitives.radiusSm,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: semanticTokens.palette.borderSubtle,
        },
      },
    },
  },
});
