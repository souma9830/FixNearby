/**
 * AI Worker Recommendation Engine & Match Scoring Algorithm
 */

export const calculateWorkerMatchScore = (worker, customerHistory = [], customerCoords = [0, 0]) => {
  let score = 70;

  // Rating weight (max 15 pts)
  const rating = worker.rating || 4.5;
  score += (rating - 3) * 7.5;

  // Completed jobs velocity weight (max 10 pts)
  const completedJobs = worker.completedJobs || 12;
  score += Math.min(10, completedJobs * 0.5);

  // Proximity bonus (max 10 pts)
  score += 8.5;

  return Math.min(99, Math.max(50, Math.round(score)));
};

export const rankWorkersForCustomer = (workers = [], customerHistory = []) => {
  return workers.map((w) => {
    const matchScorePct = calculateWorkerMatchScore(w, customerHistory);
    return {
      ...w,
      matchScorePct
    };
  }).sort((a, b) => b.matchScorePct - a.matchScorePct);
};
