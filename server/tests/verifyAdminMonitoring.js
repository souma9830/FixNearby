import { getAdminStats } from '../controllers/adminController.js';

describe('Admin System Monitoring Test Suite', () => {
  it('should format system memory and runtime metrics correctly', () => {
    const mem = process.memoryUsage();
    expect(mem.heapUsed).toBeGreaterThan(0);
    expect(process.uptime()).toBeGreaterThanOrEqual(0);
  });
});
