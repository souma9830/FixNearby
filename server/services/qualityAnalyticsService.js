/**
 * Service Quality & Review Sentiment Analytics Service
 * Analyzes rating distribution, flag triggers for low score trends, and punctuality metric scores.
 */

export const calculateWorkerQualityMetrics = (reviews = []) => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      punctualityScore: 100,
      qualityScore: 100,
      riskFlag: false
    };
  }

  let totalRating = 0;
  let lowRatingCount = 0;

  reviews.forEach(r => {
    totalRating += r.rating || 0;
    if (r.rating <= 2) {
      lowRatingCount++;
    }
  });

  const avg = parseFloat((totalRating / reviews.length).toFixed(1));
  const lowRatingRatio = lowRatingCount / reviews.length;
  const riskFlag = avg < 3.5 || lowRatingRatio > 0.25;

  return {
    averageRating: avg,
    totalReviews: reviews.length,
    punctualityScore: Math.round(avg * 20),
    qualityScore: Math.round(avg * 20),
    riskFlag
  };
};
