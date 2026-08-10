export class DynamicIpReputationRateLimiter {
  constructor() {
    this.hits = new Map();
    this.reputation = new Map();
  }

  isRateLimited(ip, windowMs = 60000, maxHits = 5) {
    const now = Date.now();
    const timestamps = (this.hits.get(ip) || []).filter(ts => now - ts < windowMs);
    timestamps.push(now);
    this.hits.set(ip, timestamps);

    const score = this.reputation.get(ip) || 1.0;
    const effectiveLimit = Math.floor(maxHits * score);

    if (timestamps.length > effectiveLimit) {
      this.reputation.set(ip, Math.max(0.1, score - 0.1));
      return { limited: true, status: 429, score: this.reputation.get(ip) };
    }
    return { limited: false, remaining: effectiveLimit - timestamps.length, score };
  }
}

export default new DynamicIpReputationRateLimiter();
