import { useEffect, useRef, useState } from "react";

const getIssueCoords = (issue) => {
  if (issue.latitude !== undefined && issue.longitude !== undefined) {
    return [parseFloat(issue.latitude), parseFloat(issue.longitude)];
  }
  if (issue.location?.coordinates?.length === 2) {
    return [issue.location.coordinates[1], issue.location.coordinates[0]];
  }
  return null;
};

const getMarkerColor = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
    case "closed":
      return { bg: "bg-emerald-600", border: "border-emerald-400", dot: "bg-emerald-400" };
    case "in-progress":
      return { bg: "bg-blue-600", border: "border-blue-400", dot: "bg-blue-400" };
    default:
      return { bg: "bg-red-600", border: "border-red-400", dot: "bg-red-400" };
  }
};

const CivicIssueMap = ({ issues, selectedIssueId, onMarkerClick, onUpvote }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically Load Leaflet CSS and JS
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    cssLink.id = "leaflet-issue-css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.id = "leaflet-issue-js";
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("leaflet-issue-css");
      const js = document.getElementById("leaflet-issue-js");
      if (css) document.head.removeChild(css);
      if (js) document.body.removeChild(js);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = [17.4065, 78.4772]; // Default center
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, 12);

      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      window.L.control.zoom({ position: "bottomright" }).addTo(map);

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

  // Update Markers
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !markersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const validIssues = (issues || [])
      .map((issue) => ({ issue, coords: getIssueCoords(issue) }))
      .filter((item) => item.coords !== null && !isNaN(item.coords[0]) && !isNaN(item.coords[1]));

    if (validIssues.length === 0) return;

    validIssues.forEach(({ issue, coords }) => {
      const isSelected = String(issue._id) === String(selectedIssueId);
      const color = getMarkerColor(issue.status);

      const icon = window.L.divIcon({
        className: "custom-issue-marker",
        html: `
          <div class="relative flex flex-col items-center group transition-all duration-200 cursor-pointer ${
            isSelected ? "scale-125 z-[999]" : "z-10"
          }">
            <div class="px-2.5 py-1 ${color.bg} border ${color.border} text-white rounded-xl shadow-md flex items-center gap-1 font-bold text-[10px] whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full ${color.dot}"></span>
              <span>${issue.category || "Issue"}</span>
              <span class="opacity-80">(${issue.upvotes || 0}👍)</span>
            </div>
            <div class="w-2 h-2 ${color.bg} rotate-45 -mt-1 shadow-sm"></div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const marker = window.L.marker(coords, { icon });

      const reporterName = issue.reportedBy?.name || issue.reportedByName || "Anonymous";

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">${issue.title}</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #475569; line-clamp: 2;">${issue.description || ""}</p>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            👤 Reported by <strong>${reporterName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 999px; background: #f1f5f9; color: #334155;">
              ${issue.status || "open"}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #2563eb;">
              👍 ${issue.upvotes || 0} upvotes
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        if (onMarkerClick) onMarkerClick(issue._id);
      });

      marker.addTo(markersGroup);
    });

    try {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      console.error("Map bounds fit error:", e);
    }
  }, [leafletLoaded, issues, selectedIssueId]);

  return (
    <div className="w-full h-full min-h-[400px] relative bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 z-20">
          <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading Issue Map...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};

export default CivicIssueMap;
