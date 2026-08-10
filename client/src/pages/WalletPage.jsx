import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  X,
  Gift,
} from "lucide-react";
import {
  getWalletBalance,
  topupWallet,
  getWalletTransactions,
} from "../services/walletService";
import { useAuth } from "../context/AuthContext";

const PRESET_AMOUNTS = [25, 50, 100, 200];

const MOCK_FALLBACK_WALLET = {
  balance: 100,
  currency: "USD",
  status: "active",
  transactions: [
    {
      _id: "t1",
      transactionId: "TXN_W_WELCOME_101",
      type: "cashback",
      amount: 100,
      status: "completed",
      description: "Welcome Wallet Bonus Credit",
      createdAt: new Date().toISOString(),
    },
  ],
};

const statusBadge = (status) => {
  const styles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-emerald-500"
            : status === "pending"
            ? "bg-amber-500"
            : "bg-rose-500"
        }`}
      />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Completed"}
    </span>
  );
};

export const WalletPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Top Up Modal State
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("50");
  const [topupMethod, setTopupMethod] = useState("card");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWalletBalance();
      setWalletData(res);
    } catch (err) {
      console.warn("Wallet API fallback:", err.message);
      setWalletData(MOCK_FALLBACK_WALLET);
      setError("Connected to demo wallet mode");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(topupAmount);
    if (!amountNum || amountNum <= 0) {
      setTopupMsg({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    setTopupLoading(true);
    setTopupMsg(null);

    try {
      const res = await topupWallet({
        amount: amountNum,
        method: topupMethod,
        stripePaymentIntentId: `pi_topup_${Date.now()}`,
      });

      setTopupMsg({
        type: "success",
        text: res.message || `Successfully added $${amountNum.toFixed(2)} to your wallet!`,
      });
      setTimeout(() => {
        setTopupModalOpen(false);
        setTopupMsg(null);
      }, 1800);
      fetchWallet();
    } catch (err) {
      setTopupMsg({ type: "error", text: err.message || "Failed to top up wallet" });
    } finally {
      setTopupLoading(false);
    }
  };

  const filteredTransactions = (walletData?.transactions || []).filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 font-semibold text-slate-600">Loading digital wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">In-App Digital Wallet</h1>
          <p className="mt-1 text-sm text-slate-500">
            Instant 1-click checkout, instant refunds, and secure Stripe digital balance.
          </p>
        </div>
        <button
          onClick={fetchWallet}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Balance
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          {error}
        </div>
      )}

      {/* Main Digital Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-900/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  FixNearby Digital Pass
                </p>
                <p className="text-xs text-blue-300 font-semibold">{user?.name || "Verified Member"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Available Balance</p>
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                ${(walletData?.balance || 0).toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:w-auto">
            <button
              onClick={() => setTopupModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/40 hover:bg-blue-500 transition"
            >
              <PlusCircle size={18} /> Top Up Funds
            </button>
            <Link
              to="/services"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition backdrop-blur-sm"
            >
              Browse Services & Pay
            </Link>
          </div>
        </div>
      </div>

      {/* Perks Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">1-Click Checkout</p>
            <p className="text-[11px] text-slate-500">Skip entering card details on every booking</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">256-Bit Stripe Encryption</p>
            <p className="text-[11px] text-slate-500">Bank-grade security on every transaction</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Gift size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Instant Refunds</p>
            <p className="text-[11px] text-slate-500">Cancelled bookings credit back instantly</p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Wallet Transactions</h3>
            <p className="text-xs text-slate-500">Complete record of top-ups, service payments, and refunds</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[
              { id: "all", label: "All" },
              { id: "topup", label: "Top-Ups" },
              { id: "payment", label: "Payments" },
              { id: "cashback", label: "Bonus/Refunds" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterType === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Wallet className="mx-auto mb-3 opacity-30" size={36} />
            <p className="font-semibold text-slate-600">No wallet transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.type === "topup" || tx.type === "cashback" || tx.type === "refund";
                  return (
                    <tr key={tx.transactionId || tx._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
                              isPositive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          >
                            {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <span className="text-xs font-bold text-slate-800 capitalize">
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 max-w-[220px] truncate">
                        {tx.description || "Wallet Transaction"}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {tx.transactionId}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(tx.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-xs font-extrabold ${
                          isPositive ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {isPositive ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {statusBadge(tx.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TOP UP MODAL */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Top Up Wallet</h3>
                  <p className="text-xs text-slate-500">Instant credit via Stripe Digital Payments</p>
                </div>
              </div>
              <button
                onClick={() => setTopupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {topupMsg && (
              <div
                className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
                  topupMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {topupMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {topupMsg.text}
              </div>
            )}

            <form onSubmit={handleTopupSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Select or Enter Amount ($)
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(String(amt))}
                      className={`py-2 rounded-xl border text-xs font-extrabold transition ${
                        topupAmount === String(amt)
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      topupMethod === "card" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topupMethod"
                      checked={topupMethod === "card"}
                      onChange={() => setTopupMethod("card")}
                      className="text-blue-600"
                    />
                    <CreditCard size={18} className="text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                      <p className="text-[10px] text-slate-500">Stripe Card Payment</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      topupMethod === "wallet" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topupMethod"
                      checked={topupMethod === "wallet"}
                      onChange={() => setTopupMethod("wallet")}
                      className="text-blue-600"
                    />
                    <Wallet size={18} className="text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Apple Pay / Google Pay</p>
                      <p className="text-[10px] text-slate-500">Instant mobile wallet top up</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={topupLoading}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {topupLoading ? "Adding Funds..." : `Add $${Number(topupAmount || 0).toFixed(2)} to Wallet`}
                </button>
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
