import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import CenteredLoadingSpinner from "../components/CenteredLoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import StarRating from "../components/StarRating";
import { Package, Clock, DollarSign, ChevronDown, ChevronUp, Zap, AlertCircle, X, History, MessageSquare } from "lucide-react";
import BookingTimeline from "../components/BookingTimeline";
import useBookingTimeline from "../hooks/useBookingTimeline";
import { useBookings } from "../hooks/useBookings";
import api from "../services/apiClient";
import useToast from "../hooks/useToast";
import { showApiError } from "../utils/apiErrorHandler";
import CancelBookingModal from "../components/CancelBookingModal";
import useBookingSocket from "../hooks/useBookingSocket";
import AnimatedBookingProgressBar from "../components/AnimatedBookingProgressBar";
import JobCompletionFlow from "../components/JobCompletionFlow";


const statusOptions = ["All", "Pending", "Confirmed", "Reminder Sent", "Technician En Route", "Completed", "Cancelled"];

const statusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Confirmed":
    case "Accepted":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-amber-100 text-amber-800";
    case "Cancelled":
      return "bg-rose-100 text-rose-800";
    case "Reminder Sent":
    case "Reminder sent":
      return "bg-purple-100 text-purple-800";
    case "Technician En Route":
    case "Technician en route":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

/**
 * Normalize a booking document from the API into the shape the UI expects.
 * - `worker` is a populated object (or falls back to a stored name).
 * - `estimateSpecs`, if present, is encoded as JSON inside the booking notes
 *   by WorkerProfile so the breakdown panel keeps working end-to-end.
 */
