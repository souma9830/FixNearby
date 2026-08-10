/**
 * Client IP Reputation Store & Sliding Window Request Log Tracker.
 */

class IPReputationStore {
  constructor() {
    this.requests = new Map(); // ip -> Array of timestamps
    this.reputationScores = new Map(); // ip -> reputation score (0.0 to 1.0)
  }

  recordRequest(ip, windowMs = 60000) {
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];
    const valid = timestamps.filter(t => now - t < windowMs);
    valid.push(now);

    this.requests.set(ip, valid);
    return valid.length;
  }

  getReputation(ip) {
    return this.reputationScores.get(ip) || 1.0; // 1.0 = clean, < 0.3 = suspicious
  }

  penalize(ip, penalty = 0.2) {
    const current = this.getReputation(ip);
    const updated = Math.max(0.0, current - penalty);
    this.reputationScores.set(ip, updated);
    return updated;
  }
}

export const ipReputationEngine = new IPReputationStore();
