import { useState, useEffect , useCallback} from 'react';
import { Users, CheckSquare, CheckCircle2 } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const TeamDispatchHub = ({ bookingId = 'booking-101' }) => {
  const { showToast } = useToast();
  const [, setLoading] = useState(true);
  const [taskBreakdown, setTaskBreakdown] = useState(null);
useState('');
useState(25);

  const fetchTeamBreakdown = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/team-bookings/${bookingId}`);
      if (res.data?.success) {
        setTaskBreakdown(res.data.taskBreakdown);
      }
    } catch (err) {
      showToast('Failed to load team dispatch hub', 'error');
    } finally {
      setLoading(false);
    }
  }, [bookingId, setLoading, showToast]);

  useEffect(() => {
    fetchTeamBreakdown();
  }, [fetchTeamBreakdown]);

  const handleToggleSubTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await api.patch(`/team-bookings/${bookingId}/tasks/${taskId}`, { status: nextStatus });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchTeamBreakdown();
      }
    } catch (err) {
      showToast('Failed to update sub-task status', 'error');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={14} />
            Multi-Worker Team Dispatch Hub
          </div>
          <h2 className="text-2xl font-black text-white">Team Sub-Task & Revenue Split Control</h2>
          <p className="text-xs text-slate-400 mt-1">Lead contractor sub-task delegation, checklist tracking, and automated revenue splits</p>
        </div>

        <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-extrabold self-start sm:self-auto">
          Overall Progress: {taskBreakdown?.overallProgressPct || 0}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">Team Job Completion Matrix</span>
          <span className="text-emerald-400">{taskBreakdown?.overallProgressPct || 0}% Complete</span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            style={{ width: `${taskBreakdown?.overallProgressPct || 0}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Sub-Tasks Checklist */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckSquare size={16} className="text-blue-400" /> Sub-Task Assignment Checklist
        </h3>

        <div className="space-y-3">
          {taskBreakdown?.subTasks?.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.taskId}
                onClick={() => handleToggleSubTask(task.taskId, task.status)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                  }`}>
                    {isDone && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDone ? 'line-through opacity-80' : 'text-white'}`}>{task.title}</h4>
                    <span className="text-[10px] text-slate-400">Weight: {task.weightPct}% of job revenue</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {task.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamDispatchHub;
