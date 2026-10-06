import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './theme.css';
import './global.css';
import App from './App.js';
import { registerSW } from 'virtual:pwa-register';
import { showSnackbar } from './ui/Snackbar.js';

const updateSW = registerSW({
  onNeedRefresh() {
    showSnackbar({
      message: 'Versi baru tersedia',
      actionLabel: 'Muat Ulang',
      duration: 10000,
      onAction: () => {
        updateSW(true);
      },
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
