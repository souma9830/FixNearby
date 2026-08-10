import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, CheckCircle } from 'lucide-react';
import geofenceService from '../../services/geofenceService';

const ServiceZoneMap = () => {
  const [radiusKm, setRadiusKm] = useState(15);
  const [address, setAddress] = useState('123 Main Street, Boston MA');
  const [maxTravelTime, setMaxTravelTime] = useState(45);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchGeofence();
  }, []);

  const fetchGeofence = async () => {
    try {
      const data = await geofenceService.getMyGeofence();
      if (data.geofence) {
        setRadiusKm(data.geofence.radiusKm || 15);
        setAddress(data.geofence.centerAddress || '123 Main Street, Boston MA');
        setMaxTravelTime(data.geofence.maxTravelTimeMinutes || 45);
        setIsActive(data.geofence.isActive !== false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await geofenceService.updateGeofence({
        radiusKm: Number(radiusKm),
        centerAddress: address,
        maxTravelTimeMinutes: Number(maxTravelTime),
        isActive
      });
      setMsg('Operational geofence service radius updated successfully!');
    } catch (err) {
      setMsg('Failed to update service zone radius.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Compass className="w-7 h-7 text-cyan-200" /> Service Coverage & Geofence Manager
          </h1>
          <p className="text-xs text-cyan-100 mt-1">Configure your active dispatch radius and travel time limits.</p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-2xl flex items-center gap-2 border border-emerald-200 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">Center Base Address</label>
          <div className="flex gap-2">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="flex-1 p-2.5 rounded-xl border text-sm dark:bg-slate-900" placeholder="Street Address, City, State" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Coverage Radius: {radiusKm} KM</label>
            <input type="range" min="3" max="50" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className="w-full accent-blue-600" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Max One-Way Travel (Minutes)</label>
            <input type="number" min="15" max="120" value={maxTravelTime} onChange={(e) => setMaxTravelTime(e.target.value)} className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-900" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="geofenceActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
          <label htmlFor="geofenceActive" className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Service Zone Dispatch</label>
        </div>

        <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition">
          {saving ? 'Updating Geofence...' : 'Save Geofence Settings'}
        </button>
      </form>
    </div>
  );
};

export default ServiceZoneMap;
