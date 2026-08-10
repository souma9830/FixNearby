import React, { useState, useEffect } from 'react';
import { fetchPartsForBooking, setPartsApprovalStatus } from '../../services/partsBillingService';

export default function ItemizedPartsInvoiceWidget({ bookingId, isCustomer }) {
  const [partsData, setPartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadParts = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await fetchPartsForBooking(bookingId);
      if (res.success) setPartsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, [bookingId]);

  const handleApproval = async (status) => {
    try {
      await setPartsApprovalStatus(bookingId, status);
      loadParts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="text-xs text-gray-500">Loading parts billing...</div>;
  if (!partsData || !partsData.items || partsData.items.length === 0) return null;

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:border-slate-800 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Itemized Replacement Parts & Materials</h4>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
          partsData.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {partsData.approvalStatus}
        </span>
      </div>

      <div className="divide-y text-xs dark:divide-slate-800">
        {partsData.items.map((item, idx) => (
          <div key={idx} className="py-2 flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">{item.itemName} (x{item.quantity})</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${(item.unitCostUSD * (1 + item.markupPercentage / 100) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline pt-2 border-t dark:border-slate-800">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Total Materials Cost</span>
        <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">${partsData.totalMaterialCostUSD.toFixed(2)}</span>
      </div>

      {isCustomer && partsData.approvalStatus === 'Pending Customer Approval' && (
        <div className="flex space-x-2 pt-2">
          <button onClick={() => handleApproval('Approved')} className="flex-1 py-1 bg-green-600 text-white rounded text-xs font-bold">
            Approve Parts
          </button>
          <button onClick={() => handleApproval('Rejected')} className="flex-1 py-1 bg-red-600 text-white rounded text-xs font-bold">
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
