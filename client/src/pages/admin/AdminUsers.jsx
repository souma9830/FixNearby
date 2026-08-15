import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Ban,
  CheckCircle,
  Clock,
  Eye,
  X,
  Download,
  Calendar,

  User as UserIcon,
  Wrench,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getAdminUsers, banUser, getUserBookings } from '../../services/adminService';
import { exportToCSV } from '../../utils/exportUtils';

const AdminUsers = () => {
  useDocumentTitle('User & Worker Management');

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Ban confirmation modal state
  const [banModal, setBanModal] = useState(null); // { user, isBanned }
  const [banLoading, setBanLoading] = useState(false);

  // Booking history inspector modal state
  const [bookingHistoryModal, setBookingHistoryModal] = useState(null); // { user, bookings: [], loading: false }

  const loadUsersData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page,
        limit: 15,
        role: roleFilter,
        status: statusFilter,
        search
      });
      if (data.success) {
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsersData(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsersData]);

  const handleToggleBan = async () => {
    if (!banModal) return;
    setBanLoading(true);
    try {
      const targetState = !banModal.user.isBanned;
      const res = await banUser(banModal.user._id, targetState);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === banModal.user._id ? { ...u, isBanned: targetState } : u));
        setBanModal(null);
      }
    } catch (err) {
      console.error('Ban action failed:', err);
    } finally {
      setBanLoading(false);
    }
  };

  const handleInspectBookings = async (user) => {
    setBookingHistoryModal({ user, bookings: [], loading: true });
    try {
      const res = await getUserBookings(user._id);
      if (res.success) {
        setBookingHistoryModal({ user, bookings: res.bookings || [], loading: false });
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setBookingHistoryModal({ user, bookings: [], loading: false });
    }
  };

  const handleExportCSV = () => {
    const exportData = users.map(u => ({
      ID: u._id,
      Name: u.name,
      Email: u.email,
      Phone: u.phone || u.contact || '',
      Role: u.role,
      Status: u.status || u.availabilityStatus || 'offline',
      Banned: u.isBanned ? 'Yes' : 'No',
      JoinedDate: new Date(u.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, `users_export_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Back Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-2 transition font-medium">
            <ArrowLeft size={16} /> Back to Executive Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User & Worker Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage customers, technicians, role authorizations, and account status</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm self-start md:self-auto"
        >
          <Download className="h-4 w-4 text-emerald-600" />
          Export to CSV
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Search by name, email, phone, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter size={14} />
            Filters:
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="worker">Workers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="online">Online / Available</option>
            <option value="offline">Offline</option>
          </select>

          <button
            onClick={() => loadUsersData(pagination.page)}
            className="p-2 text-gray-500 hover:text-blue-600 transition"
            title="Reload Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden mb-6">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-medium">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-700 dark:text-slate-300">No matching user records found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filter selections</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700/60 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          item.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                          item.role === 'worker' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}>
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        item.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                        item.role === 'worker' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {item.role === 'worker' && <Wrench size={12} />}
                        {item.role === 'admin' && <Shield size={12} />}
                        {item.role === 'customer' && <UserIcon size={12} />}
                        {item.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-600 dark:text-slate-300">
                      {item.phone || item.contact || 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.isBanned ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                            Banned
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            (item.status === 'online' || item.status === 'available') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            item.status === 'busy' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {item.status || 'offline'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Inspect Bookings Button */}
                        <button
                          onClick={() => handleInspectBookings(item)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 transition"
                          title="View Booking History"
                          aria-label="View Booking History"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Ban / Unban Toggle Button */}
                        <button
                          onClick={() => setBanModal({ user: item })}
                          className={`p-1.5 rounded-lg transition ${
                            item.isBanned
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}
                          title={item.isBanned ? 'Unban Account' : 'Ban Account'}
                          aria-label={item.isBanned ? 'Unban Account' : 'Ban Account'}
                        >
                          {item.isBanned ? <CheckCircle size={16} /> : <Ban size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-slate-900/30 border-t border-gray-100 dark:border-slate-700/60">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Showing page <span className="font-semibold text-gray-900 dark:text-white">{pagination.page}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{pagination.pages}</span> ({pagination.total} total accounts)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadUsersData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => loadUsersData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban / Unban Confirmation Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${banModal.user.isBanned ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {banModal.user.isBanned ? <CheckCircle size={24} /> : <Ban size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {banModal.user.isBanned ? 'Unban Account' : 'Suspend / Ban Account'}
                </h3>
                <p className="text-xs text-gray-500">{banModal.user.email}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
              Are you sure you want to {banModal.user.isBanned ? 'unban' : 'ban'} <span className="font-semibold text-gray-900 dark:text-white">{banModal.user.name}</span>?
              {!banModal.user.isBanned && ' Banning will prevent the user from logging in or booking services.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBanModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBan}
                disabled={banLoading}
                className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition ${
                  banModal.user.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {banLoading ? 'Processing...' : banModal.user.isBanned ? 'Confirm Unban' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking History Inspector Modal */}
      {bookingHistoryModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} />
                  Booking History: {bookingHistoryModal.user.name}
                </h3>
                <p className="text-xs text-gray-500">{bookingHistoryModal.user.email} &bull; {bookingHistoryModal.user.role}</p>
              </div>
              <button
                onClick={() => setBookingHistoryModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {bookingHistoryModal.loading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Fetching booking history records...</div>
              ) : bookingHistoryModal.bookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-semibold text-gray-700 dark:text-slate-300">No booking history found</p>
                  <p className="text-xs text-gray-400 mt-1">This user has no associated booking records yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingHistoryModal.bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">{booking.service}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            booking.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          <span className="font-medium">Customer:</span> {booking.userId?.name || 'N/A'} &bull; <span className="font-medium">Worker:</span> {booking.workerId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Address: {booking.address}</p>
                      </div>

                      <div className="text-right sm:self-center">
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">₹{booking.price}</p>
                        <p className="text-[11px] text-gray-400">{new Date(booking.scheduledTime).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
