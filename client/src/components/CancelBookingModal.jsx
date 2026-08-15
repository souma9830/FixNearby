import { useState } from 'react';
import {  AlertTriangle } from 'lucide-react';
import FocusTrap from './FocusTrap';

const CANCEL_REASONS = [
  'Change of plans',
  'Found another service provider',
  'Booking was a duplicate',
  'Pricing too high',
  'Scheduling conflict',
  'No longer need this service',
  'Other',
];

export default function CancelBookingModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(finalReason.trim());
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Cancel booking"
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please let us know why you&rsquo;re cancelling.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {CANCEL_REASONS.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  reason === r
                    ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    reason === r
                      ? 'border-red-500'
                      : 'border-slate-300 dark:border-slate-500'
                  }`}
                >
                  {reason === r && <div className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
                {r}
              </label>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe your reason..."
              className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              rows={3}
            />
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || submitting}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Cancelling\u2026' : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
