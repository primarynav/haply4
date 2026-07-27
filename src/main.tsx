import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
  </>
);
