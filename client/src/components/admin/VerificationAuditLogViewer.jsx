import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const VerificationAuditLogViewer = ({ workerId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!workerId) return;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/verification/audits/${workerId}`);
        setLogs(res.data.logs || []);
      } catch (err) {
        showToast('Failed to load verification audit logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [workerId]);

  if (loading) return <div className="p-4 text-slate-500">Loading audit history...</div>;
  if (!logs.length) return <div className="p-4 text-slate-500">No verification audit logs recorded yet.</div>;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <History className="h-4 w-4 text-blue-500" /> Verification Audit History
      </h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log._id} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {log.previousStatus} ➔ {log.newStatus}
              </span>
              <span className="text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Reviewed by: {log.reviewerId?.name || 'Admin'}
            </p>
            {log.notes && <p className="mt-0.5 italic text-slate-500">"{log.notes}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationAuditLogViewer;
