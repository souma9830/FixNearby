
import {  Navigation } from 'lucide-react';

const MultiLocationGeofenceManager = ({ zones = [] }) => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Multi-Location Geofence Coverage</h3>
        </div>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
          + Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zones.map((zone, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{zone.zoneName}</p>
              <p className="text-xs text-slate-500">Coverage Radius: {zone.radiusKm} km</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiLocationGeofenceManager;
