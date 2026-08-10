/**
 * Surge Pricing & Dynamic Price Estimation Engine
 * Calculates dynamic service estimates based on base rate, peak hours, worker supply density, and distance.
 */

export const calculateSurgeEstimate = (basePrice, options = {}) => {
  const { hourOfDay = new Date().getHours(), distanceKm = 0, isEmergency = false, workerSupplyCount = 5 } = options;

  let multiplier = 1.0;

  // Peak hours surge (e.g. 8 AM - 10 AM, 5 PM - 8 PM)
  if ((hourOfDay >= 8 && hourOfDay <= 10) || (hourOfDay >= 17 && hourOfDay <= 20)) {
    multiplier += 0.25;
  }

  // Low worker density surge
  if (workerSupplyCount < 3) {
    multiplier += 0.3;
  } else if (workerSupplyCount > 10) {
    multiplier -= 0.1;
  }

  // Emergency service priority
  if (isEmergency) {
    multiplier += 0.5;
  }

  // Distance surcharge (₹15 / km beyond 5km)
  const distanceFee = distanceKm > 5 ? Math.round((distanceKm - 5) * 15) : 0;
  const surgeAmount = Math.round(basePrice * (multiplier - 1));
  const finalPrice = Math.max(0, basePrice + surgeAmount + distanceFee);

  return {
    basePrice,
    surgeMultiplier: parseFloat(multiplier.toFixed(2)),
    surgeAmount,
    distanceFee,
    finalPrice
  };
};
