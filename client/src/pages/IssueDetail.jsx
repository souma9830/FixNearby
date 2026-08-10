import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ThumbsUp, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Wrench, FileText } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getIssueById, upvoteIssue } from '../services/issueService';
import useToast from '../hooks/useToast';
import SkeletonLoader from '../components/SkeletonLoader';

const STEPS = [
  { id: 'submitted', label: 'Submitted', desc: 'Report logged in system', icon: FileText },
  { id: 'assigned', label: 'Assigned', desc: 'Assigned to field team', icon: ShieldCheck },
  { id: 'in-progress', label: 'In Progress', desc: 'Work underway on site', icon: Wrench },
  { id: 'resolved', label: 'Resolved', desc: 'Issue fixed & verified', icon: CheckCircle2 },
];

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

const IssueDetail = () => {
  const { id } = useParams();
  useDocumentTitle('Issue Details');
  const { showToast } = useToast();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getIssueById(id);
        setIssue(data.data || data);
      } catch (err) {
        showToast('Failed to load issue details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, showToast]);

  const handleUpvote = async () => {
    setUpvoting(true);
    try {
      const res = await upvoteIssue(id);
      setIssue(prev => ({ ...prev, upvotes: res.upvotes || (prev?.upvotes || 0) + 1 }));
      showToast('Upvote recorded!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upvote.', 'error');
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold">Issue not found</h2>
        <Link to="/civic-issues" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Civic Issues</Link>
      </div>
    );
  }

  const currentStep = getStatusIndex(issue.status);
  const severity = issue.severity || issue.priority || 'Medium';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/civic-issues" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Civic Issues
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${getSeverityBadgeColor(severity)}`}>
                {severity} Priority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{issue.title}</h1>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Clock size={14} className="inline text-gray-400" />
              Reported {new Date(issue.reportedAt || issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Interactive Resolution Flow Stepper */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Resolution Progress Flow</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-105'
                      : isDone
                      ? 'bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-900/40 text-emerald-800'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{step.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1 leading-tight">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {issue.thumbnailUrl && (
          <img src={issue.thumbnailUrl} alt={issue.title} className="w-full rounded-2xl max-h-96 object-cover shadow-sm" />
        )}

        <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-base">{issue.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100 dark:border-slate-700">
          {issue.latitude && issue.longitude && (
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-blue-500" /> {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
            </span>
          )}
          <span className="font-bold text-gray-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">{issue.category}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ThumbsUp size={20} className="text-blue-600" />
            <span className="font-black text-xl text-slate-900 dark:text-white">{issue.upvotes || 0}</span>
            <span className="text-sm font-semibold text-gray-500">Community Upvotes</span>
          </div>
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-125 disabled:opacity-50 transition-all duration-200 shadow-md shadow-blue-500/20"
          >
            <ThumbsUp size={18} className={upvoting ? "animate-bounce" : ""} />
            {upvoting ? 'Upvoting...' : 'Upvote Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
