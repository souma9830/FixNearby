/**
 * AI Vision Damage Assessment Service
 * Analyzes uploaded damage images and computes severity score, BOM hardware parts, and estimated repair cost
 */

export const analyzeDamageImage = async (imageUrl = '') => {
  // Simulate AI Computer Vision Damage Analysis
  const categories = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  let severityScore = 6;
  let issues = [];
  let bom = [];
  let laborHours = 2.5;

  if (category === 'Plumbing') {
    severityScore = 7;
    issues = [
      { name: 'Pipe Joint Micro-Crack', confidencePct: 96, description: 'High-pressure PVC pipe hairline crack causing moisture leak' },
      { name: 'Corroded Brass Fitting', confidencePct: 91, description: 'Oxidized brass valve joint needing replacement' }
    ];
    bom = [
      { item: '3/4 inch PVC Ball Valve', estimatedPrice: 18.50 },
      { item: 'Teflon Sealing Tape', estimatedPrice: 4.00 },
      { item: 'PVC Cement & Primer Kit', estimatedPrice: 12.00 }
    ];
    laborHours = 2.0;
  } else if (category === 'Electrical') {
    severityScore = 8;
    issues = [
      { name: 'Overheated Circuit Breaker Terminal', confidencePct: 94, description: 'Thermal discoloration on 20A breaker terminal' }
    ];
    bom = [
      { item: '20A Single-Pole Circuit Breaker', estimatedPrice: 24.00 },
      { item: 'Copper Wire 12/2 Gauge (10ft)', estimatedPrice: 15.00 }
    ];
    laborHours = 1.5;
  } else {
    severityScore = 5;
    issues = [
      { name: 'Filter Blockage & Capacitor Wear', confidencePct: 89, description: 'Reduced airflow due to clogged filter and aging start capacitor' }
    ];
    bom = [
      { item: '35/5 MFD Dual Run Capacitor', estimatedPrice: 22.00 },
      { item: 'HEPA Air Filter 16x25x1', estimatedPrice: 16.00 }
    ];
    laborHours = 1.0;
  }

  const partsTotal = bom.reduce((acc, item) => acc + item.estimatedPrice, 0);
  const laborTotal = laborHours * 50; // $50/hr base labor
  const estimatedTotalCost = Number((partsTotal + laborTotal).toFixed(2));

  return {
    detectedCategory: category,
    severityScore,
    detectedIssues: issues,
    estimatedLaborHours: laborHours,
    estimatedTotalCost,
    billOfMaterials: bom
  };
};
