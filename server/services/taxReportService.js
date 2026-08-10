/**
 * Worker Earnings & Tax Deduction Analytics Service
 */

export const generateTaxReportData = (workerName = 'John Doe', year = 2026) => {
  const grossIncome = 14500.00;
  const platformFees = 1450.00;
  const tipsEarned = 1200.00;
  const netEarnings = grossIncome - platformFees + tipsEarned;
  const estimatedTaxDeduction = Number((netEarnings * 0.15).toFixed(2));

  const quarters = [
    { period: 'Q1 (Jan - Mar)', gross: 3200.00, net: 3040.00 },
    { period: 'Q2 (Apr - Jun)', gross: 4100.00, net: 3895.00 },
    { period: 'Q3 (Jul - Sep)', gross: 3800.00, net: 3610.00 },
    { period: 'Q4 (Oct - Dec)', gross: 3400.00, net: 3230.00 }
  ];

  return {
    workerName,
    taxYear: year,
    grossIncome,
    platformFees,
    tipsEarned,
    netEarnings,
    estimatedTaxDeduction,
    quarters
  };
};
