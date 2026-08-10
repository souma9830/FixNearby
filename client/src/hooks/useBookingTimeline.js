import { useState, useEffect, useCallback } from "react";
import { getBookingTimeline } from "../services/bookingService";

const useBookingTimeline = (bookingId) => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBookingTimeline(bookingId);
      if (data.success) {
        setSteps(data.steps || []);
      } else {
        setError(data.message || "Failed to load timeline");
      }
    } catch (err) {
      const msg =
        err.message || err.response?.data?.message || "Failed to load timeline";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    steps,
    loading,
    error,
    refresh: fetchTimeline,
  };
};

export default useBookingTimeline;
