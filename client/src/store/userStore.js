import { create } from 'zustand';

/**
 * Global User & Session State Store
 */
export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: 'customer',

  setUser: (user) => set({ user, isAuthenticated: !!user, role: user?.role || 'customer' }),
  clearUser: () => set({ user: null, isAuthenticated: false, role: 'customer' })
}));

export default useUserStore;
