import { useState } from "react";
import { ShieldCheck, Key, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import api from "../services/apiClient";
import useToast from "../hooks/useToast";

const TwoFactorChallenge = ({ userId, userType, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your authentication code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/2fa/challenge", {
        userId,
        userType,
        code: code.trim(),
      });

      if (res.data.success) {
        showToast("Authentication successful!", "success");
        if (onSuccess) {
          onSuccess(res.data);
        }
      }
    } catch (err) {
      console.error("2FA Challenge error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid authentication code. Check your authenticator app or recovery code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Back to login"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-slate-600 text-xs leading-relaxed text-center">
            {useRecoveryCode
              ? "Enter one of your 8-character single-use recovery codes to gain access to your account."
              : "Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                {useRecoveryCode ? "8-Character Recovery Code" : "6-Digit Authenticator Code"}
              </label>
              <input
                type="text"
                maxLength={useRecoveryCode ? 10 : 6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={useRecoveryCode ? "XXXX-XXXX" : "000000"}
                className="w-full text-center tracking-[0.3em] font-mono text-xl font-bold border border-slate-200 rounded-2xl py-3.5 focus:ring-2 focus:ring-blue-600 uppercase"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 text-xs transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
            </button>
          </form>

          {/* Toggle between TOTP Code and Recovery Code */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setUseRecoveryCode(!useRecoveryCode);
                setCode("");
                setError(null);
              }}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Key className="h-3.5 w-3.5" />
              {useRecoveryCode ? "Use 6-Digit Authenticator Code" : "Lost access? Use Recovery Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallenge;
