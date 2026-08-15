import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  Calendar,

  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Download,
  CreditCard,
  Building2,
  QrCode,
  Plus,
  Trash2,
  BarChart3,
  LineChart,
  Zap,
  Briefcase,
  ShieldCheck,
  X,

} from "lucide-react";
import {
  getEarningsSummary,
  getEarningsHistory,
  requestPayout,
  getPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  downloadEarningsCSV,
} from "../../services/earningService";

// Mock Fallback Data for Offline/Demo
const MOCK_SUMMARY = {
  totalEarnings: 48750,
  availableBalance: 12400,
  pendingAmount: 6200,
  paidAmount: 42550,
  thisMonth: 12400,
  thisWeek: 3450,
  bookingCount: 34,
  avgEarningPerJob: 1433,
  analytics: {
    weeklyTrends: [
      { date: "2026-07-19", label: "Sun", earnings: 450, grossAmount: 500, platformFee: 50, completedJobs: 1, avgPerJob: 450 },
      { date: "2026-07-20", label: "Mon", earnings: 1200, grossAmount: 1350, platformFee: 150, completedJobs: 2, avgPerJob: 600 },
      { date: "2026-07-21", label: "Tue", earnings: 0, grossAmount: 0, platformFee: 0, completedJobs: 0, avgPerJob: 0 },
      { date: "2026-07-22", label: "Wed", earnings: 1800, grossAmount: 2000, platformFee: 200, completedJobs: 3, avgPerJob: 600 },
      { date: "2026-07-23", label: "Thu", earnings: 900, grossAmount: 1000, platformFee: 100, completedJobs: 1, avgPerJob: 900 },
      { date: "2026-07-24", label: "Fri", earnings: 2400, grossAmount: 2650, platformFee: 250, completedJobs: 4, avgPerJob: 600 },
      { date: "2026-07-25", label: "Sat", earnings: 3450, grossAmount: 3800, platformFee: 350, completedJobs: 5, avgPerJob: 690 },
    ],
    monthlyTrends: [
      { period: "2026-02", label: "Feb", earnings: 6200, grossAmount: 6900, platformFee: 700, completedJobs: 5, avgPerJob: 1240 },
      { period: "2026-03", label: "Mar", earnings: 8400, grossAmount: 9300, platformFee: 900, completedJobs: 7, avgPerJob: 1200 },
      { period: "2026-04", label: "Apr", earnings: 7100, grossAmount: 7900, platformFee: 800, completedJobs: 6, avgPerJob: 1183 },
      { period: "2026-05", label: "May", earnings: 9800, grossAmount: 10800, platformFee: 1000, completedJobs: 8, avgPerJob: 1225 },
      { period: "2026-06", label: "Jun", earnings: 11200, grossAmount: 12400, platformFee: 1200, completedJobs: 9, avgPerJob: 1244 },
      { period: "2026-07", label: "Jul", earnings: 12400, grossAmount: 13800, platformFee: 1400, completedJobs: 10, avgPerJob: 1240 },
    ],
    correlationSeries: [
      { period: "Feb", completedJobs: 5, earnings: 6200, avgPerJob: 1240 },
      { period: "Mar", completedJobs: 7, earnings: 8400, avgPerJob: 1200 },
      { period: "Apr", completedJobs: 6, earnings: 7100, avgPerJob: 1183 },
      { period: "May", completedJobs: 8, earnings: 9800, avgPerJob: 1225 },
      { period: "Jun", completedJobs: 9, earnings: 11200, avgPerJob: 1244 },
      { period: "Jul", completedJobs: 10, earnings: 12400, avgPerJob: 1240 },
    ]
  },
  payoutMethods: [
    {
      _id: "pm1",
      type: "bank_account",
      isDefault: true,
      details: { bankName: "HDFC Bank", accountNumber: "•••• 4892", ifscCode: "HDFC0001234", accountHolderName: "John Doe" }
    },
    {
      _id: "pm2",
      type: "upi",
      isDefault: false,
      details: { upiId: "worker@okhdfcbank" }
    }
  ]
};