const normalizeBooking = (booking) => {
  const workerName =
    (typeof booking.worker === "object" && booking.worker?.name) ||
    booking.workerName ||
    booking.worker ||
    "Service Professional";
  const serviceName =
    (typeof booking.service === "object" && booking.service?.name) ||
    booking.service ||
    "Service";
  const price =
    typeof booking.price === "number"
      ? booking.price
      : Number(String(booking.price || "").replace(/[^0-9.]/g, "")) || 0;

  let estimateSpecs = booking.estimateSpecs || null;
  if (!estimateSpecs && booking.notes) {
    // Estimate specs are optionally carried in notes as a JSON payload.
    try {
      const parsed = JSON.parse(booking.notes);
      if (parsed && parsed.totalCost) estimateSpecs = parsed;
    } catch {
      /* notes is plain text — ignore */
    }
  }

  let status = booking.status;
  if (status === "Accepted") {
    status = "Confirmed";
  }

  // Format date and time
  const t = booking.scheduledTime || booking.scheduledDate || booking.date;
  let formattedDate = "";
  if (t) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } else {
      formattedDate = String(t);
    }
  } else {
    formattedDate = new Date(booking.createdAt || Date.now()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  // Normalize backend `statusHistory` into unified `events` timeline.
  // Each event is: { status, at, message }
  const rawStatusHistory = Array.isArray(booking.statusHistory)
    ? booking.statusHistory
    : [];

  const events = rawStatusHistory
    .map((e) => ({
      status: e?.status,
      at: e?.changedAt ? new Date(e.changedAt).toISOString() : null,
      message: e?.note || "",
    }))
    .filter((e) => e.status)
    .sort((a, b) => {
      const atA = a.at ? new Date(a.at).getTime() : 0;
      const atB = b.at ? new Date(b.at).getTime() : 0;
      return atA - atB;
    });

  return {
    ...booking,
    id: booking._id || booking.id,
    worker: workerName,
    service: serviceName,
    price,
    date: formattedDate,
    estimateSpecs,
    status,
    events,
  };
};


/* ── Estimate breakdown panel for a booking card ── */
const TimelineDot = ({ variant }) => {
  const className =
    variant === "completed"
      ? "bg-emerald-500"
      : variant === "cancelled"
        ? "bg-rose-500"
        : variant === "active"
          ? "bg-blue-500"
          : "bg-slate-300";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${className}`} />;
};

const formatEventAt = (at) => {
  if (!at) return "";
  const d = new Date(at);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

const BookingStatusTimeline = ({ booking }) => {
  const status = booking.status;

  const steps = [
    { key: "Pending", label: "Pending" },
    { key: "Confirmed", label: "Confirmed" },
    { key: "Technician En Route", label: "En Route" },
    { key: "Completed", label: "Completed" },
    { key: "Cancelled", label: "Cancelled" },
  ];

  // Prefer events; fallback to inferred timestamps.
  const events = Array.isArray(booking.events) ? booking.events : [];

  const eventByStatus = new Map(
    events.map((e) => [e.status, e]).filter(([k]) => !!k)
  );

  const createdAt = booking.createdAt ? new Date(booking.createdAt).toISOString() : null;
  const scheduledAt = booking.scheduledTime ? new Date(booking.scheduledTime).toISOString() : null;

  const timelineItems = steps.map((s) => {
    let at = eventByStatus.get(s.key)?.at || null;
    let message = eventByStatus.get(s.key)?.message || "";

    // Fallbacks
    if (!at) {
      if (s.key === "Pending") at = createdAt || null;
      if (s.key === "Confirmed") at = scheduledAt || null;
      if (s.key === "Technician En Route") at = null;
      if (s.key === "Completed" || s.key === "Cancelled") at = booking.updatedAt ? new Date(booking.updatedAt).toISOString() : null;
    }

    return { ...s, at, message };
  });

  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === status) // if status matches one of the keys
  );

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-slate-800">Booking Timeline</h4>
        <span className="text-xs font-medium text-slate-500">{status}</span>
      </div>

      <div className="mt-3 space-y-3">
        {timelineItems.map((item, idx) => {
          const isReached = item.key === status || idx <= currentIndex;
          const variant = item.key === "Completed" && status === "Completed"
            ? "completed"
            : item.key === "Cancelled" && status === "Cancelled"
              ? "cancelled"
              : isReached
                ? "active"
                : "pending";

          // Hide En Route step if it has no event and booking isn't yet in that state.
          const shouldHideEnRoute = item.key === "Technician En Route" && !item.at && status !== "Technician En Route";
          if (shouldHideEnRoute) return null;

          return (
            <div key={item.key} className="flex items-start gap-3">
              <div className="pt-1">
                <TimelineDot variant={variant} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${isReached ? "text-slate-900" : "text-slate-500"}`}>
                    {item.label}
                  </span>
                  <span className={`text-xs ${isReached ? "text-slate-600" : "text-slate-400"}`}>
                    {formatEventAt(item.at) || "—"}
                  </span>
                </div>
                {item.message ? (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.message}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EstimateBreakdown = ({ specs }) => {

  const [open, setOpen] = useState(false);
  // Guard against divide-by-zero when a malformed estimate has no total.
  const total = specs.totalCost > 0 ? specs.totalCost : 0;
  const matPct = total > 0 ? Math.round((specs.materialCost / total) * 100) : 0;
  const labPct = total > 0 ? 100 - matPct : 0;

  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Package size={14} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">Estimate Breakdown</span>
          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            Approved
          </span>
        </div>
        {open
          ? <ChevronUp size={14} className="text-emerald-600" />
          : <ChevronDown size={14} className="text-emerald-600" />}
      </button>

      {/* Summary pill always visible */}
      <div className="px-4 pb-2">
        <code className="text-xs text-emerald-800 font-mono bg-emerald-100 px-2.5 py-1 rounded-lg">
          {specs.summary}
        </code>
      </div>

      {/* Cost split bar always visible */}
      <div className="px-4 pb-2.5">
        <div className="flex justify-between text-[10px] text-emerald-600 mb-1">
          <span>Materials {matPct}%</span>
          <span>Labor {labPct}%</span>
        </div>
        <div className="cost-bar-track flex">
          <div className="cost-bar-fill bg-blue-400" style={{ width: `${matPct}%` }} />
          <div className="cost-bar-fill bg-amber-400" style={{ width: `${labPct}%` }} />
        </div>
      </div>

      {/* Full breakdown */}
      {open && (
        <div className="border-t border-emerald-100 px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={11} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Materials</span>
          </div>
          {specs.materials.map((mat, i) => (
            <div key={i} className="flex justify-between text-xs text-slate-700">
              <span>{mat.name} <span className="text-slate-400">({mat.qty} {mat.unit})</span></span>
              <span className="font-semibold">${mat.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div className="flex items-center gap-1.5 mt-2 mb-1">
            <Clock size={11} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Labor</span>
          </div>
          <div className="flex justify-between text-xs text-slate-700">
            <span>Labor <span className="text-slate-400">({specs.laborHours} hrs)</span></span>
            <span className="font-semibold">${specs.laborCost.toFixed(2)}</span>
          </div>

          <div className="border-t border-emerald-200 mt-2 pt-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Total</span>
            </div>
            <span className="text-sm font-extrabold text-emerald-600">${specs.totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingTimelineInline = ({ bookingId, currentStatus }) => {
  const { steps, loading, error } = useBookingTimeline(bookingId);

  return (
    <BookingTimeline
      statusHistory={steps.map((s) => ({
        status: s.status,
        changedAt: s.timestamp,
        changedBy: { name: s.actor },
        note: s.note,
      }))}
      currentStatus={currentStatus}
      loading={loading}
    />
  );
};

const Bookings = () => {
  const {
    bookings: rawBookings,
    loading,
    error,
    cancelBooking,
    rescheduleBooking,
    refresh,
  } = useBookings();
  const { showToast } = useToast();

  // Bookings come from the API in document form; normalize once for the UI.
  const bookings = useMemo(
    () => rawBookings.map(normalizeBooking),
    [rawBookings]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [activeReview, setActiveReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const [reschedulingId, setReschedulingId] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(null);

  // Timeline toggle state
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);
  const [liveUpdatedId, setLiveUpdatedId] = useState(null);
  const [activeEscrowBooking, setActiveEscrowBooking] = useState(null);

  // Filter change handlers that guarantee pagination page index resets to 1
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  // Subscribe to real-time booking socket status updates
  const handleSocketStatusUpdate = (eventData) => {
    const updatedId = eventData?.bookingId || eventData?.booking?._id || eventData?.booking?.id;
    const newStatus = eventData?.status;
    if (newStatus) {
      showToast(`Real-time update: Booking status changed to "${newStatus}"`, "info");
    }
    if (updatedId) {
      setLiveUpdatedId(updatedId);
      setTimeout(() => setLiveUpdatedId(null), 4000);
    }
    refresh();
  };

  useBookingSocket({
    onStatusUpdate: handleSocketStatusUpdate,
    enableNotifications: true,
  });

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.worker.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const handleCancel = async (id) => {
    setCancelTargetId(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async (reason) => {
    setCancelError("");
    setCancelingId(cancelTargetId);
    const ok = await cancelBooking(cancelTargetId, reason);
    setCancelingId(null);
    setCancelTargetId(null);
    if (!ok) {
      setCancelError(
        "Could not cancel this booking. It may already be completed."
      );
    } else {
      showToast("Booking cancelled successfully.", "success");
    }
  };

  const handleRescheduleSubmit = async (id) => {
    if (!newTime) {
      setRescheduleError("Please select a valid date and time.");
      return;
    }
    const selectedDate = new Date(newTime);
    if (selectedDate.getTime() <= Date.now()) {
      setRescheduleError("Rescheduled time must be in the future.");
      return;
    }

    setRescheduleError("");
    setSubmittingReschedule(id);
    const result = await rescheduleBooking(id, selectedDate.toISOString());
    setSubmittingReschedule(null);
    if (result.success) {
      setReschedulingId(null);
      setNewTime("");
      refresh();
    } else {
      setRescheduleError(result.message || "Failed to reschedule booking. Please try another time.");
    }
  };

  const handleReviewSubmit = async (id) => {
    if (!rating) {
      showToast("Please select a rating before submitting.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("reviewText", comment);
    reviewImages.forEach((img) => {
      formData.append("images", img);
    });

    setSubmittingReview(id);
    try {
      const response = await api.post(`/bookings/${id}/review`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (response.data.success) {
        showToast("Review submitted successfully!", "success");
        setActiveReview(null);
        setRating(0);
        setComment("");
        setReviewImages([]);
        refresh();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      showApiError(err, showToast);
    } finally {
      setSubmittingReview(null);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setReviewImages(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const handleRemoveImage = (idx) => {
    setReviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  useDocumentTitle("My Bookings");

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">My Bookings</h1>
        <p className="mt-2 text-slate-600">
          Track, manage, and review your service bookings.
        </p>
      </div>

      {/* SUMMARY STATS */}
      <div className="mb-8 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{completedBookings}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-500">{pendingBookings}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search worker or service..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:w-1/2"
        />
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusFilterChange(status)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                statusFilter === status
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading && <SkeletonLoader type="booking" count={3} />}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-2 text-rose-500" size={24} />
          <p className="text-rose-700 font-medium">{error}</p>
          <button
            type="button"
            onClick={() => refresh()}
            className="mt-4 inline-block rounded-xl bg-rose-600 px-5 py-2.5 font-medium text-white hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && cancelError && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {cancelError}
        </p>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
          <h3 className="text-xl font-bold text-slate-900">No bookings found</h3>
          <p className="mt-2 text-slate-600">
            Try adjusting your filters or book a new service.
          </p>
          <Link
            to="/services"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Browse Services
          </Link>
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {paginatedBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {booking.service}
                    </h3>
                    {/* Smart Estimate badge */}
                    {booking.estimateSpecs && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Zap size={10} className="fill-emerald-500 text-emerald-500" />
                        Smart Estimate
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{booking.worker}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                  {/* Show estimated total prominently */}
                  {booking.estimateSpecs && (
                    <span className="text-sm font-bold text-emerald-600">
                      ${booking.estimateSpecs.totalCost.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-500">
                <span>ID: {booking.id}</span>
                <span>{booking.date}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm items-center">
                {/* Escrow Release Action */}
                {booking.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => setActiveEscrowBooking(booking)}
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs transition shadow-sm"
                  >
                    🔒 Escrow Approval
                  </button>
                )}
                {(booking.status === "Pending" || booking.status === "Confirmed" || booking.status === "Reminder Sent" || booking.status === "Technician En Route") && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelingId === booking.id}
                    className="font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelingId === booking.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
                {booking.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      setReschedulingId(booking.id);
                      setNewTime("");
                      setRescheduleError("");
                    }}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Reschedule
                  </button>
                )}
                {booking.status === "Completed" && !booking.review && (
                  <button
                    type="button"
                    onClick={() => setActiveReview(booking.id)}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Leave Review
                  </button>
                )}
                {booking.review && (
                  <span className="font-medium text-emerald-600">
                    Rated {booking.review.rating}/5
                  </span>
                )}
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <MessageSquare size={14} />
                  Chat
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTimelineId(
                      expandedTimelineId === booking.id ? null : booking.id
                    )
                  }
                  className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800 transition"
                >
                  <History size={14} />
                  {expandedTimelineId === booking.id
                    ? "Hide Timeline"
                    : "View Timeline"}
                </button>
              </div>

              {/* RESCHEDULE BOX */}
              {reschedulingId === booking.id && (
                <div className="mt-4 p-5 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-3 max-w-md transition-all duration-300">

                  <h4 className="text-sm font-bold text-slate-800">Reschedule Booking</h4>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="datetime-local"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRescheduleSubmit(booking.id)}
                        disabled={submittingReschedule === booking.id}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {submittingReschedule === booking.id ? "Updating…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingId(null);
                          setNewTime("");
                          setRescheduleError("");
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {rescheduleError && (
                    <p className="text-xs font-semibold text-rose-600">
                      {rescheduleError}
                    </p>
                  )}
                </div>
              )}

              {/* STATUS TIMELINE */}
              {expandedTimelineId === booking.id && (
                <div className="mt-4">
                  <BookingTimelineInline bookingId={booking.id} currentStatus={booking.status} />
                </div>
              )}
              {/* REAL-TIME ANIMATED STATUS PROGRESS BAR */}
              <AnimatedBookingProgressBar booking={booking} liveUpdated={liveUpdatedId === booking.id} />

              {/* BOOKING TIMELINE */}
              <BookingStatusTimeline booking={booking} />

              {/* ESTIMATE BREAKDOWN */}
              {booking.estimateSpecs && (
                <EstimateBreakdown specs={booking.estimateSpecs} />
              )}

              {/* REVIEW BOX */}

              {activeReview === booking.id && (
                <div className="mt-6 relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

                  {/* TOP GRADIENT */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                  <div className="p-6">

                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          Share Your Experience
                        </h3>
                        <p className="text-slate-500 mt-1 text-sm">
                          Your feedback helps other customers choose better services.
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-2xl text-sm font-medium">
                        ⭐ Review
                      </div>
                    </div>

                    {/* WORKER PREVIEW */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                        {booking.worker.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{booking.worker}</h4>
                        <p className="text-sm text-slate-500">{booking.service} Service</p>
                      </div>
                    </div>

                    {/* STAR SECTION */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        Rate your experience
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className={`group transition-all duration-200 ${
                              rating >= s ? "scale-110" : "hover:scale-110"
                            }`}
                          >
                            <span
                              className={`text-4xl transition-all duration-200 ${
                                rating >= s
                                  ? "text-yellow-400 drop-shadow"
                                  : "text-slate-300 group-hover:text-yellow-300"
                              }`}
                            >
                              ★
                            </span>
                          </button>
                        ))}
                        <div className="ml-2">
                          {rating === 1 && <span className="text-rose-500 font-semibold">Poor</span>}
                          {rating === 2 && <span className="text-orange-500 font-semibold">Fair</span>}
                          {rating === 3 && <span className="text-amber-500 font-semibold">Good</span>}
                          {rating === 4 && <span className="text-lime-600 font-semibold">Very Good</span>}
                          {rating === 5 && <span className="text-emerald-600 font-semibold">Excellent</span>}
                        </div>
                      </div>
                    </div>

                    {/* REVIEW TEXTAREA */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">
                          Write your feedback
                        </label>
                        <span className="text-xs text-slate-400">{comment.length}/300</span>
                      </div>
                      <textarea
                        value={comment}
                        maxLength={300}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about service quality, professionalism, punctuality..."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 min-h-[140px] resize-none outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                     </div>

                     <div className="mb-6">
                       <label className="text-sm font-medium text-slate-700 block mb-2">
                         Add Photos (Optional, max 5)
                       </label>
                       <input
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={handleImageChange}
                         className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                       />
                     </div>

                    {/* QUICK TAGS */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-3">Quick feedback</p>
                      <div className="flex flex-wrap gap-2">
                        {["Professional", "On Time", "Friendly", "Affordable", "Highly Recommended", "Quick Service"].map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                setComment((prev) =>
                                  prev.includes(tag) ? prev : `${prev} ${tag}`.trim()
                                )
                              }
                              className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              + {tag}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* PREVIEW */}
                    {(rating > 0 || comment || reviewImages.length > 0) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Preview</p>
                        <div className="flex items-center gap-1 text-yellow-400 text-lg mb-2">
                          {"★".repeat(rating)}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                          {comment || "Your review preview will appear here..."}
                        </p>
                        {reviewImages.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {reviewImages.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                <img src={URL.createObjectURL(img)} alt="upload preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black"
                                  title="Remove photo"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => handleReviewSubmit(booking.id)}
                        disabled={submittingReview === booking.id}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview === booking.id ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReview(null);
                          setRating(0);
                          setComment("");
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold text-slate-500">
                Showing Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span> ({filteredBookings.length} total bookings)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelTargetId(null); }}
        onConfirm={confirmCancel}
      />

      {activeEscrowBooking && (
        <JobCompletionFlow
          booking={activeEscrowBooking}
          isOpen={!!activeEscrowBooking}
          onClose={() => setActiveEscrowBooking(null)}
          onEscrowReleased={() => {
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default Bookings;
