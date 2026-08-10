import api from "./apiClient";

/**
 * Fetch the authenticated user's wallet balance and transactions
 */
export const getWalletBalance = async () => {
  try {
    const response = await api.get("/wallet/balance");
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load wallet balance",
      status: error.response?.status,
    };
  }
};

/**
 * Top up wallet balance
 * @param {{ amount: number, method?: string, stripePaymentIntentId?: string }} payload
 */
export const topupWallet = async (payload) => {
  try {
    const body = typeof payload === "number" ? { amount: payload } : payload;
    const response = await api.post("/wallet/topup", body);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to top up wallet",
      status: error.response?.status,
    };
  }
};

/**
 * Pay for booking using Wallet balance (1-click checkout)
 * @param {{ bookingId: string, amount: number }} payload
 */
export const payWithWallet = async (payload) => {
  try {
    const response = await api.post("/wallet/pay", payload);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Wallet payment failed",
      status: error.response?.status,
    };
  }
};

/**
 * Fetch wallet transactions history
 * @param {{ type?: string }} params
 */
export const getWalletTransactions = async (params = {}) => {
  try {
    const response = await api.get("/wallet/transactions", { params });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to load wallet transactions",
      status: error.response?.status,
    };
  }
};

export default {
  getWalletBalance,
  topupWallet,
  payWithWallet,
  getWalletTransactions,
};
