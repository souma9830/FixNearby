import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Droplet,
  Hammer,
  SlidersHorizontal,
  Zap,
  Sparkles,
  Scale,
  SprayCan,
  Heart,
  Star,
  GitCompareArrows,
  X,
  Map,
  List,
} from "lucide-react";


import useDocumentTitle from "../hooks/useDocumentTitle";
import SkeletonLoader from "../components/SkeletonLoader";
import CenteredLoadingSpinner from "../components/CenteredLoadingSpinner";
import useToast from "../hooks/useToast";


import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import ReviewBadge from "../components/ReviewBadge";
import useSearch from "../hooks/useSearch";
import { fetchWorkers } from "../services/workerService";
import { getSearchSuggestions, searchWorkers } from "../services/searchService";
import { useLocation } from "../context/LocationContext";
import { getWorkerAvailability } from "../services/availabilityService";
import { useAuth } from "../context/AuthContext";
import { getFavorites, toggleFavorite } from "../services/favoriteService";
import { getEstimatorConfig } from "../utils/estimatorConfig";
import EstimateWizard from "../components/EstimateWizard";
import CostEstimatorWidget from "../components/calculator/CostEstimatorWidget";
import WorkerMap from "../components/WorkerMap";
import SearchResults from "../components/SearchResults";
import {
  addRecentWorker,
  clearRecentWorkers,
  getRecentWorkers,
  removeRecentWorker,
} from "../utils/recentWorkers";


const mockWorkers = [
  {
    id: 1,
    name: "John Doe",
    profession: "Electrician",
    rating: 4.8,
    price: 40,
    availability: "Available today",
    responseTime: "Replies in 20 min",
    outcomeText:
      "Open the full profile to compare pricing, reviews, and booking slots.",
    mockOffset: { lat: 17.3850, lon: 78.4867 },
    verified: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    profession: "Plumber",
    rating: 4.9,
    price: 50,
    availability: "Next slot this afternoon",
    responseTime: "Replies in 15 min",
    outcomeText:
      "See availability first, then confirm a plumbing booking in one flow.",
    mockOffset: { lat: 17.4435, lon: 78.3772 },
    verified: true,
  },
  {
    id: 3,
    name: "Mike Johnson",
    profession: "Carpenter",
    rating: 4.5,
    price: 35,
    availability: "Available tomorrow morning",
    responseTime: "Replies in 35 min",
    outcomeText:
      "Review past work and request a carpentry visit from the profile page.",
    mockOffset: { lat: 17.4399, lon: 78.4983 },
    verified: true,
  },
  {
    id: 4,
    name: "Ravi Kumar",
    profession: "Painter",
    rating: 4.6,
    price: 30,
    availability: "Next slot tomorrow",
    responseTime: "Replies in 25 min",
    outcomeText: "Check service details and move straight into booking when ready.",
    mockOffset: { lat: 17.4483, lon: 78.3915 },
    verified: true,
  },
  {
    id: 5,
    name: "Amit Sharma",
    profession: "AC Technician",
    rating: 4.7,
    price: 45,
    availability: "Emergency slots open",
    responseTime: "Replies in 10 min",
    outcomeText: "View service scope, urgency fit, and book an AC repair visit quickly.",
    mockOffset: { lat: 17.4126, lon: 78.4052 },
    verified: true,
  },
  {
    id: 6,
    name: "Suresh Patel",
    profession: "Cleaner",
    rating: 4.3,
    price: 25,
    availability: "Weekend availability",
    responseTime: "Replies in 30 min",
    outcomeText:
      "Open the profile to compare rates and schedule a cleaning appointment.",
    mockOffset: { lat: 17.3616, lon: 78.4747 },
    verified: true,
  },
  {
    id: 7,
    name: "David Lee",
    profession: "Mechanic",
    rating: 4.8,
    price: 55,
    availability: "Available this evening",
    responseTime: "Replies in 20 min",
    outcomeText:
      "See diagnostic pricing and book a mechanic visit with clearer expectations.",
    mockOffset: { lat: 17.4948, lon: 78.3996 },
    verified: true,
  },
  {
    id: 8,
    name: "Priya Singh",
    profession: "Gardener",
    rating: 4.4,
    price: 20,
    availability: "Morning slots open",
    responseTime: "Replies in 40 min",
    outcomeText:
      "Review service options and book a gardener for regular or one-time visits.",
    mockOffset: { lat: 17.4239, lon: 78.4738 },
    verified: true,
  },
  {
    id: 9,
    name: "Imran Khan",
    profession: "Appliance Repair",
    rating: 4.6,
    price: 35,
    availability: "Next slot tomorrow",
    responseTime: "Replies in 25 min",
    outcomeText:
      "Open the profile to check appliance support and request a repair appointment.",
    mockOffset: { lat: 17.3724, lon: 78.4378 },
    verified: true,
  },
  {
    id: 10,
    name: "Neha Gupta",
    profession: "Pest Control",
    rating: 4.5,
    price: 40,
    availability: "Inspection slots open",
    responseTime: "Replies in 15 min",
    outcomeText:
      "View treatment details and book an inspection without leaving the flow.",
    mockOffset: { lat: 17.4065, lon: 78.4772 },
    verified: true,
  },
];

