import api from "./apiClient";

export const workerSignup = async (data) => {
  try {
    const res = await api.post("/workers/register", data);
    return res.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "Registration failed",
      status: error.response?.status,
    };
  }
};

export const workerLogin = async (data) => {
  try {
    const res = await api.post("/workers/login", data);

    return res.data;

  } catch (error) {

    console.error(
      error.response?.data?.message || error
    );

    throw {
      message:
        error.response?.data?.message ||
        "Login failed",

      status: error.response?.status,
    };
  }
};

export const fetchWorkers = async () => {
  try {
    const res = await api.get("/workers");
    const workersArray = res.data?.workers || res.data || [];
    return workersArray.map(worker => ({
      ...worker,
      id: worker._id || worker.id,
      profession: worker.category || worker.profession,
      price: worker.price ? (worker.price.toString().startsWith('$') ? worker.price : `$${worker.price}/hr`) : "$30/hr",
      availability: worker.availability || 
        (worker.availabilityStatus === "available" ? "Available today" : 
         worker.availabilityStatus === "busy" ? "Busy" : 
         worker.availabilityStatus === "offline" ? "Offline" : "Available today"),
      responseTime: worker.responseTime || "Replies in 15 min",
      outcomeText: worker.outcomeText || `Review past work and request a ${worker.category?.toLowerCase() || 'service'} visit.`,
      mockOffset: worker.mockOffset || { lat: (Math.random() - 0.5) * 0.05, lon: (Math.random() - 0.5) * 0.05 },
      verified: worker.verified ?? true,
      experience: worker.experience ? (worker.experience.toString().toLowerCase().includes("year") ? worker.experience : `${worker.experience} Years`) : "3 Years",
      rating: worker.rating || 4.5,
      completedJobs: worker.completedJobs || 12,
    }));
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "Failed to fetch workers",
      status: error.response?.status,
    };
  }
};
