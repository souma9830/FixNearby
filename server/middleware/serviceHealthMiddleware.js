import { Router } from 'express';
import CircuitBreaker from '../utils/circuitBreaker.js';

/**
 * Health check handler that returns all circuit breaker metrics
 * @param {Object} req 
 * @param {Object} res 
 */
export const serviceHealthHandler = (req, res) => {
  const metrics = CircuitBreaker.getAllMetrics();
  res.json({
    success: true,
    services: metrics
  });
};

export const serviceHealthRouter = Router();

serviceHealthRouter.get('/', serviceHealthHandler);
