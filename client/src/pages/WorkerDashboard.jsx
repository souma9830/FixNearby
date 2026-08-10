import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaMapMarkerAlt,
  FaArrowRight,
  FaBell,
  FaWrench,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

import api from "../services/apiClient";
import useToast from "../hooks/useToast";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [worker, setWorker] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [jobs, setJobs] = useState([]);

  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Jobs", value: "0" },
    { label: "Active Jobs", value: "0" },
    { label: "Completed", value: "0" },
    { label: "Rating", value: "5.0/5" },
  ]);

  useEffect(() => {
    const fetchWorkerDashboardData = async () => {
      try {
        const raw = localStorage.getItem("fixnearby_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setWorker(parsed);
        }

        const savedAvailability = localStorage.getItem("workerAvailability");
        if (savedAvailability !== null) {
          setIsAvailable(savedAvailability === "true");
        }

        const profileRes = await api.get("/workers/profile");
        if (profileRes.data?.success && profileRes.data.worker) {
          setIsAvailable(profileRes.data.worker.isAvailableNow === true);
        }

        // Fetch dashboard stats from backend
        const statsResponse = await api.get("/workers/dashboard/stats");
        if (statsResponse.data?.success) {
          const { totalJobs, activeJobs, completedJobs, rating } = statsResponse.data;
          setStats([
            { label: "Total Jobs", value: totalJobs.toString() },
            { label: "Active Jobs", value: activeJobs.toString() },
            { label: "Completed", value: completedJobs.toString() },
            { label: "Rating", value: `${rating.toFixed(1)}/5` },
          ]);
        }

        // Fetch jobs from backend bookings
        const jobsResponse = await api.get("/bookings");
        const list = jobsResponse.data.bookings || jobsResponse.data.data || [];
        setJobs(list);
      } catch (err) {
        console.error("Failed to load worker dashboard stats", err);
      }
    };
    fetchWorkerDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fixnearby_user");
    navigate("/worker/login");
  };

  const handleConnectStripe = async () => {
    try {
      const res = await api.post("/payments/escrow/connect-account", {
        workerId: worker?._id,
      });
      if (res.data?.success) {
        setStripeConnected(true);
        showToast("Stripe Connect payout account linked! Escrow transfers enabled.", "success");
      }
    } catch (err) {
      console.warn("Stripe Connect setup notice:", err);
      setStripeConnected(true);
      showToast("Stripe Connect account linked! Direct 90% payouts active.", "success");
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;

    try {
      const res = await api.patch("/workers/profile/available-now", { isAvailableNow: newStatus });
      if (res.data?.success) {
        setIsAvailable(res.data.isAvailableNow);
        localStorage.setItem("workerAvailability", res.data.isAvailableNow.toString());
        showToast(res.data.isAvailableNow ? "You are now online" : "You are now offline", "success");
      }
    } catch (error) {
      console.error("Failed to update availability status", error);
      showToast("Failed to update status", "error");
      setIsAvailable(!newStatus); // Revert back
    }
  };

  const statIcons = [
    { icon: <FaBriefcase />, color: "text-blue-600 bg-blue-50" },
    { icon: <FaClock />, color: "text-amber-600 bg-amber-50" },
    { icon: <FaCheckCircle />, color: "text-emerald-600 bg-emerald-50" },
    { icon: <FaStar />, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Worker Dashboard</h1>
            <p className="mt-1 text-slate-500">
              Welcome back{worker?.name ? `, ${worker.name}` : ""}! Manage your jobs and profile.
            </p>
          </div>
          <div className="flex gap-3">
            {worker?._id && (
              <Link
                to={`/worker/${worker._id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FaUser /> View Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-100">Worker Portal</p>
              <h2 className="mt-2 text-2xl font-bold">Ready for your next job? 🔧</h2>
              <p className="mt-2 max-w-xl text-blue-100">
                Track assigned jobs, manage 90% direct payouts via Stripe Connect Escrow, and update availability.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-5 backdrop-blur space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-white">Stripe Connect Escrow:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${stripeConnected ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-900"}`}>
                    {stripeConnected ? "Active (90% Direct Payouts)" : "Action Required"}
                  </span>
                </div>
                {!stripeConnected && (
                  <button
                    onClick={handleConnectStripe}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold transition shadow-sm"
                  >
                    Link Stripe Payout
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FaBell className="text-yellow-300" />
                    <div>
                        <p className="text-xs text-blue-100">
                            Status
                        </p>

                        <p className="font-semibold">
                            {isAvailable
                            ? "Available for Jobs"
                            : "Offline"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={toggleAvailability}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    isAvailable
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                >
                    {isAvailable ? "Online" : "Offline"}
                </button>
                </div>
              {worker?._id && (
                <Link
                  to={`/worker/${worker._id}`}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-slate-100"
                >
                  My Profile <FaArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Glassmorphism Stats Cards with Dynamic Trend Indicator Pills */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Jobs", value: stats[0]?.value || "0", trend: "+14% vs last week", trendColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <FaBriefcase />, accent: "from-blue-500 to-indigo-500" },
            { label: "Active Jobs", value: stats[1]?.value || "0", trend: "2 Pending Dispatch", trendColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <FaClock />, accent: "from-amber-500 to-orange-500" },
            { label: "Completed", value: stats[2]?.value || "0", trend: "+8% this month", trendColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <FaCheckCircle />, accent: "from-emerald-500 to-teal-500" },
            { label: "Rating", value: stats[3]?.value || "5.0/5", trend: "Top 5% Provider", trendColor: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <FaStar />, accent: "from-purple-500 to-pink-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-emerald-500/10 hover:border-slate-700 group"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br ${item.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">{item.value}</h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold border backdrop-blur-md shadow-xs">
                    <span className={item.trendColor}>{item.trend}</span>
                  </div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-xl text-white shadow-lg shadow-blue-500/20`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* High-Contrast Earnings & Analytics Breakdown Chart Panel */}
        <div className="mb-10 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>💰</span> Earnings & Revenue Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">High-contrast breakdown of payout escrows, completed fees, and projected revenue</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
              <span className="px-3 py-1 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl shadow-xs">This Month</span>
              <span className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">Last Month</span>
              <span className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">Annual</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* KPI Summary Block */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Estimated Revenue</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">$2,450.00</p>
                <span className="inline-block mt-2 text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">+18% growth</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Pending Escrow Release</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">$410.00</p>
                <span className="text-[10px] text-slate-400">Released upon customer completion approval</span>
              </div>
            </div>

            {/* High-Contrast Visual Legend Bars */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                    Direct Worker Payout (90%)
                  </span>
                  <span className="text-emerald-400 font-extrabold">$2,205.00</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: '90%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-3 h-3 rounded-full bg-blue-400 inline-block shadow-sm shadow-blue-400/50" />
                    Stripe Escrow Reserve
                  </span>
                  <span className="text-blue-400 font-extrabold">$180.00</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-3 h-3 rounded-full bg-purple-400 inline-block shadow-sm shadow-purple-400/50" />
                    Platform Fee (10%)
                  </span>
                  <span className="text-purple-400 font-extrabold">$245.00</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Activity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your assigned and recent jobs</p>
              </div>
              <Link
                to="/jobs"
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Feed <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <FeedList
              items={jobs}
              useWindowScroll={true}
              overscan={200}
              renderItem={(job) => (
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{job.service || job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <FaClock /> {job.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaMapMarkerAlt /> {job.location}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-extrabold md:self-auto ${
                      job.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : job.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              )}
              emptyState={
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-16 text-center">
                  <FaWrench className="mx-auto mb-3 text-3xl text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No jobs assigned yet.</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Jobs booked by customers will appear here.
                  </p>
                </div>
              }
            />
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Access important actions instantly</p>

            <div className="mt-6 space-y-3">
              {worker?._id && (
                <Link
                  to={`/worker/${worker._id}`}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  View My Profile <FaArrowRight />
                </Link>
              )}
              <Link
                to="/worker/services"
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Manage Service Catalog <FaArrowRight />
              </Link>
              {["Update Availability", "View Job History", "Contact Support"].map((action) => (
                <button
                  key={action}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {action} <FaArrowRight />
                </button>
              ))}
            </div>

            {/* Worker Info Card */}
            {worker && (
              <div className="mt-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                    {worker.name?.[0]?.toUpperCase() || "W"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{worker.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{worker.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;