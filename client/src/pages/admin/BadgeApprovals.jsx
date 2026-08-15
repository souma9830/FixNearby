import  { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getPendingBadgeRequests, reviewBadgeRequest } from '../../services/badgeService';

const BadgeApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingBadgeRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await reviewBadgeRequest(id, status, notes[id] || '');
      fetchRequests();
    } catch (err) {
      console.error('Review action failed', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> Badge Verification Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review worker accreditation documents and assign verification badges.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading pending accreditation requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
          No pending badge verification requests at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-full">{req.badgeType}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-2">{req.worker?.name || 'Worker'}</h3>
                  <p className="text-xs text-slate-400">Document No: {req.documentNumber || 'N/A'}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-bold">
                  <Clock className="w-3.5 h-3.5" /> Pending Audit
                </span>
              </div>

              <input
                type="text"
                placeholder="Audit notes or rejection reason..."
                value={notes[req._id] || ''}
                onChange={(e) => setNotes({ ...notes, [req._id]: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs dark:bg-slate-900"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleReview(req._id, 'rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleReview(req._id, 'approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Badge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeApprovals;
