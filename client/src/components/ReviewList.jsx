import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';
import api from '../services/apiClient';

const ratingBreakdown = (reviews) => {
  const total = reviews.length;
  const breakdown = [0, 0, 0, 0, 0];
  let sum = 0;
  reviews.forEach((r) => {
    breakdown[r.rating - 1]++;
    sum += r.rating;
  });
  const average = total > 0 ? (sum / total).toFixed(1) : '0.0';
  return { total, average, breakdown };
};

export default function ReviewList({ reviews = [] }) {
  const [sortBy, setSortBy] = useState('newest');
  const [allReviews] = useState(reviews);

  const sorted = [...allReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const { total, average, breakdown } = ratingBreakdown(allReviews);

  const handleReport = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason: 'Reported by user' });
    } catch {
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-4xl font-bold text-slate-900 dark:text-white">{average}</div>
          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={18}
                className={i <= Math.round(Number(average)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600'}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total} {total === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star - 1];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right text-slate-600 dark:text-slate-400">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-slate-500 dark:text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          <MessageSquare size={16} className="mr-1 inline" />
          {total} {total === 1 ? 'review' : 'reviews'}
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest</option>
          <option value="lowest">Lowest</option>
        </select>
      </div>

      <div className="mt-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-700">
            <Star className="mx-auto text-slate-300 dark:text-slate-600" size={36} />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No reviews yet</p>
          </div>
        ) : (
          sorted.map((review) => (
            <ReviewCard key={review._id} review={review} onReport={handleReport} />
          ))
        )}
      </div>
    </div>
  );
}
