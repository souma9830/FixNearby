/**
 * Price Estimate Matrix Service
 */
export const calculateServicePriceEstimate = (baseRatePerHour, durationHours, urgencyMultiplier = 1.0, distanceKm = 0) => {
  const rate = Number(baseRatePerHour) || 40;
  const hours = Math.max(0.5, Number(durationHours) || 1);
  const urgency = Math.max(1.0, Number(urgencyMultiplier) || 1.0);
  const dist = Math.max(0, Number(distanceKm) || 0);

  const baseLabor = rate * hours;
  const travelFee = dist > 5 ? (dist - 5) * 1.5 : 0;
  const subtotal = (baseLabor + travelFee) * urgency;
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const totalEstimate = Math.round((subtotal + serviceFee) * 100) / 100;

  return {
    valid: true,
    baseLabor: Math.round(baseLabor * 100) / 100,
    travelFee: Math.round(travelFee * 100) / 100,
    urgencyMultiplier: urgency,
    serviceFee,
    totalEstimate
  };
};

export const sanitizeEstimateInput = (data) => {
  if (!data || typeof data !== 'object') return {};
  return {
    notes: typeof data.notes === 'string' ? data.notes.replace(/[<>{}]/g, '').trim() : ''
  };
};
