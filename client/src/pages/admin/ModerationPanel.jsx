import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import {
  getReportedReviews,
  approveReview,
  rejectReview,
  bulkAction,
  getModerationStats,
} from "../../services/moderationService";

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ModerationPanel = () => {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, flagged: 0 });
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        getReportedReviews({ page, limit: 8 }),
        getModerationStats(),
      ]);
      setReviews(reviewsRes.reviews || []);
      setPagination(reviewsRes.pagination || { page: 1, pages: 1, total: 0 });
      setStats(statsRes.stats || { total: 0, approved: 0, pending: 0, flagged: 0 });
    } catch (err) {
      console.error("Failed to load moderation data:", err);
    } finally {
      setLoading(false);
      setSelected(new Set());
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === reviews.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(reviews.map((r) => r._id)));
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        flagged: prev.flagged + 1,
      }));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulk = async (action) => {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    try {
      await bulkAction([...selected], action);
      loadData(pagination.page);
    } catch (err) {
      console.error("Bulk action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 font-medium">Loading moderation queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-600" />
          Review Moderation
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review and moderate user-submitted reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBadge icon={ClipboardList} label="Total Reviews" value={stats.total} color="bg-gray-600" />
        <StatBadge icon={AlertTriangle} label="Pending" value={stats.pending} color="bg-amber-500" />
        <StatBadge icon={CheckCircle2} label="Approved" value={stats.approved} color="bg-emerald-600" />
        <StatBadge icon={XCircle} label="Flagged" value={stats.flagged} color="bg-red-600" />
      </div>

      {/* Bulk Actions Bar */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected.size === reviews.length && reviews.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">
              {selected.size > 0 ? `${selected.size} selected` : "Select all"}
            </span>
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulk("approve")}
                disabled={actionLoading === "bulk"}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                Approve Selected
              </button>
              <button
                onClick={() => handleBulk("reject")}
                disabled={actionLoading === "bulk"}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                Reject Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-emerald-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm mt-1">No reviews need moderation right now</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Review</th>
                    <th className="px-4 py-3 font-medium">Report Reason</th>
                    <th className="px-4 py-3 font-medium">Reported</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(review._id)}
                          onChange={() => toggleSelect(review._id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{review.user?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-400">{review.user?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{review.worker?.name || "N/A"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-amber-400" : "text-gray-200"}>★</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[250px]">
                        <p className="truncate" title={review.reviewText}>
                          {review.reviewText?.length > 80
                            ? review.reviewText.slice(0, 80) + "…"
                            : review.reviewText}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium border border-red-100">
                          {review.reportReason || "No reason"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {review.reportedAt
                          ? new Date(review.reportedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(review._id)}
                            disabled={actionLoading === review._id}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(review._id)}
                            disabled={actionLoading === review._id}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} items)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => loadData(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModerationPanel;
