import { createTheme, ThemeOptions } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

const themeOptions: ThemeOptions = {
  typography: {
    h1: {
      fontSize: '3rem',
    },
    h2: {
      fontSize: '2.5rem',
    },
    h3: {
      fontSize: '2rem',
    },
    h4: {
      fontSize: '1.75rem',
    },
    h5: {
      fontSize: '1.5rem',
    },
    h6: {
      fontSize: '1.25rem',
    },
    subtitle1: {
      fontSize: '0.9rem',
    },
    subtitle2: {
      fontSize: '0.8rem',
    },
  },
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
}

// A custom theme for this app
const themeLight = createTheme(themeOptions);
const themeDark = createTheme({
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    mode: 'dark',
  }
});

export const ThemeProvider = (props: { children?: React.ReactNode; }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => {
    if (prefersDarkMode) {
      return themeDark;
    }

    return themeLight;
  }, [prefersDarkMode]);

  return (
    <MuiThemeProvider {...props} theme={theme} />
  );
};