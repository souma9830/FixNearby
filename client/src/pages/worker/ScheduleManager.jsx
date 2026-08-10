import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  getWorkerSchedule,
  setRecurringAvailability,
  blockTimeSlot,
  getBlockedSlots,
  removeBlockedSlot,
} from "../../services/scheduleService";
import { getSocket } from "../../services/socketService";
import AvailabilityCalendar from "../../components/worker/AvailabilityCalendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 AM to 8:00 PM (8..20)

const getWeekDates = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
};

const formatDate = (d) => d.toISOString().split("T")[0];
const formatDisplay = (d) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const formatHourLabel = (h) => {
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:00 ${period}`;
};

const ScheduleManager = () => {
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() - now.getDay());
    return now;
  });

  const [schedule, setSchedule] = useState({});
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Block modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });
  const [blockLoading, setBlockLoading] = useState(false);

  // Recurring form state
  const [recurringForm, setRecurringForm] = useState([]);
  const [recurringLoading, setRecurringLoading] = useState(false);

  // Drag selection state for grid time range selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null); // { dayIdx, dateStr, hour }
  const [dragCurrent, setDragCurrent] = useState(null); // { dayIdx, dateStr, hour }

  const weekDates = getWeekDates(weekStart);
  const dateRange = {
    startDate: formatDate(weekDates[0]),
    endDate: formatDate(weekDates[6]),
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleRes, blockedRes] = await Promise.all([
        getWorkerSchedule(dateRange),
        getBlockedSlots(dateRange),
      ]);
      setSchedule(scheduleRes.schedule || {});
      setBlockedSlots(blockedRes.blockedSlots || []);
      setRecurring(scheduleRes.recurringAvailability || []);
      setRecurringForm(scheduleRes.recurringAvailability || []);
    } catch (err) {
      console.warn("Schedule API unavailable:", err.message);
      const empty = {};
      for (const d of weekDates) {
        empty[formatDate(d)] = {
          date: formatDate(d),
          bookings: [],
          blocked: [],
          available: true,
        };
      }
      setSchedule(empty);
      setError("API unavailable — showing cached schedule");
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Listen to real-time socket updates for booking/expiry slot releases
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      console.log("[ScheduleManager] Real-time availability update received. Refetching schedule...");
      fetchSchedule();
    };

    socket.on("availability-update", handleUpdate);
    socket.on("schedule-update", handleUpdate);

    return () => {
      socket.off("availability-update", handleUpdate);
      socket.off("schedule-update", handleUpdate);
    };
  }, [fetchSchedule]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const openBlockModal = (dateStr, startTime = "09:00", endTime = "17:00") => {
    setBlockForm({
      date: dateStr,
      endDate: dateStr,
      startTime,
      endTime,
      reason: "",
    });
    setShowBlockModal(true);
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setBlockLoading(true);
    try {
      await blockTimeSlot(blockForm);
      setShowBlockModal(false);
      setSuccessMessage("Time slot blocked successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchSchedule();
    } catch (err) {
      alert(err.message || "Failed to block slot");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleRemoveBlock = async (id) => {
    try {
      await removeBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((s) => s._id !== id));
      fetchSchedule();
    } catch (err) {
      console.error("Remove block failed:", err);
    }
  };

  // Drag-to-select handlers
  const handleMouseDownCell = (dayIdx, dateStr, hour) => {
    setIsDragging(true);
    setDragStart({ dayIdx, dateStr, hour });
    setDragCurrent({ dayIdx, dateStr, hour });
  };

  const handleMouseEnterCell = (dayIdx, dateStr, hour) => {
    if (isDragging && dragStart && dragStart.dayIdx === dayIdx) {
      setDragCurrent({ dayIdx, dateStr, hour });
    }
  };

  const handleMouseUpGrid = () => {
    if (isDragging && dragStart && dragCurrent) {
      const minHour = Math.min(dragStart.hour, dragCurrent.hour);
      const maxHour = Math.max(dragStart.hour, dragCurrent.hour) + 1;

      const startTime = `${String(minHour).padStart(2, "0")}:00`;
      const endTime = `${String(maxHour).padStart(2, "0")}:00`;

      openBlockModal(dragStart.dateStr, startTime, endTime);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const isCellSelected = (dayIdx, hour) => {
    if (!isDragging || !dragStart || !dragCurrent) return false;
    if (dragStart.dayIdx !== dayIdx) return false;
    const minH = Math.min(dragStart.hour, dragCurrent.hour);
    const maxH = Math.max(dragStart.hour, dragCurrent.hour);
    return hour >= minH && hour <= maxH;
  };

  // Copy template functionality
  const copyMonToWeekdays = () => {
    const monEntry = recurringForm.find((s) => s.dayOfWeek === 1);
    if (!monEntry) {
      alert("Please configure Monday recurring hours first.");
      return;
    }
    const updated = [...recurringForm];
    [2, 3, 4, 5].forEach((dayIdx) => {
      const existingIdx = updated.findIndex((s) => s.dayOfWeek === dayIdx);
      const newSlot = {
        dayOfWeek: dayIdx,
        startTime: monEntry.startTime,
        endTime: monEntry.endTime,
      };
      if (existingIdx >= 0) {
        updated[existingIdx] = newSlot;
      } else {
        updated.push(newSlot);
      }
    });
    setRecurringForm(updated);
    setSuccessMessage("Copied Monday schedule to all weekdays!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const copyTemplateToAllDays = () => {
    const defaultSlot = recurringForm[0] || {
      startTime: "09:00",
      endTime: "17:00",
    };
    const allDays = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => ({
      dayOfWeek: dayIdx,
      startTime: defaultSlot.startTime,
      endTime: defaultSlot.endTime,
    }));
    setRecurringForm(allDays);
    setSuccessMessage("Applied 9 AM – 5 PM template to all 7 days!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleRecurringDay = (dayIdx) => {
    setRecurringForm((prev) => {
      const exists = prev.find((s) => s.dayOfWeek === dayIdx);
      if (exists) {
        return prev.filter((s) => s.dayOfWeek !== dayIdx);
      }
      return [
        ...prev,
        { dayOfWeek: dayIdx, startTime: "09:00", endTime: "17:00" },
      ];
    });
  };

  const updateRecurringTime = (dayIdx, field, value) => {
    setRecurringForm((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIdx ? { ...s, [field]: value } : s))
    );
  };

  const saveRecurring = async () => {
    setRecurringLoading(true);
    try {
      await setRecurringAvailability(recurringForm);
      setRecurring(recurringForm);
      setSuccessMessage("Recurring weekly availability saved!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchSchedule();
    } catch (err) {
      alert(err.message || "Failed to save availability");
    } finally {
      setRecurringLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 font-medium">
            Loading schedule & availability manager...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 select-none"
      onMouseUp={handleMouseUpGrid}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-blue-600" />
            Worker Schedule & Availability Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Set weekly recurring schedules, drag time ranges to block dates, and
            sync real-time bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSchedule}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
            Refresh
          </button>
          <button
            onClick={() =>
              openBlockModal(formatDate(new Date()), "09:00", "17:00")
            }
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
          >
            <Ban className="h-4 w-4" />
            Block Off Date
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={prevWeek}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
          Previous Week
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-800">
            {formatDisplay(weekDates[0])} — {formatDisplay(weekDates[6])}
          </h2>
          <span className="text-xs text-gray-400">
            Drag across hour cells on any day to select time block
          </span>
        </div>
        <button
          onClick={nextWeek}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
        >
          Next Week
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Interactive Weekly Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Grid Header Days */}
        <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50">
          <div className="p-3 text-center text-xs font-semibold text-gray-400 border-r border-gray-100 flex items-center justify-center">
            TIME
          </div>
          {weekDates.map((d, i) => {
            const dateKey = formatDate(d);
            const dayData = schedule[dateKey] || {};
            const isToday = formatDate(new Date()) === dateKey;
            return (
              <div
                key={i}
                className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${
                  isToday ? "bg-blue-50/70" : ""
                }`}
              >
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {DAYS[i]}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  {d.getDate()}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                  {dayData.bookings?.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-semibold">
                      {dayData.bookings.length} book
                    </span>
                  )}
                  {dayData.blocked?.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-semibold">
                      {dayData.blocked.length} block
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hourly Grid Rows */}
        <div className="divide-y divide-gray-50">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[44px]">
              <div className="p-2 border-r border-gray-100 text-right pr-3 text-[11px] font-medium text-gray-400 bg-gray-50/50 flex items-center justify-end">
                {formatHourLabel(hour)}
              </div>
              {weekDates.map((d, dayIdx) => {
                const dateKey = formatDate(d);
                const dayData = schedule[dateKey] || {};
                const hourStr = `${String(hour).padStart(2, "0")}:00`;

                // Find if there is a booking during this hour
                const bookingInHour = dayData.bookings?.find((b) => {
                  const bTime = new Date(b.time);
                  const bStartH = bTime.getHours();
                  const bEndH = bStartH + (b.duration || 1);
                  return hour >= bStartH && hour < bEndH;
                });

                // Find if there is a block slot during this hour
                const blockedInHour = dayData.blocked?.find((bs) => {
                  const [sH] = bs.startTime.split(":").map(Number);
                  const [eH] = bs.endTime.split(":").map(Number);
                  return hour >= sH && hour < eH;
                });

                const selected = isCellSelected(dayIdx, hour);

                return (
                  <div
                    key={dayIdx}
                    onMouseDown={() =>
                      handleMouseDownCell(dayIdx, dateKey, hour)
                    }
                    onMouseEnter={() =>
                      handleMouseEnterCell(dayIdx, dateKey, hour)
                    }
                    className={`border-r border-gray-50 last:border-r-0 p-1 relative transition cursor-pointer hover:bg-purple-50/40 ${
                      selected ? "bg-purple-200 border-purple-400" : ""
                    }`}
                  >
                    {bookingInHour && (
                      <div className="px-1.5 py-1 bg-blue-600 text-white rounded-md text-[10px] shadow-xs truncate leading-tight">
                        <span className="font-bold">
                          {bookingInHour.service}
                        </span>
                        <span className="opacity-90 block">
                          {bookingInHour.status}
                        </span>
                      </div>
                    )}

                    {!bookingInHour && blockedInHour && (
                      <div className="px-1.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-md text-[10px] truncate leading-tight">
                        <span className="font-semibold">🚫 Blocked</span>
                        {blockedInHour.reason && (
                          <span className="block opacity-80 truncate">
                            {blockedInHour.reason}
                          </span>
                        )}
                      </div>
                    )}

                    {!bookingInHour && !blockedInHour && selected && (
                      <div className="text-[10px] font-semibold text-purple-700 text-center py-1">
                        Selecting...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Slots List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            Blocked Dates & Time Ranges
          </h3>
          <span className="text-xs text-gray-400">
            {blockedSlots.length} active block off periods
          </span>
        </div>
        {blockedSlots.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            No blocked time slots set for this date range. Click "Block Off Date"
            or drag across calendar grid hours above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {blockedSlots.map((slot) => (
              <div
                key={slot._id}
                className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    {new Date(slot.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {" · "}
                    {slot.startTime} — {slot.endTime}
                  </p>
                  {slot.reason && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">
                      Reason: {slot.reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBlock(slot._id)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition"
                  title="Remove block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Weekly Availability Template */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Repeat className="h-5 w-5 text-purple-600" />
            Recurring Weekly Availability Template
          </h3>
          <div className="flex gap-2">
            <button
              onClick={copyMonToWeekdays}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Monday to Weekdays
            </button>
            <button
              onClick={copyTemplateToAllDays}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              Apply 9–5 to All Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {DAYS.map((day, i) => {
            const entry = recurringForm.find((s) => s.dayOfWeek === i);
            const isActive = !!entry;
            return (
              <div
                key={i}
                className={`border rounded-xl p-3 transition ${
                  isActive
                    ? "border-purple-300 bg-purple-50/50"
                    : "border-gray-200"
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleRecurringDay(i)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="font-semibold text-sm text-gray-800">
                    {day}
                  </span>
                </label>
                {isActive && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) =>
                        updateRecurringTime(i, "startTime", e.target.value)
                      }
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) =>
                        updateRecurringTime(i, "endTime", e.target.value)
                      }
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={saveRecurring}
          disabled={recurringLoading}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
        >
          {recurringLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {recurringLoading
            ? "Saving..."
            : "Save Recurring Availability Template"}
        </button>
      </div>

      {/* Interactive Slot Calendar */}
      <div className="mt-8">
        <AvailabilityCalendar schedule={recurring} onUpdateSchedule={(newSlots) => setRecurring(newSlots)} />
      </div>

      {/* Block Off Date/Time Range Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                Block Off Date / Time Range
              </h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={blockForm.date}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, date: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={blockForm.endDate || blockForm.date}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, endDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, startTime: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, endTime: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Blocking (Optional)
                </label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                  placeholder="e.g. Personal holiday, maintenance, doctor appt"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blockLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {blockLoading ? "Blocking..." : "Block Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
