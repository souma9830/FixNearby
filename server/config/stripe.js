let stripeInstance = {
  paymentIntents: { create: async () => ({ client_secret: 'mock_sec' }) },
  customers: { create: async () => ({ id: 'mock_cus' }) }
};

try {
  const StripeModule = (await import('stripe')).default;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_fixnearby_secret_key_12345';
  stripeInstance = new StripeModule(stripeSecretKey, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2,
  });
} catch (e) {
  // fallback to mock stripe instance
}

export const stripe = stripeInstance;
export default stripe;