const MOCK_EARNINGS = [
  { _id: "1", amount: 1500, platformFee: 150, netAmount: 1350, type: "booking_income", status: "paid", createdAt: "2026-07-24T10:30:00Z", description: "Plumbing repair - Sector 15", payoutDate: "2026-07-24" },
  { _id: "2", amount: 2200, platformFee: 220, netAmount: 1980, type: "booking_income", status: "pending", createdAt: "2026-07-23T14:00:00Z", description: "Electrical wiring - MG Road", payoutDate: null },
  { _id: "3", amount: 2500, platformFee: 25, netAmount: 2475, type: "payout_withdrawal", status: "paid", createdAt: "2026-07-20T12:00:00Z", description: "Stripe Connect Instant Payout (TXN_PO_8841)", payoutDate: "2026-07-20" },
  { _id: "4", amount: 3500, platformFee: 350, netAmount: 3150, type: "booking_income", status: "paid", createdAt: "2026-07-18T11:45:00Z", description: "Kitchen renovation - Sector 22", payoutDate: "2026-07-19" },
  { _id: "5", amount: 1100, platformFee: 110, netAmount: 990, type: "booking_income", status: "refunded", createdAt: "2026-07-15T16:20:00Z", description: "Carpentry work - Palam Vihar", payoutDate: null },
];

