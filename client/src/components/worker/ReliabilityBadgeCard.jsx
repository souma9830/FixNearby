import React, { useState, useEffect } from 'react';
import { fetchReliabilityScore } from '../../services/reliabilityService';

export default function ReliabilityBadgeCard({ workerId }) {
  const [reliability, setReliability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    fetchReliabilityScore(workerId)
      .then((res) => {
        if (res.success) setReliability(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) return <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">Loading reliability...</div>;
  if (!reliability) return null;

  const tierColors = {
    Gold: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
    Silver: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    Bronze: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300',
    Probation: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700 flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Reliability Score</h4>
          <span className={`px-3 py-0.5 text-xs font-bold rounded-full border ${tierColors[reliability.reliabilityTier]}`}>
            {reliability.reliabilityTier} Tier
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Completed: {reliability.completedBookingsCount} | Cancellations: {reliability.canceledBookingsCount} ({reliability.lateCancellationsCount} late)
        </p>
      </div>

      <div className="text-right">
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          {reliability.reliabilityIndexScore}<span className="text-sm text-gray-400">/100</span>
        </div>
        <span className="text-xs text-gray-400">Dispatch Priority x{reliability.dispatchPenaltyMultiplier}</span>
      </div>
    </div>
  );
}
