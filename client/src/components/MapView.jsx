import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

const getWorkerCoords = (worker) => {
  if (worker.mockOffset) {
    return [worker.mockOffset.lat, worker.mockOffset.lon];
  }
  if (worker.location && worker.location.coordinates && worker.location.coordinates.length === 2) {
    // GeoJSON format is [longitude, latitude]
    return [worker.location.coordinates[1], worker.location.coordinates[0]];
  }
  if (worker.coordinates && typeof worker.coordinates.lat === 'number' && typeof worker.coordinates.lon === 'number') {
    return [worker.coordinates.lat, worker.coordinates.lon];
  }
  return null;
};

const MapView = ({ workers = [], selectedWorkerId, onMarkerClick }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const coverageCircleRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeWorker, setActiveWorker] = useState(null);

  // Sync activeWorker when selectedWorkerId changes
  useEffect(() => {
    if (selectedWorkerId) {
      const found = workers.find(w => String(w._id || w.id) === String(selectedWorkerId));
      if (found) setActiveWorker(found);
    }
  }, [selectedWorkerId, workers]);

  // Dynamic Leaflet Loader
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    cssLink.id = "leaflet-css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.id = "leaflet-js";
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("leaflet-css");
      const js = document.getElementById("leaflet-js");
      if (css) document.head.removeChild(css);
      if (js) document.body.removeChild(js);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center default Hyderabad
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([17.4065, 78.4772], 12);

      // Voyager elegant light gray basemap
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Zoom controller to bottom right
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = window.L.featureGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Update Markers, Coverage Radius, & Clustering
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !markersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (coverageCircleRef.current) {
      coverageCircleRef.current.remove();
      coverageCircleRef.current = null;
    }

    // 1. Filter workers with valid coords
    const workersWithCoords = workers
      .map(w => ({ worker: w, coords: getWorkerCoords(w) }))
      .filter(w => w.coords !== null);

    if (workersWithCoords.length === 0) return;

    // 2. Proximity-Based Clustering (0.015 degrees distance)
    const CLUSTER_DISTANCE = 0.015;
    const clusters = [];

    workersWithCoords.forEach(({ worker, coords }) => {
      let addedToCluster = false;
      
      for (let cluster of clusters) {
        const center = cluster.center;
        const latDiff = Math.abs(center[0] - coords[0]);
        const lonDiff = Math.abs(center[1] - coords[1]);
        
        if (latDiff < CLUSTER_DISTANCE && lonDiff < CLUSTER_DISTANCE) {
          cluster.workers.push(worker);
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          center: coords,
          workers: [worker]
        });
      }
    });

    // 3. Render markers & clusters
    clusters.forEach(cluster => {
      if (cluster.workers.length === 1) {
        const w = cluster.workers[0];
        const isSelected = activeWorker && String(w._id || w.id) === String(activeWorker._id || activeWorker.id);
        
        const price = w.price ? (w.price.toString().startsWith('$') ? w.price : `$${w.price}`) : '$40';
        
        const icon = window.L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="relative flex flex-col items-center group transition-all duration-200 cursor-pointer ${
              isSelected ? 'scale-125 z-[999]' : 'z-10 hover:scale-110'
            }">
              <div class="px-2.5 py-1 bg-slate-900 border ${
                isSelected ? 'border-blue-500 bg-blue-600 ring-4 ring-blue-300' : 'border-slate-800'
              } text-white rounded-xl shadow-md flex items-center gap-1 font-bold text-[10px] whitespace-nowrap">
                ${w.verified ? '<span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>' : ''}
                <span>${price}</span>
              </div>
              <div class="w-2 h-2 bg-slate-900 ${isSelected ? 'bg-blue-600' : ''} rotate-45 -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });

        const marker = window.L.marker(cluster.center, { icon });
        marker.on('click', () => {
          setActiveWorker(w);
          if (onMarkerClick) onMarkerClick(w._id || w.id);
        });
        marker.addTo(markersGroup);
      } else {
        const count = cluster.workers.length;
        const containsSelected = activeWorker && cluster.workers.some(w => String(w._id || w.id) === String(activeWorker._id || activeWorker.id));

        const icon = window.L.divIcon({
          className: 'custom-cluster-marker',
          html: `
            <div class="w-9 h-9 rounded-full ${
              containsSelected ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-200' : 'bg-slate-900 border-slate-700'
            } text-white font-extrabold flex items-center justify-center border-2 shadow-lg text-xs cursor-pointer hover:scale-110 transition-all">
              ${count}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = window.L.marker(cluster.center, { icon });
        marker.on('click', () => {
          map.setView(cluster.center, map.getZoom() + 1.5);
        });
        marker.addTo(markersGroup);
      }
    });

    // 4. Draw Service Coverage Radius for activeWorker
    if (activeWorker) {
      const activeCoords = getWorkerCoords(activeWorker);
      if (activeCoords) {
        const coverageKm = activeWorker.serviceCoverage || 10;
        coverageCircleRef.current = window.L.circle(activeCoords, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          radius: coverageKm * 1000, // convert km to meters
          weight: 2,
          dashArray: '5, 5',
        }).addTo(map);
      }
    }

    // 5. Fit bounds if no activeWorker
    if (!activeWorker) {
      try {
        const bounds = markersGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [leafletLoaded, workers, activeWorker]);

  return (
    <div className="w-full h-full min-h-[500px] relative bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200/80">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 z-20">
          <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading Leaflet Map...</span>
        </div>
      )}
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Active Worker Preview Card */}
      {activeWorker && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 transition-all duration-300">
          <button
            type="button"
            onClick={() => setActiveWorker(null)}
            className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close worker preview"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-blue-200">
              {activeWorker.profilePicture ? (
                <img src={activeWorker.profilePicture} alt={activeWorker.name} className="h-full w-full object-cover" />
              ) : (
                activeWorker.name?.charAt(0) || 'W'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-bold text-slate-900 truncate">{activeWorker.name}</h4>
                {activeWorker.verified && (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-xs font-semibold text-blue-600 truncate">{activeWorker.profession || activeWorker.category}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{activeWorker.rating || 4.5}</span>
              <span className="text-slate-400">({activeWorker.completedJobs || 12})</span>
            </div>
            <div className="text-right font-bold text-slate-900">
              {activeWorker.price ? (String(activeWorker.price).startsWith('$') ? activeWorker.price : `$${activeWorker.price}/hr`) : '$40/hr'}
            </div>
            <div className="col-span-2 text-slate-500 flex items-center gap-1 text-[11px]">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span>Service Radius: {activeWorker.serviceCoverage || 10} km</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/worker/${activeWorker._id || activeWorker.id}`)}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span>View Full Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;