const StatCard = ({ icon: Icon, label, value, color, subtext, badge }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
          ₹{typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
        {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} text-white shadow-sm`}>
        <Icon size={22} />
      </div>
    </div>
    {badge && (
      <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{badge.label}</span>
        <span className="text-[11px] font-bold text-emerald-600">{badge.value}</span>
      </div>
    )}
  </div>
);

const statusBadge = (status) => {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    refunded: "bg-rose-50 text-rose-700 border-rose-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'paid' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
    </span>
  );
};

export const EarningsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timeframe Tab for Chart: 'weekly' | 'monthly'
  const [chartTimeframe, setChartTimeframe] = useState("monthly");
  const [chartType, setChartType] = useState("bar"); // 'bar' | 'line'
  const [activeHoverData, setActiveHoverData] = useState(null);

  // Modals & Payout State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedMethodType, setSelectedMethodType] = useState("stripe_connect");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // Add Payout Method Modal State
  const [addMethodModalOpen, setAddMethodModalOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState("bank_account");
  const [bankDetails, setBankDetails] = useState({ bankName: "", accountNumber: "", ifscCode: "", accountHolderName: "" });
  const [upiDetails, setUpiDetails] = useState({ upiId: "" });
  const [addMethodLoading, setAddMethodLoading] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, historyRes, pmRes] = await Promise.all([
        getEarningsSummary(),
        getEarningsHistory({ page, limit: 8 }),
        getPayoutMethods().catch(() => ({ payoutMethods: [] })),
      ]);
      setSummary(sumRes);
      setEarnings(historyRes.earnings || []);
      setPagination(historyRes.pagination || { page: 1, pages: 1, total: 0 });
      setPayoutMethods(sumRes.payoutMethods || pmRes.payoutMethods || []);
    } catch (err) {
      console.warn("Earnings API fallback to mock data:", err.message);
      setSummary(MOCK_SUMMARY);
      setEarnings(MOCK_EARNINGS);
      setPagination({ page: 1, pages: 1, total: MOCK_EARNINGS.length });
      setPayoutMethods(MOCK_SUMMARY.payoutMethods);
      setError("Connected to offline demo mode");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Payout Submission (with Stripe Connect mock simulation)
  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    const available = summary?.availableBalance || summary?.paidAmount || 0;

    if (!amountNum || amountNum <= 0) {
      setPayoutMsg({ type: "error", text: "Please enter a valid payout amount" });
      return;
    }

    if (available > 0 && amountNum > available) {
      setPayoutMsg({ type: "error", text: `Requested amount exceeds available balance (₹${available.toLocaleString('en-IN')})` });
      return;
    }

    setPayoutLoading(true);
    setPayoutMsg(null);

    try {
      const selectedPm = payoutMethods.find((pm) => pm.type === selectedMethodType);
      const res = await requestPayout({
        amount: amountNum,
        payoutMethodType: selectedMethodType,
        payoutMethodDetails: selectedPm ? selectedPm.details : {}
      });

      setPayoutMsg({
        type: "success",
        text: res.message || `Payout request for ₹${amountNum.toLocaleString('en-IN')} processed!`
      });
      setPayoutAmount("");
      setTimeout(() => setPayoutModalOpen(false), 2000);
      fetchData();
    } catch (err) {
      setPayoutMsg({ type: "error", text: err.message || "Failed to process payout" });
    } finally {
      setPayoutLoading(false);
    }
  };

  // Handle Add Payout Method
  const handleAddPayoutMethodSubmit = async (e) => {
    e.preventDefault();
    setAddMethodLoading(true);
    try {
      const details = newMethodType === 'bank_account' ? bankDetails : newMethodType === 'upi' ? upiDetails : { stripeAccountId: `acct_mock_${Date.now()}` };
      const res = await addPayoutMethod({
        type: newMethodType,
        isDefault: payoutMethods.length === 0,
        details
      });

      setPayoutMethods(res.payoutMethods || []);
      setAddMethodModalOpen(false);
      setBankDetails({ bankName: "", accountNumber: "", ifscCode: "", accountHolderName: "" });
      setUpiDetails({ upiId: "" });
    } catch (err) {
      alert(err.message || "Failed to add payout method");
    } finally {
      setAddMethodLoading(false);
    }
  };

  // Handle Delete Payout Method
  const handleDeleteMethod = async (id) => {
    if (!confirm("Are you sure you want to remove this payout method?")) return;
    try {
      const res = await deletePayoutMethod(id);
      setPayoutMethods(res.payoutMethods || []);
    } catch (err) {
      alert(err.message || "Failed to delete payout method");
    }
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    setCsvLoading(true);
    try {
      await downloadEarningsCSV();
    } catch (err) {
      alert("Could not generate CSV download");
    } finally {
      setCsvLoading(false);
    }
  };

  // Selected chart dataset
  const chartData = useMemo(() => {
    if (!summary?.analytics) return [];
    return chartTimeframe === "weekly"
      ? summary.analytics.weeklyTrends || []
      : summary.analytics.monthlyTrends || [];
  }, [summary, chartTimeframe]);

  const maxChartEarnings = useMemo(() => {
    if (!chartData.length) return 1000;
    const maxVal = Math.max(...chartData.map((d) => d.earnings || 0));
    return maxVal > 0 ? maxVal * 1.2 : 1000;
  }, [chartData]);

  const correlationSeries = summary?.analytics?.correlationSeries || [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 font-semibold text-slate-600">Loading financial analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Earnings & Financial Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time revenue metrics, Stripe Connect payout tracking, and financial statements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={csvLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
          >
            <Download size={16} className="text-slate-500" />
            {csvLoading ? "Generating..." : "Export CSV Report"}
          </button>
          <button
            onClick={() => { setPayoutAmount(String(summary?.availableBalance || summary?.paidAmount || "")); setPayoutModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition"
          >
            <ArrowUpRight size={18} />
            Request Payout
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          {error}
        </div>
      )}

      {/* Summary Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Lifetime Earnings"
          value={summary?.totalEarnings || 0}
          color="bg-blue-600"
          subtext="Net income after platform fee"
        />
        <StatCard
          icon={Zap}
          label="Available Payout Balance"
          value={summary?.availableBalance || summary?.paidAmount || 0}
          color="bg-emerald-600"
          subtext="Ready for instant transfer"
          badge={{ label: "Avg Earning/Job", value: `₹${(summary?.avgEarningPerJob || 0).toLocaleString('en-IN')}` }}
        />
        <StatCard
          icon={Calendar}
          label="This Month's Revenue"
          value={summary?.thisMonth || 0}
          color="bg-indigo-600"
          subtext={`This week: ₹${(summary?.thisWeek || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          icon={Briefcase}
          label="Completed Services"
          value={summary?.bookingCount || 0}
          color="bg-purple-600"
          subtext="Total completed bookings"
        />
      </div>

      {/* REVENUE TRENDS & ANALYTICS CHART */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              <h2 className="text-xl font-bold text-slate-900">Revenue Trend Analytics</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Net earnings and completed service trends over time
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart mode toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartType === "bar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BarChart3 size={14} /> Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartType === "line" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LineChart size={14} /> Line
              </button>
            </div>

            {/* Timeframe toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setChartTimeframe("weekly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartTimeframe === "weekly" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Weekly (7 Days)
              </button>
              <button
                onClick={() => setChartTimeframe("monthly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartTimeframe === "monthly" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly (6 Months)
              </button>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Component */}
        <div className="relative h-64 w-full pt-4">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-slate-300 pointer-events-none pb-8">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-12 text-right">
                  ₹{Math.round(maxChartEarnings * ratio).toLocaleString('en-IN')}
                </span>
                <div className="flex-1 border-b border-dashed border-slate-200" />
              </div>
            ))}
          </div>

          {/* Render Bars / Points */}
          <div className="relative ml-14 flex h-48 items-end justify-around gap-2 pt-4">
            {chartData.map((item, idx) => {
              const heightPct = Math.max(5, (item.earnings / maxChartEarnings) * 100);
              const label = item.label || item.period;
              const isHovered = activeHoverData?.label === label;

              return (
                <div
                  key={idx}
                  className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                  onMouseEnter={() => setActiveHoverData(item)}
                  onMouseLeave={() => setActiveHoverData(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 rounded-xl bg-slate-900 px-3 py-2 text-white shadow-xl text-center pointer-events-none whitespace-nowrap border border-slate-700 animate-in fade-in duration-200">
                      <p className="text-[11px] font-bold text-slate-300">{label}</p>
                      <p className="text-xs font-extrabold text-emerald-400">
                        ₹{(item.earnings || 0).toLocaleString("en-IN")} net
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.completedJobs || 0} jobs • ₹{item.avgPerJob || 0}/job
                      </p>
                    </div>
                  )}

                  {/* Bar Visualizer */}
                  {chartType === "bar" ? (
                    <div
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                        isHovered
                          ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-lg shadow-blue-200 scale-105"
                          : "bg-gradient-to-t from-blue-500 to-cyan-400"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  ) : (
                    /* Line Mode Column Dot */
                    <div className="flex flex-col items-center justify-end w-full h-full">
                      <div
                        className={`h-4 w-4 rounded-full border-2 border-white transition-all duration-300 ${
                          isHovered ? "bg-blue-600 scale-125 shadow-md shadow-blue-300" : "bg-blue-500"
                        }`}
                        style={{ marginBottom: `${heightPct}%` }}
                      />
                    </div>
                  )}

                  <span className="mt-3 text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* COMPLETED JOBS VS EARNINGS CORRELATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              <h3 className="text-lg font-bold">Jobs vs Earnings Correlation</h3>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              High Efficiency
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-6">
            Measures service volume against net revenue output per monthly cycle.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {correlationSeries.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4 transition hover:bg-slate-800">
                <p className="text-xs font-bold text-slate-400">{item.period}</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-emerald-400">
                    ₹{item.earnings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-blue-300">
                    {item.completedJobs} jobs
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50 pt-2">
                  <span>Avg/Job</span>
                  <span className="font-bold text-slate-200">₹{item.avgPerJob.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Payout Methods Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Payout Destinations</h3>
              <button
                onClick={() => setAddMethodModalOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            <div className="space-y-3">
              {payoutMethods.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No payout methods added yet. Add a bank account or Stripe Connect to receive funds.
                </p>
              ) : (
                payoutMethods.map((pm) => (
                  <div key={pm._id || pm.type} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-blue-300 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        {pm.type === 'bank_account' ? <Building2 size={18} /> : pm.type === 'upi' ? <QrCode size={18} /> : <CreditCard size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 uppercase">
                            {pm.type.replace('_', ' ')}
                          </p>
                          {pm.isDefault && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {pm.details?.bankName || pm.details?.upiId || pm.details?.accountNumber || "Connected Account"}
                        </p>
                      </div>
                    </div>
                    {pm._id && (
                      <button
                        onClick={() => handleDeleteMethod(pm._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                        title="Delete method"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Encrypted banking standards powered by Stripe Connect</span>
            </div>
          </div>
        </div>
      </div>

      {/* EARNINGS & PAYOUT HISTORY TABLE */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-500">All earnings, completed payouts, and adjustments</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total entries: {pagination.total}
          </span>
        </div>

        {earnings.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <DollarSign className="mx-auto mb-3 opacity-30" size={36} />
            <p className="font-semibold text-slate-600">No earnings recorded yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5 text-right">Gross</th>
                    <th className="px-6 py-3.5 text-right">Fee</th>
                    <th className="px-6 py-3.5 text-right">Net Amount</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800 max-w-[240px] truncate">
                        {item.description || item.bookingId?.service || "Service Earning"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          item.type === 'payout_withdrawal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {item.type === 'payout_withdrawal' ? 'Payout Withdrawal' : 'Service Income'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-600">
                        ₹{item.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        ₹{item.platformFee?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">
                        ₹{item.netAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {statusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchData(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchData(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PAYOUT REQUEST MODAL (STRIPE CONNECT MOCK) */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Request Payout</h3>
                  <p className="text-xs text-slate-500">Stripe Connect & Direct Payouts</p>
                </div>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {payoutMsg && (
              <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
                payoutMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {payoutMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {payoutMsg.text}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Payout Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Available: ₹{(summary?.availableBalance || summary?.paidAmount || 0).toLocaleString('en-IN')}</span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(summary?.availableBalance || summary?.paidAmount || 0))}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Use Max
                  </button>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Select Payout Method
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    selectedMethodType === 'stripe_connect' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethodType === 'stripe_connect'}
                        onChange={() => setSelectedMethodType('stripe_connect')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Stripe Connect Express</p>
                        <p className="text-[10px] text-slate-500">Instant payout to linked debit/bank</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Instant</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    selectedMethodType === 'bank_account' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethodType === 'bank_account'}
                        onChange={() => setSelectedMethodType('bank_account')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Direct Bank Transfer</p>
                        <p className="text-[10px] text-slate-500">Standard 1-2 business days</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    selectedMethodType === 'upi' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethodType === 'upi'}
                        onChange={() => setSelectedMethodType('upi')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Instant UPI Transfer</p>
                        <p className="text-[10px] text-slate-500">Direct to UPI VPA ID</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {payoutLoading ? "Processing Payout..." : "Confirm & Transfer"}
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PAYOUT METHOD MODAL */}
      {addMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add Payout Method</h3>
              <button onClick={() => setAddMethodModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPayoutMethodSubmit} className="space-y-4">
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewMethodType("bank_account")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    newMethodType === "bank_account" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setNewMethodType("upi")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    newMethodType === "upi" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setNewMethodType("stripe_connect")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    newMethodType === "stripe_connect" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Stripe Connect
                </button>
              </div>

              {newMethodType === "bank_account" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="IFSC Code (e.g. HDFC0001234)"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              {newMethodType === "upi" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI VPA ID</label>
                  <input
                    type="text"
                    placeholder="e.g. worker@upi"
                    value={upiDetails.upiId}
                    onChange={(e) => setUpiDetails({ upiId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}

              {newMethodType === "stripe_connect" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-center">
                  <CreditCard className="mx-auto mb-2 text-blue-600" size={32} />
                  <p className="text-xs font-bold text-slate-900">Stripe Connect Express Onboarding</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Connect your bank or debit card instantly via Stripe Express payouts.
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={addMethodLoading}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  {addMethodLoading ? "Saving..." : "Save Payout Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;
