import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

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
    mockOffset: { lat: 0.012, lon: 0.008 },
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
    mockOffset: { lat: -0.005, lon: 0.02 },
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
    mockOffset: { lat: 0.03, lon: -0.015 },
    verified: true,
  },
];

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
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
};

const Services = () => {
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

  useEffect(() => {
    setLoading(true);

    const timer = window.setTimeout(() => {
      setWorkers(mockWorkers);

      const storedRecent =
        JSON.parse(localStorage.getItem("recentWorkers")) || [];

      setRecentWorkers(storedRecent);

      setLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = {};

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (categoryFilter !== "All") {
      params.category = categoryFilter;
    }

    if (sortBy !== "distance") {
      params.sort = sortBy;
    }

    setSearchParams(params);
  }, [categoryFilter, searchQuery, setSearchParams, sortBy]);

  const filteredWorkers = useMemo(() => {
    let result = workers.map((worker) => {
      if (!coords) {
        return { ...worker, distanceKm: null };
      }

      const workerLat = coords.latitude + worker.mockOffset.lat;
      const workerLon = coords.longitude + worker.mockOffset.lon;

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
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Find Reliable Services Near You
        </h1>

        <p className="mt-2 text-gray-500">
          {locationStatus === "success"
            ? "Showing nearby professionals"
            : locationStatus === "loading"
              ? "Detecting your location..."
              : "Enable location for better distance results"}
        </p>
      </div>

      <div className="mb-10 space-y-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by worker or service..."
            className="w-full flex-1 rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="distance">
              📍 Nearest
            </option>

            <option value="rating">
              ⭐ Top Rated
            </option>

            <option value="price">
              💰 Lowest Price
            </option>

          </select>
        </div>

        {/* CATEGORY PILLS */}

        <div className="flex gap-3 mt-5 overflow-x-auto pb-1 scrollbar-hide">

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`
                shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }
              `}
            >

              {cat !== "All" && iconMap[cat] && (
                <span className="mr-2">
                  {iconMap[cat]}
                </span>
              )}

              {cat}

            </button>
          ))}

        </div>

      </div>

    </div>

  </div>

</section>

      {recentWorkers.length > 0 && (
        <div className="mb-14">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-2xl">⭐</span>

            <h2 className="text-2xl font-bold text-gray-900">
              Recently Viewed Professionals
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
                  {worker.profession}
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

      {loading ? (
        <LoadingSpinner />
      ) : filteredWorkers.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900">No workers found</h3>

          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Try a broader search or reset the selected category.
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
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm font-medium text-gray-500">
            Showing {filteredWorkers.length} professionals
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
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-2xl font-bold text-gray-900">
                    {worker.name}
                  </h3>

                  <p className="text-blue-600 font-medium mt-1">
                    {w.profession}
                  </p>

                </div>

                <div
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    w.available
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {w.available ? "Available" : "Busy"}
                </div>

              </div>

              {/* STATS */}

              <div className="grid grid-cols-2 gap-4 mt-auto pt-6">

                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-1">
                    Rating
                  <p className="mb-4 font-bold text-blue-600">
                    {worker.profession}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {worker.availability}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      {worker.responseTime}
                    </span>
                  </div>

                  <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">
                      Rating {worker.rating}
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
                    {worker.outcomeText}
                  </p>
                </div>

                {/* BUTTONS */}

                <div className="grid grid-cols-2 gap-3">

                  <button className="border border-slate-300 rounded-2xl py-3 font-medium hover:border-blue-500 hover:text-blue-600 transition">

                    Chat Now

                  </button>

                  <Link
                    to={`/worker/${w.id}`}
                    className="bg-slate-900 text-white text-center py-3 rounded-2xl font-medium hover:bg-blue-600 transition"
                  >
                    {w.instantBooking
                      ? "Book Instantly"
                      : "Request Booking"}
                  </Link>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <LoadingSpinner />
        ) : processedWorkers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-24 text-center">

            <div className="text-7xl mb-6">
              🔍
            </div>

            <h3 className="text-3xl font-bold text-slate-900">

              No Professionals Found

            </h3>

            <p className="text-slate-500 mt-3">

              Try another keyword or category filter

            </p>

          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8">

            {processedWorkers.map((w) => (
              <div
                key={w.id}
                className="group relative bg-white border border-slate-200 rounded-[30px] p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                 <div className="flex-1 flex flex-col">
                {/* RECOMMENDED */}

                {w.recommended && (
                  <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">

                    ⭐ Recommended

                  </div>
                )}

                {/* TOP */}

                <div className="flex items-start gap-4">

                  {/* ICON */}

                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-110 transition duration-300">

                    {iconMap[w.profession]}

                  </div>

                  {/* INFO */}

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">

                        {w.name}

                      </h3>

                      {w.verified && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">

                          ✓ Verified

                        </span>
                      )}

                    </div>

                    <p className="text-blue-600 font-semibold mt-1 text-lg min-h-[28px]">

                      {w.profession}

                    </p>

                    {/* PRIMARY DECISION */}

                    <div className="flex flex-wrap gap-2 mt-4">

                      <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">

                        ⭐ {w.rating}

                      </div>

                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">

                        💰 ${w.price}/hr

                      </div>

                      <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">

                        🛠 {w.experience} yrs

                      </div>

                    </div>

                  </div>

                </div>

                {/* AVAILABILITY */}

                <div className="mt-6 flex items-center justify-between">

                  <div
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      w.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {w.available
                      ? "Available Now"
                      : "Currently Busy"}
                  </div>

                  {w.distanceKm && (
                    <div className="text-sm font-semibold text-slate-600">

                      📍 {formatDistance(w.distanceKm)}

                    </div>
                  )}

                </div>

                {/* STATS */}

                <div className="grid grid-cols-3 gap-3 mt-6 auto-rows-fr">

                  <div className="bg-slate-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Jobs
                    </p>

                    <h4 className="font-bold text-slate-900 mt-1">

                      {w.completedJobs}+

                    </h4>

                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Response
                    </p>

                    <h4 className="font-bold text-slate-900 mt-1">

                      {w.responseTime}

                    </h4>

                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Success
                    </p>

                    <h4 className="font-bold text-emerald-600 mt-1">

                      {w.successRate}%

                    </h4>

                  </div>

                </div>

                {/* SERVICE DETAILS */}

                <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">

                  <div className="flex items-center justify-between">

                    <span className="text-slate-500 text-sm">

                      🚀 Booking Type

                    </span>

                    <span
                      className={`font-semibold text-sm ${
                        w.instantBooking
                          ? "text-emerald-600"
                          : "text-orange-500"
                      }`}
                    >
                      {w.instantBooking
                        ? "Instant Confirmation"
                        : "Approval Required"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-slate-500 text-sm">

                      ⏱ Arrival Time

                    </span>

                    <span className="font-semibold text-slate-900 text-sm">

                      {w.arrivalTime}

                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-slate-500 text-sm">

                      🛡 Warranty

                    </span>

                    <span className="font-semibold text-slate-900 text-sm">

                      {w.serviceWarranty}

                    </span>

                  </div>

                </div>

                {/* OUTCOME BOX */}

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 min-h-[88px] flex items-center">

                  <p className="text-sm leading-relaxed text-slate-700">

                    {w.instantBooking
                      ? `Book instantly and expect arrival within ${w.arrivalTime}.`
                      : `Worker approval required before booking confirmation.`}

                  </p>

                </div>

                {/* BUTTONS */}

                <div className="grid grid-cols-2 gap-4 mt-6">

                  <button className="border border-slate-300 rounded-2xl py-3.5 font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">

                    Chat Now

                  </button>

                  <Link
                    to={`/worker/${w.id}`}
                    className="bg-slate-900 text-white text-center py-3.5 rounded-2xl font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200"
                  >
                    {w.instantBooking
                      ? "Book Instantly"
                      : "Request Booking"}
                  </Link>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Services;
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔗 URL Synced State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "distance");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workers, setWorkers] = useState([]);

  // 🌍 Location
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const categories = [
    "All","Electrician","Plumber","Carpenter","Painter",
    "AC Technician","Cleaner","Mechanic","Gardener",
    "Appliance Repair","Pest Control"
  ];

  const iconMap = {
    Electrician: "⚡", Plumber: "🚰", Carpenter: "🪵", Painter: "🎨",
    "AC Technician": "❄️", Cleaner: "🧹", Mechanic: "🔧",
    Gardener: "🌱", "Appliance Repair": "🔌", "Pest Control": "🐜",
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (dist) => {
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  // 🌍 LOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus("success");
      },
      () => setLocationStatus("denied")
    );
  }, []);

  // 🔗 Sync URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sortBy !== "distance") params.sort = sortBy;

    setSearchParams(params);
  }, [searchQuery, categoryFilter, sortBy]);

  // 📦 Mock Data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWorkers([
        { id: 1, name: "John Doe", profession: "Electrician", rating: 4.8, price: 40, mockOffset: { lat: 0.012, lon: 0.008 }, verified: true },
        { id: 2, name: "Jane Smith", profession: "Plumber", rating: 4.9, price: 50, mockOffset: { lat: -0.005, lon: 0.02 }, verified: true },
        { id: 3, name: "Mike Johnson", profession: "Carpenter", rating: 4.5, price: 35, mockOffset: { lat: 0.03, lon: -0.015 }, verified: true },
        { id: 4, name: "Ravi Kumar", profession: "Painter", rating: 4.6, price: 30, mockOffset: { lat: -0.022, lon: -0.01 }, verified: true },
        { id: 5, name: "Amit Sharma", profession: "AC Technician", rating: 4.7, price: 45, mockOffset: { lat: 0.008, lon: -0.025 }, verified: true },
        { id: 6, name: "Suresh Patel", profession: "Cleaner", rating: 4.3, price: 25, mockOffset: { lat: 0.050, lon: 0.030 }, verified: true },
        { id: 7, name: "David Lee", profession: "Mechanic", rating: 4.8, price: 55, mockOffset: { lat: -0.040, lon: 0.015 }, verified: true },
        { id: 8, name: "Priya Singh", profession: "Gardener", rating: 4.4, price: 20, mockOffset: { lat: 0.003, lon: 0.004 }, verified: true },
        { id: 9, name: "Imran Khan", profession: "Appliance Repair", rating: 4.6, price: 35, mockOffset: { lat: -0.018, lon: -0.030 }, verified: true },
        { id: 10, name: "Neha Gupta", profession: "Pest Control", rating: 4.5, price: 40, mockOffset: { lat: 0.025, lon: -0.005 }, verified: true },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // 🔍 Filter + Sort
  const filteredWorkers = useMemo(() => {
    let result = workers.map((w) => {
      if (!coords) return { ...w, distanceKm: null };
      const workerLat = coords.latitude + w.mockOffset.lat;
      const workerLon = coords.longitude + w.mockOffset.lon;
      return {
        ...w,
        distanceKm: getDistanceKm(coords.latitude, coords.longitude, workerLat, workerLon),
      };
    });

    result = result.filter((w) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = w.name.toLowerCase().includes(q) || w.profession.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || w.profession === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "distance") {
      result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [workers, coords, searchQuery, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Find Reliable Services Near You
        </h1>
        <p className="text-gray-500 mt-2">
          {locationStatus === "success"
            ? "Showing nearby professionals"
            : locationStatus === "loading"
            ? "Detecting your location..."
            : "Enable location for better results"}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or service..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600 shadow-sm'
              }`}
            >
              {cat !== "All" && iconMap[cat] && <span className="mr-2">{iconMap[cat]}</span>}
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {[
            { id: 'distance', label: '📍 Nearest', icon: '📍' },
            { id: 'rating', label: '⭐ Top Rated', icon: '⭐' },
            { id: 'price', label: '💰 Lowest Price', icon: '💰' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSortBy(type.id)}
              className={`px-4 py-2 rounded-lg border transition ${
                sortBy === type.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-20 text-red-600 font-medium">{error}</div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🔦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Try broadening your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Showing {filteredWorkers.length} professionals found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {iconMap[worker.profession] || '👷'}
                    </div>
                    {worker.verified && (
                      <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {worker.name}
                  </h3>
                  <p className="text-blue-600 font-bold mb-4">{worker.profession}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-bold text-gray-900">{worker.rating}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="font-bold text-gray-900">${worker.price}/hr</div>
                    {worker.distanceKm && (
                      <>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="font-bold text-gray-900">📍 {formatDistance(worker.distanceKm)}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-8 pt-0">
                  <Link
                    to={`/worker/${worker.id}`}
                    onClick={() => handleRecentlyViewed(worker)}
                    className="block w-full rounded-xl bg-gray-900 py-4 text-center font-bold text-white transition-all duration-300 hover:bg-blue-600"
                  >
                    View Profile and Book
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
