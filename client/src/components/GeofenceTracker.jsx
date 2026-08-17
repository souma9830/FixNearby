import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Crosshair, Timer, LogIn, LogOut } from "lucide-react";
import {
  geofencedCheckIn,
  geofencedCheckOut,
} from "../services/telemetryService";
import { haversineDistanceMeters } from "../utils/geoUtils";

const GEOFENCE_RADIUS_M = 500;

const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  });

export const GeofenceTracker = ({ bookingId, targetCoordinates, onStatusChange }) => {
  const [position, setPosition] = useState(null);
  const [distanceM, setDistanceM] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [telemetry, setTelemetry] = useState(null);
  const timerRef = useRef(null);

  const inRange =
    distanceM !== null &&
    distanceM <= GEOFENCE_RADIUS_M;

  const locate = useCallback(async () => {
    setLocating(true);
    setLocError("");
    try {
      const pos = await getPosition();
      const coords = [pos.coords.longitude, pos.coords.latitude];
      setPosition(coords);
      if (targetCoordinates && targetCoordinates.length === 2) {
        setDistanceM(
          Math.round(
            haversineDistanceMeters(
              coords[0],
              coords[1],
              targetCoordinates[0],
              targetCoordinates[1]
            )
          )
        );
      }
    } catch (err) {
      setLocError(err.message || "Unable to fetch your location");
    } finally {
      setLocating(false);
    }
  }, [targetCoordinates]);

  useEffect(() => {
    locate();
  }, [locate]);

  const startTimer = () => {
    setElapsedSec(0);
    timerRef.current = setInterval(
      () => setElapsedSec((s) => s + 1),
      1000
    );
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCheckIn = async () => {
    setActing(true);
    setActionError("");
    try {
      const data = await geofencedCheckIn(bookingId, position);
      setCheckedIn(true);
      setTelemetry(data.telemetry);
      startTimer();
      if (onStatusChange) onStatusChange("checked_in", data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Check-in failed");
    } finally {
      setActing(false);
    }
  };

  const handleCheckOut = async () => {
    setActing(true);
    setActionError("");
    try {
      const data = await geofencedCheckOut(bookingId, position);
      setCheckedIn(false);
      setTelemetry(data.telemetry);
      if (timerRef.current) clearInterval(timerRef.current);
      if (onStatusChange) onStatusChange("checked_out", data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Check-out failed");
    } finally {
      setActing(false);
    }
  };

  const formatElapsed = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <MapPin className="h-5 w-5 text-[#0056D2]" />
          Geofenced Job Check-in
        </h3>
        <button
          onClick={locate}
          disabled={locating || checkedIn}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <Crosshair className="h-3.5 w-3.5" />
          {locating ? "Locating..." : "Refresh Location"}
        </button>
      </div>

      {locError && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {locError}
        </p>
      )}

      {position && (
        <div className="mt-4 space-y-3">
          {distanceM !== null && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Distance to job location
                </span>
                <span
                  className={`font-semibold ${
                    inRange ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {distanceM}m / {GEOFENCE_RADIUS_M}m
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    inRange ? "bg-green-500" : "bg-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(100, (distanceM / GEOFENCE_RADIUS_M) * 100)}%`,
                  }}
                />
              </div>
              <p
                className={`mt-1.5 text-xs ${
                  inRange ? "text-green-600" : "text-amber-600"
                }`}
              >
                {inRange
                  ? "You are inside the geofence — job can be started."
                  : `Move within ${GEOFENCE_RADIUS_M}m of the job location to start.`}
              </p>
            </div>
          )}

          {checkedIn && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <Timer className="h-4 w-4" />
              Job timer: {formatElapsed(elapsedSec)}
            </div>
          )}

          {actionError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {actionError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={!inRange || acting || checkedIn}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0056D2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogIn className="h-4 w-4" />
              {acting ? "Checking in..." : "Start Job"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!checkedIn || acting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogOut className="h-4 w-4" />
              {acting ? "Checking out..." : "Check-out"}
            </button>
          </div>

          {telemetry && (
            <p className="text-xs text-slate-500">
              Last verified distance: {telemetry.distanceFromTargetMeters}m
              {telemetry.durationMinutes > 0 &&
                ` · Duration: ${telemetry.durationMinutes} min`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GeofenceTracker;
