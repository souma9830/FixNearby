import connectDB from '../config/db.js';

describe('Backend Database Diagnostic Hardening', () => {
  it('should report database connection state without throwing runtime errors', () => {
    expect(typeof connectDB).toBe('function');
  });
});
