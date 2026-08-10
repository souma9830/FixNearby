import "./i18n/index.js";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

/**
 * Production Performance Monitoring Observers (#896)
 * Safely registers PerformanceObserver for LCP, FID, and CLS web vitals metrics.
 */
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return null;
  }

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals Metric] ${entry.name} (${entry.entryType}):`, Math.round(entry.startTime), 'ms');
        }
      }
    });

    const entryTypes = ['largest-contentful-paint', 'first-input', 'layout-shift'];
    entryTypes.forEach((type) => {
      try {
        if (typeof PerformanceObserver.supportedEntryTypes !== 'undefined' &&
            PerformanceObserver.supportedEntryTypes.includes(type)) {
          observer.observe({ type, buffered: true });
        }
      } catch (e) {
        // Silently skip unsupported entry type in older browser engines
      }
    });

    return observer;
  } catch (err) {
    console.warn('[PerformanceObserver] Observer initialization deferred:', err);
    return null;
  }
};

/**
 * Entry Point Initialization Helper (#896)
 * Bootstraps and mounts the React application root with wrapped top-level providers.
 */
export const initApp = (container = typeof document !== 'undefined' ? document.getElementById('root') : null) => {
  if (!container) {
    console.error('[initApp] Target DOM container element #root not found');
    return null;
  }

  // Initialize web vitals performance monitoring observers
  initPerformanceMonitoring();

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <LocationProvider>
            <ThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ThemeProvider>
          </LocationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  return root;
};

// Automatic bootstrap when executed in browser document environment
if (typeof document !== 'undefined' && document.getElementById('root')) {
  initApp();
}
