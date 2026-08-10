import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Key, QrCode, Download, CheckCircle2, Lock, RefreshCw, Smartphone } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const MfaSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [webAuthnRegistered, setWebAuthnRegistered] = useState(false);

  const handleSetupMfa = async () => {
    setLoading(true);
    try {
      const res = await api.post('/mfa/setup');
      if (res.data?.success) {
        setSetupData(res.data);
      }
    } catch (err) {
      showToast('Failed to generate MFA secret', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    if (!verificationToken || verificationToken.length !== 6) {
      return showToast('Enter valid 6-digit TOTP code', 'warning');
    }

    setLoading(true);
    try {
      const res = await api.post('/mfa/enable', {
        token: verificationToken,
        secret: setupData?.secret
      });

      if (res.data?.success) {
        setMfaEnabled(true);
        setBackupCodes(res.data.backupCodes || []);
        setSetupData(null);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast(err.message || 'MFA verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setLoading(true);
    try {
      const res = await api.post('/mfa/disable', { token: verificationToken });
      if (res.data?.success) {
        setMfaEnabled(false);
        setBackupCodes([]);
        showToast(res.data.message, 'info');
      }
    } catch (err) {
      showToast('Failed to disable 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const content = `FixNearby 2FA Emergency Recovery Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n` + backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FixNearby_2FA_Backup_Codes_${Date.now()}.txt`;
    link.click();
    showToast('Emergency backup codes downloaded!', 'success');
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Lock size={14} />
            Two-Factor Security Portal
          </div>
          <h2 className="text-2xl font-black text-white">Multi-Factor Authentication (MFA)</h2>
          <p className="text-xs text-slate-400 mt-1">Protect your account and wallet payouts with TOTP Authenticator apps & FIDO2 hardware keys</p>
        </div>

        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold border ${
          mfaEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {mfaEnabled ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          {mfaEnabled ? '2FA Enabled & Active' : '2FA Disabled'}
        </span>
      </div>

      {/* Setup Step 1 */}
      {!mfaEnabled && !setupData && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Authenticator App (TOTP)</h3>
              <p className="text-xs text-slate-400">Use Google Authenticator, Authy, or 1Password to generate 6-digit login codes</p>
            </div>
          </div>

          <button
            onClick={handleSetupMfa}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <QrCode size={14} />}
            Setup TOTP Authenticator
          </button>
        </div>
      )}

      {/* Setup Step 2: QR Code & Verification */}
      {setupData && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-blue-500/50 space-y-6">
          <h3 className="font-bold text-white text-sm">Scan QR Code into your Authenticator App</h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center font-bold text-slate-900 text-xs">
              [QR Code Simulator]
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-300">Secret Key (Manual Entry):</p>
              <code className="font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300 text-sm font-bold block">
                {setupData.secret}
              </code>
            </div>
          </div>

          <form onSubmit={handleEnableMfa} className="space-y-3">
            <label className="block text-xs font-bold text-slate-400">Enter 6-Digit Code from App to Verify</label>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={6}
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="123456"
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold text-white tracking-widest outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                Verify & Activate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Backup Codes Display */}
      {backupCodes.length > 0 && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Key size={16} /> Emergency Recovery Backup Codes
            </h3>
            <button
              onClick={handleDownloadBackupCodes}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download (.TXT)
            </button>
          </div>

          <p className="text-xs text-slate-400">Save these one-time use recovery codes in a safe place. Each code can be used once if you lose access to your authenticator app.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center font-bold">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-amber-300">
                {code}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active State Actions */}
      {mfaEnabled && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={16} /> Account Protected with 2FA
          </h3>
          <button
            onClick={handleDisableMfa}
            disabled={loading}
            className="px-4 py-2 bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-xs font-bold rounded-xl transition"
          >
            Disable Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
  );
};

export default MfaSettings;
