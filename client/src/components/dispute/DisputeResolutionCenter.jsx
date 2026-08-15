import  { useState, useEffect , useCallback} from 'react';
import { fileDisputeEscalation, fetchDisputesForBooking } from '../../services/disputeEscalationService';

export default function DisputeResolutionCenter({ bookingId, respondentId }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disputeReason: 'Incomplete Work',
    claimAmountRequested: 50,
    detailedStatement: '',
  });

  const reasons = ['Incomplete Work', 'Property Damage', 'Unsatisfactory Quality', 'Billing Discrepancy', 'No Show', 'Safety Violation'];

  const loadDisputes = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await fetchDisputesForBooking(bookingId);
      if (res.success) setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [bookingId, setLoading]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fileDisputeEscalation({
        ...formData,
        bookingId,
        respondentId,
      });
      setFormData({
        disputeReason: 'Incomplete Work',
        claimAmountRequested: 50,
        detailedStatement: '',
      });
      loadDisputes();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-red-100 dark:border-red-900 space-y-6">
      <div className="flex items-center space-x-3 border-b pb-4 dark:border-gray-700">
        <div className="p-2 bg-red-100 dark:bg-red-900 text-red-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Service Dispute & Resolution Portal</h3>
          <p className="text-xs text-gray-500">File a claim under FixNearby Service Guarantee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dispute Reason</label>
          <select
            value={formData.disputeReason}
            onChange={(e) => setFormData({ ...formData, disputeReason: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          >
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Claim Amount ($)</label>
          <input
            type="number"
            min="0"
            required
            value={formData.claimAmountRequested}
            onChange={(e) => setFormData({ ...formData, claimAmountRequested: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Incident Statement</label>
          <textarea
            required
            rows="3"
            value={formData.detailedStatement}
            onChange={(e) => setFormData({ ...formData, detailedStatement: e.target.value })}
            placeholder="Describe what occurred, unfulfilled service expectations, or damages..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition"
        >
          Escalate Dispute to Arbitration
        </button>
      </form>

      <div className="mt-6 border-t pt-4 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Active & Prior Disputes</h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading dispute status...</p>
        ) : disputes.length === 0 ? (
          <p className="text-sm text-gray-500">No disputes filed for this booking.</p>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <div key={d._id} className="p-3 border rounded-md dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{d.disputeReason}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">{d.escalationStatus}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{d.detailedStatement}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
