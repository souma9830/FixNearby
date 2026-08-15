import { useState, useEffect , useCallback} from 'react';
import { Scale, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const DisputeArbitrationPanel = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const [notes, setNotes] = useState('');
  const [splitRefund] = useState(0);
  const [splitPayout] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/disputes');
      if (res.data?.success) {
        setDisputes(res.data.disputes || []);
        if (res.data.disputes?.length > 0 && !selectedDispute) {
          setSelectedDispute(res.data.disputes[0]);
        }
      }
    } catch (err) {
      showToast('Failed to load dispute arbitration queue.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDispute, showToast]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async (action) => {
    if (!selectedDispute) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/disputes/${selectedDispute._id}/resolve`, {
        action,
        refundAmount: splitRefund,
        payoutAmount: splitPayout,
        notes
      });
      if (res.data?.success) {
        showToast(`Dispute #${selectedDispute._id} arbitrated via "${action}"!`, 'success');
        setNotes('');
        setSelectedDispute(null);
        fetchDisputes();
      }
    } catch (err) {
      showToast(err.message || 'Dispute arbitration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-12 text-center border border-slate-800">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
        <p className="font-semibold text-sm">Loading arbitration queue...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Scale size={14} />
            Support Escrow Arbitration Center
          </div>
          <h2 className="text-2xl font-black text-white">Dispute Arbitration Hub</h2>
          <p className="text-xs text-slate-400 mt-1">Review evidence attachments, inspect claims, and issue atomic wallet refunds or worker payouts</p>
        </div>
        <button
          onClick={fetchDisputes}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={36} />
          <h3 className="font-bold text-lg text-white">Arbitration Queue Clear</h3>
          <p className="text-xs text-slate-400 mt-1">No open customer-worker disputes pending review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Sidebar */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Open Disputes ({disputes.length})</p>
            {disputes.map((d) => {
              const isSelected = selectedDispute?._id === d._id;
              return (
                <div
                  key={d._id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg ring-1 ring-blue-500'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-extrabold text-blue-400">#{d._id.slice(-6)}</span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                      {d.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{d.reasonCategory?.replace('_', ' ')}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{d.description}</p>
                </div>
              );
            })}
          </div>

          {/* Selected Dispute Detail & Action Center */}
          {selectedDispute && (
            <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-blue-400 font-extrabold">ID: {selectedDispute._id}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedDispute.reasonCategory?.toUpperCase()}</h3>
                </div>
                <span className="text-2xl font-black text-emerald-400">${selectedDispute.claimAmount || 0}</span>
              </div>

              {/* Claim Parties */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold block">Customer (Claimant)</span>
                  <p className="font-bold text-white mt-1">{selectedDispute.raisedBy?.name || 'Customer'}</p>
                  <p className="text-slate-500">{selectedDispute.raisedBy?.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Worker (Respondent)</span>
                  <p className="font-bold text-white mt-1">{selectedDispute.againstWorker?.name || 'Worker'}</p>
                  <p className="text-slate-500">{selectedDispute.againstWorker?.category}</p>
                </div>
              </div>

              {/* Claim Description & Attachments */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Claim Details</h4>
                <p className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedDispute.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-400">Arbitration Decision Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide resolution justification for customer and worker..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleResolve('refund')}
                    disabled={submitting}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                  >
                    Full Customer Refund
                  </button>
                  <button
                    onClick={() => handleResolve('payout')}
                    disabled={submitting}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                  >
                    Worker Escrow Release
                  </button>
                  <button
                    onClick={() => handleResolve('reject')}
                    disabled={submitting}
                    className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisputeArbitrationPanel;
