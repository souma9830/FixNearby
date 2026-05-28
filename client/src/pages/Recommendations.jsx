import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "../context/LocationContext";
import { formatDistance, getDistanceKm } from "../utils/distance";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ children, className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const IconBolt       = ({ c }) => (<Icon className={c}><path d="M13 2L4 14h7l-1 8 10-14h-7z" /></Icon>);
const IconPipe       = ({ c }) => (<Icon className={c}><path d="M8 6h6a3 3 0 013 3v2" /><path d="M17 11h-6a3 3 0 00-3 3v4" /><path d="M7 18h2" /><path d="M15 6h2" /></Icon>);
const IconSaw        = ({ c }) => (<Icon className={c}><path d="M5 15l7-7 7 7" /><path d="M8 17h8" /></Icon>);
const IconBrush      = ({ c }) => (<Icon className={c}><path d="M14 3l7 7-7 7-7-7z" /><path d="M7 14l-3 7" /><path d="M5 18h4" /></Icon>);
const IconBroom      = ({ c }) => (<Icon className={c}><path d="M10 3l8 8" /><path d="M9 8l7 7" /><path d="M3 21l6-6" /></Icon>);
const IconSnowflake  = ({ c }) => (<Icon className={c}><path d="M12 2v20" /><path d="M4.5 6.5l15 11" /><path d="M19.5 6.5l-15 11" /></Icon>);
const IconBug        = ({ c }) => (<Icon className={c}><rect x="8" y="9" width="8" height="10" rx="4" /><path d="M9 9h6" /><path d="M6 13h2" /><path d="M16 13h2" /></Icon>);
const IconStar       = ({ className = "", filled = false }) => (<Icon className={className}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={filled ? "currentColor" : "none"} /></Icon>);
const IconSparkle    = ({ className = "" }) => (<Icon className={className}><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></Icon>);
const IconMapPin     = ({ className = "" }) => (<Icon className={className}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></Icon>);
const IconClock      = ({ className = "" }) => (<Icon className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></Icon>);
const IconTrendingUp = ({ className = "" }) => (<Icon className={className}><path d="M3 17l5-5 4 4 9-9" /><path d="M15 7h5v5" /></Icon>);
const IconFilter     = ({ className = "" }) => (<Icon className={className}><path d="M4 6h16M8 12h8M11 18h2" /></Icon>);
const IconSliders    = ({ className = "" }) => (<Icon className={className}><path d="M4 6h16" /><path d="M8 6V4" /><path d="M8 10v10" /><path d="M16 18v2" /><path d="M16 6v8" /><circle cx="8" cy="8" r="2" /><circle cx="16" cy="16" r="2" /></Icon>);

// ─── Worker Data ──────────────────────────────────────────────────────────────
const ALL_WORKERS = [
  { id: 1,  name: "John Doe",     profession: "Electrician",     rating: 4.8, price: "$40/hr", availability: "Available today",          responseTime: "Replies in 20 min", responseMinutes: 20, totalBookings: 142, repeatCustomers: 38, mockOffset: { lat: 0.012, lon: 0.008  } },
  { id: 2,  name: "Jane Smith",   profession: "Plumber",         rating: 4.9, price: "$50/hr", availability: "Next slot this afternoon", responseTime: "Replies in 15 min", responseMinutes: 15, totalBookings: 198, repeatCustomers: 55, mockOffset: { lat: -0.005, lon: 0.02  } },
  { id: 3,  name: "Mike Johnson", profession: "Carpenter",       rating: 4.5, price: "$35/hr", availability: "Available tomorrow",       responseTime: "Replies in 35 min", responseMinutes: 35, totalBookings: 87,  repeatCustomers: 20, mockOffset: { lat: 0.03,  lon: -0.015} },
  { id: 4,  name: "Ravi Kumar",   profession: "Painter",         rating: 4.6, price: "$30/hr", availability: "Next slot tomorrow",       responseTime: "Replies in 25 min", responseMinutes: 25, totalBookings: 104, repeatCustomers: 30, mockOffset: { lat: -0.022, lon: -0.01} },
  { id: 5,  name: "Amit Sharma",  profession: "AC Technician",   rating: 4.7, price: "$45/hr", availability: "Emergency slots open",     responseTime: "Replies in 10 min", responseMinutes: 10, totalBookings: 160, repeatCustomers: 47, mockOffset: { lat: 0.008, lon: -0.025} },
  { id: 6,  name: "Suresh Patel", profession: "Cleaner",         rating: 4.3, price: "$25/hr", availability: "Weekend availability",     responseTime: "Replies in 30 min", responseMinutes: 30, totalBookings: 73,  repeatCustomers: 14, mockOffset: { lat: 0.05,  lon: 0.03  } },
  { id: 7,  name: "David Lee",    profession: "Mechanic",        rating: 4.8, price: "$55/hr", availability: "Available this evening",   responseTime: "Replies in 20 min", responseMinutes: 20, totalBookings: 175, repeatCustomers: 60, mockOffset: { lat: -0.04, lon: 0.015 } },
  { id: 8,  name: "Priya Singh",  profession: "Gardener",        rating: 4.4, price: "$20/hr", availability: "Morning slots open",       responseTime: "Replies in 40 min", responseMinutes: 40, totalBookings: 61,  repeatCustomers: 12, mockOffset: { lat: 0.003, lon: 0.004 } },
  { id: 9,  name: "Imran Khan",   profession: "Appliance Repair",rating: 4.6, price: "$35/hr", availability: "Next slot tomorrow",       responseTime: "Replies in 25 min", responseMinutes: 25, totalBookings: 92,  repeatCustomers: 22, mockOffset: { lat: -0.018, lon: -0.03} },
  { id: 10, name: "Neha Gupta",   profession: "Pest Control",    rating: 4.5, price: "$40/hr", availability: "Inspection slots open",    responseTime: "Replies in 15 min", responseMinutes: 15, totalBookings: 118, repeatCustomers: 35, mockOffset: { lat: 0.025, lon: -0.005} },
];

