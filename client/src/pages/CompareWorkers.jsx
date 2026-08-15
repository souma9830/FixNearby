
import { Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Briefcase,
  BadgeCheck,
  X,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Download,
} from 'lucide-react';
import useWorkerComparison from '../hooks/useWorkerComparison';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { exportToCSV } from '../utils/exportUtils';
import { buildWorkerComparisonRows } from '../utils/workerComparisonExport';

const WorkerColumn = ({ worker, onRemove, isBestPrice, isBestRating, isBestExperience }) => {
  const recentReviews = (worker.reviews || []).slice(0, 2);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
        <button
          type="button"
          onClick={() => onRemove(worker._id)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          title="Remove from comparison"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden">
          {worker.profilePicture ? (
            <img src={worker.profilePicture} alt={worker.name} className="h-full w-full object-cover rounded-full" />
          ) : (
            worker.name?.charAt(0) || '?'
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 truncate">{worker.name}</h3>
        <p className="text-sm text-blue-600 font-medium">{worker.category}</p>
        <Link
          to={`/worker/${worker._id}`}
          className="mt-3 inline-block rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
        >
          Book Now
        </Link>
      </div>

      {/* Stats */}
      <div className="flex-1 px-5 py-4 space-y-3">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</span>
          <span className={`flex items-center gap-1 text-sm font-bold ${isBestRating ? 'text-emerald-600' : 'text-gray-700'}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {worker.averageRating || 'N/A'}
            {isBestRating && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-1">Best</span>}
          </span>
        </div>

        {/* Experience */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</span>
          <span className={`flex items-center gap-1 text-sm font-bold ${isBestExperience ? 'text-emerald-600' : 'text-gray-700'}`}>
            <Briefcase className="h-3.5 w-3.5" />
            {worker.experience || 'N/A'}
            {isBestExperience && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-1">Best</span>}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</span>
          <span className={`text-sm font-bold ${isBestPrice ? 'text-emerald-600' : 'text-gray-700'}`}>
            {worker.price ? `$${worker.price}/hr` : 'N/A'}
            {isBestPrice && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-1">Best</span>}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</span>
          <span className="flex items-center gap-1 text-sm text-gray-700">
            <MapPin className="h-3.5 w-3.5" />
            {worker.location?.city || worker.location?.address || 'N/A'}
          </span>
        </div>

        {/* Verified */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified</span>
          {worker.verified ? (
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
              <BadgeCheck className="h-4 w-4" /> Yes
            </span>
          ) : (
            <span className="text-sm text-gray-400">No</span>
          )}
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response</span>
          <span className="flex items-center gap-1 text-sm text-gray-700">
            <Clock className="h-3.5 w-3.5" />
            {worker.slaResponseMins ? `~${worker.slaResponseMins} min` : 'N/A'}
          </span>
        </div>

        {/* Completed Jobs */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs Done</span>
          <span className="text-sm font-bold text-gray-700">{worker.completedJobs || 0}</span>
        </div>

        {/* Karma Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Karma</span>
          <span className="flex items-center gap-1 text-sm font-bold text-gray-700">
            <Sparkles className="h-3.5 w-3.5" />
            {worker.karmaScore || 100}
          </span>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            worker.availabilityStatus === 'available' ? 'bg-green-100 text-green-700' :
            worker.availabilityStatus === 'busy' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {worker.availabilityStatus || 'offline'}
          </span>
        </div>

        {/* Bio */}
        {worker.bio && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">About</span>
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{worker.bio}</p>
          </div>
        )}

        {/* Service Categories */}
        {worker.serviceCoverage && worker.serviceCoverage.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Services</span>
            <div className="flex flex-wrap gap-1">
              {worker.serviceCoverage.slice(0, 3).map((svc, idx) => (
                <span key={idx} className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {svc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {worker.certifications && worker.certifications.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Certifications</span>
            <div className="flex flex-wrap gap-1">
              {worker.certifications.map((cert, idx) => (
                <span key={idx} className="flex items-center gap-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Recent Reviews</span>
            <div className="space-y-2">
              {recentReviews.map((review) => (
                <div key={review._id} className="rounded-lg bg-slate-50 p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[11px] font-bold text-gray-700">{review.rating}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{review.user?.name || 'Anonymous'}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2">{review.reviewText}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonColumn = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="bg-slate-100 p-6 text-center space-y-3">
      <div className="mx-auto h-20 w-20 rounded-full bg-slate-200" />
      <div className="h-5 bg-slate-200 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
      <div className="h-8 bg-slate-200 rounded-xl w-24 mx-auto" />
    </div>
    <div className="p-5 space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-3 bg-slate-200 rounded w-12" />
        </div>
      ))}
    </div>
  </div>
);

const CompareWorkers = () => {
  useDocumentTitle('Compare Workers');
  const { workers, loading, error, removeWorker, clearAll } = useWorkerComparison();

  const exportComparison = () => {
    exportToCSV(
      buildWorkerComparisonRows(workers),
      `fixnearby-worker-comparison-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  if (workers.length === 0 && !loading && !error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 px-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select workers to compare</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Choose up to 3 workers from our services page to see them side-by-side and pick the best one.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-blue-600"
          >
            <ArrowLeft className="h-4 w-4" /> Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Workers</h1>
          <p className="text-gray-500 mt-1">
            {workers.length} worker{workers.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        <div className="flex gap-3">
          {workers.length > 0 && (
            <button
              type="button"
              onClick={exportComparison}
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          <Link
            to="/services"
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Add Worker
          </Link>
          {workers.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.max(2, workers.length || 2)}, 1fr)` }}>
          {[...Array(workers.length || 2)].map((_, i) => (
            <SkeletonColumn key={i} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid gap-6 min-w-0"
            style={{ gridTemplateColumns: `repeat(${workers.length}, minmax(280px, 1fr))` }}
          >
            {workers.map((worker) => {
              const prices = workers.map(w => {
                const p = typeof w.price === 'string' ? parseInt(w.price.replace(/[^0-9]/g, ''), 10) : (w.price || 0);
                return isNaN(p) ? Infinity : p;
              });
              const ratings = workers.map(w => w.averageRating || 0);
              const experiences = workers.map(w => {
                const exp = parseInt(String(w.experience).replace(/[^0-9]/g, ''), 10);
                return isNaN(exp) ? 0 : exp;
              });

              const minPrice = Math.min(...prices.filter(p => p > 0));
              const maxRating = Math.max(...ratings);
              const maxExp = Math.max(...experiences);

              const wPrice = typeof worker.price === 'string' ? parseInt(worker.price.replace(/[^0-9]/g, ''), 10) : (worker.price || 0);
              const wRating = worker.averageRating || 0;
              const wExp = parseInt(String(worker.experience).replace(/[^0-9]/g, ''), 10);

              return (
                <WorkerColumn
                  key={worker._id}
                  worker={worker}
                  onRemove={removeWorker}
                  isBestPrice={wPrice > 0 && wPrice === minPrice && workers.length > 1}
                  isBestRating={wRating === maxRating && workers.length > 1}
                  isBestExperience={wExp === maxExp && workers.length > 1}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareWorkers;
