import React, { useState, useEffect } from 'react';
import { Award, Gift, Sparkles, Ticket, CheckCircle, RefreshCw, Copy } from 'lucide-react';
import rewardsService from '../../services/rewardsService';

const RewardsHub = () => {
  const [pointsData, setPointsData] = useState({ balance: 0, tier: 'Bronze', history: [], activeCoupons: [] });
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const data = await rewardsService.getUserRewards();
      setPointsData(data);
      setCoupons(data.availableCoupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (couponId) => {
    setRedeeming(true);
    setMsg('');
    try {
      const res = await rewardsService.redeemCoupon(couponId);
      setMsg(`Success! Generated Coupon Code: ${res.code}`);
      fetchRewards();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center py-16">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white rounded-3xl p-8 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold opacity-90">Loyalty Tier: {pointsData.tier}</span>
          <h1 className="text-4xl font-black mt-2">{pointsData.balance} PTS</h1>
          <p className="text-xs opacity-90 mt-1">Earn 10 points for every completed service booking!</p>
        </div>
        <Award className="w-20 h-20 opacity-30" />
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {msg}
        </div>
      )}

      {pointsData.activeCoupons && pointsData.activeCoupons.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-500" /> Your Active Claimed Coupons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pointsData.activeCoupons.map((coupon, idx) => (
              <div key={idx} className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{coupon.code}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{coupon.title}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    setMsg(`Copied code ${coupon.code} to clipboard!`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" /> Redeem Discount Coupons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon._id || coupon.code} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
              <div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                  {coupon.discount}% OFF
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white mt-2">{coupon.title}</h3>
                <p className="text-xs text-slate-400">{coupon.pointsCost} Points Required</p>
              </div>
              <button
                onClick={() => handleRedeem(coupon._id)}
                disabled={pointsData.balance < coupon.pointsCost || redeeming}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition"
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsHub;