const workerIconMap = {
  Electrician:      IconBolt,
  Plumber:          IconPipe,
  Carpenter:        IconSaw,
  Painter:          IconBrush,
  "AC Technician":  IconSnowflake,
  Cleaner:          IconBroom,
  Mechanic:         IconSaw,
  Gardener:         IconBroom,
  "Appliance Repair": IconBolt,
  "Pest Control":   IconBug,
};

const CATEGORIES  = ["All", ...new Set(ALL_WORKERS.map((w) => w.profession))];

const categoryTranslationKeys = {
  Electrician: "services.categories.electrician",
  Plumber: "services.categories.plumber",
  Carpenter: "services.categories.carpenter",
  Painter: "services.categories.painter",
  "AC Technician": "services.categories.acTechnician",
  Cleaner: "services.categories.cleaner",
  Mechanic: "services.categories.mechanic",
  Gardener: "services.categories.gardener",
  "Appliance Repair": "services.categories.applianceRepair",
  "Pest Control": "services.categories.pestControl",
};

const translateCategory = (t, category) => {
  if (category === "All") return t("services.categories.all");
  const key = categoryTranslationKeys[category];
  return key ? t(key) : category;
};
const SORT_OPTIONS = [
  { value: "score",    label: "Best Match" },
  { value: "rating",   label: "Highest Rated" },
  { value: "distance", label: "Nearest First" },
  { value: "price",    label: "Lowest Price" },
];

// ─── Scoring Engine ───────────────────────────────────────────────────────────
const calcScore = (worker, distanceKm) => {
  const rating   = (worker.rating / 5) * 30;
  const distance = distanceKm != null ? Math.max(0, 25 - distanceKm * 1.5) : 12;
  const bookings = Math.min(20, worker.totalBookings * 0.1);
  const response = Math.max(0, 15 - worker.responseMinutes * 0.25);
  const repeat   = Math.min(10, worker.repeatCustomers * 0.18);
  return parseFloat((rating + distance + bookings + response + repeat).toFixed(1));
};

const priceNum = (p) => parseFloat(p.replace(/[^0-9.]/g, ""));

// ─── Sub-components ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <div className="flex gap-3">
      <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-2/3 rounded-full bg-slate-200" />
        <div className="h-3 w-1/2 rounded-full bg-slate-200" />
      </div>
    </div>
    <div className="h-3 w-full rounded-full bg-slate-100" />
    <div className="h-3 w-4/5 rounded-full bg-slate-100" />
    <div className="flex gap-2">
      <div className="h-6 w-20 rounded-full bg-slate-100" />
      <div className="h-6 w-28 rounded-full bg-slate-100" />
    </div>
    <div className="h-10 w-full rounded-xl bg-slate-200" />
  </div>
);

