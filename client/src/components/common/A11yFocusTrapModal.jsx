import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const A11yFocusTrapModal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl w-full max-w-lg relative outline-none space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 id="modal-title" className="text-lg font-black text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <X size={18} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default A11yFocusTrapModal;
