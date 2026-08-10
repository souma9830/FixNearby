import { useState, useEffect } from 'react';
import { Zap, AlertCircle, Info, Check, MapPin, Calculator } from 'lucide-react';
import api from '../../services/apiClient';

const DynamicPricingWidget = ({ baseRate = 45, category = 'Plumbing', onPriceCalculated }) => {
  const [distanceKm, setDistanceKm] = useState(5);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({
    baseRate: 45,
    surgeMultiplier: 1.0,
    distanceSurcharge: 0,
    platformFee: 4.5,
    totalPrice: 49.5,
    isSurgeActive: false
  });

  const calculatePrice = async () => {
    setLoading(true);
    try {
      const res = await api.post('/pricing/estimate', {
        distanceKm,
        category
      });
      if (res.data?.success && res.data.priceBreakdown) {
        setPricing(res.data.priceBreakdown);
        if (onPriceCalculated) onPriceCalculated(res.data.priceBreakdown);
      }
    } catch (err) {
      console.error('Failed to calculate pricing', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [distanceKm, category]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-400" />
          <h3 className="font-extrabold text-sm text-white">Dynamic Surge & Fee Calculator</h3>
        </div>
        {pricing.isSurgeActive && (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-black animate-pulse">
            <Zap size={12} />
            {pricing.surgeMultiplier}x Surge Active
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Travel Distance Radius ({distanceKm} km)</span>
          <span className="font-bold text-white">{distanceKm} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={distanceKm}
          onChange={(e) => setDistanceKm(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Breakdown Cards */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Base Hourly Rate</span>
          <span className="font-bold text-white">${pricing.baseRate || baseRate}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Regional Demand Multiplier</span>
          <span className="font-bold text-emerald-400">{pricing.surgeMultiplier}x</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Distance Surcharge</span>
          <span className="font-bold text-white">+${pricing.distanceSurcharge}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Platform Fee ({pricing.platformFeePct || 10}%)</span>
          <span className="font-bold text-white">+${pricing.platformFee}</span>
        </div>
        <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between font-black text-sm text-white">
          <span>Estimated Total Price</span>
          <span className="text-emerald-400">${pricing.totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricingWidget;
