
import { Siren, Zap, Radio } from 'lucide-react';

const EmergencyDispatchBanner = ({ activeTicket, onTriggerSOS }) => {
  return (
    <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 text-white p-5 rounded-2xl shadow-2xl border border-rose-700/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 animate-pulse">
            <Siren className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-500 text-slate-950 font-black text-xs rounded uppercase tracking-wider">
                Priority 1
              </span>
              <h3 className="text-lg font-bold">24/7 Rapid Emergency Dispatch</h3>
            </div>
            <p className="text-xs text-rose-200 mt-1 max-w-xl">
              Burst pipes, electrical short circuits, or gas hazards? Broadcast instant high-priority SOS alert to closest certified emergency technicians within 15km.
            </p>
          </div>
        </div>

        <div>
          {activeTicket ? (
            <div className="px-4 py-2 bg-slate-900/80 border border-rose-500/40 rounded-xl text-xs flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Dispatch Active: <b>{activeTicket.dispatchStatus}</b> (ETA: {activeTicket.etaMinutes || 15}m)</span>
            </div>
          ) : (
            <button
              onClick={onTriggerSOS}
              className="w-full md:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              <Zap className="w-4 h-4 fill-current" /> Trigger SOS Dispatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyDispatchBanner;

