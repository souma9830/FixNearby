import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import badgeService from '../../services/badgeService';

const BadgeApprovalPortal = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchBadgeRequests();
  }, []);

  const fetchBadgeRequests = async () => {
    setLoading(true);
    try {
      const data = await badgeService.getPendingBadgeRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    setActionLoading(true);
    setMsg('');
    try {
      await badgeService.reviewBadgeRequest(requestId, status);
      setMsg(`Badge request marked as ${status}.`);
      fetchBadgeRequests();
    } catch (err) {
      setMsg('Failed to update request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center py-16">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <ShieldCheck className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Worker Skill Badge Verification Portal</h1>
          <p className="text-sm text-slate-500">Audit submitted licenses, background checks, and certifications.</p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-blue-50 text-blue-700 font-bold rounded-2xl">
          {msg}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No pending badge requests to audit.</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {requests.map((req) => (
              <div key={req._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
                    {req.badgeType}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2">{req.worker?.name || 'Worker'}</h3>
                  <p className="text-xs text-slate-500">Doc Ref: {req.documentNumber || 'N/A'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReview(req._id, 'approved')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Badge
                  </button>
                  <button
                    onClick={() => handleReview(req._id, 'rejected')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeApprovalPortal;
