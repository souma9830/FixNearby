import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchWorkers } from "../services/workerService";

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

const professionTranslationKeys = {
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

const translatedCategory = (t, category) => {
  if (category === "All") return t("services.categories.all");
  const key = professionTranslationKeys[category];
  return key ? t(key) : category;
};

const availabilityTranslationKeys = {
  "Available today": "services.availability.availableToday",
  "Next slot this afternoon": "services.availability.nextSlotAfternoon",
  "Available tomorrow morning": "services.availability.availableTomorrowMorning",
  "Next slot tomorrow": "services.availability.nextSlotTomorrow",
  "Emergency slots open": "services.availability.emergencySlotsOpen",
  "Weekend availability": "services.availability.weekendAvailability",
  "Available this evening": "services.availability.availableThisEvening",
  "Morning slots open": "services.availability.morningSlotsOpen",
  "Inspection slots open": "services.availability.inspectionSlotsOpen",
};

const responseTimeTranslationKeys = {
  "Replies in 20 min": "services.responseTime.replies20",
  "Replies in 15 min": "services.responseTime.replies15",
  "Replies in 35 min": "services.responseTime.replies35",
  "Replies in 25 min": "services.responseTime.replies25",
  "Replies in 10 min": "services.responseTime.replies10",
  "Replies in 30 min": "services.responseTime.replies30",
  "Replies in 40 min": "services.responseTime.replies40",
};

const outcomeTranslationKeys = {
  "Open the full profile to compare pricing, reviews, and booking slots.":
    "services.outcomes.comparePricingReviews",
  "See availability first, then confirm a plumbing booking in one flow.":
    "services.outcomes.confirmPlumbingFlow",
  "Review past work and request a carpentry visit from the profile page.":
    "services.outcomes.requestCarpentryVisit",
  "Check service details and move straight into booking when ready.":
    "services.outcomes.checkDetailsBook",
  "View service scope, urgency fit, and book an AC repair visit quickly.":
    "services.outcomes.acRepairVisit",
  "Open the profile to compare rates and schedule a cleaning appointment.":
    "services.outcomes.cleaningAppointment",
  "See diagnostic pricing and book a mechanic visit with clearer expectations.":
    "services.outcomes.mechanicVisit",
  "Review service options and book a gardener for regular or one-time visits.":
    "services.outcomes.gardenerVisit",
  "Open the profile to check appliance support and request a repair appointment.":
    "services.outcomes.applianceRepair",
  "View treatment details and book an inspection without leaving the flow.":
    "services.outcomes.treatmentInspection",
};

const translatedWorkerMeta = (t, value, keyMap) => {
  const key = keyMap[value];
  return key ? t(key) : value;
};

const iconMap = {
  Electrician: "⚡",
  Plumber: "🚰",
  Carpenter: "🪵",
  Painter: "🎨",
  "AC Technician": "❄️",
  Cleaner: "🧹",
  Mechanic: "🔧",
  Gardener: "🌱",
  "Appliance Repair": "🔌",
  "Pest Control": "🐜",
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return radiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatDistance = (distance) => {
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
};

const Services = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "All",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "distance");

  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [recentWorkers, setRecentWorkers] = useState([]);

  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  // GEOLOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("success");
      },
      () => {
        setLocationStatus("denied");
      },
    );
  }, []);

  // LOAD WORKERS
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const backendWorkers = await fetchWorkers();
        // Merge backend workers and mock workers, preventing duplicate IDs
        if (backendWorkers && backendWorkers.length > 0) {
          const merged = new Map();
          mockWorkers.forEach(w => merged.set(w.id, w));
          backendWorkers.forEach(w => merged.set(w.id, w));
          setWorkers(Array.from(merged.values()));
        } else {
          setWorkers(mockWorkers);
        }
      } catch (err) {
        console.error("Failed to fetch workers, falling back to mock data", err);
        setWorkers(mockWorkers);
      } finally {
        const storedRecent =
          JSON.parse(localStorage.getItem("recentWorkers")) || [];
        setRecentWorkers(storedRecent);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // SYNC URL PARAMS
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sortBy !== "distance") params.sort = sortBy;
    setSearchParams(params);
  }, [categoryFilter, searchQuery, setSearchParams, sortBy]);

  // FILTER + SORT
  const filteredWorkers = useMemo(() => {
    let result = workers.map((worker) => {
      if (!coords) return { ...worker, distanceKm: null };
      const workerLat = worker.mockOffset.lat;
      const workerLon = worker.mockOffset.lon;
      return {
        ...worker,
        distanceKm: getDistanceKm(
          coords.latitude,
          coords.longitude,
          workerLat,
          workerLon,
        ),
      };
    });

    result = result.filter((worker) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !search ||
        worker.name.toLowerCase().includes(search) ||
        worker.profession.toLowerCase().includes(search);
      const matchesCategory =
        categoryFilter === "All" || worker.profession === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    } else {
      result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return result;
  }, [categoryFilter, coords, searchQuery, sortBy, workers]);

  const handleRecentlyViewed = (worker) => {
    let stored = JSON.parse(localStorage.getItem("recentWorkers")) || [];
    stored = stored.filter((item) => item.id !== worker.id);
    stored.unshift(worker);
    stored = stored.slice(0, 5);
    localStorage.setItem("recentWorkers", JSON.stringify(stored));
    setRecentWorkers(stored);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* HEADER */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          {t("services.header.title")}
        </h1>
        <p className="mt-2 text-gray-500">
          {locationStatus === "success"
            ? t("services.locationStatus.success")
            : locationStatus === "loading"
              ? t("services.locationStatus.loading")
              : t("services.locationStatus.default")}
        </p>
      </div>

      {/* FILTERS */}
      <div className="mb-10 space-y-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("services.searchPlaceholder")}
            className="w-full flex-1 rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="distance">📍 {t("services.sort.nearest")}</option>
            <option value="rating">⭐ {t("services.sort.topRated")}</option>
            <option value="price">💰 {t("services.sort.lowestPrice")}</option>
          </select>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                categoryFilter === cat
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {cat !== "All" && iconMap[cat] && (
                <span className="mr-2">{iconMap[cat]}</span>
              )}
              {translatedCategory(t, cat)}
            </button>
          ))}
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      {recentWorkers.length > 0 && (
        <div className="mb-14">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("services.recentlyViewed")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentWorkers.map((worker) => (
              <div
                key={worker.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">
                  {iconMap[worker.profession] || "👷"}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {worker.name}
                </h3>
                <p className="mb-3 font-medium text-blue-600">
                  {translatedCategory(t, worker.profession)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>⭐ {worker.rating}</span>
                  <span>${worker.price}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKER CARDS */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredWorkers.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900">{t("services.emptyState.title")}</h3>
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            {t("services.emptyState.description")}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("All");
              setSortBy("distance");
            }}
            className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            {t("services.emptyState.resetFilters")}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm font-medium text-gray-500">
            {t("services.showingCount", { count: filteredWorkers.length })}
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-2xl"
              >
                <div className="flex-1 p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
                      {iconMap[worker.profession] || "👷"}
                    </div>
                    {worker.verified && (
                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                        {t("services.verified")}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-2xl font-bold text-gray-900">
                    {worker.name}
                  </h3>
                  <p className="mb-4 font-bold text-blue-600">
                    {translatedCategory(t, worker.profession)}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {translatedWorkerMeta(t, worker.availability, availabilityTranslationKeys)}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      {translatedWorkerMeta(t, worker.responseTime, responseTimeTranslationKeys)}
                    </span>
                  </div>

                  <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">
                      {t("services.ratingLabel", { rating: worker.rating })}
                    </span>
                    <span className="font-bold text-gray-900">
                      ${worker.price}/hr
                    </span>
                    {worker.distanceKm !== null && (
                      <span className="font-bold text-gray-900">
                        {formatDistance(worker.distanceKm)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {translatedWorkerMeta(t, worker.outcomeText, outcomeTranslationKeys)}
                  </p>
                </div>

                <div className="p-8 pt-0 space-y-3">
                    <a
                      title={t("services.getDirections")}
                    href={`https://www.google.com/maps?q=${worker.mockOffset.lat},${worker.mockOffset.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl border border-blue-600 bg-white py-4 text-center font-bold text-blue-600 transition hover:bg-blue-50"
                    >
                      📍 {t("services.openInGoogleMaps")}
                    </a>

                    <Link
                      to={`/worker/${worker.id}`}
                      onClick={() => handleRecentlyViewed(worker)}
                      className="block w-full rounded-xl bg-slate-900 py-4 text-center font-bold text-white transition hover:bg-blue-600"
                    >
                      {t("services.viewProfileAndBook")}
                    </Link>
                  </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Services;