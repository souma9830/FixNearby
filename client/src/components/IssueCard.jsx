import { MapPin, ThumbsUp, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

const getSeverityBadgeColor = (severity) => {
  const sev = (severity || 'medium').toLowerCase();
  switch (sev) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'emergency':
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    case 'medium':
    default:
      return 'bg-amber-100 text-amber-800 border-amber-300';
  }
};

const getStatusIndex = (status) => {
  const s = (status || 'open').toLowerCase();
  if (s === 'resolved' || s === 'closed') return 3;
  if (s === 'in-progress' || s === 'in_progress') return 2;
  if (s === 'assigned') return 1;
  return 0; // submitted / open
};

const STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const IssueCard = ({ issue, onUpvote, isUpvoting }) => {
  const reporterName = issue.reportedBy?.name || issue.reportedByName || 'Anonymous Citizen';
  const currentStep = getStatusIndex(issue.status);
  const severity = issue.severity || issue.priority || 'Medium';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
      <div>
        {/* Header Badges & Severity */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${getSeverityBadgeColor(severity)}`}>
              {severity} Priority
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Clock size={12} />
            {new Date(issue.reportedAt || issue.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {issue.thumbnailUrl && (
          <img
            src={issue.thumbnailUrl}
            alt={issue.title}
            className="w-full h-44 object-cover rounded-2xl mb-4 shadow-sm"
          />
        )}

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{issue.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5 line-clamp-3">
          {issue.description}
        </p>

        {/* Status Stepper Timeline */}
        <div className="mb-5 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span>Resolution Timeline</span>
            <span className="text-blue-600 dark:text-blue-400">{STEPS[currentStep]}</span>
          </div>
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 z-0" />
            {/* Active progress line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 z-0"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                      isDone
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-sm scale-110'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <span className={`mt-1 text-[9px] font-semibold ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <User size={14} className="text-blue-500" />
          <span>Reported by <strong className="text-slate-700 dark:text-slate-200">{reporterName}</strong></span>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 flex items-center justify-between mt-auto">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-400" />
          {issue.category}
        </span>

        {/* Upvote Button with Micro-Animation */}
        <button
          onClick={(e) => { e.preventDefault(); onUpvote(issue._id); }}
          disabled={isUpvoting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 active:scale-125 disabled:opacity-50 shadow-xs"
        >
          <ThumbsUp size={14} className={isUpvoting ? "animate-bounce text-blue-600" : "text-slate-500 group-hover:text-blue-600"} />
          <span>Upvote ({issue.upvotes || 0})</span>
        </button>
      </div>
    </div>
  );
};

export default IssueCard;
