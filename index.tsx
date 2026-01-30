import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // FIX: Construct the URL using window.location.origin to ensure the Service Worker
    // is requested from the same domain the app is running on.
    // This prevents "The origin of the provided scriptURL... does not match" errors.
    const swUrl = new URL('sw.js', window.location.origin).href;

    navigator.serviceWorker.register(swUrl).then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);