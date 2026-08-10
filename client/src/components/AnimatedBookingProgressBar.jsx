import { useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Navigation,
  Wrench,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Radio,
} from "lucide-react";

/**
 * Animated Real-Time Booking Status Progress Bar
 * 
 * Tracks booking progress across the 5 primary status milestones:
 * Pending (20%) -> Accepted/Confirmed (40%) -> Technician En Route (60%) -> In-Progress (80%) -> Completed (100%)
 * 
 * Special visual handling for Cancelled and Expired states.
 */
const STEPS = [
  {
    key: "Pending",
    label: "Pending",
    desc: "Awaiting worker confirmation",
    icon: Clock,
    pct: 20,
  },
  {
    key: "Accepted",
    altKeys: ["Confirmed"],
    label: "Accepted",
    desc: "Worker confirmed your booking",
    icon: CheckCircle2,
    pct: 40,
  },
  {
    key: "Technician En Route",
    altKeys: ["Technician en route", "En Route"],
    label: "En Route",
    desc: "Technician is on the way",
    icon: Navigation,
    pct: 60,
  },
  {
    key: "In-Progress",
    altKeys: ["In Progress", "Work Started"],
    label: "In-Progress",
    desc: "Service currently being performed",
    icon: Wrench,
    pct: 80,
  },
  {
    key: "Completed",
    label: "Completed",
    desc: "Service successfully finished",
    icon: CheckCheck,
    pct: 100,
  },
];

const normalizeStatusKey = (rawStatus) => {
  if (!rawStatus) return "Pending";
  const str = String(rawStatus).trim();

  for (const step of STEPS) {
    if (step.key.toLowerCase() === str.toLowerCase()) return step.key;
    if (step.altKeys) {
      for (const alt of step.altKeys) {
        if (alt.toLowerCase() === str.toLowerCase()) return step.key;
      }
    }
  }
  if (str === "Confirmed") return "Accepted";
  if (str.toLowerCase().includes("route")) return "Technician En Route";
  if (str.toLowerCase().includes("progress")) return "In-Progress";

  return str;
};

export const AnimatedBookingProgressBar = ({ booking, liveUpdated = false }) => {
  const status = booking?.status || "Pending";
  const normalizedKey = useMemo(() => normalizeStatusKey(status), [status]);

  const isCancelled = normalizedKey === "Cancelled" || status === "Cancelled";
  const isExpired = normalizedKey === "Expired" || status === "Expired";

  const currentIndex = useMemo(() => {
    if (isCancelled || isExpired) return -1;
    const idx = STEPS.findIndex((s) => s.key === normalizedKey);
    return idx >= 0 ? idx : 0;
  }, [normalizedKey, isCancelled, isExpired]);

  const currentPct = useMemo(() => {
    if (isCancelled || isExpired) return 100;
    return STEPS[currentIndex]?.pct || 20;
  }, [currentIndex, isCancelled, isExpired]);

  if (isCancelled || isExpired) {
    const isCancel = isCancelled;
    return (
      <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-sm">
            {isCancel ? <XCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-900">
                Booking {isCancel ? "Cancelled" : "Expired"}
              </h4>
              <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                {status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-rose-700">
              {isCancel
                ? "This booking was cancelled and is no longer active."
                : "Worker response timed out. Please try booking another slot."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-4 shadow-sm transition-all duration-300">
      {/* Header with Live indicator */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Real-Time Tracking
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {liveUpdated && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
              <Radio size={10} className="text-emerald-600" />
              Updated Just Now
            </span>
          )}
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {STEPS[currentIndex]?.label || status}
          </span>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="relative my-4">
        {/* Background track */}
        <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
          {/* Fill bar with gradient animation */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${currentPct}%` }}
          />
        </div>

        {/* Milestone Nodes */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1 pointer-events-none">
          {STEPS.map((step, idx) => {
            const isCompletedStep = idx < currentIndex;
            const isActiveStep = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  isActiveStep
                    ? "h-7 w-7 bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110"
                    : isCompletedStep
                    ? "h-6 w-6 bg-emerald-500 text-white"
                    : "h-6 w-6 bg-slate-200 text-slate-400"
                }`}
              >
                <Icon size={isActiveStep ? 14 : 12} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Labels */}
      <div className="mt-5 grid grid-cols-5 gap-1 text-center">
        {STEPS.map((step, idx) => {
          const isReached = idx <= currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <span
                className={`text-[11px] font-bold leading-tight ${
                  isActive
                    ? "text-blue-700 font-extrabold"
                    : isReached
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              <span className="mt-0.5 text-[9px] text-slate-500 hidden sm:block line-clamp-1">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBookingProgressBar;
