import { useState, useEffect , useCallback} from 'react';
import {  Trophy } from 'lucide-react';
import api from '../services/apiClient';
import useToast from '../hooks/useToast';

const LoyaltyRewardsPortal = () => {
  const { showToast } = useToast();
  const [, setLoading] = useState(true);
  const [reward, setReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/rewards/profile');
      if (res.data?.success) {
        setReward(res.data.reward);
      }
    } catch (err) {
      showToast('Failed to load loyalty rewards', 'error');
    } finally {
      setLoading(false);
    }
  }, [setLoading, showToast]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleRedeemVoucher = async (title, discountPct, xpCost) => {
    setRedeeming(true);
    try {
      const res = await api.post('/rewards/redeem', { title, discountPct, xpCost });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchRewards();
      }
    } catch (err) {
      showToast(err.message || 'Voucher redemption failed', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy size={14} />
            FixNearby Customer VIP Loyalty Club
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Customer Rewards & Tier Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Earn XP points on every service booking, unlock VIP tiers, and redeem discount vouchers</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active XP Balance</span>
            <span className="text-2xl font-black text-amber-400">{reward?.totalXp || 0} XP</span>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold rounded-xl">
            {reward?.currentTier || 'Bronze'} Member
          </span>
        </div>
      </div>

      {/* Tier Progression */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">VIP Tier Progression</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { tier: 'Bronze', xp: '0 XP', perk: 'Standard Service Booking' },
            { tier: 'Silver', xp: '300 XP', perk: '5% Booking Discount' },
            { tier: 'Gold', xp: '1,000 XP', perk: '10% Off + Free Cancellation' },
            { tier: 'Platinum', xp: '2,500 XP', perk: 'Free Diagnostic Visits' }
          ].map((t) => {
            const isCurrent = reward?.currentTier === t.tier;
            return (
              <div key={t.tier} className={`p-4 rounded-2xl border ${isCurrent ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                <span className="text-xs font-black block">{t.tier} Tier</span>
                <span className="text-[11px] font-mono text-slate-500">{t.xp}</span>
                <p className="text-xs font-bold text-white mt-2">{t.perk}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeem Store */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Voucher Redemption Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: '10% Off Any Service', discountPct: 10, xpCost: 150 },
            { title: '15% Off Plumbing / HVAC', discountPct: 15, xpCost: 250 },
            { title: 'Free Priority Dispatch Pass', discountPct: 20, xpCost: 400 }
          ].map((v, idx) => (
            <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">{v.title}</span>
              <span className="text-lg font-black text-amber-400 block">{v.xpCost} XP</span>
              <button
                onClick={() => handleRedeemVoucher(v.title, v.discountPct, v.xpCost)}
                disabled={redeeming || (reward?.totalXp || 0) < v.xpCost}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl transition"
              >
                Redeem Voucher
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyRewardsPortal;
