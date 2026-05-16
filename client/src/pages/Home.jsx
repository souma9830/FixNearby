import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useLocation } from "../context/LocationContext";
import { formatDistance, getDistanceKm } from "../utils/distance";

const Icon = ({ children, className = "" }) => (
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

const IconSearch = ({ className = "" }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" />
  </Icon>
);

const IconCalendar = ({ className = "" }) => (
  <Icon className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const IconCheckCircle = ({ className = "" }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </Icon>
);

const IconBolt = ({ className = "" }) => (
  <Icon className={className}>
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);

const IconPipe = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M7 7h6a4 4 0 0 1 4 4v6" />
    <circle cx="7" cy="7" r="2" />
    <circle cx="17" cy="17" r="2" />
  </Icon>
);

const IconSaw = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M3 17l5-5 3 3 5-5 5 5" />
  </Icon>
);

const IconBrush = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M14 4l6 6" />
    <path d="M4 20c2 0 4-2 4-4 0-1 1-2 2-2" />
    <path d="M12 12l8-8" />
  </Icon>
);

const IconSnowflake = ({ className = "" }) => (
  <Icon className={className}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
  </Icon>
);

const IconBroom = ({ className = "" }) => (
  <Icon className={className}>
    <line x1="6" y1="4" x2="18" y2="16" />
    <path d="M3 21h8l3-3-8-8-3 3z" />
  </Icon>
);

const IconBug = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M8 9h8v8a4 4 0 0 1-8 0z" />
    <line x1="12" y1="5" x2="12" y2="9" />
    <line x1="5" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="19" y2="12" />
  </Icon>
);

const ALL_WORKERS = [
  {
    id: 1,
    name: "John Doe",
    profession: "Electrician",
    rating: 4.8,
    price: "$40/hr",
    availability: "Available today",
    responseTime: "Replies in 20 min",
    outcomeText: "Open the profile to compare pricing, reviews, and booking options.",
    mockOffset: { lat: 0.012, lon: 0.008 },
  },
  {
    id: 2,
    name: "Jane Smith",
    profession: "Plumber",
    rating: 4.9,
    price: "$50/hr",
    availability: "Next slot this afternoon",
    responseTime: "Replies in 15 min",
    outcomeText: "See availability first, then confirm a plumbing booking in one flow.",
    mockOffset: { lat: -0.005, lon: 0.02 },
  },
  {
    id: 3,
    name: "Mike Johnson",
    profession: "Carpenter",
    rating: 4.5,
    price: "$35/hr",
    availability: "Available tomorrow morning",
    responseTime: "Replies in 35 min",
    outcomeText: "Review past work and request a carpentry visit from the profile page.",
    mockOffset: { lat: 0.03, lon: -0.015 },
  },
  {
    id: 4,
    name: "Ravi Kumar",
    profession: "Painter",
    rating: 4.6,
    price: "$30/hr",
    availability: "Next slot tomorrow",
    responseTime: "Replies in 25 min",
    outcomeText: "Check service details and move straight into booking when ready.",
    mockOffset: { lat: -0.022, lon: -0.01 },
  },
  {
    id: 5,
    name: "Amit Sharma",
    profession: "AC Technician",
    rating: 4.7,
    price: "$45/hr",
    availability: "Emergency slots open",
    responseTime: "Replies in 10 min",
    outcomeText: "View service scope, urgency fit, and book an AC repair visit quickly.",
    mockOffset: { lat: 0.008, lon: -0.025 },
  },
  {
    id: 6,
    name: "Suresh Patel",
    profession: "Cleaner",
    rating: 4.3,
    price: "$25/hr",
    availability: "Weekend availability",
    responseTime: "Replies in 30 min",
    outcomeText: "Open the profile to compare rates and schedule a cleaning appointment.",
    mockOffset: { lat: 0.05, lon: 0.03 },
  },
  {
    id: 7,
    name: "David Lee",
    profession: "Mechanic",
    rating: 4.8,
    price: "$55/hr",
    availability: "Available this evening",
    responseTime: "Replies in 20 min",
    outcomeText: "See diagnostic pricing and book a mechanic visit with clearer expectations.",
    mockOffset: { lat: -0.04, lon: 0.015 },
  },
  {
    id: 8,
    name: "Priya Singh",
    profession: "Gardener",
    rating: 4.4,
    price: "$20/hr",
    availability: "Morning slots open",
    responseTime: "Replies in 40 min",
    outcomeText: "Review service options and book a gardener for regular or one-time visits.",
    mockOffset: { lat: 0.003, lon: 0.004 },
  },
  {
    id: 9,
    name: "Imran Khan",
    profession: "Appliance Repair",
    rating: 4.6,
    price: "$35/hr",
    availability: "Next slot tomorrow",
    responseTime: "Replies in 25 min",
    outcomeText: "Open the profile to check appliance support and request a repair appointment.",
    mockOffset: { lat: -0.018, lon: -0.03 },
  },
  {
    id: 10,
    name: "Neha Gupta",
    profession: "Pest Control",
    rating: 4.5,
    price: "$40/hr",
    availability: "Inspection slots open",
    responseTime: "Replies in 15 min",
    outcomeText: "View treatment details and book an inspection without leaving the flow.",
    mockOffset: { lat: 0.025, lon: -0.005 },
  },
];

const workerIconMap = {
  Electrician: IconBolt,
  Plumber: IconPipe,
  Carpenter: IconSaw,
  Painter: IconBrush,
  "AC Technician": IconSnowflake,
  Cleaner: IconBroom,
  Mechanic: IconSaw,
  Gardener: IconBroom,
  "Appliance Repair": IconBolt,
  "Pest Control": IconBug,
};

