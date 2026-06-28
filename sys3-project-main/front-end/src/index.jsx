import React from 'react';    // core react lib
import ReactDOM from 'react-dom/client';  // rendering the actual page
import './index.css';          // global styles
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));    // takes the root from index.html and tells react where the app goes

// renders the App component into the root div
root.render(    
  <React.StrictMode>             
    <App />
  </React.StrictMode>
);// strict happens only in dev


// file that index.html loads
// start react and puts app on the page