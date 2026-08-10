import { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const TerritoryManager = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(15);
  const [territoryName, setTerritoryName] = useState('Central Metro Zone');

  const handleSaveTerritory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/geofence', { territoryName, radiusKm: Number(radiusKm) });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast('Failed to update territory boundaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin size={14} />
            Geofenced Service Territory Manager
          </div>
          <h2 className="text-2xl font-black text-white">Interactive Operating Boundary Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Define custom operating polygon service zones to prevent travel delay cancellations</p>
        </div>
      </div>

      {/* Simulated Map View */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 h-64 flex items-center justify-center overflow-hidden">
        <div className="text-center space-y-2">
          <Navigation className="text-emerald-400 mx-auto animate-pulse" size={32} />
          <h4 className="text-xs font-bold text-white">Interactive Polygon Map Boundary Simulator</h4>
          <span className="text-[10px] text-slate-400 font-mono">Radius: {radiusKm} km | Zone: {territoryName}</span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveTerritory} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Territory Name</label>
            <input
              type="text"
              value={territoryName}
              onChange={(e) => setTerritoryName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Operating Radius ({radiusKm} km)</label>
            <input
              type="range"
              min={5}
              max={50}
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          Save Territory Geofence Boundary
        </button>
      </form>
    </div>
  );
};

export default TerritoryManager;
