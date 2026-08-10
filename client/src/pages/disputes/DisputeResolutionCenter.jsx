import React, { useState } from 'react';
import { ShieldAlert, FilePlus, Scale, CheckCircle2, AlertOctagon } from 'lucide-react';
import { fileDisputeEscalation, attachDisputeEvidence } from '../../services/disputeEscalationService';

const DisputeResolutionCenter = ({ bookingId, respondentId }) => {
  const [reason, setReason] = useState('Incomplete Work');
  const [claimAmount, setClaimAmount] = useState('');
  const [statement, setDetailedStatement] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dispute, setDispute] = useState(null);
  const [msg, setMsg] = useState('');

  const handleFileDispute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fileDisputeEscalation({
        bookingId,
        respondentId,
        disputeReason: reason,
        claimAmountRequested: Number(claimAmount),
        detailedStatement: statement
      });
      setDispute(res.data);
      setMsg('Dispute filed successfully and submitted to arbitration panel.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Filing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!dispute || !evidenceUrl) return;
    try {
      const res = await attachDisputeEvidence(dispute._id, {
        evidenceType: 'Photo',
        fileUrl: evidenceUrl,
        description: 'Supplementary photo evidence'
      });
      setDispute(res.data);
      setEvidenceUrl('');
      setMsg('Evidence attached to active dispute log.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-200" /> Resolution & Arbitration Center
          </h1>
          <p className="text-xs text-rose-100 mt-1">Escalate booking disputes with evidence tracking and admin mediation.</p>
        </div>
        <Scale className="w-12 h-12 opacity-30" />
      </div>

      {msg && (
        <div className="p-4 bg-rose-50 text-rose-800 font-bold rounded-2xl flex items-center gap-2 border border-rose-200 text-sm">
          <AlertOctagon className="w-5 h-5 text-rose-600" /> {msg}
        </div>
      )}

      {!dispute ? (
        <form onSubmit={handleFileDispute} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">File Escalation Claim</h2>
          
          <div>
            <label className="block text-xs font-bold mb-1">Dispute Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-sm">
              <option value="Incomplete Work">Incomplete Work</option>
              <option value="Property Damage">Property Damage</option>
              <option value="Unsatisfactory Quality">Unsatisfactory Quality</option>
              <option value="Billing Discrepancy">Billing Discrepancy</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Requested Refund / Claim Amount ($)</label>
            <input type="number" required min="1" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-sm" placeholder="150" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Detailed Statement (Min 20 characters)</label>
            <textarea required minLength={20} rows={4} value={statement} onChange={(e) => setDetailedStatement(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-sm" placeholder="Provide thorough details regarding the service issue..." />
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition">
            {submitting ? 'Submitting Claim...' : 'File Official Dispute'}
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">Status: {dispute.escalationStatus}</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2">{dispute.disputeReason}</h3>
            </div>
            <span className="text-xl font-black text-rose-600">${dispute.claimAmountRequested}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">{dispute.detailedStatement}</p>

          <form onSubmit={handleAddEvidence} className="flex gap-2 pt-2">
            <input type="url" placeholder="Paste photo or document evidence URL..." value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className="flex-1 p-2 rounded-xl border text-xs dark:bg-slate-900" />
            <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1">
              <FilePlus className="w-3.5 h-3.5" /> Attach Evidence
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DisputeResolutionCenter;
