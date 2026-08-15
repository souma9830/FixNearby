import  { useState, useEffect , useCallback} from 'react';
import { addWorkerServiceZone, fetchWorkerServiceZones } from '../../services/zoneManagementService';

export default function MultiZoneCoveragePicker({ workerId }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    zoneName: 'Metropolitan Area',
    latitude: 40.7128,
    longitude: -74.006,
    serviceRadiusKm: 15,
    travelSurcharge: 10,
  });

  const loadZones = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await fetchWorkerServiceZones(workerId);
      if (res.success) setZones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workerId, setLoading]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addWorkerServiceZone({
        workerId,
        zoneName: formData.zoneName,
        centerCoordinates: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        travelSurcharge: Number(formData.travelSurcharge),
      });
      loadZones();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Multi-Zone Geofence Coverage</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zone Label</label>
          <input
            type="text"
            required
            value={formData.zoneName}
            onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Radius (km)</label>
          <input
            type="number"
            min="1"
            max="100"
            required
            value={formData.serviceRadiusKm}
            onChange={(e) => setFormData({ ...formData, serviceRadiusKm: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Center Latitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Center Longitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Travel Surcharge ($)</label>
          <input
            type="number"
            min="0"
            value={formData.travelSurcharge}
            onChange={(e) => setFormData({ ...formData, travelSurcharge: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow">
            Add Coverage Zone
          </button>
        </div>
      </form>

      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Configured Zones</h4>
        {loading ? <p className="text-sm text-gray-500">Loading zones...</p> : zones.length === 0 ? <p className="text-sm text-gray-500">No active coverage zones.</p> : (
          <div className="space-y-2">
            {zones.map((z) => (
              <div key={z._id} className="p-3 border rounded-lg flex justify-between dark:border-gray-700">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{z.zoneName}</span>
                  <p className="text-xs text-gray-500">Radius: {z.serviceRadiusKm} km | Surcharge: ${z.travelSurcharge}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
