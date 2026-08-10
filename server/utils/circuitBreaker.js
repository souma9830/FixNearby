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
