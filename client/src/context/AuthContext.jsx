import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/apiClient';

/**
 * AuthContext
 * Provides { user, token, login, logout, isAuthenticated, authLoading } to the entire tree.
 */
const AuthContext = createContext(null);

const DEMO_USER_DEFAULT = {
  _id: "650000000000000000000001",
  name: "Demo Customer",
  email: "customer@example.com",
  role: "customer",
  token: "demo_guest_token_123"
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEMO_USER_DEFAULT;
  } catch {
    return DEMO_USER_DEFAULT;
  }
};

const normalizeFromUserProfile = (profile, token) => {
  if (!profile) return null;
  return {
    _id: profile._id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    notificationPreferences: profile.notificationPreferences,
    token,
  };
};

const normalizeFromWorkerProfile = (workerProfile, token) => {
  // server returns { success: true, worker: req.worker }
  const w = workerProfile?.worker;
  if (!w) return null;
  return {
    _id: w.id || w._id,
    name: w.name,
    email: w.email,
    phone: w.phone,
    token,
  };
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => loadFromStorage());
  const [authLoading, setAuthLoading] = useState(true);

  const login = useCallback((userData) => {
    // userData = { _id, name, email, token, phone? }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setAuthData(userData);
    setAuthLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthData(null);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      const stored = loadFromStorage();
      const token = stored?.token;

      // No token: auth is definitely not authenticated.
      if (!token) {
        if (!cancelled) {
          setAuthData(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        // 1) Validate as a regular user
        const userProfile = await api.get('/auth/profile');
        if (cancelled) return;

        const nextAuth = normalizeFromUserProfile(userProfile.data, token);
        if (!nextAuth) throw new Error('Invalid user profile shape');

        setAuthData(nextAuth);
        setAuthLoading(false);
        return;
      } catch (e) {
        const isOfflineOrNotFound = !e.response || 
          e.code === 'ERR_NETWORK' || 
          e.message === 'Network Error' || 
          [404, 502, 503, 504].includes(e.response?.status);

        if (isOfflineOrNotFound) {
          if (!cancelled && stored) {
            setAuthData(stored);
            setAuthLoading(false);
            return;
          }
        }
        // 2) Try as a worker
        try {
          const workerProfile = await api.get('/auth/worker/profile');
          if (cancelled) return;

          const nextAuth = normalizeFromWorkerProfile(workerProfile.data, token);
          if (!nextAuth) throw new Error('Invalid worker profile shape');

          setAuthData(nextAuth);
          setAuthLoading(false);
        } catch {
          // Token exists but is invalid/expired/blacklisted.
          if (!cancelled) logout();
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = {
    user: authData
      ? {
          _id: authData._id,
          name: authData.name,
          email: authData.email,
          phone: authData.phone,
          notificationPreferences: authData.notificationPreferences,
        }
      : null,
    token: authData?.token ?? null,
    // Important: do not treat localStorage token as truth until validation completes.
    isAuthenticated: !authLoading && !!authData?.token,
    authLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;
