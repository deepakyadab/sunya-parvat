import React from 'react';
import ReactDOM from 'react-dom/client';
// Global tokens and base styles load first so component styles can refine them.
import './styles/global.css';
import './styles/motion.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
