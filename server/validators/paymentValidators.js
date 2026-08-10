import { createSchema } from './index.js';

export const createPaymentIntentSchema = {
  body: createSchema({
    bookingId: { required: true, type: 'string' },
    amount: { required: true, type: 'number', min: 1 }
  })
};

export const confirmPaymentSchema = {
  body: createSchema({
    bookingId: { required: true, type: 'string' },
    paymentIntentId: { required: true, type: 'string' },
    method: { required: true, type: 'string', enum: ['credit_card', 'bank_transfer', 'digital_wallet'] }
  })
};

export const refundRequestSchema = {
  body: createSchema({
    reason: { required: true, type: 'string', minLength: 10, maxLength: 500 }
  })
};
