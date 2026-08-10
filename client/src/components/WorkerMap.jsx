import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, MapPin, Star, RotateCcw } from 'lucide-react';

const STATUS_COLORS = {
  available: '#22c55e',
  busy: '#f97316',
  offline: '#9ca3af',
};

const STATUS_LABELS = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
};

const WorkerMap = ({
  workers = [],
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 1,
  onWorkerClick,
}) => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const workersWithCoords = useMemo(() => {
    return workers.filter(w => {
      if (w.location?.coordinates) return true;
      if (w.mockOffset) return true;
      return false;
    });
  }, [workers]);

  const projectWorker = useCallback((worker) => {
    let lat, lng;
    if (worker.location?.coordinates) {
      lng = worker.location.coordinates[0];
      lat = worker.location.coordinates[1];
    } else if (worker.mockOffset) {
      lat = worker.mockOffset.lat;
      lng = worker.mockOffset.lon;
    } else {
      return null;
    }

    const latDiff = (lat - center.lat) * currentZoom * 50;
    const lngDiff = (lng - center.lng) * currentZoom * 50;

    const x = dimensions.width / 2 + lngDiff + panOffset.x;
    const y = dimensions.height / 2 - latDiff + panOffset.y;

    return { x, y, lat, lng };
  }, [center, currentZoom, panOffset, dimensions]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.worker-pin')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.worker-pin')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPanOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setCurrentZoom(zoom);
    setPanOffset({ x: 0, y: 0 });
    setSelectedWorker(null);
  };

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker._id === selectedWorker?._id ? null : worker);
    if (onWorkerClick) onWorkerClick(worker._id);
  };

  const handleViewProfile = (workerId) => {
    navigate(`/worker/${workerId}`);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setCurrentZoom(prev => Math.min(prev + 0.2, 5));
    } else {
      setCurrentZoom(prev => Math.max(prev - 0.2, 0.5));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Grid lines for visual reference
  const gridLines = useMemo(() => {
    const lines = [];
    const step = 50 / currentZoom;
    for (let x = 0; x <= dimensions.width; x += step) {
      lines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={dimensions.height}
          stroke="#e2e8f0" strokeWidth="0.5" />
      );
    }
    for (let y = 0; y <= dimensions.height; y += step) {
      lines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={dimensions.width} y2={y}
          stroke="#e2e8f0" strokeWidth="0.5" />
      );
    }
    return lines;
  }, [currentZoom, dimensions]);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4 text-slate-700" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4 text-slate-700" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4 text-slate-700" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-slate-200">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
        <div className="flex gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px] font-medium text-slate-600">{STATUS_LABELS[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Worker count badge */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-slate-200">
        <span className="text-xs font-bold text-slate-700">{workersWithCoords.length} workers</span>
      </div>

      {/* SVG Map */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="select-none"
        >
          {/* Background grid */}
          {gridLines}

          {/* Center crosshair */}
          <line
            x1={dimensions.width / 2} y1={0}
            x2={dimensions.width / 2} y2={dimensions.height}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"
          />
          <line
            x1={0} y1={dimensions.height / 2}
            x2={dimensions.width} y2={dimensions.height / 2}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"
          />

          {/* Worker pins */}
          {workersWithCoords.map((worker) => {
            const pos = projectWorker(worker);
            if (!pos) return null;
            if (pos.x < -20 || pos.x > dimensions.width + 20 || pos.y < -20 || pos.y > dimensions.height + 20) {
              return null;
            }

            const statusColor = STATUS_COLORS[worker.availabilityStatus] || STATUS_COLORS.offline;
            const isSelected = selectedWorker?._id === worker._id;

            return (
              <g key={worker._id} className="worker-pin" style={{ cursor: 'pointer' }}
                onClick={() => handleWorkerClick(worker)}>
                {/* Ping ring for available */}
                {worker.availabilityStatus === 'available' && (
                  <circle cx={pos.x} cy={pos.y} r={isSelected ? 18 : 12}
                    fill="none" stroke={statusColor} strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="r" from={isSelected ? 12 : 8} to={isSelected ? 22 : 16}
                      dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Shadow */}
                <circle cx={pos.x + 1} cy={pos.y + 2} r={isSelected ? 8 : 6}
                  fill="rgba(0,0,0,0.1)" />

                {/* Main dot */}
                <circle cx={pos.x} cy={pos.y} r={isSelected ? 8 : 6}
                  fill={statusColor} stroke="white" strokeWidth="2" />

                {/* Selected ring */}
                {isSelected && (
                  <circle cx={pos.x} cy={pos.y} r={11}
                    fill="none" stroke={statusColor} strokeWidth="2" opacity="0.5" />
                )}

                {/* Worker initial inside dot */}
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="7" fontWeight="bold">
                  {worker.name?.charAt(0) || '?'}
                </text>
              </g>
            );
          })}

          {/* Empty state */}
          {workersWithCoords.length === 0 && (
            <text x={dimensions.width / 2} y={dimensions.height / 2}
              textAnchor="middle" dominantBaseline="middle"
              fill="#94a3b8" fontSize="14" fontFamily="system-ui">
              No workers found in this area
            </text>
          )}
        </svg>
      </div>

      {/* Worker popup card */}
      {selectedWorker && (
        <div className="absolute z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-64"
          style={{
            left: Math.min(
              Math.max(16, projectWorker(selectedWorker)?.x - 128 || 0),
              dimensions.width - 280
            ),
            top: Math.min(
              (projectWorker(selectedWorker)?.y || 0) - 120,
              dimensions.height - 180
            ),
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedWorker(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0 overflow-hidden">
              {selectedWorker.profilePicture ? (
                <img src={selectedWorker.profilePicture} alt="" className="h-full w-full object-cover" />
              ) : (
                selectedWorker.name?.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{selectedWorker.name}</h4>
              <p className="text-xs text-blue-600 font-medium">{selectedWorker.category}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {selectedWorker.averageRating || 'N/A'}
            </span>
            <span>{selectedWorker.price ? `$${selectedWorker.price}/hr` : 'N/A'}</span>
          </div>
          <button
            type="button"
            onClick={() => handleViewProfile(selectedWorker._id)}
            className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-blue-600 transition"
          >
            View Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkerMap;
