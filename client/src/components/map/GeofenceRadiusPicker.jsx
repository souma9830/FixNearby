import React, { useState } from 'react';
import { MapPin, Navigation, Save, CheckCircle, AlertCircle } from 'lucide-react';
import geofenceService from '../../services/geofenceService';

const GeofenceRadiusPicker = ({ currentRadius = 10, currentAddress = '', onSaved }) => {
  const [radius, setRadius] = useState(currentRadius);
  const [address, setAddress] = useState(currentAddress);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await geofenceService.updateGeofence({ radiusKm: radius, centerAddress: address });
      setMsg('Service radius updated successfully!');
      if (onSaved) onSaved({ radiusKm: radius, centerAddress: address });
    } catch (err) {
      setMsg('Failed to update service radius.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
          <Navigation className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Geofence & Operational Radius</h3>
          <p className="text-xs text-slate-500">Define how far you are willing to travel for client service bookings.</p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Base Location Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Downtown Central Plaza, Sector 4"
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm dark:text-white"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Coverage Radius (KM)</label>
            <span className="text-sm font-extrabold text-blue-600">{radius} KM</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving Geofence...' : 'Save Service Boundary'}
        </button>
      </form>
    </div>
  );
};

export default GeofenceRadiusPicker;
