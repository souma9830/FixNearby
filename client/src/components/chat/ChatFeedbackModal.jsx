import  { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';

const ChatFeedbackModal = ({ isOpen, onClose, onSubmit, workerName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating of at least 1 star.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a brief feedback comment.');
      return;
    }
    setError('');
    onSubmit({ rating, comment: comment.trim() });
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Leave Feedback for {workerName}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => { setRating(star); setError(''); }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-slate-300 hover:scale-110 transition duration-100 cursor-pointer"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs font-bold text-amber-500 ml-2">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); setError(''); }}
              placeholder="Describe your experience working with this professional..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatFeedbackModal;
