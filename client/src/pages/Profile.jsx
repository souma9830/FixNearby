import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateNotificationPreferences, updateProfile } from "../services/authService";
import useToast from "../hooks/useToast";
import TwoFactorSetup from "../components/TwoFactorSetup";
import MfaSettings from "../components/auth/MfaSettings";
import api from "../services/apiClient";
import { ShieldCheck, ShieldAlert, Lock, Trash2, CheckCircle2 } from "lucide-react";

const Profile = () => {
  const { user, token, login } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email: user?.notificationPreferences?.email ?? true,
    sms: user?.notificationPreferences?.sms ?? true,
    push: user?.notificationPreferences?.push ?? true,
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!user?.twoFactorEnabled);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const res = await api.get("/auth/2fa/status");
      if (res.data?.success) {
        setTwoFactorEnabled(!!res.data.twoFactorEnabled);
      }
    } catch (err) {
      console.warn("Could not fetch 2FA status:", err.message);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }

    setLoading(true);

    try {
      const updatedUser = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
      
      login(updatedUser);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Save failed:", error);
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setPreferencesLoading(true);
    try {
      const updatedPreferences = await updateNotificationPreferences(preferences);
      setPreferences(updatedPreferences);
      login({ ...user, token, notificationPreferences: updatedPreferences });
      showToast('Notification preferences updated!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update notification preferences', 'error');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setDisableLoading(true);
    try {
      const res = await api.post("/auth/2fa/disable", { password: disablePassword });
      if (res.data.success) {
        setTwoFactorEnabled(false);
        setShowDisableModal(false);
        setDisablePassword("");
        showToast("Two-Factor Authentication disabled", "success");
        fetch2FAStatus();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to disable 2FA", "error");
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Settings & Security
      </h1>

      {/* Account Info Form */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Profile</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email address is locked to your account.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-xs disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* 2FA & Account Security Section */}
      <section className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-6" aria-labelledby="security-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h2 id="security-heading" className="text-xl font-semibold text-gray-900">Account Security & 2FA</h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            twoFactorEnabled
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}>
            {twoFactorEnabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Two-Factor Authentication adds an extra layer of security to your account. When enabled, logging in requires your password and a 6-digit verification code from your authenticator app.
        </p>

        {twoFactorEnabled ? (
          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
            <div>
              <p className="text-xs font-bold text-emerald-900">Your Account is Protected with 2FA</p>
              <p className="text-xs text-emerald-700 mt-0.5">TOTP authenticator codes will be required on all future logins.</p>
            </div>
            <button
              onClick={() => setShowDisableModal(true)}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition shadow-xs"
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
            <div>
              <p className="text-xs font-bold text-blue-900">Enhance Your Account Security</p>
              <p className="text-xs text-blue-700 mt-0.5">Use Google Authenticator, Authy, or Microsoft Authenticator to secure logins.</p>
            </div>
            <button
              onClick={() => setShow2FASetup(true)}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 text-xs rounded-xl transition shadow-xs"
            >
              Enable 2FA Now
            </button>
          </div>
        )}
      </section>

      {/* Notification Preferences Section */}
      <section className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6" aria-labelledby="notification-settings-heading">
        <h2 id="notification-settings-heading" className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">Choose how FixNearby may contact you regarding bookings and security alerts.</p>
        <div className="mt-5 space-y-4">
          {[
            ['email', 'Email notifications'],
            ['sms', 'SMS notifications'],
            ['push', 'Push notifications'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(event) => setPreferences((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={preferencesLoading}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white text-sm hover:bg-blue-700 disabled:opacity-50 shadow-xs"
        >
          {preferencesLoading ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </section>

      {/* MFA 2FA Enterprise Portal */}
      <section className="mt-8">
        <MfaSettings />
      </section>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <TwoFactorSetup
          onClose={() => setShow2FASetup(false)}
          onSuccess={() => {
            setTwoFactorEnabled(true);
            setShow2FASetup(false);
            fetch2FAStatus();
          }}
        />
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Disable Two-Factor Authentication?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Disabling 2FA will reduce your account security. Enter your password to confirm.
            </p>
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {disableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
