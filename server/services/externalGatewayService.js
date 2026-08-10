/**
 * External Payment and Communication Gateway Service wrapped with CircuitBreaker.
 */

import { CircuitBreaker } from '../utils/circuitBreaker.js';

const paymentGatewayBreaker = new CircuitBreaker({
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 3000
});

export const processExternalPaymentGateway = async (paymentDetails) => {
  const requestFn = async () => {
    // Simulating external gateway call
    if (paymentDetails.forceFail) {
      throw new Error('External gateway HTTP 503 Service Unavailable');
    }
    return {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      gateway: 'Stripe/Razorpay'
    };
  };

  const fallbackFn = (err) => {
    return {
      success: false,
      isFallback: true,
      reason: err.message,
      status: 'GATEWAY_DEGRADED'
    };
  };

  return paymentGatewayBreaker.execute(requestFn, fallbackFn);
};

export const getGatewayBreakerStatus = () => {
  return paymentGatewayBreaker.getState();
};
