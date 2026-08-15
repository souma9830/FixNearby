
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const FallbackUI = ({ onRetry }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          An unexpected error occurred while rendering this view. Our engineering team has been notified.
        </p>

        <div className="flex justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default FallbackUI;
