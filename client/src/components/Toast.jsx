
import useToast from '../hooks/useToast';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-slate-900/95 border-emerald-500/30 text-emerald-50';
      case 'error':
        return 'bg-slate-900/95 border-rose-500/30 text-rose-50';
      case 'warning':
        return 'bg-slate-900/95 border-amber-500/30 text-amber-50';
      default:
        return 'bg-slate-900/95 border-blue-500/30 text-blue-50';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 ${getTypeStyles(
            toast.type
          )}`}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 text-sm font-medium leading-5">
            {typeof toast.message === 'string' ? toast.message : String(toast.message || '')}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
