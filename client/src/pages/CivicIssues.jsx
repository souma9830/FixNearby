import { useState, useEffect, useCallback } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import IssueSubmissionForm from "../components/IssueSubmissionForm";
import IssueCard from "../components/IssueCard";
import IssueFilterBar from "../components/IssueFilterBar";
import SkeletonLoader from "../components/SkeletonLoader";
import CivicIssueMap from "../components/CivicIssueMap";
import { getNearbyIssues, upvoteIssue } from "../services/issueService";
import useToast from "../hooks/useToast";
import { AlertTriangle, Map as MapIcon, List, PlusCircle, RefreshCw, Download } from "lucide-react";
import useGeolocation from "../hooks/useGeolocation";
import { getSocket } from "../services/socketService";
import { downloadCivicIssuesGeoJson } from "../utils/civicGeoJson";

const CATEGORIES = [
  "All",
  "Pothole",
  "Street Light",
  "Traffic Light",
  "Sidewalk",
  "Drainage",
  "Litter",
  "Graffiti",
  "Other",
];

const CivicIssues = () => {
  useDocumentTitle("Civic Issues & Neighborhood Map");
  const { coords } = useGeolocation();
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("map"); // 'map', 'list', 'report'
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [upvotingIds, setUpvotingIds] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const lat = coords?.latitude || 17.4065;
      const lng = coords?.longitude || 78.4772;
      const data = await getNearbyIssues({
        latitude: lat,
        longitude: lng,
        category: filterCategory !== "All" ? filterCategory : undefined,
        radiusKm: 25,
      });
      const issueList = data?.data || data || [];
      setIssues(Array.isArray(issueList) ? issueList : []);
    } catch (error) {
      console.error("Failed to load issues:", error);
      showToast("Could not fetch neighborhood reports.", "error");
    } finally {
      setLoading(false);
    }
  }, [coords, filterCategory]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Real-time Socket.IO sync for new issues and upvote updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewIssue = (data) => {
      console.log("[CivicIssues] New issue received via socket:", data);
      if (data?.issue) {
        setIssues((prev) => [data.issue, ...prev.filter((i) => i._id !== data.issue._id)]);
      } else {
        fetchIssues();
      }
    };

    const handleIssueUpdated = (data) => {
      console.log("[CivicIssues] Issue update received via socket:", data);
      if (data?.issue) {
        setIssues((prev) =>
          prev.map((i) => (i._id === data.issue._id ? { ...i, ...data.issue } : i))
        );
      } else {
        fetchIssues();
      }
    };

    socket.on("new_issue", handleNewIssue);
    socket.on("civic_issue_created", handleNewIssue);
    socket.on("issue_updated", handleIssueUpdated);

    return () => {
      socket.off("new_issue", handleNewIssue);
      socket.off("civic_issue_created", handleNewIssue);
      socket.off("issue_updated", handleIssueUpdated);
    };
  }, [fetchIssues]);

  const handleUpvote = async (id) => {
    setUpvotingIds((prev) => new Set(prev).add(id));
    try {
      const updatedIssue = await upvoteIssue(id);
      showToast("Upvote recorded!", "success");
      setIssues((prev) =>
        prev.map((item) => (item._id === id ? { ...item, ...updatedIssue, upvotes: (item.upvotes || 0) + 1 } : item))
      );
    } catch (error) {
      showToast(error.message || "Already upvoted or authentication required.", "error");
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCount = filteredIssues.filter((i) => !i.status || i.status === "open").length;
  const inProgressCount = filteredIssues.filter((i) => i.status === "in-progress").length;
  const resolvedCount = filteredIssues.filter((i) => i.status === "resolved" || i.status === "closed").length;

  const handleGeoJsonExport = () => {
    const exportedCount = downloadCivicIssuesGeoJson(filteredIssues);
    showToast(
      exportedCount > 0
        ? `Exported ${exportedCount} mapped issue${exportedCount === 1 ? "" : "s"}.`
        : "No mapped issues are available to export.",
      exportedCount > 0 ? "success" : "warning",
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Community Civic Issues & Reporting Portal
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Spot a problem in your neighborhood? View live reported issues on the map, upvote critical community requests, or report new concerns for local resolution.
        </p>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 shadow-xs">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === "map"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapIcon size={16} className="text-blue-600" />
            Map View ({filteredIssues.length})
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List size={16} className="text-purple-600" />
            Report Grid
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === "report"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle size={16} className="text-emerald-600" />
            Report New Issue
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleGeoJsonExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
          >
            <Download size={14} />
            Export GeoJSON
          </button>
          <button
            type="button"
            onClick={fetchIssues}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      {activeTab === "report" ? (
        <div className="animate-fadeIn max-w-3xl mx-auto">
          <IssueSubmissionForm
            onSubmitSuccess={() => {
              setActiveTab("map");
              fetchIssues();
            }}
          />
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Category Filter & Search Bar */}
          <IssueFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            categories={CATEGORIES}
            totalCount={filteredIssues.length}
          />

          {/* Status Breakdown Summary */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status Summary:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {openCount} Open
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {inProgressCount} In Progress
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {resolvedCount} Resolved
            </span>
          </div>

          {/* Map View */}
          {activeTab === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[520px]">
                <CivicIssueMap
                  issues={filteredIssues}
                  selectedIssueId={selectedIssueId}
                  onMarkerClick={(id) => setSelectedIssueId(id)}
                  onUpvote={handleUpvote}
                />
              </div>

              {/* Side List Panel */}
              <div className="h-[520px] overflow-y-auto space-y-4 pr-1">
                <h3 className="text-base font-bold text-slate-900 sticky top-0 bg-gray-50 py-2 border-b border-slate-200 z-10">
                  Nearby Issues ({filteredIssues.length})
                </h3>
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonLoader type="card" />
                    <SkeletonLoader type="card" />
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-4">
                    <AlertTriangle className="mx-auto text-amber-500 mb-2" size={36} />
                    <p className="text-xs font-bold text-slate-700">No issues found in this view.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div
                      key={issue._id}
                      onClick={() => setSelectedIssueId(issue._id)}
                      className={`cursor-pointer transition-all ${
                        String(issue._id) === String(selectedIssueId)
                          ? "ring-2 ring-blue-500 rounded-2xl"
                          : ""
                      }`}
                    >
                      <IssueCard
                        issue={issue}
                        onUpvote={handleUpvote}
                        isUpvoting={upvotingIds.has(issue._id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Full Grid View */}
          {activeTab === "list" && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SkeletonLoader key={n} type="card" />
                  ))}
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                  <h3 className="text-lg font-bold text-slate-900">No issues found</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Be the first to report an issue in this area!
                  </p>
                  <button
                    onClick={() => setActiveTab("report")}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm shadow-sm"
                  >
                    Report Issue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIssues.map((issue) => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      onUpvote={handleUpvote}
                      isUpvoting={upvotingIds.has(issue._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CivicIssues;
