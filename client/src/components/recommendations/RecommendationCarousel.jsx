import { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
import api from '../../services/apiClient';

const RecommendationCarousel = () => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    api.get('/recommendations/workers')
      .then((res) => {
        if (res.data?.success) setWorkers(res.data.recommendations);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-400" size={18} />
          <h3 className="text-lg font-black text-white">Recommended Workers for You</h3>
        </div>
        <span className="text-xs text-slate-400 font-bold">AI Personalized Scoring</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {workers.map((w) => (
          <div key={w.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black rounded-lg">
                {w.matchScorePct}% AI Match
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star size={12} className="fill-amber-400" /> {w.rating}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">{w.name}</h4>
              <p className="text-xs text-slate-400">{w.category}</p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-800">
              <span className="text-slate-400">${w.hourlyRate}/hr</span>
              <span className="text-emerald-400 font-mono">{w.completedJobs} Jobs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCarousel;
