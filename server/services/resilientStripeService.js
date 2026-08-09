import CircuitBreaker from '../utils/circuitBreaker.js';

const stripeBreaker = new CircuitBreaker({
  name: 'stripe',
  failureThreshold: 3,
  resetTimeoutMs: 30000
});

// Mock stripe instance for this example
const stripe = {
  paymentIntents: {
    create: async () => ({ id: 'pi_123', status: 'requires_payment_method' }),
    confirm: async () => ({ id: 'pi_123', status: 'succeeded' }),
  },
  refunds: {
    create: async () => ({ id: 're_123', status: 'succeeded' })
  }
};

/**
 * Creates a payment intent resiliently
 * @param {number} amount 
 * @param {string} currency 
 * @param {Object} metadata 
 * @returns {Promise<Object>}
 */
export async function createPaymentIntent(amount, currency, metadata) {
  try {
    return await stripeBreaker.execute(async () => {
      return await stripe.paymentIntents.create({ amount, currency, metadata });
    });
  } catch (err) {
    if (err.message.includes('is OPEN') || err.message.includes('is HALF_OPEN')) {
      return { fallback: true, message: 'Payment service temporarily unavailable' };
    }
    throw err;
  }
}

/**
 * Confirms a payment intent resiliently
 * @param {string} paymentIntentId 
 * @returns {Promise<Object>}
 */
export async function confirmPayment(paymentIntentId) {
  try {
    return await stripeBreaker.execute(async () => {
      return await stripe.paymentIntents.confirm(paymentIntentId);
    });
  } catch (err) {
    if (err.message.includes('is OPEN') || err.message.includes('is HALF_OPEN')) {
      return { fallback: true, message: 'Payment service temporarily unavailable' };
    }
    throw err;
  }
}

/**
 * Creates a refund resiliently
 * @param {string} paymentIntentId 
 * @param {number} amount 
 * @returns {Promise<Object>}
 */
export async function createRefund(paymentIntentId, amount) {
  try {
    return await stripeBreaker.execute(async () => {
      return await stripe.refunds.create({ payment_intent: paymentIntentId, amount });
    });
  } catch (err) {
    if (err.message.includes('is OPEN') || err.message.includes('is HALF_OPEN')) {
      return { fallback: true, message: 'Payment service temporarily unavailable' };
    }
    throw err;
  }
}

/**
 * Gets the Stripe service circuit breaker metrics
 * @returns {Object}
 */
export function getStripeHealth() {
  return stripeBreaker.getMetrics();
}
