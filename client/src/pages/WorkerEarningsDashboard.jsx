import { useState, useEffect } from 'react';
import {  Download, TrendingUp } from 'lucide-react';
import api from '../services/apiClient';
import useToast from '../hooks/useToast';

const WorkerEarningsDashboard = () => {
  const { showToast } = useToast();
  const [, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/earnings/analytics')
      .then((res) => {
        if (res.data?.success) setData(res.data.analytics);
      })
      .catch(() => showToast('Failed to load earnings analytics', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleDownloadTaxReport = () => {
    if (!data) return;
    const content = `FixNearby Worker Annual Tax Deduction Statement (Tax Year ${data.taxYear})\n` +
      `Worker Name: ${data.workerName}\n` +
      `Generated Date: ${new Date().toLocaleString()}\n\n` +
      `Financial Summary:\n` +
      `- Gross Booking Earnings: $${data.grossIncome}\n` +
      `- Customer Tips Earned: $${data.tipsEarned}\n` +
      `- Platform Fees Paid: -$${data.platformFees}\n` +
      `- Net Taxable Revenue: $${data.netEarnings}\n` +
      `- Estimated 15% Tax Deduction Reserve: $${data.estimatedTaxDeduction}\n\n` +
      `Quarterly Income Breakdown:\n` +
      data.quarters.map(q => `${q.period}: Gross $${q.gross} | Net $${q.net}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FixNearby_Tax_Statement_${data.taxYear}.txt`;
    link.click();
    showToast('Tax Deduction Report downloaded successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp size={14} />
            Worker Financial Intelligence Hub
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Earnings Analytics & Tax Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time revenue breakdowns, customer tips, platform commission fees, and 1-click tax statement exports</p>
        </div>

        <button
          onClick={handleDownloadTaxReport}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Download size={14} /> Export 1099 Tax Statement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gross Income</span>
          <h3 className="text-3xl font-black text-white mt-1">${data?.grossIncome || '0.00'}</h3>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tips Earned</span>
          <h3 className="text-3xl font-black text-amber-400 mt-1">${data?.tipsEarned || '0.00'}</h3>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Net Taxable Revenue</span>
          <h3 className="text-3xl font-black text-emerald-400 mt-1">${data?.netEarnings || '0.00'}</h3>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Estimated Tax Reserve</span>
          <h3 className="text-3xl font-black text-purple-400 mt-1">${data?.estimatedTaxDeduction || '0.00'}</h3>
        </div>
      </div>

      {/* Quarterly Breakdown */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quarterly Earnings Breakdown</h3>
        <div className="space-y-3">
          {data?.quarters?.map((q, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-white">{q.period}</span>
              <div className="flex gap-6">
                <span className="text-slate-400 font-mono">Gross: ${q.gross}</span>
                <span className="text-emerald-400 font-bold font-mono">Net: ${q.net}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerEarningsDashboard;
