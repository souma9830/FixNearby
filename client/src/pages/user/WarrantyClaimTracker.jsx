import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, FileCheck, CheckCircle2, Clock } from 'lucide-react';
import { submitWarrantyClaim } from '../../services/warrantyClaimService';

const WarrantyClaimTracker = ({ bookingId, originalWorkerId }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workmanship Defect');
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState(null);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitWarrantyClaim({
        bookingId,
        originalWorkerId,
        claimDescription: description,
        claimCategory: category,
        jobCompletionDate: new Date()
      });
      setClaim(res.data);
      setMsg('Warranty claim submitted under 30-Day FixNearby Satisfaction Guarantee!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Claim filing failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-200" /> 30-Day Service Guarantee & Warranty
          </h1>
          <p className="text-xs text-emerald-100 mt-1">Free inspection & repair re-dispatch if work fails within 30 days.</p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl flex items-center gap-2 border border-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {msg}
        </div>
      )}

      {!claim ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">File Warranty Re-Service Claim</h2>

          <div>
            <label className="block text-xs font-bold mb-1">Issue Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-900">
              <option value="Workmanship Defect">Workmanship Defect</option>
              <option value="Part Failure">Part Failure</option>
              <option value="Recurring Leak">Recurring Leak</option>
              <option value="Electrical Short">Electrical Short</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Claim Details (Min 15 characters)</label>
            <textarea required minLength={15} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-900" placeholder="Describe what failed or needs re-servicing..." />
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition">
            {submitting ? 'Filing Claim...' : 'File Guarantee Claim'}
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Status: {claim.claimStatus}</span>
            <span className="text-xs text-slate-400">30-Day Guarantee</span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{claim.claimCategory}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">{claim.claimDescription}</p>
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimTracker;
