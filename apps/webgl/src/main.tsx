import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from "react-router-dom";
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root') as Element).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
