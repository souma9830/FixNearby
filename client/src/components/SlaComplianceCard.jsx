
import { ShieldCheck, AlertTriangle, Clock, Award } from 'lucide-react';

const SlaComplianceCard = ({ complianceRate = 98.5, totalJobs = 45, violations = 1, avgResponseTime = 14 }) => {
  const getBadgeColor = (rate) => {
    if (rate >= 95) return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/50';
    if (rate >= 85) return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/50';
    return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800/50';
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">SLA Guarantee Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">2026-08</span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeColor(complianceRate)}`}>
            {complianceRate}% Compliant
          </span>
        </div>
      </div>


      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Response Avg</p>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {avgResponseTime}m
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Serviced</p>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-1">
            <Award className="w-3.5 h-3.5 text-slate-400" /> {totalJobs}
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Violations</p>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${violations > 0 ? 'text-amber-500' : 'text-slate-400'}`} /> {violations}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlaComplianceCard;
