import React from 'react';
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

const BookingCard = ({ booking, onAction }) => {
  if (!booking) return null;

  const isPending = booking.status === 'Pending';
  const isExpired = booking.status === 'Expired';

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-900 dark:text-white text-base">{booking.service}</h4>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          isPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          isExpired ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(booking.scheduledTime).toLocaleString()}</span>
        </div>
        {booking.price && (
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span>Amount: ₹{booking.price}</span>
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>Awaiting worker confirmation (Auto-expires in 60m)</span>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
