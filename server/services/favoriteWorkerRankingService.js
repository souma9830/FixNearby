/**
 * Favorite Worker Ranking Engine Service
 */
export const rankFavoriteWorkers = (favoritesList = []) => {
  if (!Array.isArray(favoritesList)) return [];

  return [...favoritesList].sort((a, b) => {
    const ratingA = Number(a.worker?.rating) || 0;
    const ratingB = Number(b.worker?.rating) || 0;
    if (ratingB !== ratingA) return ratingB - ratingA;

    const jobsA = Number(a.worker?.completedJobsCount) || 0;
    const jobsB = Number(b.worker?.completedJobsCount) || 0;
    return jobsB - jobsA;
  });
};

export const sanitizeFavoriteWorkerPayload = (workerId) => {
  if (typeof workerId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(workerId.trim())) {
    return { valid: false, reason: 'Invalid MongoDB ObjectId for worker' };
  }
  return { valid: true, workerId: workerId.trim() };
};
