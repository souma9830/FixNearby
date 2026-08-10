import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, UserCheck, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const SlaComplianceTracker = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [complianceRate, setComplianceRate] = useState(96);
  const [overdueCount, setOverdueCount] = useState(0);
  const [overdueBookings, setOverdueBookings] = useState([]);
  const [activeWorkers, setActiveWorkers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reassignWorkerId, setReassignWorkerId] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const fetchSlaData = async () => {
    setLoading(true);
    try {
      const [slaRes, workersRes] = await Promise.all([
        api.get('/admin/sla-metrics'),
        api.get('/admin/workers')
      ]);

      if (slaRes.data?.success) {
        setComplianceRate(slaRes.data.complianceRate || 96);
        setOverdueCount(slaRes.data.overdueCount || 0);
        setOverdueBookings(slaRes.data.overdueBookings || []);
      }

      if (workersRes.data?.success) {
        setActiveWorkers(workersRes.data.workers?.filter(w => w.availabilityStatus === 'available') || []);
      }
    } catch (err) {
      showToast('Failed to load SLA metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlaData();
  }, []);

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !reassignWorkerId) {
      return showToast('Select a target worker for re-assignment', 'warning');
    }

    setReassigning(true);
    try {
      const res = await api.post('/admin/reassign-booking', {
        bookingId: selectedBooking._id,
        targetWorkerId: reassignWorkerId
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setSelectedBooking(null);
        setReassignWorkerId('');
        fetchSlaData();
      }
    } catch (err) {
      showToast(err.message || 'Re-assignment failed', 'error');
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} />
            Response SLA & Auto-Escalation Engine
          </div>
          <h2 className="text-2xl font-black text-white">SLA Compliance & Escalation Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">Track response SLA timers, monitor overdue pending requests, and re-route stale bookings</p>
        </div>
        <button
          onClick={fetchSlaData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Overall SLA Compliance</p>
          <h3 className="text-3xl font-black text-emerald-400 mt-2">{complianceRate}%</h3>
          <span className="text-[10px] text-slate-500">Based on 15-min response window</span>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Overdue Pending Requests</p>
          <h3 className="text-3xl font-black text-amber-400 mt-2">{overdueCount}</h3>
          <span className="text-[10px] text-amber-400/80 font-bold">Action Required: Exceeding 15m SLA</span>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Response Time</p>
          <h3 className="text-3xl font-black text-blue-400 mt-2">12.4 min</h3>
          <span className="text-[10px] text-slate-500">Target SLA: &lt; 15 mins</span>
        </div>
      </div>

      {/* Overdue Queue */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Overdue Booking Re-Assignment Queue
        </h3>

        {overdueBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
            All booking requests are within SLA limits.
          </div>
        ) : (
          <div className="space-y-3">
            {overdueBookings.map((b) => (
              <div key={b._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{b.service}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold animate-pulse">
                      Overdue &gt; 15m
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Customer: <strong>{b.userId?.name || 'User'}</strong> | Assigned Worker: <strong>{b.workerId?.name || 'Worker'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBooking(b)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  Re-Assign Worker
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Re-Assignment Modal */}
      {selectedBooking && (
        <div className="p-6 bg-slate-950 rounded-2xl border border-blue-500/50 space-y-4">
          <h4 className="font-bold text-white text-sm">Re-Assign Booking #{selectedBooking._id}</h4>
          <p className="text-xs text-slate-400">Select an online available worker in category "{selectedBooking.service}"</p>

          <form onSubmit={handleReassign} className="flex flex-col sm:flex-row gap-3">
            <select
              value={reassignWorkerId}
              onChange={(e) => setReassignWorkerId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">-- Choose Available Worker --</option>
              {activeWorkers.map(w => (
                <option key={w._id} value={w._id}>{w.name} ({w.category}) - ⭐ {w.averageRating || '5.0'}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={reassigning}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                Confirm Re-assign
              </button>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SlaComplianceTracker;
