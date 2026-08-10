import "./i18n/index.js";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

if (import.meta.env.PROD && 'performance' in window && 'getEntriesByType' in performance) {
  import('./utils/performance.js').then(({ reportWebVitals }) => {
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            reportWebVitals({ name: 'LCP', value: entry.startTime, rating: entry.startTime > 2500 ? 'poor' : 'good', delta: 0 });
          }
          if (entry.entryType === 'first-input') {
            reportWebVitals({ name: 'FID', value: entry.processingStart - entry.startTime, rating: 'needs-improvement', delta: 0 });
          }
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
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
  </React.StrictMode>,
)
