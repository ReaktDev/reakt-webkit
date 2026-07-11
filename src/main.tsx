import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SiteConfigProvider } from './context/SiteConfigContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SiteConfigProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SiteConfigProvider>
  </React.StrictMode>
);
