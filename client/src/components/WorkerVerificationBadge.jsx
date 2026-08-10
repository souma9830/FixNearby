import React from 'react';
import { ShieldCheck, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

const WorkerVerificationBadge = ({ complianceStatus = 'UNVERIFIED', isIdentityVerified = false }) => {
  if (complianceStatus === 'FULLY_COMPLIANT' || (isIdentityVerified && complianceStatus !== 'UNVERIFIED')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified Pro
      </span>
    );
  }

  if (complianceStatus === 'PARTIALLY_COMPLIANT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Award className="w-3.5 h-3.5" />
        Basic Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
      <AlertTriangle className="w-3.5 h-3.5" />
      Pending Audit
    </span>
  );
};

export default WorkerVerificationBadge;
