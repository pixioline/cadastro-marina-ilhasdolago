import React from 'react';
import ReactDOM from 'react-dom/client';
import './carbon.scss'; // Carbon seletivo (~150 KB vs 925 KB do styles.css completo)
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
