import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import WorkerCard from "./WorkerCard";
import SkeletonCard from "./SkeletonCard";

const RecommendedWorkers = ({ userId }) => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get user location
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;

          const res = await axios.get(
            `/api/recommendations/${userId}?lat=${lat}&lng=${lng}&limit=6`
          );
          setWorkers(res.data.data);
          setLoading(false);
        },
        async () => {
          // Fallback without location
          const res = await axios.get(
            `/api/recommendations/${userId}?limit=6`
          );
          setWorkers(res.data.data);
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to load recommendations.");
        setLoading(false);
      }
    };

    if (userId) fetchRecommendations();
  }, [userId]);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">
        🌟 {t("home.recommendations.title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          : workers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                showScore={true}
              />
            ))}
      </div>
    </div>
  );
};

export default RecommendedWorkers;