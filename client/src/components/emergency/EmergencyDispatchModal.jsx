import React, { useState } from 'react';
import { AlertOctagon, Flame, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import emergencyService from '../../services/emergencyService';

const EmergencyDispatchModal = ({ isOpen, onClose }) => {
  const [issueType, setIssueType] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await emergencyService.broadcastEmergencyAlert({ issueType, description, location });
      setSuccessAlert(data.alert);
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency broadcast failed. Call 911 for immediate danger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-rose-200 dark:border-rose-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-xl">
            <Flame className="w-6 h-6 animate-bounce" />
            <span>Hyperlocal Emergency Dispatch</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successAlert ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Broadcast Live!</h3>
            <p className="text-sm text-slate-500">
              Alert dispatched to {successAlert.notifiedWorkersCount || 5} nearby active workers within 5km radius.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Emergency Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium text-sm text-slate-900 dark:text-white"
              >
                <option value="plumbing">Pipe Burst / Massive Leak</option>
                <option value="electrical">Power Outage / Short Circuit</option>
                <option value="locksmith">Door Lock Outage / Security</option>
                <option value="gas">Gas Smell / Appliance Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Location Address</label>
              <input
                type="text"
                placeholder="Full address where urgent worker is needed"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Brief Hazard Note</label>
              <textarea
                rows="2"
                placeholder="Describe urgent issue (e.g. kitchen flooding fast)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
            >
              <ShieldAlert className="w-5 h-5" />
              {loading ? 'Broadcasting Alert...' : 'BROADCAST EMERGENCY ALERT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmergencyDispatchModal;
