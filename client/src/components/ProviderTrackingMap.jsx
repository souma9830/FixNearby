import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, Navigation, Clock, MapPin, RefreshCw } from 'lucide-react';
import { getSocket } from '../utils/socketClient';

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const clampedA = Math.min(1, Math.max(0, a));
  return R * (2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA)));
};

const ProviderTrackingMap = ({
  bookingId,
  customerLocation = { lat: 17.4065, lng: 78.4772 },
  initialProviderLocation = { lat: 17.4350, lng: 78.3772 },
  providerName = 'Service Professional',
  providerPhone = '',
  providerAvatar = '',
  status = 'En Route',
  onEtaUpdate,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const providerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [, setProviderLocation] = useState(initialProviderLocation);
  const [distanceKm, setDistanceKm] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [isSimulating, setIsSimulating] = useState(false);
  const [, setLastUpdated] = useState(new Date());

  // 1. Dynamic Leaflet Loader
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.id = 'leaflet-css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.id = 'leaflet-js';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById('leaflet-css');
      const js = document.getElementById('leaflet-js');
      if (css) document.head.removeChild(css);
      if (js) document.body.removeChild(js);
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, { zoomControl: false }).setView(
        [customerLocation.lat, customerLocation.lng],
        13
      );

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 20,
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Customer Destination Marker
      const customerIcon = window.L.divIcon({
        className: 'customer-destination-marker',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg shadow-lg font-bold text-[10px] whitespace-nowrap flex items-center gap-1 border border-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>Your Location</span>
            </div>
            <div class="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-sm"></div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });
      window.L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon }).addTo(map);

      // Provider En-Route Marker
      const providerIcon = window.L.divIcon({
        className: 'provider-live-marker',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="px-2.5 py-1 bg-blue-600 text-white rounded-lg shadow-xl font-bold text-[10px] whitespace-nowrap flex items-center gap-1.5 border border-blue-300 ring-4 ring-blue-200">
              <span>🚗 ${providerName.split(' ')[0]}</span>
            </div>
            <div class="w-2.5 h-2.5 bg-blue-600 rotate-45 -mt-1 shadow-md"></div>
          </div>
        `,
        iconSize: [90, 30],
        iconAnchor: [45, 30],
      });

      providerMarkerRef.current = window.L.marker(
        [initialProviderLocation.lat, initialProviderLocation.lng],
        { icon: providerIcon }
      ).addTo(map);

      // Route Line
      routeLineRef.current = window.L.polyline(
        [
          [initialProviderLocation.lat, initialProviderLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ],
        { color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '8, 8' }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, customerLocation, initialProviderLocation, providerName]);

  // 3. Compute Distance & ETA
  const updateMetrics = useCallback(
    (plat, plng) => {
      const dist = getDistanceKm(plat, plng, customerLocation.lat, customerLocation.lng);
      setDistanceKm(dist.toFixed(1));
      // Average city drive speed ~ 25 km/h
      const estEta = Math.max(1, Math.round((dist / 25) * 60));
      setEtaMinutes(estEta);
      if (onEtaUpdate) onEtaUpdate(estEta);
      setLastUpdated(new Date());
    },
    [customerLocation, onEtaUpdate]
  );

  // 4. Update Provider Location & Map
  const handleLocationUpdate = useCallback(
    (lat, lng) => {
      setProviderLocation({ lat, lng });
      updateMetrics(lat, lng);

      if (mapInstanceRef.current && providerMarkerRef.current) {
        providerMarkerRef.current.setLatLng([lat, lng]);

        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [lat, lng],
            [customerLocation.lat, customerLocation.lng],
          ]);
        }

        const bounds = window.L.latLngBounds([
          [lat, lng],
          [customerLocation.lat, customerLocation.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
      }
    },
    [customerLocation, updateMetrics]
  );

  // 5. WebSocket Integration
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (bookingId) {
      socket.emit('join_booking', { bookingId });
    }

    const onLocationUpdate = (data) => {
      if (!data) return;
      if (data.bookingId && String(data.bookingId) !== String(bookingId)) return;

      const lat = data.lat || data.latitude;
      const lng = data.lng || data.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        handleLocationUpdate(lat, lng);
      }
    };

    socket.on('provider:location_update', onLocationUpdate);
    socket.on('tracking:location', onLocationUpdate);

    return () => {
      socket.off('provider:location_update', onLocationUpdate);
      socket.off('tracking:location', onLocationUpdate);
      if (bookingId) {
        socket.emit('leave_booking', { bookingId });
      }
    };
  }, [bookingId, handleLocationUpdate]);

  // 6. Simulated Driver Movement (Fallback for Demo Mode)
  useEffect(() => {
    if (!isSimulating) return;

    let step = 0;
    const totalSteps = 20;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const curLat = initialProviderLocation.lat + (customerLocation.lat - initialProviderLocation.lat) * progress;
      const curLng = initialProviderLocation.lng + (customerLocation.lng - initialProviderLocation.lng) * progress;

      handleLocationUpdate(curLat, curLng);

      if (step >= totalSteps) {
        setIsSimulating(false);
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, customerLocation, initialProviderLocation, handleLocationUpdate]);

  return (
    <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
      {/* Top Real-Time Status Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 shrink-0">
              <Navigation className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">{status}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h3 className="text-lg font-bold text-white">{providerName} is on the way</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Live ETA</p>
                <p className="text-sm font-extrabold text-amber-400">{etaMinutes} mins</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Distance</p>
                <p className="text-sm font-extrabold text-blue-400">{distanceKm} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[400px] bg-slate-100">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20">
            <span className="text-xs font-semibold text-slate-400">Loading Live GPS Map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Demo Simulation Control Button */}
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            onClick={() => setIsSimulating((prev) => !prev)}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSimulating ? 'Simulating GPS...' : 'Simulate Movement'}</span>
          </button>
        </div>
      </div>

      {/* Provider Details & Contact Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0">
            {providerAvatar ? (
              <img src={providerAvatar} alt={providerName} className="h-full w-full object-cover" />
            ) : (
              providerName.charAt(0)
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{providerName}</h4>
            <p className="text-[11px] text-slate-500">Live GPS tracking active (Pings every 5s)</p>
          </div>
        </div>

        {providerPhone && (
          <a
            href={`tel:${providerPhone}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
          >
            <Phone className="h-4 w-4" />
            <span>Call Provider</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default ProviderTrackingMap;
