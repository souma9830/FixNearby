import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wrench,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldAlert,
  FileCheck,
  Download,
  Printer,
  RefreshCw,
  ArrowUpRight,
  Server,
  Database,
  Cpu,
  Clock
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getAdminStats } from '../../services/adminService';
import api from '../../services/apiClient';
import { exportToCSV, exportToPDFReport } from '../../utils/exportUtils';

import SpatialHeatmap from '../../components/admin/SpatialHeatmap';
import DisputeArbitrationPanel from '../../components/admin/DisputeArbitrationPanel';
import SlaComplianceTracker from '../../components/admin/SlaComplianceTracker';
import AdminAuditLogs from '../../components/admin/AdminAuditLogs';
import { Flame, Scale, ShieldCheck } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, change, link, subtext }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/60 hover:shadow-md transition duration-200">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {change && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <ArrowUpRight className="h-3 w-3 mr-0.5" />
          {change}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</h3>
      {subtext && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{subtext}</p>}
    </div>
    {link && (
      <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700/50">
        <Link to={link} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
          View details &rarr;
        </Link>
      </div>
    )}
  </div>
);

// SVG Line Chart Component for Signups & Revenue Trends
const SimpleTrendChart = ({ data, dataKey, color = '#2563eb', height = 180 }) => {
  if (!data || data.length === 0) return <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No analytics data available</div>;

  const values = data.map(d => Number(d[dataKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * 100;
    const y = 100 - ((val - minVal) / (maxVal - minVal || 1)) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-44 overflow-visible">
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${dataKey})`}
        />
        {/* Line path */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      {/* Date markers on X axis */}
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">
        <span>{data[0]?.date || '30 days ago'}</span>
        <span>{data[Math.floor(data.length / 2)]?.date || '15 days ago'}</span>
        <span>{data[data.length - 1]?.date || 'Today'}</span>
      </div>
    </div>
  );
};

// SVG Stacked Bar Chart for Booking Trends
const BookingTrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No booking trend data</div>;

  const maxVal = Math.max(...data.map(d => (d.completedBookings || 0) + (d.pendingBookings || 0) + (d.cancelledBookings || 0)), 1);

  return (
    <div>
      <div className="flex items-center justify-end gap-4 text-xs font-medium mb-3">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancelled</span>
      </div>
      <div className="h-40 flex items-end gap-1.5 pt-4">
        {data.slice(-14).map((d, i) => {
          const total = (d.completedBookings || 0) + (d.pendingBookings || 0) + (d.cancelledBookings || 0);
          const hCompleted = ((d.completedBookings || 0) / maxVal) * 100;
          const hPending = ((d.pendingBookings || 0) / maxVal) * 100;
          const hCancelled = ((d.cancelledBookings || 0) / maxVal) * 100;

          return (
            <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5 group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 pointer-events-none shadow-lg">
                <p className="font-semibold">{d.date}</p>
                <p>Completed: {d.completedBookings || 0}</p>
                <p>Pending: {d.pendingBookings || 0}</p>
                <p>Cancelled: {d.cancelledBookings || 0}</p>
              </div>
              {hCancelled > 0 && <div style={{ height: `${hCancelled}%` }} className="w-full bg-rose-500 rounded-t-sm" />}
              {hPending > 0 && <div style={{ height: `${hPending}%` }} className="w-full bg-purple-500" />}
              {hCompleted > 0 && <div style={{ height: `${hCompleted}%` }} className="w-full bg-emerald-500 rounded-b-sm" />}
              {total === 0 && <div className="w-full h-1 bg-gray-100 dark:bg-slate-700 rounded" />}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">
        <span>{data[data.length - 14]?.date || '14d ago'}</span>
        <span>Today</span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard & Control Center');

  const [stats, setStats] = useState({
    users: 0,
    workers: 0,
    bookings: 0,
    revenue: 0,
    openIssues: 0,
    pendingVerifications: 0,
    pendingReviews: 0
  });

  const [analytics, setAnalytics] = useState([]);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState({
    status: 'checking...',
    dbStatus: 'Connected',
    uptimeSeconds: 0,
    memoryHeapMB: '0.00',
    environment: 'development'
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('signups'); // signups, bookings, revenue
  const [mainTab, setMainTab] = useState('overview'); // overview, heatmap, disputes, sla, audit

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      if (data.success) {
        setStats(data.stats || stats);
        setAnalytics(data.analytics || []);
        setActivity(data.recentActivity || []);
        if (data.systemHealth) setHealth(data.systemHealth);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCSVExport = () => {
    const exportData = analytics.map(item => ({
      Date: item.date,
      Total_Signups: item.totalSignups,
      User_Signups: item.users,
      Worker_Signups: item.workers,
      Completed_Bookings: item.completedBookings,
      Pending_Bookings: item.pendingBookings,
      Cancelled_Bookings: item.cancelledBookings,
      Revenue_INR: item.revenue
    }));
    exportToCSV(exportData, `admin_analytics_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePDFExport = () => {
    exportToPDFReport({
      title: 'Platform Overview & Executive Analytics Summary',
      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'full' }),
      metrics: [
        { label: 'Total Users', value: stats.users },
        { label: 'Active Workers', value: stats.workers },
        { label: 'Total Bookings', value: stats.bookings },
        { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}` },
      ],
      tableHeaders: ['Date', 'Total Signups', 'Completed Bookings', 'Cancelled Bookings', 'Daily Revenue'],
      tableData: analytics.slice(-10).map(a => [
        a.date,
        a.totalSignups,
        a.completedBookings,
        a.cancelledBookings,
        `₹${a.revenue.toLocaleString()}`
      ])
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Main Control Center Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Enterprise Operations Control Center</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Multi-role administrative management, dispute arbitration, SLA tracking & spatial heatmaps</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleCSVExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={handlePDFExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Platform Growth Analytics (30 Days)
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Daily platform trends for signups, bookings, and revenue</p>
          </div>

          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('signups')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'signups' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'}`}
            >
              Signups
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'bookings' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'}`}
            >
              Booking Trends
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'}`}
            >
              Revenue
            </button>
          </div>
        </div>

        {activeTab === 'signups' && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Daily User & Worker Registrations</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Total 30D Signups</span>
            </div>
            <SimpleTrendChart data={analytics} dataKey="totalSignups" color="#2563eb" />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Booking Volume Breakdown by Status</div>
            <BookingTrendChart data={analytics} />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Daily Completed Booking Revenue (₹)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gross Cumulative</span>
            </div>
            <SimpleTrendChart data={analytics} dataKey="revenue" color="#10b981" />
          </div>
        )}
      </div>

      {/* Two Column Grid: Recent Activity Feed & System Health Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-700/60">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Recent System Activity Stream
            </h2>
            <span className="text-xs text-gray-400">Real-time platform logs</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading activity stream...</div>
          ) : activity.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No recent platform activity recorded.</div>
          ) : (
            <div className="space-y-4">
              {activity.map((act) => (
                <div key={act.id} className="flex items-start justify-between gap-4 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-start gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${act.badgeColor}`}>
                      {act.type.replace('_', ' ')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{act.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health Status Diagnostics (1 Col) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-700/60">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-600" />
                System Diagnostics
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${health.status === 'operational' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700'}`}>
                {health.status === 'operational' ? 'OPERATIONAL' : 'DEGRADED'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-slate-700/50">
                <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Database className="h-4 w-4 text-blue-500" />
                  MongoDB Connection
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{health.dbStatus}</span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-slate-700/50">
                <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Server Uptime
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">{Math.floor(health.uptimeSeconds / 60)} min {health.uptimeSeconds % 60}s</span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-slate-700/50">
                <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Cpu className="h-4 w-4 text-amber-500" />
                  Memory Heap Usage
                </span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">{health.memoryHeapMB} MB</span>
              </div>

              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-slate-700/50">
                <span className="text-gray-500 dark:text-slate-400">Node Runtime</span>
                <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300">{health.nodeVersion}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-700/60 space-y-2">
            <Link
              to="/admin/moderation"
              className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl text-xs font-bold transition"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Moderation Queue
              </span>
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px]">
                {stats.pendingReviews + stats.openIssues}
              </span>
            </Link>

            <Link
              to="/admin/moderation?tab=verifications"
              className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition"
            >
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Worker Verification Requests
              </span>
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px]">
                {stats.pendingVerifications}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
