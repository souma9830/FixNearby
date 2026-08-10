import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  DollarSign,
  Shield,
  Star,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  Package,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService";
import useToast from "../hooks/useToast";

// Simple relative time helper — avoids adding a dependency
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_ICON = {
  booking_reminder: Package,
  status_update: Clock,
  new_message: MessageCircle,
  review_response: Star,
  promotion: DollarSign,
  system: Shield,
  payout: DollarSign,
};

const TYPE_LABEL = {
  booking_reminder: "Booking",
  status_update: "Booking",
  new_message: "Message",
  review_response: "Review",
  promotion: "Promotion",
  system: "System",
  payout: "Payout",
};

const PRIORITY_DOT = {
  high: "bg-amber-400",
  urgent: "bg-rose-500",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "booking", label: "Bookings" },
  { key: "message", label: "Messages" },
  { key: "system", label: "System" },
];

const FILTER_MAP = {
  all: {},
  unread: { read: "false" },
  booking: { type: "booking_reminder" },
  message: { type: "new_message" },
  system: { type: "system" },
};

const SkeletonItem = () => (
  <div className="flex items-start gap-4 px-5 py-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
    <div className="h-3 bg-slate-100 rounded w-12 shrink-0" />
  </div>
);

const Notifications = () => {
  useDocumentTitle("Notifications");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(
    async (pageNum = 1, filter = activeFilter, append = false) => {
      try {
        setLoading(true);
        const params = {
          page: pageNum,
          limit: 15,
          ...FILTER_MAP[filter],
        };
        const data = await getNotifications(params);
        setNotifications((prev) =>
          append ? [...prev, ...data.notifications] : data.notifications
        );
        setTotalPages(data.pagination?.pages || 1);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        showToast(err.message || "Failed to load notifications", "error");
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, showToast]
  );

  useEffect(() => {
    setPage(1);
    fetchNotifications(1, activeFilter, false);
  }, [activeFilter, fetchNotifications]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark all as read", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silently fail — the read status will refresh on next load
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      showToast("Failed to delete notification", "error");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, activeFilter, true);
  };

  const activeCount =
    activeFilter === "unread" ? unreadCount : notifications.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#0056D2] flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0056D2] hover:text-[#0047AF] transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {markingAll ? "Marking..." : "Mark All Read"}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200
              ${
                activeFilter === tab.key
                  ? "border-[#0056D2] bg-[#0056D2] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1
                  ${
                    activeFilter === "unread"
                      ? "bg-white/20 text-white"
                      : "bg-rose-100 text-rose-600"
                  }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading && notifications.length === 0 && (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Bell size={28} className="text-slate-300" />
            </div>
            <p className="text-lg font-semibold text-slate-700">No notifications yet</p>
            <p className="text-sm text-slate-400 mt-1">
              When you get notifications, they'll show up here.
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const IconComp = TYPE_ICON[n.type] || Bell;
              const typeLabel = TYPE_LABEL[n.type] || "Notification";
              const priorityClass = PRIORITY_DOT[n.priority];

              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors duration-150
                    ${
                      n.read
                        ? "hover:bg-slate-50"
                        : "bg-blue-50/40 hover:bg-blue-50/70"
                    }`}
                >
                  {/* Icon */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${
                          n.read
                            ? "bg-slate-100 text-slate-400"
                            : "bg-blue-100 text-[#0056D2]"
                        }`}
                    >
                      <IconComp size={18} />
                    </div>
                    {priorityClass && (
                      <span
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${priorityClass}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {typeLabel}
                      </span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2] shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-sm leading-snug ${
                        n.read
                          ? "font-medium text-slate-700"
                          : "font-bold text-slate-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  {/* Time + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {timeAgo(n.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && notifications.length > 0 && (
          <div className="border-t border-slate-100 p-4 text-center">
            <button
              onClick={loadMore}
              className="text-sm font-medium text-[#0056D2] hover:text-[#0047AF] transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {loading && notifications.length > 0 && (
          <div className="border-t border-slate-100 p-4 text-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#0056D2] mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
