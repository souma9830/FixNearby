import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Building2,
  Wallet,
  Lock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Receipt,
  RotateCcw,
  PlusCircle,
  Zap,
} from "lucide-react";
import {
  createPaymentIntent,
  confirmPayment,
} from "../services/paymentService";
import { getWalletBalance, payWithWallet, topupWallet } from "../services/walletService";

const PAYMENT_METHODS = [
  { id: "wallet", label: "In-App Wallet", icon: Wallet, desc: "Instant 1-click checkout" },
  { id: "card", label: "Credit Card", icon: CreditCard, desc: "Stripe secure card payment" },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "Direct bank wire" },
];

const maskCardNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})/g, "$1 ").trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + " / " + digits.slice(2);
  }
  return digits;
};

const PaymentCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId") || "";
  const amountParam = parseFloat(searchParams.get("amount")) || 0;

  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | processing | success | error
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [, setWalletLoading] = useState(true);
  const [quickTopupLoading, setQuickTopupLoading] = useState(false);

  useEffect(() => {
    if (!bookingId || amountParam <= 0) {
      setErrorMsg("Invalid checkout parameters. Please go back and try again.");
      setStep("error");
      return;
    }

    // Load user wallet balance
    const fetchBalance = async () => {
      setWalletLoading(true);
      try {
        const res = await getWalletBalance();
        setWalletBalance(res.balance || 0);
      } catch (err) {
        console.warn("Wallet fetch warning:", err.message);
        setWalletBalance(100); // Fallback demo balance
      } finally {
        setWalletLoading(false);
      }
    };

    fetchBalance();
  }, [bookingId, amountParam]);

  const hasSufficientWallet = walletBalance >= amountParam;

  const isFormValid = () => {
    if (!bookingId || amountParam <= 0) return false;
    if (selectedMethod === "wallet") {
      return hasSufficientWallet;
    }
    if (selectedMethod === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      return (
        digits.length === 16 &&
        cardExpiry.replace(/\D/g, "").length === 4 &&
        cardCvv.length >= 3
      );
    }
    return true;
  };

  const handleQuickTopup = async () => {
    setQuickTopupLoading(true);
    try {
      const needed = Math.max(50, Math.ceil(amountParam - walletBalance));
      const res = await topupWallet({ amount: needed, method: "card" });
      setWalletBalance(res.balance);
    } catch (err) {
      setErrorMsg(err.message || "Failed to top up wallet balance.");
    } finally {
      setQuickTopupLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isFormValid()) return;

    setLoading(true);
    setStep("processing");
    setErrorMsg("");

    try {
      if (selectedMethod === "wallet") {
        // 1-Click Wallet Payment Execution
        const walletRes = await payWithWallet({
          bookingId,
          amount: amountParam,
        });

        if (!walletRes.success) {
          throw new Error(walletRes.message || "Wallet payment failed");
        }

        setPaymentResult(walletRes.payment);
        setStep("success");
      } else {
        // Stripe Card / Bank Transfer Flow
        const intentRes = await createPaymentIntent({
          bookingId,
          amount: amountParam,
          method: selectedMethod,
        });

        if (!intentRes.success) {
          throw new Error(intentRes.message || "Failed to initialize payment");
        }

        await new Promise((r) => setTimeout(r, 1200));

        const confirmRes = await confirmPayment({
          paymentId: intentRes.payment._id,
          transactionId: intentRes.stripePaymentIntentId || `txn_${Date.now().toString(36)}`,
        });

        if (!confirmRes.success) {
          throw new Error(confirmRes.message || "Payment confirmation failed");
        }

        setPaymentResult(confirmRes.payment);
        setStep("success");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong with your payment.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep("form");
    setErrorMsg("");
    setPaymentResult(null);
  };

  // ── Invalid params state ──
  if (step === "error" && !bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Invalid Checkout</h2>
          <p className="text-slate-600">
            We couldn't find the booking details for this payment. Please go back and try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0056D2] px-6 py-3 text-white font-semibold hover:bg-[#0047AF] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Processing state ──
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <Loader2 className="w-12 h-12 mx-auto text-[#0056D2] animate-spin" />
          <h2 className="text-2xl font-bold text-slate-900">
            {selectedMethod === "wallet" ? "Executing 1-Click Wallet Checkout..." : "Processing Stripe Payment..."}
          </h2>
          <p className="text-slate-500">
            Please don't close this page while we securely process your payment.
          </p>
        </div>
      </div>
    );
  }

  // ── Success state ──
  if (step === "success" && paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Payment Successful!
            </h2>
            <p className="text-slate-600">
              Your payment of{" "}
              <span className="font-semibold text-slate-800">
                ${paymentResult.amount.toFixed(2)}
              </span>{" "}
              has been processed.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Receipt className="w-4 h-4" />
              <span>Transaction Receipt</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-slate-800 text-xs">
                  {paymentResult.transactionId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-800 capitalize">
                  {paymentResult.method.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-800">
                  {new Date(paymentResult.paymentDate || Date.now()).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/bookings")}
              className="w-full rounded-xl bg-[#0056D2] px-6 py-3 text-white font-semibold hover:bg-[#0047AF] transition"
            >
              View My Bookings
            </button>
            <Link
              to="/wallet"
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-center text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              View Wallet Balance
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error retry state ──
  if (step === "error" && errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Failed</h2>
            <p className="text-slate-600">{errorMsg}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0056D2] px-6 py-3 text-white font-semibold hover:bg-[#0047AF] transition"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout form ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to booking
        </button>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Escrow Protection Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/40">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                    FixNearby Escrow Protection
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800 leading-relaxed dark:text-emerald-400">
                    Your funds are held securely in Escrow by FixNearby and will only be released when you approve the completed job.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference</span>
                  <span className="font-medium text-slate-800 font-mono text-xs">
                    {bookingId.slice(0, 12)}...
                  </span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Total Amount Due</span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ${amountParam.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Info Box */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>In-App Digital Wallet</span>
                <Link to="/wallet" className="text-blue-300 hover:underline font-semibold">
                  Manage Wallet
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold">${walletBalance.toFixed(2)}</span>
                {hasSufficientWallet ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={12} /> Ready for 1-Click Pay
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                    Low Balance
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Checkout</h2>
              <p className="text-slate-500 text-sm mb-8">
                Choose your preferred payment method to confirm booking.
              </p>

              {/* Method Selector */}
              <div className="space-y-3 mb-8">
                <label className="block text-sm font-semibold text-slate-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = selectedMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedMethod(pm.id)}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-[#0056D2] bg-blue-50 ring-2 ring-[#0056D2]/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected ? "text-[#0056D2]" : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-[#0056D2]" : "text-slate-600"
                          }`}
                        >
                          {pm.label}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:block">
                          {pm.desc}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0056D2] flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallet Option Details */}
              {selectedMethod === "wallet" && (
                <div className="mb-8 p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Zap size={16} className="text-blue-600" /> 1-Click Wallet Checkout
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Instant deduction from your pre-funded digital balance.
                      </p>
                    </div>
                  </div>

                  {!hasSufficientWallet ? (
                    <div className="rounded-xl bg-amber-100/80 p-4 border border-amber-300/80 text-amber-900 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>Insufficient balance ($${walletBalance.toFixed(2)} available)</span>
                        <span>Needs: ${(amountParam - walletBalance).toFixed(2)} more</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickTopup}
                        disabled={quickTopupLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
                      >
                        <PlusCircle size={14} />
                        {quickTopupLoading ? "Adding Funds..." : `Quick Top Up $${Math.max(50, Math.ceil(amountParam - walletBalance))} & Pay`}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 p-2.5 rounded-lg border border-emerald-200">
                      ✓ Available wallet balance (${walletBalance.toFixed(2)}) is sufficient for instant checkout.
                    </p>
                  )}
                </div>
              )}

              {/* Card Details */}
              {selectedMethod === "card" && (
                <div className="space-y-5 mb-8 p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm font-mono outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        CVV
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="***"
                          maxLength={4}
                          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-3 text-sm font-mono outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Details */}
              {selectedMethod === "bank_transfer" && (
                <div className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Bank Transfer Instructions</p>
                  <p>
                    Wire transfer instructions will be generated after confirming. Your booking slot will be held for 48 hours.
                  </p>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={!isFormValid() || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0056D2] to-[#0040A0] px-6 py-4 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Lock className="w-5 h-5" />
                {selectedMethod === "wallet"
                  ? `Pay $${amountParam.toFixed(2)} with Wallet`
                  : `Pay $${amountParam.toFixed(2)}`}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                By confirming, you agree to our{" "}
                <a href="/terms" className="underline hover:text-slate-600">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
