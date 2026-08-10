import api from "./apiClient";

/**
 * Booking API client.
 *
 * Previously the frontend had NO booking service at all — `WorkerProfile`,
 * `Bookings`, and `Dashboard` persisted bookings directly to localStorage,
 * which meant:
 *   - bookings never reached the server,
 *   - no auth/ownership was enforced (any visitor could "book"),
 *   - cancellations and reviews were purely cosmetic.
 *
 * This module is the single source of truth for talking to the
 * /api/bookings endpoints. Every function follows the normalized error
 * contract used across the service layer: on failure it throws a plain object
 * `{ message, status }` so callers can render consistent UI without handling
 * several different error shapes.
 */

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

/**
 * Create a new booking for a worker.
 * @param {{ worker: string, service: string, price: number, scheduledDate?: string, notes?: string }} payload
 */
export const createBooking = async (payload) => {
  try {
    const response = await api.post("/bookings", payload);
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to create booking");
  }
};

/**
 * Fetch the authenticated principal's bookings.
 * @param {{ status?: string }} [params] optional status filter
 */
export const getBookings = async (params = {}) => {
  try {
    const response = await api.get("/bookings", { params });
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to load bookings");
  }
};

/**
 * Fetch a single booking by id (authorized server-side to participants).
 * @param {string} id
 */
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to load booking");
  }
};

/**
 * Transition a booking's status. The server enforces the lifecycle
 * (who may move which status to which) so the client cannot bypass it.
 * @param {string} id
 * @param {("Pending"|"Confirmed"|"Completed"|"Cancelled")} status
 */
export const updateBookingStatus = async (id, status) => {
  try {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to update booking status");
  }
};

/** Convenience wrapper around updateBookingStatus for the common cancel flow. */
export const cancelBooking = (id, reason) => updateBookingStatus(id, "Cancelled")
  .then((res) => {
    if (reason && res.booking) {
      api.patch(`/bookings/${id}/cancel-reason`, { reason }).catch(() => {});
    }
    return res;
  });

/**
 * Reschedule a pending booking.
 * @param {string} id
 * @param {string} scheduledTime ISO string
 */
export const rescheduleBooking = async (id, scheduledTime) => {
  try {
    const response = await api.patch(`/bookings/${id}/reschedule`, { scheduledTime });
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to reschedule booking");
  }
};

/**
 * Fetch the status change timeline for a specific booking.
 * @param {string} bookingId
 */
export const getBookingTimeline = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/timeline`);
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to load booking timeline");
  }
};

export const checkBookingExpiry = async () => {
  try {
    const response = await api.post("/bookings/watchdog/sweep");
    return response.data;
  } catch (error) {
    throw normalizeError(error, "Failed to execute booking watchdog sweep");
  }
};

/**
 * Map an axios error to the normalized service-layer error contract.
 * @param {import('axios').AxiosError} error
 * @param {string} fallbackMessage
 */
function normalizeError(error, fallbackMessage) {
  return {
    message:
      error.response?.data?.message ||
      error.response?.data?.error ||
      fallbackMessage,
    status: error.response?.status,
  };
}

export default {
  BOOKING_STATUSES,
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getBookingTimeline,
  checkBookingExpiry,
};
