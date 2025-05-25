import React from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import themeStore from './stores/ThemeStore';

const ThemeProviderWrapper = observer(({ children }) => {
  const theme = createTheme({
    palette: {
      mode: themeStore.mode,
      ...(themeStore.mode === 'dark'
        ? {
            background: {
              default: '#252736 !important',
              paper: '#252736 !important'
            },
            text: {
              primary: '#ffffff',
            },
          }
        : {
            background: {
              default: '#ffffff',
              paper: '#f9f9f9',
            },
            text: {
              primary: '#252736',
            },
          }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
});

export default ThemeProviderWrapper;
