import { useState, useEffect } from 'react';
import { ShieldCheck, Download, RefreshCw, Search, Clock, User } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const AdminAuditLogs = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      showToast('Failed to fetch security audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return showToast('No log data available to export.', 'warning');

    const headers = ['ID', 'Timestamp', 'Admin Name', 'Role', 'Action', 'Target Category', 'Target ID', 'Details', 'IP Address'];
    const rows = logs.map(l => [
      l._id,
      new Date(l.createdAt).toISOString(),
      `"${l.adminName || 'Admin'}"`,
      l.role,
      l.action,
      l.targetCategory,
      l.targetId || '',
      `"${l.details?.replace(/"/g, '""') || ''}"`,
      l.ipAddress
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Admin_Audit_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Audit trail exported to CSV file!', 'success');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = !search ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.adminName?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || l.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} />
            Security & Compliance Audit Trail
          </div>
          <h2 className="text-2xl font-black text-white">Multi-Role Security Audit Logs</h2>
          <p className="text-xs text-slate-400 mt-1">Immutable audit records tracking supervisory administrative actions, arbitration resolutions, and permission changes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md whitespace-nowrap"
          >
            <Download size={14} />
            Export CSV Audit Trail
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, agent name, or details..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="All">All Admin Roles</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SupportAgent">SupportAgent</option>
            <option value="OperationsLead">OperationsLead</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Agent / Role</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
              <th className="p-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 font-semibold">
                  No audit log entries matched criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User size={12} className="text-blue-400" />
                      {log.adminName || 'Admin'}
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                      {log.role || 'Agent'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-300">
                    {log.action}
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">
                    {log.details || 'N/A'}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
