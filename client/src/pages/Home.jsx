import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { formatDistance, getDistanceKm } from '../utils/distance';
import { getNearbyIssues } from '../services/issueService';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ children, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const IconSearch = ({ className = '' }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);
const IconCalendar = ({ className = '' }) => (
  <Icon className={className}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
    <path d="M8 3.5v4" />
    <path d="M16 3.5v4" />
    <path d="M4 9h16" />
  </Icon>
);
const IconCheckCircle = ({ className = '' }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.2 2.2L16 9.5" />
  </Icon>
);
const IconBolt = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M13 2L4 14h7l-1 8 10-14h-7z" />
  </Icon>
);
const IconPipe = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M8 6h6a3 3 0 013 3v2" />
    <path d="M17 11h-6a3 3 0 00-3 3v4" />
    <path d="M7 18h2" />
    <path d="M15 6h2" />
  </Icon>
);
const IconSaw = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M5 15l7-7 7 7" />
    <path d="M6.5 13.5l-2 2" />
    <path d="M17.5 13.5l2 2" />
    <path d="M8 17h8" />
  </Icon>
);
const IconBrush = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M14 3l7 7-7 7-7-7z" />
    <path d="M7 14l-3 7" />
    <path d="M5 18h4" />
  </Icon>
);
const IconBroom = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M10 3l8 8" />
    <path d="M9 8l7 7" />
    <path d="M3 21l6-6" />
    <path d="M5 19l3 3" />
  </Icon>
);
const IconSnowflake = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M12 2v20" />
    <path d="M4.5 6.5l15 11" />
    <path d="M19.5 6.5l-15 11" />
  </Icon>
);
const IconBug = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M9 9h6" />
    <path d="M10 6l2-2 2 2" />
    <rect x="8" y="9" width="8" height="10" rx="4" />
    <path d="M6 13h2" />
    <path d="M16 13h2" />
    <path d="M7 19l-2 2" />
    <path d="M17 19l2 2" />
  </Icon>
);
const IconStar = ({ className = '', filled = false }) => (
  <Icon className={className}>
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={filled ? 'currentColor' : 'none'}
    />
  </Icon>
);
const IconSparkle = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
  </Icon>
);
const IconFilter = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M4 6h16M8 12h8M11 18h2" />
  </Icon>
);
const IconMapPin = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </Icon>
);
const IconClock = ({ className = '' }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Icon>
);
const IconTrendingUp = ({ className = '' }) => (
  <Icon className={className}>
    <path d="M3 17l5-5 4 4 9-9" />
    <path d="M15 7h5v5" />
  </Icon>
);

