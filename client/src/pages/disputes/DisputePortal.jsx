import React, { useState, useEffect } from 'react';
import disputeService from '../../services/disputeService';
import DisputeEscalationCard from '../../components/DisputeEscalationCard';


const DisputePortal = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bookingId: '', againstUser: '', reason: 'INCOMPLETE_WORK', claimAmount: 0, evidenceUrls: '' });

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await disputeService.getUserDisputes();
      setDisputes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await disputeService.createDispute({
        ...form,
        evidenceUrls: form.evidenceUrls ? form.evidenceUrls.split(',') : []
      });
      fetchDisputes();
      setForm({ bookingId: '', againstUser: '', reason: 'INCOMPLETE_WORK', claimAmount: 0, evidenceUrls: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting dispute');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dispute Resolution & Mediation Portal</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">File a Service Dispute</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Booking ID"
            value={form.bookingId}
            onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Against User ID"
            value={form.againstUser}
            onChange={(e) => setForm({ ...form, againstUser: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="INCOMPLETE_WORK">Incomplete Work</option>
            <option value="PROPERTY_DAMAGE">Property Damage</option>
            <option value="UNPROFESSIONAL_BEHAVIOR">Unprofessional Behavior</option>
            <option value="OVERCHARGED">Overcharged</option>
            <option value="NON_PAYMENT">Non Payment</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="number"
            placeholder="Claim Amount ($)"
            value={form.claimAmount}
            onChange={(e) => setForm({ ...form, claimAmount: Number(e.target.value) })}
            className="border p-2 rounded"
          />
        </div>
        <textarea
          placeholder="Evidence URLs (comma separated)"
          value={form.evidenceUrls}
          onChange={(e) => setForm({ ...form, evidenceUrls: e.target.value })}
          className="border p-2 rounded w-full mt-4"
          rows={3}
        />
        <button type="submit" className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Submit Claim
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dispute History</h2>
        {loading ? (
          <p>Loading claims...</p>
        ) : disputes.length === 0 ? (
          <p>No active disputes found.</p>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div key={d._id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Claim #{d._id.slice(-6)}</span>
                  <span className={`px-2 py-1 text-sm rounded ${d.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Reason: {d.reason} | Amount: ${d.claimAmount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputePortal;
