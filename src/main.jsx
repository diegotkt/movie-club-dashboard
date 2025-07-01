import React from 'react';
import ReactDOM from 'react-dom/client';
import ImdbStyleDashboard from './components/ImdbStyleDashboard';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ImdbStyleDashboard />
  </React.StrictMode>
);