// ─── Worker Data ──────────────────────────────────────────────────────────────
const ALL_WORKERS = [
  {
    id: 1,
    name: 'John Doe',
    profession: 'Electrician',
    rating: 4.8,
    price: '$40/hr',
    availability: 'Available today',
    responseTime: 'Replies in 20 min',
    responseMinutes: 20,
    totalBookings: 142,
    repeatCustomers: 38,
    mockOffset: { lat: 0.012, lon: 0.008 },
    outcomeText: 'Open the profile to compare pricing, reviews, and booking options.',
  },
  {
    id: 2,
    name: 'Jane Smith',
    profession: 'Plumber',
    rating: 4.9,
    price: '$50/hr',
    availability: 'Next slot this afternoon',
    responseTime: 'Replies in 15 min',
    responseMinutes: 15,
    totalBookings: 198,
    repeatCustomers: 55,
    mockOffset: { lat: -0.005, lon: 0.02 },
    outcomeText: 'See availability first, then confirm a plumbing booking in one flow.',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    profession: 'Carpenter',
    rating: 4.5,
    price: '$35/hr',
    availability: 'Available tomorrow',
    responseTime: 'Replies in 35 min',
    responseMinutes: 35,
    totalBookings: 87,
    repeatCustomers: 20,
    mockOffset: { lat: 0.03, lon: -0.015 },
    outcomeText: 'Review past work and request a carpentry visit from the profile page.',
  },
  {
    id: 4,
    name: 'Ravi Kumar',
    profession: 'Painter',
    rating: 4.6,
    price: '$30/hr',
    availability: 'Next slot tomorrow',
    responseTime: 'Replies in 25 min',
    responseMinutes: 25,
    totalBookings: 104,
    repeatCustomers: 30,
    mockOffset: { lat: -0.022, lon: -0.01 },
    outcomeText: 'Check service details and move straight into booking when ready.',
  },
  {
    id: 5,
    name: 'Amit Sharma',
    profession: 'AC Technician',
    rating: 4.7,
    price: '$45/hr',
    availability: 'Emergency slots open',
    responseTime: 'Replies in 10 min',
    responseMinutes: 10,
    totalBookings: 160,
    repeatCustomers: 47,
    mockOffset: { lat: 0.008, lon: -0.025 },
    outcomeText: 'View service scope, urgency fit, and book an AC repair visit quickly.',
  },
  {
    id: 6,
    name: 'Suresh Patel',
    profession: 'Cleaner',
    rating: 4.3,
    price: '$25/hr',
    availability: 'Weekend availability',
    responseTime: 'Replies in 30 min',
    responseMinutes: 30,
    totalBookings: 73,
    repeatCustomers: 14,
    mockOffset: { lat: 0.05, lon: 0.03 },
    outcomeText: 'Open the profile to compare rates and schedule a cleaning appointment.',
  },
  {
    id: 7,
    name: 'David Lee',
    profession: 'Mechanic',
    rating: 4.8,
    price: '$55/hr',
    availability: 'Available this evening',
    responseTime: 'Replies in 20 min',
    responseMinutes: 20,
    totalBookings: 175,
    repeatCustomers: 60,
    mockOffset: { lat: -0.04, lon: 0.015 },
    outcomeText: 'See diagnostic pricing and book a mechanic visit with clearer expectations.',
  },
  {
    id: 8,
    name: 'Priya Singh',
    profession: 'Gardener',
    rating: 4.4,
    price: '$20/hr',
    availability: 'Morning slots open',
    responseTime: 'Replies in 40 min',
    responseMinutes: 40,
    totalBookings: 61,
    repeatCustomers: 12,
    mockOffset: { lat: 0.003, lon: 0.004 },
    outcomeText: 'Review service options and book a gardener for regular or one-time visits.',
  },
  {
    id: 9,
    name: 'Imran Khan',
    profession: 'Appliance Repair',
    rating: 4.6,
    price: '$35/hr',
    availability: 'Next slot tomorrow',
    responseTime: 'Replies in 25 min',
    responseMinutes: 25,
    totalBookings: 92,
    repeatCustomers: 22,
    mockOffset: { lat: -0.018, lon: -0.03 },
    outcomeText: 'Open the profile to check appliance support and request a repair appointment.',
  },
  {
    id: 10,
    name: 'Neha Gupta',
    profession: 'Pest Control',
    rating: 4.5,
    price: '$40/hr',
    availability: 'Inspection slots open',
    responseTime: 'Replies in 15 min',
    responseMinutes: 15,
    totalBookings: 118,
    repeatCustomers: 35,
    mockOffset: { lat: 0.025, lon: -0.005 },
    outcomeText: 'View treatment details and book an inspection without leaving the flow.',
  },
];

const workerIconMap = {
  Electrician: IconBolt,
  Plumber: IconPipe,
  Carpenter: IconSaw,
  Painter: IconBrush,
  'AC Technician': IconSnowflake,
  Cleaner: IconBroom,
  Mechanic: IconSaw,
  Gardener: IconBroom,
  'Appliance Repair': IconBolt,
  'Pest Control': IconBug,
};

const CATEGORIES = ['All', ...new Set(ALL_WORKERS.map((w) => w.profession))];

