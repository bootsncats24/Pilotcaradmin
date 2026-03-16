import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createElectronAPIMock } from './api/electronMock';
import './index.css';

// Initialize Electron API mock before rendering
createElectronAPIMock();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