const Home = () => {
  const { coords, loading: geoLoading, error: geoError } = useLocation();

  const nearbyWorkers = useMemo(() => {
    if (!coords) {
      return [];
    }

    return ALL_WORKERS.map((worker) => {
      const workerLat = coords.latitude + worker.mockOffset.lat;
      const workerLon = coords.longitude + worker.mockOffset.lon;

      return {
        ...worker,
        distanceKm: getDistanceKm(
          coords.latitude,
          coords.longitude,
          workerLat,
          workerLon
        ),
      };
    })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [coords]);

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative pb-[260px] sm:pb-[220px] lg:pb-[180px]">
            <div className="relative overflow-hidden rounded-[36px] shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <div className="relative h-[320px] sm:h-[380px] lg:h-[420px]">
                <img
                  src="/hero-section.png"
                  alt="Home service professional"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <div className="absolute left-1/2 top-[180px] w-full -translate-x-1/2 px-5 sm:top-[220px] sm:px-8 lg:top-[250px]">
              <div className="mx-auto w-full max-w-[560px] lg:max-w-[720px] rounded-2xl border border-slate-200 bg-white/95 px-7 py-7 text-center shadow-[0_14px_32px_rgba(15,23,42,0.18)] backdrop-blur sm:px-10 sm:py-9">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  Trusted by 10,000+ homeowners
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Reliable Home Services,
                  <span className="block text-[#0056D2]">
                    Right When You Need Them
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                  Find verified professionals near you with fast booking,
                  transparent pricing, and clearer next steps.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center rounded-lg bg-[#0056D2] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0047AF]"
                  >
                    Find a Pro
                  </Link>
                  <Link
                    to="/worker-register"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Become a Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "500+", label: "Verified Pros" },
            { number: "24/7", label: "Support" },
            { number: "4.9/5", label: "Rating" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-xl"
            >
              <div className="text-4xl font-extrabold text-slate-900">
                {item.number}
              </div>
              <p className="mt-2 font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSEST WORKERS SECTION */}
      {(geoLoading || coords || geoError) && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  <span
                    className={`h-2 w-2 rounded-full bg-emerald-500 ${
                      coords ? "animate-pulse" : ""
                    }`}
                  />
                  {coords
                    ? "Live location"
                    : geoLoading
                      ? "Detecting location..."
                      : "Location unavailable"}
                </div>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  Closest to you
                </h2>
              </div>
              <Link
                to="/services"
                className="font-semibold text-[#0056D2] hover:underline"
              >
                Browse all pros
              </Link>
            </div>

            <Link
              to="/services"
              className="text-blue-600 font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {ALL_WORKERS.map((worker) => {
              const WorkerIcon =
                workerIconMap[worker.profession] || IconBolt;

              return (
                <div
                  key={worker.id}
                  className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl transition flex flex-col h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <WorkerIcon className="w-8 h-8 text-slate-900" />
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        worker.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {worker.available ? "Available" : "Busy"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {worker.name}
                  </h3>
            {geoLoading && (
              <div className="py-12 text-center font-medium text-slate-500">
                Requesting location permission...
              </div>
            )}

            {geoError && !geoLoading && (
              <div className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-amber-50 py-10 text-center">
                <p className="font-semibold text-amber-900">{geoError}</p>
              </div>
            )}

                  <div className="flex items-center justify-between mt-5 text-sm mb-6">
                    <span>⭐ {worker.rating}</span>
                    <span className="font-semibold">
                      {worker.price}
                    </span>
                  </div>

                  <Link
                    to={`/worker/${worker.id}`}
                    className="mt-auto block text-center bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Book Now
                  </Link>
                </div>
              );
            })}
            {coords && nearbyWorkers.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {nearbyWorkers.map((worker) => {
                  const WorkerIcon = workerIconMap[worker.profession] || IconBolt;

                  return (
                    <div
                      key={worker.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div className="mb-5 flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <WorkerIcon className="h-8 w-8 text-slate-900" />
                        </div>
                        <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          Near you: {formatDistance(worker.distanceKm)}
                        </div>
                      </div>

                      <h3 className="mb-0.5 text-xl font-bold text-slate-900">
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

                      <div className="mb-6 flex items-center gap-3 text-sm text-slate-600">
                        <span>Rating {worker.rating}</span>
                        <div className="h-4 w-px bg-slate-300" />
                        <span>{worker.price}</span>
                      </div>

                      <p className="mb-6 text-sm leading-6 text-slate-600">
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

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-5xl font-extrabold text-slate-900">
            How it works
          </h2>

          <p className="mb-16 text-lg text-slate-600">
            Three simple steps to get it done.
          </p>

          <div className="grid gap-14 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Search and Select",
                desc: "Browse profiles and read reviews.",
                IconComp: IconSearch,
              },
              {
                step: "2",
                title: "Book Directly",
                desc: "Schedule appointments instantly.",
                IconComp: IconCalendar,
              },
              {
                step: "3",
                title: "Relax and Enjoy",
                desc: "Let the expert handle the job.",
                IconComp: IconCheckCircle,
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="mx-auto mb-6 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                  <step.IconComp className="h-11 w-11 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {step.step}. {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-slate-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#0056D2] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-4xl font-extrabold">Need help today?</h2>
          <p className="mb-8 text-lg text-white/80">
            Book trusted professionals in minutes and get your home back on
            track.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/services"
              className="rounded-xl bg-white px-8 py-3 font-semibold text-[#0056D2] shadow-sm transition hover:bg-slate-100"
            >
              Find a Pro
            </Link>
            <Link
              to="/worker-register"
              className="rounded-xl border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Become a Pro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
