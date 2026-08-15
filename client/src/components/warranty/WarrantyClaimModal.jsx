import  { useState } from 'react';
import { submitWarrantyClaim } from '../../services/warrantyClaimService';

export default function WarrantyClaimModal({ bookingId, originalWorkerId, onClose, onSuccess }) {
  const [claimDescription, setClaimDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitWarrantyClaim({
        bookingId,
        originalWorkerId,
        claimDescription,
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">30-Day FixNearby Service Guarantee Claim</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold">×</button>
        </div>

        <p className="text-xs text-gray-500">
          If your completed repair or installation develops an issue within 30 days, we'll re-dispatch an expert worker free of charge.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description</label>
            <textarea
              required
              rows="4"
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              placeholder="Describe what malfunction occurred after the initial repair..."
              className="w-full rounded-lg border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white text-sm"
            ></textarea>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
            >
              {submitting ? 'Filing Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
