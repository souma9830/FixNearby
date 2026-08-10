import { createSchema } from './index.js';

export const workerRegisterSchema = {
  body: createSchema({
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
    password: { required: true, type: 'string', minLength: 8 },
    category: { required: true, type: 'string' },
    experience: { required: true, type: 'string' },
    contact: { required: true, type: 'string' },
    bio: { required: true, type: 'string', minLength: 10, maxLength: 1000 },
    locationCoordinates: { 
      required: true, 
      type: 'array',
      custom: (val) => (val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number') || 'Must be an array of 2 numbers'
    }
  })
};

export const workerUpdateSchema = {
  body: createSchema({
    name: { required: false, type: 'string', minLength: 2 },
    bio: { required: false, type: 'string', maxLength: 1000 },
    hourlyRate: { required: false, type: 'number', min: 0 },
    serviceRadiusKm: { required: false, type: 'number', min: 1, max: 100 }
  })
};