const POPULAR_CATEGORIES = [
  { name: 'Electrician', icon: IconBolt, description: 'Wiring, switches & electrical repairs', count: '120+ Pros' },
  { name: 'Plumber', icon: IconPipe, description: 'Pipe leaks, drainage & bathroom fittings', count: '95+ Pros' },
  { name: 'Carpenter', icon: IconSaw, description: 'Furniture repair, custom woodwork & locks', count: '80+ Pros' },
  { name: 'Painter', icon: IconBrush, description: 'Interior wall painting, touchups & coating', count: '110+ Pros' },
  { name: 'AC Technician', icon: IconSnowflake, description: 'AC servicing, gas refilling & repair', count: '75+ Pros' },
  { name: 'Cleaner', icon: IconBroom, description: 'Deep home cleaning, sofa & carpet care', count: '140+ Pros' },
  { name: 'Pest Control', icon: IconBug, description: 'Termite, cockroach & pest treatment', count: '60+ Pros' },
  { name: 'Appliance Repair', icon: IconBolt, description: 'Washing machine, fridge & oven repair', count: '85+ Pros' },
];

// ─── Recommendation Score Engine ─────────────────────────────────────────────
const calcRecommendationScore = (worker, distanceKm) => {
  // Rating  : 0–30 pts
  const ratingScore = (worker.rating / 5) * 30;
  // Distance: 0–25 pts (max 50 km range)
  const distScore = distanceKm != null ? Math.max(0, 25 - distanceKm * 1.5) : 12;
  // Bookings: 0–20 pts
  const bookingScore = Math.min(20, worker.totalBookings * 0.1);
  // Response: 0–15 pts
  const respScore = Math.max(0, 15 - worker.responseMinutes * 0.25);
  // Repeat  : 0–10 pts
  const repeatScore = Math.min(10, worker.repeatCustomers * 0.18);

  return parseFloat((ratingScore + distScore + bookingScore + respScore + repeatScore).toFixed(1));
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card-hover animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded-full bg-slate-200" />
        <div className="h-3 w-1/2 rounded-full bg-slate-200" />
      </div>
    </div>
    <div className="h-3 w-full rounded-full bg-slate-100" />
    <div className="h-3 w-4/5 rounded-full bg-slate-100" />
    <div className="flex gap-2">
      <div className="h-6 w-24 rounded-full bg-slate-100" />
      <div className="h-6 w-24 rounded-full bg-slate-100" />
    </div>
    <div className="h-10 w-full rounded-xl bg-slate-200" />
  </div>
);

