export class CircuitBreakerEngine {
  constructor(timeout = 3000) {
    this.timeout = timeout;
    this.state = 'CLOSED';
    this.failures = 0;
  }
  execute(fn) {
    if (this.state === 'OPEN') return Promise.reject(new Error('Circuit breaker is OPEN'));
    return fn().catch(err => {
      this.failures++;
      if (this.failures >= 3) this.state = 'OPEN';
      throw err;
    });
  }
}
