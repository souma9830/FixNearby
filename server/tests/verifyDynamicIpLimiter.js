import limiter from '../middleware/dynamicIpLimiterService.js';

describe('Sliding-Window Dynamic Rate Limiter Test', () => {
  it('should allow requests within limit threshold', () => {
    const res = limiter.isRateLimited('127.0.0.1');
    expect(res.limited).toBe(false);
  });

  it('should penalize IP reputation upon threshold breach', () => {
    for (let i = 0; i < 6; i++) limiter.isRateLimited('192.168.1.1');
    const res = limiter.isRateLimited('192.168.1.1');
    expect(res.limited).toBe(true);
  });
});
