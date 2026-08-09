import React from 'react';
import { Shield, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const WarrantyBadge = ({ daysLeft = 30, status = 'ACTIVE' }) => {
  const isExpired = status === 'EXPIRED' || daysLeft <= 0;

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between ${isExpired ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-60' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'}`}>
      <div className="flex items-center space-x-3">
        <Shield className={`w-5 h-5 ${isExpired ? 'text-slate-400' : 'text-emerald-500'}`} />
        <div>
          <h4 className="font-bold text-sm">30-Day FixNearby Service Guarantee</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Covers free re-servicing for labor defects</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isExpired ? 'bg-slate-200 text-slate-600' : 'bg-emerald-500 text-white'}`}>
          {isExpired ? 'Expired' : `${daysLeft} Days Active`}
        </span>
      </div>
    </div>
  );
};

export default WarrantyBadge;
