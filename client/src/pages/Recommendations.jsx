import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import { formatDistance } from "../utils/distance";
import { getRecommendations } from "../services/recommendationService";
import {
  Sparkles,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Sliders,
  RefreshCw,
  Award,
  ThumbsUp,
  UserCheck,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// Mock Fallback Data in case API is temporarily unavailable
const MOCK_FALLBACK = {
  greeting: {
    userName: "Friend",
    topCategory: "Plumbing",
    insight: "Based on your interest in Plumbing, here are top-rated local specialists.",
  },
  becauseYouBooked: [
    { _id: "m1", id: "m1", name: "Jane Smith", category: "Plumber", averageRating: 4.9, reviewCount: 55, price: 50, responsiveness: "15 min", location: { coordinates: [-122.41, 37.77] }, aiScore: 96, matchReasons: ["Top Category: Plumbing", "4.9★ Highly Rated"] },
    { _id: "m2", id: "m2", name: "Mike Johnson", category: "Plumber", averageRating: 4.8, reviewCount: 42, price: 45, responsiveness: "20 min", location: { coordinates: [-122.42, 37.78] }, aiScore: 92, matchReasons: ["Top Category: Plumbing", "Nearby (2.1 km)"] },
  ],
  popularInArea: [
    { _id: "m3", id: "m3", name: "John Doe", category: "Electrician", averageRating: 4.8, reviewCount: 142, price: 40, responsiveness: "20 min", location: { coordinates: [-122.40, 37.76] }, aiScore: 89, matchReasons: ["Popular Choice", "142 Reviews"] },
    { _id: "m4", id: "m4", name: "Amit Sharma", category: "AC Technician", averageRating: 4.7, reviewCount: 160, price: 45, responsiveness: "10 min", location: { coordinates: [-122.43, 37.75] }, aiScore: 87, matchReasons: ["Popular Choice", "Fast Response"] },
  ],
  topRated: [
    { _id: "m5", id: "m5", name: "David Lee", category: "Mechanic", averageRating: 4.9, reviewCount: 175, price: 55, responsiveness: "20 min", location: { coordinates: [-122.39, 37.79] }, aiScore: 94, matchReasons: ["4.9★ Top Rated", "Master Specialist"] },
  ],
  recommended: [
    { _id: "m1", id: "m1", name: "Jane Smith", category: "Plumber", averageRating: 4.9, reviewCount: 55, price: 50, responsiveness: "15 min", location: { coordinates: [-122.41, 37.77] }, aiScore: 96, matchReasons: ["Top Category: Plumbing", "4.9★ Highly Rated"] },
    { _id: "m3", id: "m3", name: "John Doe", category: "Electrician", averageRating: 4.8, reviewCount: 142, price: 40, responsiveness: "20 min", location: { coordinates: [-122.40, 37.76] }, aiScore: 89, matchReasons: ["Popular Choice", "142 Reviews"] },
    { _id: "m5", id: "m5", name: "David Lee", category: "Mechanic", averageRating: 4.9, reviewCount: 175, price: 55, responsiveness: "20 min", location: { coordinates: [-122.39, 37.79] }, aiScore: 94, matchReasons: ["4.9★ Top Rated", "Master Specialist"] },
    { _id: "m4", id: "m4", name: "Amit Sharma", category: "AC Technician", averageRating: 4.7, reviewCount: 160, price: 45, responsiveness: "10 min", location: { coordinates: [-122.43, 37.75] }, aiScore: 87, matchReasons: ["Popular Choice", "Fast Response"] },
  ]
};

const SORT_OPTIONS = [
  { value: "score", label: "AI Best Match" },
  { value: "rating", label: "Highest Rated" },
  { value: "distance", label: "Nearest First" },
  { value: "reviews", label: "Most Popular" },
];

const ScoreMeter = ({ score }) => {
  const pct = Math.min(100, Math.max(0, score));
  const color = score >= 85 ? "from-emerald-500 to-teal-400" : score >= 70 ? "from-blue-600 to-indigo-500" : "from-amber-500 to-orange-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1 text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" /> AI Match Score
        </span>
        <span className="font-extrabold text-blue-600">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const WorkerCard = ({ worker, rank }) => {
  const isTop = rank && rank <= 3;
  const workerId = worker.id || worker._id;
  const rating = worker.averageRating || worker.rating || 4.5;
  const category = worker.category || worker.profession || "Service";
  const priceDisplay = typeof worker.price === "number" ? `₹${worker.price}/hr` : worker.price || "Contact for Quote";

  return (
    <div
      className={`group relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isTop ? "border-amber-200 ring-2 ring-amber-100" : "border-slate-200"
      }`}
    >
      {/* Top Rank Badge */}
      {isTop && (
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-xs font-extrabold text-white shadow-md">
          #{rank}
        </div>
      )}

      {/* Worker Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-blue-100">
          {worker.name?.charAt(0)?.toUpperCase() || "W"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-extrabold text-slate-900 text-base">{worker.name}</h3>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{category}</p>
        </div>
      </div>

      {/* AI Score Meter */}
      <div className="mb-4">
        <ScoreMeter score={worker.aiScore || 85} />
      </div>

      {/* Match Reasons Badges */}
      {worker.matchReasons && worker.matchReasons.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {worker.matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700"
            >
              <Sparkles size={10} className="text-blue-500" />
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Key Stats Row */}
      <div className="mb-5 flex items-center justify-between text-xs border-t border-slate-100 pt-3 text-slate-600">
        <span className="flex items-center gap-1 font-extrabold text-amber-500">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </span>
        <span className="font-bold text-slate-900">{priceDisplay}</span>
        {worker.distanceKm != null && (
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <MapPin size={12} className="text-slate-400" />
            {formatDistance(worker.distanceKm)}
          </span>
        )}
      </div>

      {/* CTA Button */}
      <Link
        to={`/worker/${workerId}`}
        className="mt-auto block w-full rounded-2xl bg-slate-900 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-blue-600 hover:shadow-blue-200"
      >
        View Profile & Book
      </Link>
    </div>
  );
};

export const Recommendations = () => {
  const { coords } = useLocation();
  const { user } = useAuth();

  const [recommendData, setRecommendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (coords?.latitude && coords?.longitude) {
        params.lat = coords.latitude;
        params.lng = coords.longitude;
      }

      const res = await getRecommendations(params);
      setRecommendData(res);
    } catch (err) {
      console.warn("Recommendations API fallback:", err.message);
      setRecommendData(MOCK_FALLBACK);
      setError("Showing AI recommendation previews");
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const categories = useMemo(() => {
    if (!recommendData?.recommended) return ["All"];
    const cats = new Set(recommendData.recommended.map((w) => w.category || w.profession));
    return ["All", ...Array.from(cats).filter(Boolean)];
  }, [recommendData]);

  const filteredRecommended = useMemo(() => {
    if (!recommendData?.recommended) return [];
    let list = recommendData.recommended.filter((w) => {
      const cat = w.category || w.profession || "";
      if (activeCategory !== "All" && !cat.toLowerCase().includes(activeCategory.toLowerCase())) {
        return false;
      }
      const rating = w.averageRating || w.rating || 0;
      if (rating < minRating) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "score") return (b.aiScore || 0) - (a.aiScore || 0);
      if (sortBy === "rating") return (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0);
      if (sortBy === "distance") return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
      if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0;
    });

    return list;
  }, [recommendData, activeCategory, minRating, sortBy]);

  const totalPages = Math.ceil(filteredRecommended.length / PER_PAGE);
  const paginatedList = filteredRecommended.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700">
              <Sparkles size={14} className="text-blue-600" /> AI Personalization Engine
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Smart Recommendations
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              Tailored suggestions derived from your booking history, proximity, ratings, and recency.
            </p>
          </div>
          <button
            onClick={fetchRecs}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Matches
          </button>
        </div>

        {/* ── Personalized Greeting Card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30 mb-3">
                <UserCheck size={14} /> Personal Insights
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Welcome Back, {user?.name?.split(" ")[0] || recommendData?.greeting?.userName || "Valued User"}! 👋
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed">
                {recommendData?.greeting?.insight ||
                  "Our recommendation algorithm has analyzed top verified specialists matching your area and preferences."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="p-3 rounded-xl bg-blue-600 text-white">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">Top Match Category</p>
                <p className="text-sm font-extrabold text-white">
                  {recommendData?.greeting?.topCategory || "Home Services"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 1: "Because You Booked..." ── */}
        {recommendData?.becauseYouBooked && recommendData.becauseYouBooked.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="text-blue-600" size={20} />
                <h2 className="text-xl font-extrabold text-slate-900">
                  Because You Booked {recommendData.greeting?.topCategory || "Services"}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Based on past activity</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendData.becauseYouBooked.map((w, idx) => (
                <WorkerCard key={w.id || w._id} worker={w} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* ── ROW 2: "Popular In Your Area" ── */}
        {recommendData?.popularInArea && recommendData.popularInArea.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-600" size={20} />
                <h2 className="text-xl font-extrabold text-slate-900">Popular In Your Area</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Proximity & demand sorted</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendData.popularInArea.map((w) => (
                <WorkerCard key={w.id || w._id} worker={w} />
              ))}
            </div>
          </div>
        )}

        {/* ── ROW 3: "Top Rated" ── */}
        {recommendData?.topRated && recommendData.topRated.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-400" size={20} />
                <h2 className="text-xl font-extrabold text-slate-900">Top Rated Professionals</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">4.5+ star verified pros</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendData.topRated.map((w) => (
                <WorkerCard key={w.id || w._id} worker={w} />
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN ALL RECOMMENDATIONS SECTION WITH CONTROLS ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">All AI-Ranked Matches</h2>
              <p className="text-xs text-slate-500">
                {filteredRecommended.length} professionals sorted by AI match algorithm
              </p>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of All Recommendations */}
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-xs font-semibold text-slate-500">Computing AI score weights...</p>
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-semibold text-slate-600">No recommended workers match the selected category filter.</p>
              <button
                onClick={() => setActiveCategory("All")}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Clear Category Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedList.map((w, idx) => (
                  <WorkerCard key={w.id || w._id} worker={w} rank={(page - 1) * PER_PAGE + idx + 1} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;