import api from "./apiClient";

/**
 * Fetch worker schedule for a date range (logged-in worker).
 * @param {{ startDate: string, endDate: string }} params
 */
export const getWorkerSchedule = async (params) => {
  try {
    const response = await api.get("/schedule/", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load schedule",
      status: error.response?.status,
    };
  }
};

/**
 * Fetch schedule for a worker by ID (for customer booking or viewing).
 * @param {string} workerId
 * @param {{ startDate?: string, endDate?: string }} params
 */
export const getWorkerScheduleById = async (workerId, params = {}) => {
  try {
    const response = await api.get(`/schedule/worker/${workerId}`, { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load worker schedule",
      status: error.response?.status,
    };
  }
};

/**
 * Set recurring weekly availability.
 * @param {{ dayOfWeek: number, startTime: string, endTime: string }[]} slots
 */
export const setRecurringAvailability = async (slots) => {
  try {
    const response = await api.post("/schedule/set-recurring", { slots });
    return response.data;
  } catch (error) {
    try {
      const fallbackResponse = await api.post("/schedule/recurring", { slots });
      return fallbackResponse.data;
    } catch (fallbackError) {
      throw {
        message: fallbackError.response?.data?.message || error.response?.data?.message || "Failed to update availability",
        status: fallbackError.response?.status || error.response?.status,
      };
    }
  }
};

/**
 * Block a specific time slot.
 * @param {{ date: string, startDate?: string, endDate?: string, startTime: string, endTime: string, reason?: string }} data
 */
export const blockTimeSlot = async (data) => {
  try {
    const response = await api.post("/schedule/block", data);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to block time slot",
      status: error.response?.status,
    };
  }
};

/**
 * Fetch blocked slots for a date range.
 * @param {{ startDate?: string, endDate?: string }} params
 */
export const getBlockedSlots = async (params = {}) => {
  try {
    const response = await api.get("/schedule/blocked", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load blocked slots",
      status: error.response?.status,
    };
  }
};

/**
 * Remove a blocked slot by ID.
 * @param {string} id
 */
export const removeBlockedSlot = async (id) => {
  try {
    const response = await api.delete(`/schedule/block/${id}`);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to remove blocked slot",
      status: error.response?.status,
    };
  }
};

export default {
  getWorkerSchedule,
  getWorkerScheduleById,
  setRecurringAvailability,
  blockTimeSlot,
  getBlockedSlots,
  removeBlockedSlot,
};
