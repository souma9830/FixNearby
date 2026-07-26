import React, { useEffect, useState, useCallback } from 'react';

const GEOFENCE_RADIUS_METERS = 500;

function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GeofenceTracker({ bookingId, workerId, targetLat, targetLng, onCheckedIn }) {
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setDistance(haversineDistanceMeters(latitude, longitude, targetLat, targetLng));
      },
      err => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [targetLat, targetLng]);

  const handleStartJob = useCallback(async () => {
    if (!position) return;
    setIsCheckingIn(true);
    setError(null);

    try {
      const res = await fetch('/api/telemetry/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, workerId, lat: position.lat, lng: position.lng })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Check-in failed.');
        return;
      }

      setCheckedIn(true);
      if (onCheckedIn) onCheckedIn(data.telemetry);
    } catch (err) {
      setError('Network error during check-in.');
    } finally {
      setIsCheckingIn(false);
    }
  }, [bookingId, workerId, position, onCheckedIn]);

  const withinGeofence = distance !== null && distance <= GEOFENCE_RADIUS_METERS;

  return (
    <div className="geofence-tracker">
      {error && <p className="geofence-error">{error}</p>}

      {distance !== null && (
        <p className="geofence-distance">
          {withinGeofence
            ? `You are within range (${Math.round(distance)}m from job site).`
            : `${Math.round(distance)}m away — move within ${GEOFENCE_RADIUS_METERS}m to start.`}
        </p>
      )}

      <button
        type="button"
        className="geofence-start-btn"
        disabled={!withinGeofence || isCheckingIn || checkedIn}
        onClick={handleStartJob}
      >
        {checkedIn ? 'Job Started' : isCheckingIn ? 'Checking in...' : 'Start Job'}
      </button>
    </div>
  );
}