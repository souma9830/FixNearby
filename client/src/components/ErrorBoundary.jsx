import React from 'react';

const MAX_RETRIES = 3;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const sanitizedMsg = String(error?.message || error).replace(/[^\w\s\-]/gi, '');
    console.error('[Global ErrorBoundary Caught Exception]:', sanitizedMsg, errorInfo);

    this.setState({ errorInfo });

    // Send error report to backend logging telemetry
    if (typeof fetch === 'function') {
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message || String(error),
          stack: error?.stack || '',
          componentStack: errorInfo?.componentStack || '',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      }).catch((err) => console.error('Failed to transmit UI error telemetry:', err));
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    if (retryCount < MAX_RETRIES) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1,
      }));
    }
  };

  handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleResetApp = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const { retryCount, error } = this.state;
      const { fallback } = this.props;

      // Custom Fallback Support
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleRetry);
        }
        return fallback;
      }

      const canRetry = retryCount < MAX_RETRIES;

      return (
        <div className="min-h-[60vh] bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              We encountered an unexpected rendering error. Your session data remains safe.
            </p>

            {error?.message && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl mb-4 border border-rose-200 dark:border-rose-900/50 break-words text-left">
                {error.message}
              </p>
            )}

            {retryCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 font-semibold">
                Retry attempt {retryCount} of {MAX_RETRIES}
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-md active:scale-95 text-sm"
                >
                  Try Again
                </button>
              )}

              <button
                onClick={this.handleGoHome}
                className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm active:scale-95"
              >
                Return to Homepage
              </button>

              <button
                onClick={this.handleHardReload}
                className="w-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-6 rounded-xl transition text-xs"
              >
                Reload Page
              </button>

              <button
                onClick={this.handleResetApp}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline mt-1"
              >
                Clear Cache & Reset Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
