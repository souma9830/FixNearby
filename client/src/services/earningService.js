import api from "./apiClient";

/**
 * Fetch the authenticated worker's earnings summary & analytics stats.
 */
export const getEarningsSummary = async () => {
  try {
    const response = await api.get("/earnings/summary");
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load earnings summary",
      status: error.response?.status,
    };
  }
};

export const getEarningsDashboard = getEarningsSummary;

/**
 * Fetch paginated earnings history.
 * @param {{ page?: number, limit?: number, status?: string, type?: string }} params
 */
export const getEarningsHistory = async (params = {}) => {
  try {
    const response = await api.get("/earnings/history", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load earnings history",
      status: error.response?.status,
    };
  }
};

/**
 * Request a payout.
 * @param {number|object} payload - Amount or { amount, payoutMethodType, payoutMethodDetails }
 */
export const requestPayout = async (payload) => {
  try {
    const body = typeof payload === "number" ? { amount: payload } : payload;
    const response = await api.post("/earnings/request-payout", body);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to request payout",
      status: error.response?.status,
    };
  }
};

/**
 * Get saved worker payout methods
 */
export const getPayoutMethods = async () => {
  try {
    const response = await api.get("/earnings/payout-methods");
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to fetch payout methods",
      status: error.response?.status,
    };
  }
};

/**
 * Add a payout method (Bank account, UPI, Stripe Connect)
 * @param {{ type: string, isDefault?: boolean, details?: object }} data
 */
export const addPayoutMethod = async (data) => {
  try {
    const response = await api.post("/earnings/payout-methods", data);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to add payout method",
      status: error.response?.status,
    };
  }
};

/**
 * Delete a payout method
 * @param {string} id
 */
export const deletePayoutMethod = async (id) => {
  try {
    const response = await api.delete(`/earnings/payout-methods/${id}`);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to delete payout method",
      status: error.response?.status,
    };
  }
};

/**
 * Download CSV report
 */
export const downloadEarningsCSV = async () => {
  try {
    const response = await api.get("/earnings/export-csv", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `earnings_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to download CSV report",
      status: error.response?.status,
    };
  }
};

export default {
  getEarningsSummary,
  getEarningsDashboard,
  getEarningsHistory,
  requestPayout,
  getPayoutMethods,
  addPayoutMethod,
  deletePayoutMethod,
  downloadEarningsCSV,
};
