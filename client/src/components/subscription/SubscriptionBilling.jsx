import { useState, useEffect , useCallback} from 'react';
import { CreditCard, Check } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const SubscriptionBilling = () => {
  const { showToast } = useToast();
  const [, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [upgrading, setUpgrading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscriptions/active');
      if (res.data?.success) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      console.error('Failed to load subscription', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleUpgrade = async (planTier) => {
    setUpgrading(true);
    try {
      const res = await api.post('/subscriptions/upgrade', {
        planTier,
        billingCycle
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchSubscription();
      }
    } catch (err) {
      showToast(err.message || 'Upgrade failed', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard size={14} />
            Enterprise Membership & Billing
          </div>
          <h2 className="text-2xl font-black text-white">Multi-Tier Subscription Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Unlock 0% booking service fees, priority technician dispatch, and reduced provider commission rates</p>
        </div>

        {/* Toggle Annual/Monthly */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg transition ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1.5 rounded-lg transition ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className={`bg-slate-950 p-6 rounded-2xl border space-y-4 ${subscription?.planTier === 'free' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800'}`}>
          <h3 className="font-bold text-white text-base">Standard Member</h3>
          <p className="text-2xl font-black text-white">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Standard booking dispatch</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 10% platform service fee</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Standard support queue</li>
          </ul>
          {subscription?.planTier === 'free' ? (
            <span className="block text-center py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl">Current Active Tier</span>
          ) : (
            <button onClick={() => handleUpgrade('free')} className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700">Downgrade to Free</button>
          )}
        </div>

        {/* Customer Plus Plan */}
        <div className={`bg-slate-950 p-6 rounded-2xl border space-y-4 ${subscription?.planTier === 'customer_plus' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">FixNearby Plus</h3>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Popular</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">${billingCycle === 'annual' ? '99' : '12'} <span className="text-xs text-slate-400 font-normal">/ {billingCycle}</span></p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> <strong>0% Booking Service Fees</strong></li>
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Priority Instant Dispatch</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 2x Wallet Cashback Rewards</li>
          </ul>
          {subscription?.planTier === 'customer_plus' ? (
            <span className="block text-center py-2 bg-emerald-600/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30">Active Plus Membership</span>
          ) : (
            <button onClick={() => handleUpgrade('customer_plus')} disabled={upgrading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md">Upgrade to Plus</button>
          )}
        </div>

        {/* Worker Pro Plan */}
        <div className={`bg-slate-950 p-6 rounded-2xl border space-y-4 ${subscription?.planTier === 'worker_pro' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Worker Pro Skilled</h3>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">Pro Worker</span>
          </div>
          <p className="text-2xl font-black text-purple-400">${billingCycle === 'annual' ? '249' : '29'} <span className="text-xs text-slate-400 font-normal">/ {billingCycle}</span></p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> <strong>Reduced 5% Commission Rate</strong></li>
            <li className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> Verified Gold Provider Badge</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> Top Search Listing Placement</li>
          </ul>
          {subscription?.planTier === 'worker_pro' ? (
            <span className="block text-center py-2 bg-purple-600/20 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30">Active Pro Worker</span>
          ) : (
            <button onClick={() => handleUpgrade('worker_pro')} disabled={upgrading} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md">Upgrade to Pro</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBilling;
