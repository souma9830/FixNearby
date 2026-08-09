import React from 'react';
import { AlertOctagon, Scale, ShieldCheck, FileText } from 'lucide-react';

const DisputeEscalationCard = ({ dispute }) => {
  if (!dispute) return null;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Arbitration Dispute #{dispute._id?.slice(-6)}</h4>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-full">
          {dispute.disputeStatus}
        </span>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <p><b>Reason:</b> {dispute.reasonCategory}</p>
        <p><b>Claimed Refund:</b> ${dispute.claimedRefundAmount}</p>
      </div>
    </div>
  );
};

export default DisputeEscalationCard;
