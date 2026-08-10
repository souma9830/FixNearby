/**
 * Emergency Alert Priority Dispatch Service
 */
export const calculateEmergencyPriority = (severity, location, ageMinutes = 0) => {
  const baseScores = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
  let score = baseScores[severity] || 10;

  // Time decay/boost: escalation if unresolved
  if (ageMinutes > 15) {
    score += Math.min(30, Math.floor(ageMinutes / 5) * 5);
  }

  return {
    priorityScore: Math.min(150, score),
    requiresImmediateDispatch: score >= 90,
    escalationLevel: score >= 120 ? 'TIER_1_EMERGENCY' : 'STANDARD'
  };
};

export const sanitizeEmergencyPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return {};
  return {
    notes: typeof payload.notes === 'string' ? payload.notes.replace(/[<>{}]/g, '').trim() : '',
    contactPhone: typeof payload.contactPhone === 'string' ? payload.contactPhone.replace(/[^\d+]/g, '') : ''
  };
};
