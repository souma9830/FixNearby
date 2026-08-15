import { useState } from 'react';
import { Lock, Key, X } from 'lucide-react';
import api from '../../services/apiClient';
import useToast from '../../hooks/useToast';

const MfaVerifyModal = ({ isOpen, onClose, onVerified }) => {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return showToast('Enter code', 'warning');

    setVerifying(true);
    try {
      const res = await api.post('/mfa/verify-challenge', {
        code,
        isBackupCode: useBackup
      });

      if (res.data?.success) {
        showToast('MFA Verification passed!', 'success');
        if (onVerified) onVerified();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'MFA verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl w-full max-w-md relative space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Security 2FA Challenge</h3>
            <p className="text-xs text-slate-400">Enter code from Authenticator App to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              {useBackup ? '8-Character Emergency Backup Code' : '6-Digit Authenticator Code'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={useBackup ? 'A1B2C3D4' : '123456'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-center text-lg font-bold text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => { setUseBackup(!useBackup); setCode(''); }}
              className="text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <Key size={12} /> {useBackup ? 'Use Authenticator App Code' : 'Use Emergency Backup Code'}
            </button>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md"
          >
            Verify & Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

export default MfaVerifyModal;
