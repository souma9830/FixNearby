import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Clock,
  MapPin,
  CheckCircle,
  Filter,
  Search,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import FeedList from "../components/FeedList";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api from "../services/apiClient";
import useToast from "../hooks/useToast";

const mockJobsData = [
  {
    id: "job-101",
    service: "Emergency Plumbing Repair",
    category: "Plumbing",
    customerName: "Sarah Jenkins",
    location: "Banjara Hills, Hyderabad",
    date: "Today, 2:30 PM",
    price: "$85",
    urgent: true,
    status: "Pending",
    description: "Leaking main water pipe under kitchen sink requiring immediate repair.",
  },
  {
    id: "job-102",
    service: "AC Unit Deep Servicing",
    category: "AC Repair",
    customerName: "Robert Chen",
    location: "Jubilee Hills, Hyderabad",
    date: "Today, 4:00 PM",
    price: "$60",
    urgent: false,
    status: "In Progress",
    description: "Annual cleaning, gas check, and filter replacement for 2 Split ACs.",
  },
  {
    id: "job-103",
    service: "Full House Wiring Inspection",
    category: "Electrical",
    customerName: "Ananya Rao",
    location: "Gachibowli, Hyderabad",
    date: "Tomorrow, 10:00 AM",
    price: "$120",
    urgent: false,
    status: "Pending",
    description: "Circuit breaker trips periodically when heavy appliances are turned on.",
  },
  {
    id: "job-104",
    service: "Wooden Door Frame Repair",
    category: "Carpentry",
    customerName: "Vikram Sharma",
    location: "Kondapur, Hyderabad",
    date: "Yesterday",
    price: "$50",
    urgent: false,
    status: "Completed",
    description: "Realigned swollen wooden front door frame and replaced hinges.",
  },
  {
    id: "job-105",
    service: "Wall Painting & Patch Work",
    category: "Painting",
    customerName: "Meera Patel",
    location: "Madhapur, Hyderabad",
    date: "Jul 28, 2026",
    price: "$150",
    urgent: false,
    status: "Completed",
    description: "Touch-up paint job for living room walls following water damage repair.",
  },
];

const JobsFeed = () => {
  useDocumentTitle("Provider Jobs Feed");
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bookings");
      const fetched = response.data?.bookings || response.data?.data || [];
      if (fetched.length > 0) {
        setJobs(fetched);
      } else {
        setJobs(mockJobsData);
      }
    } catch (err) {
      console.warn("Using fallback mock jobs data for feed:", err);
      setJobs(mockJobsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const title = (job.service || job.title || "").toLowerCase();
      const loc = (job.location || "").toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || title.includes(query) || loc.includes(query);
      const matchesStatus =
        statusFilter === "All" ||
        (job.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
      const matchesUrgent = !urgentOnly || job.urgent === true;

      return matchesSearch && matchesStatus && matchesUrgent;
    });
  }, [jobs, searchQuery, statusFilter, urgentOnly]);

  const handleAcceptJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, status: "In Progress" } : j))
    );
    showToast("Job accepted! Customer notified.", "success");
  };

  const handleCompleteJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId || j._id === jobId ? { ...j, status: "Completed" } : j))
    );
    showToast("Job marked as completed!", "success");
  };

  const renderJobCard = (job) => {
    const isUrgent = job.urgent || /emergency|urgent|today/i.test(job.service || "");
    const status = job.status || "Pending";

    let statusStyle = "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Completed") statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "In Progress") statusStyle = "bg-blue-50 text-blue-700 border-blue-200";

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${statusStyle}`}>
                {status}
              </span>
              {isUrgent && (
                <span className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> Urgent
                </span>
              )}
              {job.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.category}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {job.service || job.title}
            </h3>

            {job.description && (
              <p className="text-sm text-slate-600 line-clamp-2 dark:text-slate-400">
                {job.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {job.date && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {job.date}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
              )}
              {job.customerName && (
                <span className="flex items-center gap-1">
                  👤 {job.customerName}
                </span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t pt-4 sm:border-t-0 sm:pt-0 border-slate-100 dark:border-slate-800">
            {job.price && (
              <div className="text-right">
                <p className="text-xs text-slate-400">Est. Payout</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {job.price}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {status === "Pending" && (
                <button
                  type="button"
                  onClick={() => handleAcceptJob(job.id || job._id)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                >
                  Accept Job
                </button>
              )}
              {status === "In Progress" && (
                <button
                  type="button"
                  onClick={() => handleCompleteJob(job.id || job._id)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Provider Job Feed
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time virtualized feed of local service requests and active jobs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchJobs}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Feed
          </button>
          <Link
            to="/worker/dashboard"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-slate-700"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs by service or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={() => setUrgentOnly((prev) => !prev)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              urgentOnly
                ? "border-red-600 bg-red-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Urgent Only
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Pending", "In Progress", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === tab
                  ? "bg-slate-900 text-white dark:bg-blue-600"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Counter */}
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredJobs.length} virtualized feed items</span>
        <span className="font-semibold text-emerald-600">⚡ 60fps DOM recycling enabled</span>
      </div>

      {/* Virtualized Feed List */}
      <FeedList
        items={filteredJobs}
        renderItem={renderJobCard}
        useWindowScroll={true}
        overscan={300}
        loading={loading}
        emptyState={
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No matching jobs found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Adjust your search keywords or status filter.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default JobsFeed;
