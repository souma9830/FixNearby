import { useState, useEffect } from "react";
import { ShieldCheck, QrCode, Copy, Download, CheckCircle2, AlertTriangle, Key, X, RefreshCw } from "lucide-react";
import api from "../services/apiClient";
import useToast from "../hooks/useToast";

const TwoFactorSetup = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: QR & Code Input, 2: Recovery Codes
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [qrData, setQrData] = useState({ secret: "", qrCodeUrl: "", otpauthUrl: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  useEffect(() => {
    initiateSetup();
  }, []);

  const initiateSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/2fa/setup");
      setQrData({
        secret: res.data.secret,
        qrCodeUrl: res.data.qrCodeUrl,
        otpauthUrl: res.data.otpauthUrl,
      });
    } catch (err) {
      console.error("Failed to initialize 2FA setup:", err);
      setError(err.response?.data?.message || "Failed to initialize 2FA setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const res = await api.post("/auth/2fa/verify", { token: verificationCode });
      if (res.data.success) {
        setRecoveryCodes(res.data.recoveryCodes || []);
        setStep(2);
        showToast("Two-Factor Authentication enabled successfully!", "success");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid 6-digit verification code. Check your authenticator app and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(qrData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2500);
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([`FixNearby 2FA Recovery Codes\nGenerated on: ${new Date().toLocaleString()}\n\n` + recoveryCodes.join("\n")], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "fixnearby-recovery-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <h3 className="font-bold text-lg">Two-Factor Authentication (2FA)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Scan QR Code & Enter Verification Code */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Generating secure 2FA QR Code...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Setup Error</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-slate-600 text-xs leading-relaxed">
                  Open your authenticator app (Google Authenticator, Authy, 1Password) and scan the QR Code below to pair your account.
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {qrData.qrCodeUrl && (
                    <img src={qrData.qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 rounded-xl border border-slate-200 shadow-xs mb-3" />
                  )}
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 max-w-full">
                    <Key className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono truncate font-bold text-[11px]">{qrData.secret}</span>
                    <button onClick={copySecret} className="ml-1 p-1 hover:bg-slate-100 rounded text-blue-600" title="Copy Secret">
                      {copiedSecret ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Verification Code Form */}
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter 6-Digit Authenticator Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold border border-slate-200 rounded-2xl py-3 focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifying || verificationCode.length < 6}
                      className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 text-xs transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                    >
                      {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Enable 2FA"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* Step 2: Display 10 One-Time Recovery Codes */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">2FA Enabled Successfully!</p>
                <p>Save your single-use recovery codes in a safe place. You will need them if you lose access to your authenticator app.</p>
              </div>
            </div>

            {/* Recovery Codes Grid */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs grid grid-cols-2 gap-2 text-center tracking-wider">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="bg-slate-800/80 py-1.5 px-2 rounded-lg border border-slate-700 font-semibold text-blue-300">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyRecoveryCodes}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copiedRecovery ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copiedRecovery ? "Copied!" : "Copy Codes"}
              </button>
              <button
                onClick={downloadRecoveryCodes}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="h-4 w-4 text-blue-600" />
                Download TXT
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 text-xs transition shadow-sm"
            >
              Done — Return to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