const categories = [
  "All",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "AC Technician",
  "Cleaner",
  "Mechanic",
  "Gardener",
  "Appliance Repair",
  "Pest Control",
];

const iconMap = {
  Electrician: Zap,
  Plumber: Droplet,
  Carpenter: Hammer,
  Cleaner: SprayCan, // closest match for cleaning tools/icons in Lucide
  // Keeping other categories (used by mock data) stable with best-fit Lucide icons.
  Painter: Sparkles,
  "AC Technician": Scale,
  Mechanic: Hammer,
  Gardener: Sparkles,
  "Appliance Repair": Zap,
  "Pest Control": Zap,
};


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

const formatDistance = (d) =>
  d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;

import { useRef } from "react";
import { getSocket } from "../utils/socketClient";

const WorkerSlots = ({ workerId, mockAvailability, mockResponseTime }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSocketFallback, setIsSocketFallback] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;
    let didReceiveSocketUpdate = false;

    const fetchSlots = async () => {
      try {
        const res = await getWorkerAvailability(workerId);
        if (res?.success && res.availableSlots && active) {
          setSlots(res.availableSlots);
        }
      } catch (err) {
        console.error("Error fetching slots for worker " + workerId, err);
      } finally {
        if (active) setLoading(false);
      }
    };

    // Always fetch once to render immediately.
    fetchSlots();

    // Subscribe to worker availability updates over WebSockets.
    const socket = getSocket();
    socketRef.current = socket;

    const handleAvailabilityUpdate = (payload) => {
      if (!payload) return;
      const updatedWorkerId = payload.workerId;
      if (!updatedWorkerId || updatedWorkerId.toString() !== workerId.toString()) return;

      if (payload.availableSlots && Array.isArray(payload.availableSlots)) {
        didReceiveSocketUpdate = true;
        setIsSocketFallback(false);
        setSlots(payload.availableSlots);
        setLoading(false);
      }
    };

    const startPollingFallback = () => {
      setIsSocketFallback(true);
      const interval = setInterval(() => {
        if (!active) return;
        if (didReceiveSocketUpdate) {
          clearInterval(interval);
          return;
        }
        fetchSlots();
      }, 10000);

      return interval;
    };

    let pollingInterval = null;

    // Attempt socket connect; if it fails quickly, enable polling.
    // Socket.IO will also retry, but this keeps UI fresh when backend/socket isn't reachable.
    const timeoutMs = 4000;
    let timeoutHandle = setTimeout(() => {
      if (!didReceiveSocketUpdate) {
        pollingInterval = startPollingFallback();
      }
    }, timeoutMs);

    socket.on("availability:update", handleAvailabilityUpdate);

    // Back-end is expected to emit updates; joining a room/subscription is optional depending on implementation.
    // We still emit a subscribe hint if the server supports it.
    socket.emit("availability:subscribe", { workerId });

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      active = false;
      clearTimeout(timeoutHandle);
      if (pollingInterval) clearInterval(pollingInterval);
      socket.off("availability:update", handleAvailabilityUpdate);
      socket.emit("availability:unsubscribe", { workerId });
    };
  }, [workerId]);


  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400">Loading slots...</span>
      </div>
    );
  }

  let urgencyText = "Stable Availability";
  let urgencyStyle = "bg-green-50 text-green-700 border-green-100";
  if (slots.length === 0) {
    urgencyText = "Fully Booked Today";
    urgencyStyle = "bg-red-50 text-red-700 border-red-100 animate-pulse";
  } else if (slots.length === 1) {
    urgencyText = "🚨 High Demand - 1 Slot Left!";
    urgencyStyle = "bg-red-600 text-white border-red-700 font-bold shadow-sm shadow-red-200 animate-pulse";
  } else if (slots.length <= 2) {
    urgencyText = "⚠️ Limited: 2 Slots Left";
    urgencyStyle = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    urgencyText = `✅ ${slots.length} slots available`;
    urgencyStyle = "bg-blue-50 text-blue-700 border-blue-100";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 border transition-all ${urgencyStyle}`}>
          {urgencyText}
        </span>
        <span className="rounded-full bg-slate-50 border border-gray-100 px-3 py-1 text-slate-600">
          {mockResponseTime || "Replies in 15 min"}
        </span>
      </div>

      {slots.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-2.5 border border-slate-100/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next available times:</span>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {slots.slice(0, 3).map((slot, index) => (
              <span
                key={index}
                className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-0.5 shadow-sm"
              >
                {slot.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Services = () => {
  useDocumentTitle("Services");

  const [searchParams, setSearchParams] = useSearchParams();
  const { coords } = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "distance");
  const [urgentFilter, setUrgentFilter] = useState(
    searchParams.get("urgent") === "true",
  );

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedWorkerIds, setFavoritedWorkerIds] = useState(new Set());
  const [selectedWorkerForWizard, setSelectedWorkerForWizard] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list');

  const handleMarkerClick = (workerId) => {
    setSelectedWorkerId(workerId);
    const cardElement = document.getElementById(`worker-card-${workerId}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Fetch favorited worker IDs
  useEffect(() => {
    if (isAuthenticated) {
      const loadFavorites = async () => {
        try {
          const favs = await getFavorites();
          const ids = new Set(favs.map(f => f.worker._id || f.worker.id));
          setFavoritedWorkerIds(ids);
        } catch (err) {
          console.error("Failed to load favorites:", err);
        }
      };
      loadFavorites();
    } else {
      setFavoritedWorkerIds(new Set());
    }
  }, [isAuthenticated]);

  const handleToggleFavorite = async (workerId) => {
    if (!isAuthenticated) {
      showToast("Please log in to save professionals to your favorites.", "error");
      return;
    }

    const isSaved = favoritedWorkerIds.has(workerId);
    // Optimistic UI update
    setFavoritedWorkerIds(prev => {
      const copy = new Set(prev);
      if (isSaved) {
        copy.delete(workerId);
      } else {
        copy.add(workerId);
      }
      return copy;
    });

    try {
      await toggleFavorite(workerId, isSaved);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert optimistic update on failure
      setFavoritedWorkerIds(prev => {
        const copy = new Set(prev);
        if (isSaved) {
          copy.add(workerId);
        } else {
          copy.delete(workerId);
        }
        return copy;
      });
      showToast("Failed to update favorite. Please try again.", "error");
    }
  };

  const [recentWorkers, setRecentWorkers] = useState([]);

  /* GEOLOCATION */
  // Advanced search features
  const {
    searchHistory,
    addToHistory,
    clearHistory,
    removeHistoryItem,
    favoriteSearches,
    saveFavoriteSearch,
    removeFavoriteSearch,
    loadFavoriteSearch,
    getShareableUrl,
  } = useSearch({
    category: categoryFilter,
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    maxDistance: 50,
    availability: 'all',
    sortBy: sortBy,
  }, isAuthenticated);

  const [suggestions, setSuggestions] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    maxDistance: 50,
    availability: 'all',
  });

  // Geolocation is now provided by LocationContext (useLocation above)

  /* LOAD DATA */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const queryParams = {
          q: searchQuery,
          category: categoryFilter,
          minPrice: advancedFilters.minPrice,
          maxPrice: advancedFilters.maxPrice,
          minRating: advancedFilters.minRating,
          maxDistance: advancedFilters.maxDistance,
          availability: advancedFilters.availability,
          sort: sortBy,
          lat: coords?.latitude || null,
          lon: coords?.longitude || null,
        };
        const searchResponse = await searchWorkers(queryParams);
        const backendWorkers = searchResponse?.data || [];
        const mappedBackend = backendWorkers.map(w => ({
          ...w,
          id: w._id || w.id,
          profession: w.category || w.profession,
          price: w.hourlyRate ? Number(w.hourlyRate) : (w.price ? (w.price.toString().startsWith('$') ? w.price : `$${w.price}/hr`) : 30),
          availability: w.availability || 
            (w.availabilityStatus === "available" ? "Available today" : 
             w.availabilityStatus === "busy" ? "Busy" : 
             w.availabilityStatus === "offline" ? "Offline" : "Available today"),
          responseTime: w.slaResponseMins ? `Replies in ${w.slaResponseMins} min` : (w.responseTime || "Replies in 15 min"),
          outcomeText: w.outcomeText || `Review past work and request a ${w.category?.toLowerCase() || 'service'} visit.`,
          mockOffset: w.mockOffset || (w.coordinates ? { lat: w.coordinates.lat, lon: w.coordinates.lon } : null),
          verified: w.verificationStatus ? w.verificationStatus === 'verified' : (w.verified ?? true),
          isAvailableNow: w.isAvailableNow === true,
          rating: Number(w.rating) || 4.5,
          completedJobs: w.completedJobs || 12,
          slaResponseMins: w.slaResponseMins,
          serviceCoverage: w.serviceCoverage,
          cancellationPolicy: w.cancellationPolicy,
          refundPolicy: w.refundPolicy,
          verificationStatus: w.verificationStatus || 'verified',
        }));

        if (mappedBackend && mappedBackend.length > 0) {
          setWorkers(mappedBackend);
        } else {
          setWorkers(mockWorkers);
        }
      } catch (err) {
        console.error("Failed to fetch search results from backend, falling back to mock data", err);
        setWorkers(mockWorkers);
      } finally {
        setRecentWorkers(getRecentWorkers());
        setLoading(false);
      }
    };
    loadData();
  }, [searchQuery, categoryFilter, sortBy, coords, advancedFilters]);

  // SYNC URL PARAMS TO STATE
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "All";
    const urlUrgent = searchParams.get("urgent") === "true";
    const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
    const urlSort = searchParams.get("sort") || "distance";
    const urlMinPrice = searchParams.get("minPrice") !== null ? Number(searchParams.get("minPrice")) : 0;
    const urlMaxPrice = searchParams.get("maxPrice") !== null ? Number(searchParams.get("maxPrice")) : 100;
    const urlMinRating = searchParams.get("minRating") !== null ? Number(searchParams.get("minRating")) : 0;
    const urlMaxDistance = searchParams.get("maxDistance") !== null ? Number(searchParams.get("maxDistance")) : 50;
    const urlAvailability = searchParams.get("availability") || "all";

    if (urlCategory !== categoryFilter) setCategoryFilter(urlCategory);
    if (urlUrgent !== urgentFilter) setUrgentFilter(urlUrgent);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlSort !== sortBy) setSortBy(urlSort);
    if (
      urlMinPrice !== advancedFilters.minPrice ||
      urlMaxPrice !== advancedFilters.maxPrice ||
      urlMinRating !== advancedFilters.minRating ||
      urlMaxDistance !== advancedFilters.maxDistance ||
      urlAvailability !== advancedFilters.availability
    ) {
      setAdvancedFilters({
        minPrice: urlMinPrice,
        maxPrice: urlMaxPrice,
        minRating: urlMinRating,
        maxDistance: urlMaxDistance,
        availability: urlAvailability,
      });
    }
  }, [searchParams]);

  // SYNC STATE TO URL PARAMS
  useEffect(() => {
    const params = {};

    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sortBy !== "distance") params.sort = sortBy;
    if (urgentFilter) params.urgent = "true";
    
    if (advancedFilters.minPrice > 0) params.minPrice = advancedFilters.minPrice;
    if (advancedFilters.maxPrice < 100) params.maxPrice = advancedFilters.maxPrice;
    if (advancedFilters.minRating > 0) params.minRating = advancedFilters.minRating;
    if (advancedFilters.maxDistance < 50) params.maxDistance = advancedFilters.maxDistance;
    if (advancedFilters.availability !== "all") params.availability = advancedFilters.availability;

    setSearchParams(params);
  }, [
    searchQuery,
    categoryFilter,
    sortBy,
    urgentFilter,
    advancedFilters,
    setSearchParams,
  ]);
  /* FILTER + SORT */
  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestionsData = async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await getSearchSuggestions(searchQuery);
          setSuggestions(results.map(r => r.value));
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestionsData();
  }, [searchQuery]);

  // FILTER + SORT
  const filteredWorkers = useMemo(() => {
    // Compute distance for every worker when user coords are available
    let result = workers.map((w) => {
      let distanceKm = null;
      if (coords && w.mockOffset) {
        distanceKm = getDistanceKm(
          coords.latitude,
          coords.longitude,
          w.mockOffset.lat,
          w.mockOffset.lon
        );
      }
      return { ...w, distanceKm };
    });

    // Text + category filter
    result = result.filter((w) => {
      const search = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !search ||
        w.name.toLowerCase().includes(search) ||
        w.profession.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        w.profession === categoryFilter;

      // Advanced filters
      const matchesPrice =
        w.price >= advancedFilters.minPrice &&
        w.price <= advancedFilters.maxPrice;

      const matchesRating = w.rating >= advancedFilters.minRating;

      const matchesDistance =
        !advancedFilters.maxDistance ||
        w.distanceKm === null ||
        w.distanceKm <= advancedFilters.maxDistance;

      // Urgent filter: only show workers with "today" or "emergency" in availability
      const matchesUrgent =
        !urgentFilter ||
        /today|emergency|open/i.test(w.availability || "");

      // Availability filter
      const matchesAvailability = 
        advancedFilters.availability === 'all' || 
        (advancedFilters.availability === 'available' && w.isAvailableNow) ||
        (advancedFilters.availability === 'today' && /today/i.test(w.availability || "")) ||
        (advancedFilters.availability === 'week' && /week|today|tomorrow/i.test(w.availability || ""));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesDistance &&
        matchesUrgent &&
        matchesAvailability
      );
    });

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "distance") {
      result.sort((a, b) => {
        // Workers without distance go to the end
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return result;
  }, [workers, searchQuery, categoryFilter, sortBy, coords, advancedFilters, urgentFilter]);

  const toggleCompare = (workerId) => {
    setCompareIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, workerId];
    });
  };

  const removeCompare = (workerId) => {
    setCompareIds(prev => prev.filter(id => id !== workerId));
  };

  const goToCompare = () => {
    if (compareIds.length >= 2) {
      navigate(`/compare-workers?ids=${compareIds.join(',')}`);
    }
  };

  const getCompareWorkerNames = () => {
    return compareIds.map(id => {
      const w = filteredWorkers.find(worker => (worker._id || worker.id) === id);
      return w ? w.name : id;
    });
  };

  const handleRecentlyViewed = (worker) => {
    setRecentWorkers(addRecentWorker(worker));
  };

  const handleRemoveRecentWorker = (workerId) => {
    setRecentWorkers(removeRecentWorker(workerId));
  };

  const handleClearRecentWorkers = () => {
    setRecentWorkers(clearRecentWorkers());
  };

  const handleSearch = (query) => {
    addToHistory(query, { category: categoryFilter, ...advancedFilters });
  };

  const handleSaveFavorite = async (name) => {
    const success = await saveFavoriteSearch(name, searchQuery, {
      category: categoryFilter,
      sortBy,
      ...advancedFilters
    });
    if (success) {
      showToast('Search saved to favorites!', 'success');
    } else {
      showToast('Failed to save search.', 'error');
    }
  };

  const handleLoadFavorite = (favorite) => {
    setSearchQuery(favorite.query || "");
    const favFilters = favorite.filters || {};
    if (favFilters.category) setCategoryFilter(favFilters.category);
    if (favFilters.sortBy) setSortBy(favFilters.sortBy);
    setAdvancedFilters({
      minPrice: favFilters.minPrice !== undefined ? Number(favFilters.minPrice) : 0,
      maxPrice: favFilters.maxPrice !== undefined ? Number(favFilters.maxPrice) : 100,
      minRating: favFilters.minRating !== undefined ? Number(favFilters.minRating) : 0,
      maxDistance: favFilters.maxDistance !== undefined ? Number(favFilters.maxDistance) : 50,
      availability: favFilters.availability || 'all',
    });
    showToast(`Loaded search template: ${favorite.name}`, 'info');
  };

  const handleShareSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryFilter !== "All") params.set('category', categoryFilter);
    if (sortBy !== "distance") params.set('sort', sortBy);
    if (urgentFilter) params.set('urgent', "true");
    
    if (advancedFilters.minPrice > 0) params.set('minPrice', advancedFilters.minPrice);
    if (advancedFilters.maxPrice < 100) params.set('maxPrice', advancedFilters.maxPrice);
    if (advancedFilters.minRating > 0) params.set('minRating', advancedFilters.minRating);
    if (advancedFilters.maxDistance < 50) params.set('maxDistance', advancedFilters.maxDistance);
    if (advancedFilters.availability !== "all") params.set('availability', advancedFilters.availability);

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Search URL copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      showToast('Failed to copy URL.', 'error');
    });
  };

  const handleFilterChange = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setSortBy("distance");
    setUrgentFilter(false);
    setAdvancedFilters({
      minPrice: 0,
      maxPrice: 100,
      minRating: 0,
      maxDistance: 50,
      availability: 'all',
    });
  };

  const hasActiveFilters =
    advancedFilters.minPrice > 0 ||
    advancedFilters.maxPrice < 100 ||
    advancedFilters.minRating > 0 ||
    (advancedFilters.maxDistance && advancedFilters.maxDistance < 50) ||
    advancedFilters.availability !== 'all';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">

      {/* HEADER */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Find Reliable Services Near You
        </h1>
        <p className="mt-2 text-gray-500">
          {coords
            ? "Showing nearby professionals"
            : "Enable location for better results"}
        </p>
      </div>

      {/* SEARCH + SORT */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded-xl border px-4 py-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="rounded-xl border px-4 py-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="distance">Nearest</option>
          <option value="rating">Top Rated</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>
      {/* FILTERS */}
      <div className="mb-10 space-y-6">
        {/* SearchBar with Autocomplete */}
        <div className="mx-auto max-w-3xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            searchHistory={searchHistory}
            favoriteSearches={favoriteSearches}
            onRemoveHistory={removeHistoryItem}
            onClearHistory={clearHistory}
            onLoadFavorite={handleLoadFavorite}
            onRemoveFavorite={removeFavoriteSearch}
            onSaveFavorite={handleSaveFavorite}
            onShare={handleShareSearch}
            suggestions={suggestions}
            placeholder="Search for services, workers, or categories..."
          />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="distance">📍 Nearest</option>
            <option value="rating">⭐ Top Rated</option>
            <option value="price">💰 Lowest Price</option>
          </select>
          <button
            type="button"
            onClick={() => setUrgentFilter((prev) => !prev)}
            className={`rounded-xl border px-5 py-3 font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${urgentFilter
              ? "border-red-600 bg-red-600 text-white shadow-md hover:bg-red-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
          >
            <span className={urgentFilter ? "animate-pulse" : ""}>🚨</span>
            <span>Urgent Only</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Advanced Filters</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                Active
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {viewMode === 'list' ? (
              <>
                <Map className="h-5 w-5" />
                <span>Map View</span>
              </>
            ) : (
              <>
                <List className="h-5 w-5" />
                <span>List View</span>
              </>
            )}
          </button>
        </div>

        {/* CATEGORY CHIPS (FULL FIX) */}
        <div className="mb-10">
          <div className="flex gap-2.5 overflow-x-auto whitespace-nowrap px-1 py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition-all duration-300 ease-out active:scale-95 flex items-center gap-2 ${
                  categoryFilter === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50 scale-105"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {cat !== "All" && iconMap[cat] && (
                  <span className="flex h-5 w-5 items-center justify-center">
                    {(() => {
                      const Icon = iconMap[cat];
                      return <Icon className="h-4 w-4" aria-hidden="true" />;
                    })()}
                  </span>
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* URGENT ACTIVE BANNER */}
        {urgentFilter && (
          <div className="mx-auto max-w-3xl mb-10 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm animate-pulse">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-3xl">🚨</span>
                <div>
                  <h3 className="font-bold text-red-800">SOS Emergency Mode Active</h3>
                  <p className="text-sm text-red-600">
                    Filtering for service providers with immediate availability today or emergency slots open.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUrgentFilter(false)}
                className="w-full sm:w-auto rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200 transition-all duration-200"
              >
                Show All
              </button>
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED */}
        {recentWorkers.length > 0 && (
          <div className="mb-14">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">⭐</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recently Viewed Professionals
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClearRecentWorkers}
                className="text-sm font-semibold text-slate-500 hover:text-rose-600"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentWorkers.map((worker) => (
                <div
                  key={worker._id || worker.id}
                  className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveRecentWorker(worker._id || worker.id)}
                    className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${worker.name} from recently viewed`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="mb-4 text-4xl">
                    {(() => {
                      const Icon = iconMap[worker.profession];
                      if (!Icon) return <span aria-hidden="true">👷</span>;
                      return <Icon className="h-10 w-10 text-blue-600" aria-hidden="true" />;
                    })()}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {worker.name}
                  </h3>
                  <p className="mb-3 font-medium text-blue-600">
                    {worker.profession}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>⭐ {worker.rating}</span>
                    <span>{typeof worker.price === "number" ? `$${worker.price}/hr` : worker.price || "Rate unavailable"}</span>
                  </div>
                  <Link
                    to={`/worker/${worker.id}`}
                    className="mt-4 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    View profile →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT WITH SIDEBAR */}
        <div className="flex gap-8">
          {/* FILTER SIDEBAR */}
          <FilterSidebar
            filters={{
              category: categoryFilter,
              ...advancedFilters,
              sortBy: sortBy,
            }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            className="hidden lg:block"
          />

          {/* MAIN CONTENT */}
          <div className="flex-grow lg:grid lg:grid-cols-12 lg:gap-8 items-start w-full">
            {/* MAP VIEW */}
            {viewMode === 'map' ? (
              <div className="lg:col-span-12 h-[600px] shadow-lg rounded-3xl overflow-hidden border border-slate-200">
                <MapView
                  workers={filteredWorkers}
                  selectedWorkerId={selectedWorkerId}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            ) : (
            /* WORKER LIST (Left part of split) */
            <div className="lg:col-span-7 space-y-6">
              {/* WORKER CARDS */}
              {loading ? (
                <SkeletonLoader type="worker" count={4} />
              ) : filteredWorkers.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                  <h3 className="text-2xl font-bold text-gray-900">No services found</h3>
                  <p className="mx-auto mt-2 max-w-md text-gray-500">
                    Try a broader search or reset the selected category.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-sm font-medium text-gray-500 flex items-center justify-between">
                    <span>Showing {filteredWorkers.length} services</span>
                    <span className="text-xs font-semibold text-emerald-600">⚡ DOM Virtualized (60fps)</span>
                  </p>
                  <SearchResults
                    items={filteredWorkers}
                    useWindowScroll={true}
                    layout="grid"
                    overscan={300}
                    loading={loading}
                    renderItem={(worker) => {
                      const isAvailable = worker.isAvailableNow || /available|today|emergency/i.test(worker.availability || "");
                      return (
                      <div
                        key={worker.id || worker._id}
                        id={`worker-card-${worker.id || worker._id}`}
                        className={`group flex flex-col overflow-hidden rounded-3xl border bg-white dark:bg-slate-800 transition-all duration-300 ease-out relative h-full hover:-translate-y-1.5 ${
                          selectedWorkerId === (worker.id || worker._id)
                            ? "border-blue-500 shadow-xl ring-2 ring-blue-500/50 scale-[1.01]"
                            : isAvailable
                            ? "border-emerald-400/80 dark:border-emerald-500/60 shadow-md shadow-emerald-500/5 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/15 ring-1 ring-emerald-500/20"
                            : "border-amber-300/80 dark:border-amber-500/50 shadow-md shadow-amber-500/5 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/15 ring-1 ring-amber-400/20"
                        }`}
                      >
                        {/* Favorite/Save Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(worker._id || worker.id);
                          }}
                          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-white text-gray-400 hover:text-red-500 transition-all shadow-sm border border-gray-100/60 z-10 focus:outline-none"
                          title={favoritedWorkerIds.has(worker._id || worker.id) ? "Remove from Saved" : "Save Professional"}
                        >
                          <Heart
                            className={`h-5 w-5 transition-transform active:scale-125 ${
                              favoritedWorkerIds.has(worker._id || worker.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />
                        </button>

                        {/* Compare Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCompare(worker._id || worker.id);
                          }}
                          className={`absolute top-4 left-4 p-2.5 rounded-full transition-all shadow-sm border z-10 focus:outline-none ${
                            compareIds.includes(worker._id || worker.id)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white/95 dark:bg-slate-900/95 hover:bg-white border-gray-100/60 text-gray-400 hover:text-blue-500"
                          }`}
                          title={compareIds.includes(worker._id || worker.id) ? "Remove from comparison" : "Add to comparison"}
                        >
                          <GitCompareArrows className="h-5 w-5" />
                        </button>

                        {/* WORKER IMAGE & BADGES */}
                        <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          {/* Image placeholder or fallback */}
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 font-bold text-5xl group-hover:scale-105 transition-transform duration-500">
                            {worker.name.charAt(0)}
                          </div>
                          
                          {/* Badges Overlay */}
                          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-slate-900/90 dark:bg-slate-950/90 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-sm shadow-sm border border-white/10">
                              {worker.profession}
                            </span>
                            <span className="rounded-lg bg-blue-600/90 px-2.5 py-1 text-xs font-black text-white backdrop-blur-sm shadow-xs border border-blue-400/40">
                              📍 {worker.distanceText || (worker.distanceKm !== undefined ? `${worker.distanceKm} km away` : '1.8 km away')}
                            </span>
                            {worker.verified && (
                              <span className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-sm shadow-sm border border-emerald-400/30">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{worker.name}</h3>
                              {worker.isAvailableNow && (
                                <span className="relative flex h-3 w-3" title="Available Now">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                              )}
                            </div>
                            {/* High-Contrast Floating Rating Pill */}
                            <div className="flex items-center gap-1.5 rounded-full bg-amber-400 dark:bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 border border-amber-300/50 transition-transform group-hover:scale-105">
                              <Star className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                              <span>{Number(worker.rating).toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                            {worker.bio || "Professional service provider available for local projects and consultations."}
                          </p>

                          <div className="mb-6 flex flex-wrap items-center gap-y-2 text-xs font-medium text-gray-500">
                            <span className="mr-4 flex items-center gap-1">
                              💵 ${worker.price || 40}/hr
                            </span>
                            <span className="mr-4 flex items-center gap-1">
                              ⚡ {worker.responseTime || "Replies fast"}
                            </span>
                            <span className="flex items-center gap-1">
                              📅 {worker.availability || "Flexible schedule"}
                            </span>
                          </div>

                          <div className="mt-auto space-y-3">
                            {worker.mockOffset && (
                              <a
                                href={`https://www.google.com/maps?q=${worker.mockOffset.lat},${worker.mockOffset.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full rounded-xl border border-blue-600 bg-white py-4 text-center font-bold text-blue-600 transition hover:bg-blue-50"
                              >
                                📍 Open in Google Maps
                              </a>
                            )}

                            {getEstimatorConfig(worker.profession) !== null && (
                              <button
                                type="button"
                                onClick={() => setSelectedWorkerForWizard(worker)}
                                className="block w-full rounded-xl border border-emerald-600 bg-emerald-50 text-center font-bold text-emerald-700 py-4 hover:bg-emerald-100/50 transition-all text-sm focus:outline-none"
                              >
                                🧮 Calculate Smart Estimate
                              </button>
                            )}

                            <Link
                              to={`/worker/${worker.id}`}
                              onClick={() => handleRecentlyViewed(worker)}
                              className="block w-full rounded-xl bg-slate-900 py-4 text-center font-bold text-white transition hover:bg-blue-600"
                            >
                              View Profile and Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  />
                </>
              )}
            </div>
            )}

            {/* MAP CONTAINER (Right part of split, sticky) - hidden when in map view */}
            {viewMode !== 'map' && (
            <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-140px)] rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              <MapView
                workers={filteredWorkers}
                selectedWorkerId={selectedWorkerId}
                onMarkerClick={handleMarkerClick}
              />
            </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Compare Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <span className="text-sm font-bold text-gray-700">
            Compare ({compareIds.length}/3)
          </span>
          <div className="flex gap-2">
            {getCompareWorkerNames().map((name, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {name}
                <button
                  type="button"
                  onClick={() => removeCompare(compareIds[idx])}
                  className="hover:text-red-500 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={goToCompare}
            disabled={compareIds.length < 2}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              compareIds.length >= 2
                ? "bg-slate-900 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Compare Now
          </button>
        </div>
      )}
      {selectedWorkerForWizard && (
        <EstimateWizard
          isOpen={!!selectedWorkerForWizard}
          onClose={() => setSelectedWorkerForWizard(null)}
          worker={selectedWorkerForWizard}
        />
      )}
    </div>
  );
};
export default Services;
