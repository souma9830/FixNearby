import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Wrench, AlertTriangle, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const PredictiveMaintenance = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [model, setModel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppliances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/appliances');
      if (res.data?.success) {
        setAppliances(res.data.appliances || []);
      }
    } catch (err) {
      console.error('Failed to load appliances', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name) return showToast('Enter appliance name', 'warning');

    setSubmitting(true);
    try {
      const res = await api.post('/maintenance/appliances', {
        applianceName: name,
        category,
        modelNumber: model
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setName('');
        setModel('');
        setModalOpen(false);
        fetchAppliances();
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreventiveDispatch = async (id, name) => {
    try {
      const res = await api.post(`/maintenance/appliances/${id}/preventive-booking`);
      if (res.data?.success) {
        showToast(`Preventive servicing requested for ${name}!`, 'success');
        fetchAppliances();
      }
    } catch (err) {
      showToast('Servicing dispatch failed', 'error');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={14} />
            AI Predictive Equipment Lifecycle Tracker
          </div>
          <h2 className="text-2xl font-black text-white">Appliance Health & Preventive Servicing</h2>
          <p className="text-xs text-slate-400 mt-1">Track home equipment lifecycle health scores and schedule preventive servicing before failure</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md whitespace-nowrap"
        >
          <Plus size={14} />
          Register Appliance
        </button>
      </div>

      {appliances.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center">
          <Wrench size={32} className="mx-auto text-slate-600 mb-2" />
          <h3 className="font-bold text-white text-sm">No Home Equipment Registered</h3>
          <p className="text-xs text-slate-400 mt-1">Register your HVAC, Plumbing, or Electrical units for predictive health alerts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appliances.map((app) => {
            const isCritical = app.healthScore < 60;
            return (
              <div key={app._id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{app.applianceName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{app.category} {app.modelNumber && `| ${app.modelNumber}`}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                    isCritical ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    Health: {app.healthScore}%
                  </span>
                </div>

                {/* Health Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${app.healthScore}%` }}
                    className={`h-full transition-all ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span>Predicted Failure: {new Date(app.predictedFailureDate).toLocaleDateString()}</span>
                  <button
                    onClick={() => handlePreventiveDispatch(app._id, app.applianceName)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                  >
                    Dispatch Service
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="font-bold text-white text-sm">Register Equipment for Maintenance Tracking</h4>
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <input
              type="text"
              placeholder="Appliance Name (e.g. Living Room AC Unit)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none"
              >
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Appliance">Appliance</option>
              </select>
              <input
                type="text"
                placeholder="Model # (Optional)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">Save Equipment</button>
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenance;
