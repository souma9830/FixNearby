import crypto from 'crypto';

/**
 * Stripe Connect & Multi-Currency Exchange Gateway Service
 */

const CURRENCY_RATES = {
  USD: 1.0,
  INR: 83.2,
  EUR: 0.92,
  GBP: 0.79
};

export const createStripeConnectAccount = async (workerEmail = 'worker@fixnearby.com') => {
  const stripeAccountId = `acct_1M${crypto.randomBytes(8).toString('hex')}`;
  const onboardingUrl = `https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=ca_FixNearbyTest&scope=read_write&stripe_user[email]=${encodeURIComponent(workerEmail)}`;

  return {
    stripeAccountId,
    onboardingUrl
  };
};

export const processInstantPayout = async ({ workerId, stripeAccountId, amount, targetCurrency = 'USD' }) => {
  const rate = CURRENCY_RATES[targetCurrency] || 1.0;
  const convertedAmount = Number((amount * rate).toFixed(2));
  const stripePayoutId = `po_1N${crypto.randomBytes(8).toString('hex')}`;

  return {
    stripePayoutId,
    convertedAmount,
    exchangeRate: rate,
    status: 'paid'
  };
};
