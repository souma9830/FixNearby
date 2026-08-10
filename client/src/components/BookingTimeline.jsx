import { Clock, CheckCircle2, Truck, Wrench, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  Pending: { color: "text-amber-500", bg: "bg-amber-100", ring: "ring-amber-200", Icon: Clock },
  Accepted: { color: "text-blue-500", bg: "bg-blue-100", ring: "ring-blue-200", Icon: CheckCircle2 },
  "Reminder Sent": { color: "text-purple-500", bg: "bg-purple-100", ring: "ring-purple-200", Icon: Clock },
  "Technician En Route": { color: "text-indigo-500", bg: "bg-indigo-100", ring: "ring-indigo-200", Icon: Truck },
  "In-Progress": { color: "text-orange-500", bg: "bg-orange-100", ring: "ring-orange-200", Icon: Wrench },
  Completed: { color: "text-emerald-500", bg: "bg-emerald-100", ring: "ring-emerald-200", Icon: CheckCircle2 },
  Cancelled: { color: "text-rose-500", bg: "bg-rose-100", ring: "ring-rose-200", Icon: XCircle },
};

const getStepConfig = (status) => {
  return STATUS_CONFIG[status] || {
    color: "text-slate-400",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
    Icon: Clock,
  };
};

const TimelineSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          {i < 3 && <div className="w-0.5 h-12 bg-slate-200 mt-1" />}
        </div>
        <div className="pt-1 space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const BookingTimeline = ({ statusHistory = [], currentStatus, loading }) => {
  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Status Timeline</h4>
        <TimelineSkeleton />
      </div>
    );
  }

  // Build steps from the status history. If history is empty, just show the current status.
  let steps = statusHistory.map((h) => ({
    status: h.status,
    label: h.status,
    timestamp: h.changedAt,
    actor: h.changedBy?.name || "System",
    note: h.note || "",
  }));

  // Ensure the current status appears at least once
  if (currentStatus && !steps.some((s) => s.status === currentStatus)) {
    steps.push({
      status: currentStatus,
      label: currentStatus,
      timestamp: new Date().toISOString(),
      actor: "Current",
      note: "Current status",
    });
  }

  // Sort by timestamp ascending
  steps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // The latest step index tells us which steps are "completed"
  const latestIndex = steps.length - 1;

  if (steps.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800 mb-3">Status Timeline</h4>
        <p className="text-sm text-slate-400">No status history available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
      <h4 className="text-sm font-bold text-slate-800 mb-4">Status Timeline</h4>

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const { color, bg, ring, Icon } = getStepConfig(step.status);
          const isLast = idx === latestIndex;
          const isFuture = idx > latestIndex;
          const isCompleted = idx < latestIndex;

          const timeLabel = step.timestamp
            ? new Date(step.timestamp).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "";

          return (
            <div
              key={`${step.status}-${idx}`}
              className="flex gap-4"
              style={{
                animationDelay: `${idx * 80}ms`,
                animation: "fadeInUp 0.3s ease-out both",
              }}
            >
              {/* Connector column */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    transition-all duration-300
                    ${isFuture ? "bg-slate-100 ring-2 ring-slate-200" : `${bg} ring-2 ${ring}`}
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isFuture ? "text-slate-300" : isCompleted ? "text-emerald-500" : color
                    }`}
                  />
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2rem] ${
                      isCompleted ? "bg-emerald-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 pt-0.5 flex-1 ${isFuture ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-semibold ${
                      isFuture ? "text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                      Done
                    </span>
                  )}
                  {isLast && !isFuture && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{timeLabel}</p>
                {step.actor && (
                  <p className="text-xs text-slate-500 mt-1">
                    by <span className="font-medium">{step.actor}</span>
                  </p>
                )}
                {step.note && (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    &ldquo;{step.note}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingTimeline;
