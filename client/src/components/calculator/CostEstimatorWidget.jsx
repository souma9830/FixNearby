import React, { useState } from 'react';
import { Calculator, DollarSign, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import estimatorService from '../../services/estimatorService';

const CostEstimatorWidget = () => {
  const [category, setCategory] = useState('plumbing');
  const [hours, setHours] = useState(2);
  const [urgency, setUrgency] = useState('standard');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await estimatorService.calculateEstimate({ category, hours, urgency });
      setEstimate(data.estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Service Cost Estimator</h2>
          <p className="text-xs text-slate-500">Calculate instant labor & material estimates before booking.</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Service Type</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm dark:text-white"
          >
            <option value="plumbing">Plumbing & Leak Repairs</option>
            <option value="electrical">Electrical Wiring & Fixtures</option>
            <option value="carpentry">Furniture & Woodwork</option>
            <option value="cleaning">Deep Home Cleaning</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Estimated Hours Required</label>
          <input
            type="number"
            min="1"
            max="12"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Urgency Tier</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm dark:text-white"
          >
            <option value="standard">Standard Schedule</option>
            <option value="same_day">Same Day Service (+25%)</option>
            <option value="emergency">Immediate Emergency (+50%)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Calculate Quote Estimate
        </button>
      </form>

      {estimate && (
        <div className="mt-6 p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
          <span className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400">Estimated Total Cost</span>
          <h3 className="text-3xl font-black text-emerald-800 dark:text-emerald-300">${estimate.low} - ${estimate.high}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Includes base rate, hourly multiplier, and regional safety margin.</p>
        </div>
      )}
    </div>
  );
};

export default CostEstimatorWidget;
