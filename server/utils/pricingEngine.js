/**
 * Dynamic Surge Pricing Algorithm Engine
 * Calculates base rate, demand multiplier, distance surcharge, and platform fee
 */

export const calculateDynamicPrice = ({
  baseHourlyRate = 40,
  distanceKm = 5,
  activeWorkerCount = 10,
  pendingDemandCount = 15,
  hourOfDay = new Date().getHours(),
  isHoliday = false,
  userTier = 'free'
}) => {
  const baseRate = Number(baseHourlyRate) || 40;

  // Demand-to-supply ratio calculation
  const supplyRatio = activeWorkerCount > 0 ? pendingDemandCount / activeWorkerCount : 2.5;
  let surgeMultiplier = 1.0;

  if (supplyRatio > 2.0) surgeMultiplier = 1.5;
  else if (supplyRatio > 1.4) surgeMultiplier = 1.3;
  else if (supplyRatio > 1.1) surgeMultiplier = 1.15;

  // Time of day peak hours multiplier (8am-10am & 5pm-8pm)
  let peakMultiplier = 1.0;
  if ((hourOfDay >= 8 && hourOfDay <= 10) || (hourOfDay >= 17 && hourOfDay <= 20)) {
    peakMultiplier = 1.15;
  }

  // Holiday surcharge
  const holidayMultiplier = isHoliday ? 1.25 : 1.0;

  const combinedMultiplier = Number((surgeMultiplier * peakMultiplier * holidayMultiplier).toFixed(2));

  // Distance surcharge ($1.5 per km beyond 5km)
  const extraDistance = Math.max(0, distanceKm - 5);
  const distanceSurcharge = Number((extraDistance * 1.5).toFixed(2));

  const subtotal = (baseRate * combinedMultiplier) + distanceSurcharge;

  // Service Platform Fee (0% for Customer Plus, 10% for free tier)
  const platformFeePct = userTier === 'customer_plus' ? 0 : 0.10;
  const platformFee = Number((subtotal * platformFeePct).toFixed(2));

  const totalPrice = Number((subtotal + platformFee).toFixed(2));

  return {
    baseRate,
    surgeMultiplier: combinedMultiplier,
    distanceKm,
    distanceSurcharge,
    platformFee,
    platformFeePct: platformFeePct * 100,
    totalPrice,
    isPeakHour: peakMultiplier > 1.0,
    isSurgeActive: combinedMultiplier > 1.0
  };
};
