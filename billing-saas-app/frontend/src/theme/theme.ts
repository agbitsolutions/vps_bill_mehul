import { createTheme } from '@mui/material/styles';

// 🎨 Billing SaaS Design Language (v1.0)
// Color System: Clarity + Trust
export const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#305CDE', // Primary Blue - Main CTAs, Active states, Links
      light: '#5A80E8',
      dark: '#1E3A9F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280', // Muted Text for secondary content
      light: '#9CA3AF',
      dark: '#4B5563',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626', // Error - Failed, Overdue
      light: '#EF4444',
      dark: '#B91C1C',
    },
    warning: {
      main: '#F59E0B', // Warning - Pending, Due soon
      light: '#FBBF24',
      dark: '#D97706',
    },
    success: {
      main: '#16A34A', // Success - Paid, Completed
      light: '#22C55E',
      dark: '#15803D',
    },
    info: {
      main: '#305CDE', // Info - Tips, Notes (same as primary)
      light: '#5A80E8',
      dark: '#1E3A9F',
    },
    background: {
      default: '#F8F9FA', // Light gray background (Play Store style)
      paper: '#FFFFFF', // Card / Surface
    },
    text: {
      primary: '#0F172A', // Primary Text
      secondary: '#6B7280', // Muted Text
      disabled: '#9CA3AF',
    },
    divider: '#E6E9F0', // Border / Divider
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '1.75rem', // 28px - Page Title
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0F172A',
    },
    h2: {
      fontSize: '1.5rem', // 24px - Page Title
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0F172A',
    },
    h3: {
      fontSize: '1.25rem', // 20px - Section Title
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0F172A',
    },
    h4: {
      fontSize: '1.125rem', // 18px - Section Title
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0F172A',
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    subtitle1: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    subtitle2: {
      fontSize: '0.875rem', // 14px - Table Header
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body1: {
      fontSize: '0.9375rem', // 15px - Body Text
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body2: {
      fontSize: '0.875rem', // 14px - Body Text
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      textTransform: 'none',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.8125rem', // 13px - Metadata
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#6B7280',
    },
  },
  shape: {
    borderRadius: 8, // Default for buttons and inputs
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    // ... continuing with Material-UI's default shadows
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Buttons: 8px
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          height: '40px',
          padding: '0 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: '44px',
          fontSize: '0.9375rem',
        },
        containedPrimary: {
          backgroundColor: '#305CDE',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1E3A9F',
          },
        },
        outlinedPrimary: {
          borderColor: '#305CDE',
          color: '#305CDE',
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: '#1E3A9F',
            backgroundColor: 'rgba(48, 92, 222, 0.04)',
          },
        },
        containedError: {
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B91C1C',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Premium Play Store style (24px)
          border: 'none',
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', // Softer, more premium shadow
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Inputs: 8px
            '& fieldset': {
              borderColor: '#E6E9F0',
            },
            '&:hover fieldset': {
              borderColor: '#305CDE',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#305CDE',
              borderWidth: '1px',
              boxShadow: '0 0 0 3px rgba(48, 92, 222, 0.15)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Cards: 12px
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16, // Modals: 16px
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          color: '#0F172A',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #E6E9F0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E6E9F0',
          background: '#FFFFFF',
        },
      },
    },
  },
});

// Dark theme variant for future use
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
    },
  },
  // ... rest of dark theme configuration
});
