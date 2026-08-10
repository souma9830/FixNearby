import { createSchema } from './index.js';

export const createBookingSchema = {
  body: createSchema({
    workerId: { required: true, type: 'string' },
    service: { required: true, type: 'string', maxLength: 120 },
    scheduledTime: { 
      required: true, 
      type: 'string',
      custom: (val) => !isNaN(Date.parse(val)) || 'Must be a valid ISO date string'
    },
    durationHours: { required: true, type: 'number', min: 0.5, max: 24 },
    address: { required: true, type: 'string' },
    price: { required: true, type: 'number', min: 0 }
  })
};

export const updateBookingStatusSchema = {
  body: createSchema({
    status: { required: true, type: 'string', enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] },
    note: { required: false, type: 'string', maxLength: 500 }
  })
};

export const cancelBookingSchema = {
  body: createSchema({
    reason: { required: false, type: 'string', maxLength: 500 }
  })
};
