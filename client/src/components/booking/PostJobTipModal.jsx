import React, { useState } from 'react';
import { submitPostJobTip } from '../../services/gratuityBonusService';

export default function PostJobTipModal({ bookingId, workerId, onClose, onSuccess }) {
  const [tipAmount, setTipAmount] = useState(15);
  const [selectedTags, setSelectedTags] = useState(['Punctual', 'Expert Skill']);
  const [submitting, setSubmitting] = useState(false);

  const compliments = ['Punctual', 'Clean Work', 'Polite', 'Expert Skill', 'Above & Beyond'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTipSubmit = async () => {
    setSubmitting(true);
    try {
      await submitPostJobTip({
        bookingId,
        workerId,
        tipAmountUSD: Number(tipAmount),
        complimentTags: selectedTags,
        isFiveStarReview: true,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white text-center">Add a Tip for Your Worker</h3>
        
        <div className="flex justify-center space-x-3">
          {[5, 10, 15, 25].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setTipAmount(amt)}
              className={`px-4 py-2 rounded-xl font-bold border transition ${
                tipAmount === amt
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white border-gray-200'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Leave Compliments</label>
          <div className="flex flex-wrap gap-2">
            {compliments.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full font-semibold border transition ${
                  selectedTags.includes(tag)
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold">
            Skip Tip
          </button>
          <button
            onClick={handleTipSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg"
          >
            {submitting ? 'Processing...' : `Send $${tipAmount} Tip`}
          </button>
        </div>
      </div>
    </div>
  );
}
