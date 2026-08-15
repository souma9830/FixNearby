import  { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ExternalLink, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import payoutService from '../../services/payoutService';

const PayoutSettings = () => {
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payoutService.getPayoutDetails();
      setBalance(data.balance || { available: 0, pending: 0 });
      setHistory(data.payouts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payout details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setActionLoading(true);
    try {
      const { url } = await payoutService.createConnectAccount();
      window.location.href = url;
    } catch (err) {
      setError('Could not initialize Stripe Connect onboarding.');
      setActionLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (balance.available <= 0) return;
    setActionLoading(true);
    try {
      await payoutService.requestPayout(balance.available);
      await fetchPayoutData();
    } catch (err) {
      setError(err.response?.data?.message || 'Payout transfer failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Worker Payouts & Stripe Express
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your payout methods, view available earnings, and request instant bank transfers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-lg">
          <span className="text-xs uppercase tracking-wider opacity-80 font-semibold">Available for Instant Payout</span>
          <h2 className="text-4xl font-extrabold mt-2">${balance.available.toFixed(2)}</h2>
          <p className="text-xs opacity-75 mt-1">Pending: ${balance.pending.toFixed(2)}</p>

          <button
            onClick={handleRequestPayout}
            disabled={balance.available <= 0 || actionLoading}
            className="mt-6 w-full py-3 px-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <DollarSign className="w-4 h-4" /> Transfer to Bank Account
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Stripe Express Payout Verification</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Connect your bank account or debit card via Stripe Express for direct, secure automated payouts.
            </p>
          </div>

          <button
            onClick={handleConnectStripe}
            disabled={actionLoading}
            className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            Connect / Edit Stripe Account <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payout Transfer History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No previous payouts found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">${item.amount.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 block">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutSettings;