const ScoreBadge = ({ score }) => {
  const color =
    score >= 70
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 55
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${color}`}
    >
      <IconSparkle className="h-3 w-3" />
      {score} pts
    </span>
  );
};

const RecommendedWorkerCard = ({ worker, rank }) => {
  const WorkerIcon = workerIconMap[worker.profession] || IconBolt;

  return (
    <div
      className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Rank ribbon */}
      {rank <= 3 && (
        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-extrabold text-white shadow-sm">
          #{rank}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <WorkerIcon className="h-7 w-7 text-slate-800" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-900 dark:text-white">{worker.name}</h3>
          <p className="text-sm font-semibold text-[#0056D2]">{worker.profession}</p>
        </div>
      </div>

      {/* Score */}
      <div className="mb-3 flex items-center gap-2">
        <ScoreBadge score={worker.recommendationScore} />
        {worker.distanceKm != null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <IconMapPin className="h-3 w-3" />
            {formatDistance(worker.distanceKm)}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          <IconClock className="h-3 w-3" />
          {worker.responseTime}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
          {worker.availability}
        </span>
      </div>

      {/* Rating + Price */}
      <div className="mb-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1 font-semibold text-amber-500">
          <IconStar className="h-4 w-4" filled />
          {worker.rating}
        </span>
        <span className="h-4 w-px bg-slate-300" />
        <span className="font-semibold text-slate-800">{worker.price}</span>
        <span className="h-4 w-px bg-slate-300" />
        <span className="flex items-center gap-1">
          <IconTrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          {worker.totalBookings} jobs
        </span>
      </div>

      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {worker.outcomeText}
      </p>

      <Link
        to={`/worker/${worker.id}`}
        className="mt-auto block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0056D2]"
      >
        View Profile & Book
      </Link>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Home = () => {
  const { coords, loading: geoLoading, error: geoError } = useLocation();
  const { t } = useTranslation();

  useDocumentTitle('Home');
  const [recLoading, setRecLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [trendingIssues, setTrendingIssues] = useState([]);

  // Simulate async fetch of recommendations
  useEffect(() => {
    const timer = setTimeout(() => setRecLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const lat = coords?.latitude || 17.4065;
        const lng = coords?.longitude || 78.4772;
        const data = await getNearbyIssues({ latitude: lat, longitude: lng, radiusKm: 50 });
        const list = data?.data || data || [];
        setTrendingIssues(Array.isArray(list) ? list.slice(0, 3) : []);
      } catch (e) {
        console.warn('Failed to load trending issues for Home:', e.message);
      }
    };
    fetchTrending();
  }, [coords]);

  // ── Closest workers (existing logic) ───────────────────────────────────────
  const nearbyWorkers = useMemo(() => {
    if (!coords) return [];
    return ALL_WORKERS.map((worker) => ({
      ...worker,
      distanceKm: getDistanceKm(
        coords.latitude,
        coords.longitude,
        coords.latitude + worker.mockOffset.lat,
        coords.longitude + worker.mockOffset.lon
      ),
    }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [coords]);

  // ── Recommended workers (AI scoring) ──────────────────────────────────────
  const recommendedWorkers = useMemo(() => {
    let workers = ALL_WORKERS.map((worker) => {
      const distanceKm = coords
        ? getDistanceKm(
            coords.latitude,
            coords.longitude,
            coords.latitude + worker.mockOffset.lat,
            coords.longitude + worker.mockOffset.lon
          )
        : null;
      return {
        ...worker,
        distanceKm,
        recommendationScore: calcRecommendationScore(worker, distanceKm),
      };
    });

    // Apply filters
    if (activeCategory !== 'All') {
      workers = workers.filter((w) => w.profession === activeCategory);
    }
    if (minRating > 0) {
      workers = workers.filter((w) => w.rating >= minRating);
    }

    // Sort by score
    workers = workers.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return showAll ? workers : workers.slice(0, 6);
  }, [coords, activeCategory, minRating, showAll]);

  const totalFiltered = useMemo(() => {
    let workers = ALL_WORKERS;
    if (activeCategory !== 'All') workers = workers.filter((w) => w.profession === activeCategory);
    if (minRating > 0) workers = workers.filter((w) => w.rating >= minRating);
    return workers.length;
  }, [activeCategory, minRating]);

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {' '}
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-100 blur-3xl opacity-50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT CONTENT */}
            <div className="max-w-2xl">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Trusted by 10,000+ homeowners
              </div>

              {/* Main heading */}
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                {' '}
                {t('hero.headline')}
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400 sm:text-xl">
                {' '}
                {t('hero.subtext')}
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0056D2] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0047AF]"
                >
                  {t('hero.findPro') || 'Find a Pro'}
                </Link>

                <Link
                  to="/worker/register"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white dark:bg-slate-800 px-8 py-4 text-base font-bold text-slate-800 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {t('hero.becomePro') || 'Become a Pro'}
                </Link>
              </div>

              {/* Trust stats */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { number: '10K+', label: t('stats.customers') },
                  { number: '500+', label: t('stats.pros') },
                  { number: '24/7', label: t('stats.support') },
                  { number: '4.9★', label: t('stats.rating') },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {' '}
                      {item.number}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {' '}
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* RIGHT IMAGE SECTION */}
            <div className="relative mt-12 lg:mt-0" style={{ padding: '24px 20px 28px' }}>
              {/* Main image */}
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/30 via-slate-900/08 to-transparent z-10" />
                <img
                  src="/hero-section.png"
                  alt="Home service professional"
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                  loading="eager"
                />
              </div>

              {/* Floating rating card — top-left, outside the frame */}
              <div className="absolute -top-5 -left-4 rounded-2xl border border-white/50 bg-white/95 dark:border-slate-700/50 dark:bg-slate-800/95 p-4 shadow-xl backdrop-blur-md z-20 animate-float">
                {' '}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
                    <IconStar className="h-5 w-5 text-amber-500" filled />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      4.9/5 Rating
                    </div>{' '}
                    <p className="text-xs text-slate-500 dark:text-slate-400">Based on reviews</p>
                  </div>
                </div>
              </div>

              {/* Floating quick booking card — bottom-right, outside the frame */}
              <div className="absolute -bottom-5 -right-4 rounded-2xl border border-white/50 bg-white/95 dark:border-slate-700/50 dark:bg-slate-800/95 p-4 shadow-xl backdrop-blur-md z-20 max-w-[220px] animate-float-b">
                {' '}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                    <IconBolt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      Quick Booking
                    </div>{' '}
                    <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Connect with trusted professionals in minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSEST WORKERS ─────────────────────────────────────────────────── */}
      {(geoLoading || coords || geoError) && (
        <section className="bg-white dark:bg-slate-950 py-16 sm:py-20">
          {' '}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  <span
                    className={`h-2 w-2 rounded-full bg-emerald-500 ${coords ? 'animate-pulse' : ''}`}
                  />
                  {coords
                    ? 'Live location'
                    : geoLoading
                      ? 'Detecting location...'
                      : 'Location unavailable'}
                </div>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                  Closest to you
                </h2>
              </div>
              <Link to="/services" className="font-semibold text-[#0056D2] hover:underline">
                Browse all pros
              </Link>
            </div>

            {geoLoading && (
              <div className="py-12 text-center font-medium text-slate-500 dark:text-slate-400">
                Requesting location permission...
              </div>
            )}
            {geoError && !geoLoading && (
              <div className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-amber-50 py-10 text-center">
                <p className="font-semibold text-amber-900">{geoError}</p>
              </div>
            )}
            {coords && nearbyWorkers.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {nearbyWorkers.map((worker) => {
                  const WorkerIcon = workerIconMap[worker.profession] || IconBolt;
                  return (
                    <div
                      key={worker.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div className="mb-5 flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                          <WorkerIcon className="h-8 w-8 text-slate-900 dark:text-white" />
                        </div>
                        <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          Near you: {formatDistance(worker.distanceKm)}
                        </div>
                      </div>
                      <h3 className="mb-0.5 text-xl font-bold text-slate-900 dark:text-white">
                        {worker.name}
                      </h3>
                      <p className="mb-4 text-sm font-semibold text-[#0056D2]">
                        {worker.profession}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          {worker.availability}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          {worker.responseTime}
                        </span>
                      </div>
                      <div className="mb-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>Rating {worker.rating}</span>
                        <div className="h-4 w-px bg-slate-300" />
                        <span>{worker.price}</span>
                      </div>
                      <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {worker.outcomeText}
                      </p>
                      <Link
                        to={`/worker/${worker.id}`}
                        className="block w-full rounded-xl bg-slate-900 py-3.5 text-center font-bold text-white transition hover:bg-[#0056D2]"
                      >
                        View Profile and Book
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── AI RECOMMENDED WORKERS ──────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700">
                <IconSparkle className="h-3.5 w-3.5" />
                AI-Powered Recommendations
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Recommended For You
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Ranked by rating, proximity, response speed, and booking history.
              </p>
            </div>
            <Link to="/services" className="font-semibold text-[#0056D2] hover:underline shrink-0">
              See all workers
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <IconFilter className="h-4 w-4" /> Filter:
            </span>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setShowAll(false);
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                    activeCategory === cat
                      ? 'border-[#0056D2] bg-[#0056D2] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Min rating filter */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Min rating:
              </span>
              {[0, 4.3, 4.5, 4.7].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMinRating(r);
                    setShowAll(false);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                    minRating === r
                      ? 'border-amber-400 bg-amber-400 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 0 ? 'Any' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Score explanation banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-5 py-4 text-sm text-violet-800">
            <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
            <p>
              <span className="font-bold">How scoring works: </span>
              Each worker is scored up to <strong>100 pts</strong> based on rating (30), proximity
              (25), booking volume (20), response time (15), and repeat customers (10). Higher score
              = better match for you.
            </p>
          </div>

          {/* Cards grid */}
          {recLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : recommendedWorkers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-16 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No workers match the selected filters. Try adjusting them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedWorkers.map((worker, idx) => (
                <motion.div
                  key={worker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.36 }}
                  className="reveal"
                >
                  <RecommendedWorkerCard worker={worker} rank={idx + 1} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Show more / less */}
          {!recLoading && totalFiltered > 6 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900"
              >
                {showAll ? 'Show less' : `Show all ${totalFiltered} workers`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── POPULAR CATEGORIES ────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-950 py-16 sm:py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Popular Service Categories
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-base max-w-2xl mx-auto">
              Explore our top-rated local home services and verified professionals near you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {POPULAR_CATEGORIES.map(({ name, icon: CategoryIcon, description, count }) => (
              <Link
                key={name}
                to={`/services?category=${encodeURIComponent(name)}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-white hover:shadow-xl dark:hover:bg-slate-800"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 group-hover:bg-[#0056D2] group-hover:text-white transition-colors duration-300">
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0056D2] dark:group-hover:text-blue-400 transition-colors">
                    {name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-600">
                  <span>{count}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/60 py-20 sm:py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-5xl font-extrabold text-slate-900 dark:text-white">
            {t('howItWorks.title')}
          </h2>
          <p className="mb-16 text-lg text-slate-600 dark:text-slate-400">
            {t('howItWorks.subtext')}
          </p>
          <div className="grid gap-14 md:grid-cols-3">
            {[
              {
                step: '1',
                title: t('howItWorks.step1'),
                desc: t('howItWorks.step1desc'),
                IconComp: IconSearch,
              },
              {
                step: '2',
                title: t('howItWorks.step2'),
                desc: t('howItWorks.step2desc'),
                IconComp: IconCalendar,
              },
              {
                step: '3',
                title: t('howItWorks.step3'),
                desc: t('howItWorks.step3desc'),
                IconComp: IconCheckCircle,
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="mx-auto mb-6 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <step.IconComp className="h-11 w-11 text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {step.step}. {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-slate-600 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING CIVIC ISSUES ───────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700">
                <IconBolt className="h-3.5 w-3.5" />
                Community Portal
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Trending Civic Issues Nearby
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Reported infrastructure needs, potholes, street lights, and neighborhood requests.
              </p>
            </div>
            <Link
              to="/civic-issues"
              className="font-bold text-[#0056D2] hover:underline shrink-0 text-sm"
            >
              View All Issues Map &rarr;
            </Link>
          </div>

          {trendingIssues.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-xs">
              <p className="text-slate-600 dark:text-slate-400 font-semibold mb-2">
                No active civic issues reported nearby yet.
              </p>
              <Link
                to="/civic-issues/report"
                className="inline-block px-5 py-2.5 bg-[#0056D2] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                Report First Neighborhood Issue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingIssues.slice(0, 3).map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          issue.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : issue.status === 'in-progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {issue.status || 'OPEN'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {issue.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {issue.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      👍 {issue.upvotes || 0} upvotes
                    </span>
                    <Link
                      to="/civic-issues"
                      className="font-bold text-[#0056D2] hover:underline text-xs"
                    >
                      View on Map &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="bg-[#0056D2] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-4xl font-extrabold">{t('cta.title')}</h2>
          <p className="mb-8 text-lg text-white/80">{t('cta.subtext')}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/services"
              className="rounded-xl bg-white dark:bg-slate-800 px-8 py-3 font-semibold text-[#0056D2] shadow-sm transition hover:bg-slate-100"
            >
              {t('cta.findPro')}
            </Link>
            <Link
              to="/worker/register"
              className="rounded-xl border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t('cta.becomePro')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
