import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const shouldLoadVercelAnalytics =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('.vercel.app') ||
    import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS === 'true');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        {shouldLoadVercelAnalytics ? <Analytics /> : null}
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

