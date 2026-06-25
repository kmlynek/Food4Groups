import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { theme } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ThemeProvider udostępnia konfigurację Material UI całej aplikacji. */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline resetuje podstawowe style przeglądarki i ujednolica wygląd MUI. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);