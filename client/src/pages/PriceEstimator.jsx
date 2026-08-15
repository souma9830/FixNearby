import  { useState } from 'react';
import { Calculator } from 'lucide-react';
import { getDynamicPricingEstimate } from '../services/estimateService';

const PriceEstimator = () => {
  const [category, setCategory] = useState('Plumbing');
  const [complexity, setComplexity] = useState('medium');
  const [urgency, setUrgency] = useState('standard');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getDynamicPricingEstimate({
        category,
        complexity,
        urgency,
        estimatedHours
      });
      setEstimate(data.matrixEstimate);
    } catch (err) {
      console.error('Calculation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Calculator className="w-8 h-8" /> Service Cost Estimator
        </h1>
        <p className="text-sm opacity-90 mt-1">Get an instant upfront cost breakdown based on job parameters.</p>
      </div>

      <form onSubmit={handleCalculate} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Service Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="House Cleaning">House Cleaning</option>
            <option value="General Handyman">General Handyman</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Complexity</label>
            <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
              <option value="low">Low (Minor Fix)</option>
              <option value="medium">Medium (Standard Repair)</option>
              <option value="high">High (Major Installation)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Urgency</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
              <option value="standard">Standard</option>
              <option value="same_day">Same Day (+25%)</option>
              <option value="emergency">Emergency (+50%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Estimated Hours</label>
            <input type="number" min="1" max="12" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
          {loading ? 'Calculating...' : 'Calculate Estimate'}
        </button>
      </form>

      {estimate && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Estimated Total: ${estimate.totalEstimate}</h2>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>• Base Service Dispatch Fee: ${estimate.baseRate}</p>
            <p>• Estimated Materials & Equipment: ${estimate.materialsCost}</p>
            <p>• Complexity Tier Multiplier: x{estimate.complexityMultiplier}</p>
            <p>• Urgency Multiplier: x{estimate.urgencyMultiplier}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceEstimator;
