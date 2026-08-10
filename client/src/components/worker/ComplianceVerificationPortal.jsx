import React, { useState, useEffect } from 'react';
import { submitWorkerInsurance, fetchWorkerComplianceRecord } from '../../services/complianceService';

export default function ComplianceVerificationPortal({ workerId }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    insurancePolicyNumber: '',
    insuranceProvider: '',
    coverageAmountUSD: 100000,
    insuranceExpirationDate: '',
  });

  const loadRecord = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await fetchWorkerComplianceRecord(workerId);
      if (res.success) setRecord(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [workerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitWorkerInsurance({ ...formData, workerId });
      loadRecord();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Insurance & Compliance Verification</h3>
        {record && (
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            record.complianceStatus === 'Fully Compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {record.complianceStatus}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Policy Number</label>
          <input
            type="text"
            required
            value={formData.insurancePolicyNumber}
            onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Provider</label>
          <input
            type="text"
            required
            value={formData.insuranceProvider}
            onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Limit ($)</label>
          <input
            type="number"
            min="50000"
            required
            value={formData.coverageAmountUSD}
            onChange={(e) => setFormData({ ...formData, coverageAmountUSD: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
          <input
            type="date"
            required
            value={formData.insuranceExpirationDate}
            onChange={(e) => setFormData({ ...formData, insuranceExpirationDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow">
            Update Compliance Details
          </button>
        </div>
      </form>
    </div>
  );
}
