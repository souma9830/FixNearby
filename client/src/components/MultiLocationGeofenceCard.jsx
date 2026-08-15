

const MultiLocationGeofenceCard = ({ geofenceConfig }) => {
  if (!geofenceConfig) return null;

  return (
    <div className="p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Location Coverage</h3>
          <p className="text-xs text-gray-500">Primary City: {geofenceConfig.primaryCity || 'Not Specified'}</p>
        </div>
        <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
          Max {geofenceConfig.maxTravelRadiusKm || 50} km
        </span>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Service Zones</h4>
        {geofenceConfig.serviceZones && geofenceConfig.serviceZones.length > 0 ? (
          geofenceConfig.serviceZones.map((zone, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="font-medium text-sm text-gray-900 dark:text-white">{zone.zoneName}</span>
                <p className="text-xs text-gray-500">Radius: {zone.radiusKm} km</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${zone.activeStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {zone.activeStatus ? 'Active' : 'Disabled'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">No additional service zones configured.</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
        <span>Travel Surcharge: ${geofenceConfig.travelSurchargePerKm || 0}/km beyond zone</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live GPS Monitoring Active</span>
      </div>
    </div>
  );
};

export default MultiLocationGeofenceCard;