const ScoreMeter = ({ score }) => {
  const pct   = Math.round((score / 100) * 100);
  const color = score >= 70 ? "#10b981" : score >= 55 ? "#4f46e5" : "#f59e0b";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1 text-slate-500">
          <IconSparkle className="h-3 w-3" /> AI Score
        </span>
        <span style={{ color }} className="font-extrabold">{score}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

const WorkerCard = ({ worker, rank }) => {
  const { t } = useTranslation();
  const WorkerIcon = workerIconMap[worker.profession] || IconBolt;
  const isTop = rank <= 3;

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      ${isTop ? "border-amber-200 ring-1 ring-amber-100" : "border-slate-200"}`}>

      {/* Rank badge */}
      {isTop && (
        <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-extrabold text-white shadow">
          #{rank}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <WorkerIcon c="h-7 w-7 text-slate-800" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-900">{worker.name}</h3>
          <p className="text-sm font-semibold text-indigo-600">{worker.profession}</p>
        </div>
      </div>

      {/* Score meter */}
      <div className="mb-4">
        <ScoreMeter score={worker.score} />
      </div>

      {/* Chips */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          <IconClock className="h-3 w-3" />{worker.responseTime}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {worker.availability}
        </span>
        {worker.distanceKm != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <IconMapPin className="h-3 w-3" />{formatDistance(worker.distanceKm)}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5 flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1 font-bold text-amber-500">
          <IconStar className="h-4 w-4" filled />{worker.rating}
        </span>
        <span className="h-4 w-px bg-slate-200" />
        <span className="font-semibold text-slate-800">{worker.price}</span>
        <span className="h-4 w-px bg-slate-200" />
        <span className="flex items-center gap-1 text-slate-500">
          <IconTrendingUp className="h-3.5 w-3.5 text-emerald-500" />{worker.totalBookings} jobs
        </span>
      </div>

      <Link
        to={`/worker/${worker.id}`}
        className="mt-auto block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-600 hover:shadow-lg"
      >
        {t("home.viewProfileAndBook")}
      </Link>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Recommendations = () => {
  const { t } = useTranslation();
  const { coords } = useLocation();

  const [loading,         setLoading]         = useState(true);
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [sortBy,          setSortBy]          = useState("score");
  const [minRating,       setMinRating]       = useState(0);
  const [maxDistance,     setMaxDistance]     = useState(100);
  const [showFilters,     setShowFilters]     = useState(false);
  const [page,            setPage]            = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Reset page on any filter change
  useEffect(() => { setPage(1); }, [activeCategory, sortBy, minRating, maxDistance]);

  const scored = useMemo(() => {
    return ALL_WORKERS.map((w) => {
      const distanceKm = coords
        ? getDistanceKm(coords.latitude, coords.longitude,
            coords.latitude + w.mockOffset.lat,
            coords.longitude + w.mockOffset.lon)
        : null;
      return { ...w, distanceKm, score: calcScore(w, distanceKm) };
    });
  }, [coords]);

  const filtered = useMemo(() => {
    let list = scored.filter((w) => {
      if (activeCategory !== "All" && w.profession !== activeCategory) return false;
      if (w.rating < minRating) return false;
      if (coords && w.distanceKm != null && w.distanceKm > maxDistance) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "score")    return b.score - a.score;
      if (sortBy === "rating")   return b.rating - a.rating;
      if (sortBy === "distance") return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      if (sortBy === "price")    return priceNum(a.price) - priceNum(b.price);
      return 0;
    });

    return list;
  }, [scored, activeCategory, minRating, maxDistance, sortBy, coords]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                <IconSparkle className="h-3 w-3" /> AI-Powered
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {t("home.recommendations.title")}
              </h1>
              <p className="mt-1 text-slate-500">
                {loading ? "Calculating best matches..." : `${filtered.length} workers ranked by our AI scoring engine`}
              </p>
            </div>
            <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Score Info Banner ──────────────────────────────────────────── */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/70 px-5 py-4 text-sm text-violet-800">
          <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <p>
            <span className="font-bold">Scoring breakdown — </span>
            Rating <strong>(30 pts)</strong> · Proximity <strong>(25 pts)</strong> ·
            Booking volume <strong>(20 pts)</strong> · Response speed <strong>(15 pts)</strong> ·
            Repeat customers <strong>(10 pts)</strong>. Max score: <strong>100</strong>.
          </p>
        </div>

        {/* ── Controls bar ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                  activeCategory === cat
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {translateCategory(t, cat)}
              </button>
            ))}
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <IconSliders className="h-3.5 w-3.5" />
            Filters {showFilters ? "▲" : "▼"}
          </button>
        </div>

        {/* ── Advanced Filters Panel ─────────────────────────────────────── */}
        {showFilters && (
          <div className="mb-6 flex flex-wrap gap-6 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            {/* Min rating */}
            <div>
              <p className="mb-2 text-xs font-bold text-slate-600">Min Rating</p>
              <div className="flex gap-2">
                {[0, 4.3, 4.5, 4.7, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                      minRating === r
                        ? "border-amber-400 bg-amber-400 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max distance — only if location available */}
            {coords && (
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600">
                  Max Distance: <span className="text-indigo-600">{maxDistance} km</span>
                </p>
                <input
                  type="range" min={1} max={100} step={1}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-48 accent-indigo-600"
                />
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => { setMinRating(0); setMaxDistance(100); setActiveCategory("All"); setSortBy("score"); }}
              className="self-end rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Reset all
            </button>
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
            <p className="text-slate-400 font-medium">No workers match the selected filters.</p>
            <button
              onClick={() => { setMinRating(0); setMaxDistance(100); setActiveCategory("All"); }}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((w, idx) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  rank={(page - 1) * PER_PAGE + idx + 1}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-lg border text-sm font-bold transition ${
                      page === n
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations;