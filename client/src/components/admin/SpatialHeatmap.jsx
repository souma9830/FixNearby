import { useState, useEffect , useCallback} from 'react';
import {  Flame, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const SpatialHeatmap = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [workerCount, setWorkerCount] = useState(0);
  const [demandCount, setDemandCount] = useState(0);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [radiusKm, setRadiusKm] = useState(10);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'HVAC Technician', 'Cleaner'];

  const fetchHeatmap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/heatmap');
      if (res.data?.success) {
        setHeatmapData(res.data.heatmap || []);
        setWorkerCount(res.data.workerCount || 0);
        setDemandCount(res.data.demandCount || 0);
        setSurgeMultiplier(res.data.surgeMultiplier || 1.0);
      }
    } catch (err) {
      showToast('Failed to load spatial heatmap data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const filteredPoints = heatmapData.filter(p => {
    if (filterCategory === 'All') return true;
    return (p.category || p.service || '').toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Flame size={14} className="animate-pulse" />
            Live Demand & Worker Density Overlay
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Spatial Demand Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial clustering comparing active worker availability against incoming booking requests
          </p>
        </div>
        <button
          onClick={fetchHeatmap}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Map Matrix
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Service Category Filter</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">Geofence Radius Range ({radiusKm} km)</label>
          <input
            type="range"
            min="1"
            max="50"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 font-bold">Surge Pricing Multiplier</span>
          <span className={`text-base font-black px-2.5 py-0.5 rounded-lg border ${
            surgeMultiplier > 1.0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {surgeMultiplier.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Canvas Simulated Spatial Heatmap Container */}
      <div className="relative w-full h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-6 shadow-inner">
        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none" />

        {/* Center Radar Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-blue-500/20 animate-ping pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full border border-emerald-500/10 pointer-events-none" />

        {/* Heatmap Point Renderers */}
        {filteredPoints.map((pt, idx) => {
          const topPct = Math.max(10, Math.min(90, 50 + (pt.lat - 17.3850) * 800));
          const leftPct = Math.max(10, Math.min(90, 50 + (pt.lng - 78.4867) * 800));
          const isWorker = pt.type === 'worker';

          return (
            <div
              key={pt.id || idx}
              style={{ top: `${topPct}%`, left: `${leftPct}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg transition-transform hover:scale-150 ${
                  isWorker
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30'
                    : 'bg-rose-500 text-white ring-4 ring-rose-500/30 animate-bounce'
                }`}
              >
                {isWorker ? 'W' : 'D'}
              </div>

              {/* Tooltip Overlay */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap z-30">
                <p className="font-bold text-white">{pt.name || pt.service || 'Node'}</p>
                <p className="text-[10px] text-slate-400">{isWorker ? `Category: ${pt.category}` : 'Customer Booking Request'}</p>
              </div>
            </div>
          );
        })}

        {/* Map Legend Bar */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
            Active Workers ({workerCount})
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm" />
            Pending Demand ({demandCount})
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpatialHeatmap;
