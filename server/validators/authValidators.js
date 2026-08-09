import { createSchema } from './index.js';

export const loginSchema = {
  body: createSchema({
    email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
    password: { required: true, type: 'string', minLength: 6 }
  })
};

export const registerSchema = {
  body: createSchema({
    name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
    password: { 
      required: true, 
      type: 'string', 
      minLength: 8, 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/ 
    },
    phone: { required: false, type: 'string', pattern: /^\d+$/ }
  })
};

export const forgotPasswordSchema = {
  body: createSchema({
    email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ }
  })
};

export const resetPasswordSchema = {
  body: createSchema({
    password: { required: true, type: 'string', minLength: 8 }
  }),
  params: createSchema({
    token: { required: true, type: 'string' }
  })
};
