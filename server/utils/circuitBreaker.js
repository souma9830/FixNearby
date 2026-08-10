/**
 * Database Query Circuit Breaker & Exponential Backoff Retry Utility
 */

export const executeWithCircuitBreaker = async (queryFn, retries = 3, delayMs = 200) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await queryFn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw new Error(`Database Circuit Breaker Open: Executed ${retries} attempts without success. Error: ${err.message}`);
      }
      const backoff = delayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
};
export class CircuitBreaker {
  static registry = new Map();

  /**
   * Get a circuit breaker by name
   * @param {string} name 
   * @returns {CircuitBreaker}
   */
  static getBreaker(name) {
    return CircuitBreaker.registry.get(name);
  }

  /**
   * Get metrics for all registered circuit breakers
   * @returns {Object}
   */
  static getAllMetrics() {
    const metrics = {};
    for (const [name, breaker] of CircuitBreaker.registry.entries()) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts || 3;
    this.monitorInterval = options.monitorInterval || 60000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.halfOpenAttempts = 0;
    this.lastFailure = null;
    this.lastSuccess = null;
    this.totalRequests = 0;
    this.openTime = null;

    CircuitBreaker.registry.set(this.name, this);
  }

  /**
   * Wraps an async function call in the circuit breaker
   * @param {Function} fn 
   * @returns {Promise<any>}
   */
  async execute(fn) {
    this.totalRequests++;

    if (this.state === 'OPEN') {
      if (Date.now() - this.openTime >= this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.halfOpenAttempts = 0;
      } else {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        throw new Error(`Circuit breaker '${this.name}' is HALF_OPEN (max attempts reached)`);
      }
      this.halfOpenAttempts++;
    }

    try {
      const result = await fn();
      
      this.successes++;
      this.lastSuccess = new Date();
      
      if (this.state === 'HALF_OPEN') {
        this.reset(); // Recovered successfully
      } else {
        this.failures = 0; // Reset consecutive failures on success
      }
      
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailure = new Date();
      
      if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        this.openTime = Date.now();
      }
      
      throw err;
    }
  }

  /**
   * Returns current state string
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Returns circuit breaker metrics
   * @returns {Object}
   */
  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests
    };
  }

  /**
   * Force reset to CLOSED state
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.halfOpenAttempts = 0;
    this.openTime = null;
  }
}

export default CircuitBreaker;
