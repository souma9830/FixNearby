import { create } from 'zustand';

/**
 * Global Booking State Machine & Normalized Store
 */
export const useBookingStore = create((set, get) => ({
  bookings: [],
  selectedStatus: 'all',
  page: 1,
  totalPages: 1,
  totalBookings: 0,
  loading: false,
  error: null,

  // Actions
  setBookings: (bookings, totalPages, totalBookings) => set({ bookings, totalPages, totalBookings }),
  setStatusFilter: (status) => set({ selectedStatus: status, page: 1 }), // Resets page to 1 on filter change
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Real-time socket mutation update
  updateBookingStatusInStore: (bookingId, newStatus) => set((state) => ({
    bookings: state.bookings.map((b) => b._id === bookingId ? { ...b, status: newStatus } : b)
  })),

  resetFilters: () => set({ selectedStatus: 'all', page: 1 })
}));

export default useBookingStore;
