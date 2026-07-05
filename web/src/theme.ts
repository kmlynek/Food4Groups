import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#047857',
      dark: '#065f46',
      light: '#d1fae5',
    },
    secondary: {
      main: '#166534',
    },
    background: {
      default: '#f4f7f4',
      paper: '#ffffff',
    },
    success: {
      main: '#15803d',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {

    fontFamily: 'Inter, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e2e8e2',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});