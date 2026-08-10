/**
 * Worker Payout Commission Split Calculation Service
 */
export const calculatePayoutSplit = (grossAmount, platformFeePercent = 10, taxRatePercent = 5) => {
  const numGross = Number(grossAmount);
  if (isNaN(numGross) || numGross <= 0) {
    return { valid: false, reason: 'Gross payout amount must be a positive number' };
  }

  const platformFee = Math.round((numGross * (platformFeePercent / 100)) * 100) / 100;
  const taxDeduction = Math.round((numGross * (taxRatePercent / 100)) * 100) / 100;
  const netWorkerPayout = Math.round((numGross - platformFee - taxDeduction) * 100) / 100;

  return {
    valid: true,
    grossAmount: numGross,
    platformFee,
    taxDeduction,
    netWorkerPayout,
    breakdownRatio: {
      workerShare: `${100 - platformFeePercent - taxRatePercent}%`,
      platformShare: `${platformFeePercent}%`,
      taxShare: `${taxRatePercent}%`
    }
  };
};
