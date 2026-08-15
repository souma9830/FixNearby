import { useState } from 'react';
import { CreditCard, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const StripeConnectPayout = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState('USD');
  const [payouts, setPayouts] = useState([]);

  const handleConnectStripe = async () => {
    try {
      const res = await api.post('/payouts/connect');
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
        showToast('Stripe Connect onboarding link opened', 'info');
      }
    } catch (err) {
      showToast('Failed to generate Stripe Connect link', 'error');
    }
  };

  const handleInstantWithdraw = async (e) => {
    e.preventDefault();
    if (amount <= 0) return showToast('Enter valid withdrawal amount', 'warning');

    setLoading(true);
    try {
      const res = await api.post('/payouts/request', { amount: Number(amount), currency });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setPayouts([res.data.payout, ...payouts]);
      }
    } catch (err) {
      showToast(err.message || 'Payout transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard size={14} />
            Stripe Connect Instant Gateway
          </div>
          <h2 className="text-2xl font-black text-white">Multi-Currency Wallet Instant Payouts</h2>
          <p className="text-xs text-slate-400 mt-1">Direct instant transfers to worker bank accounts with live multi-currency conversion</p>
        </div>

        <button
          onClick={handleConnectStripe}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <ExternalLink size={14} /> Connect Stripe Account
        </button>
      </div>

      {/* Payout Form */}
      <form onSubmit={handleInstantWithdraw} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Withdrawal Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Target Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold outline-none focus:border-emerald-500"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <DollarSign size={16} />}
          Initiate Instant Stripe Payout
        </button>
      </form>
    </div>
  );
};

export default StripeConnectPayout;
