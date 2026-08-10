// Worker route schema validations enabled
import express from 'express';
import {
  registerWorker,
  loginWorker,
  getWorkers,
  getWorkerById,
  getWorkerProfile,
  getNearbyWorkers,
  recalculateKarmaScoresController,
  getWorkerAvailability,
  getWorkerReviews,
  getWorkerDashboardStats,
  getWorkersBatch,
  getWorkersByBounds,
  getWorkerClusters,
  updateWorkerProfile,
  updateAvailableNowStatus,
} from '../controllers/workerController.js';
import { protectWorker, requireRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateGeoCoordinates } from '../middleware/geoValidator.js';
import {
  addService,
  updateService,
  removeService,
  getMyServices,
  updateHourlyRate,
  getWorkerServices,
} from '../controllers/workerController.js';

const router = express.Router();

router.post('/batch', getWorkersBatch);
router.post('/register', upload.single('profilePicture'), validateGeoCoordinates, registerWorker);
router.post('/login', loginWorker);

// Protected Worker Endpoints (require worker/provider/admin role)
router.get('/profile', protectWorker, requireRole('provider', 'worker', 'admin'), getWorkerProfile);
router.put('/profile', protectWorker, requireRole('provider', 'worker', 'admin'), updateWorkerProfile);
router.get('/nearby', getNearbyWorkers);
router.get('/map-bounds', getWorkersByBounds);
router.get('/clusters', getWorkerClusters);
router.get('/dashboard/stats', protectWorker, requireRole('provider', 'worker', 'admin'), getWorkerDashboardStats);
router.post('/recalculate-karma', protectWorker, requireRole('provider', 'worker', 'admin'), recalculateKarmaScoresController);

// Service catalog management (protected - worker/provider/admin only)
router.get('/services', protectWorker, requireRole('provider', 'worker', 'admin'), getMyServices);
router.post('/services', protectWorker, requireRole('provider', 'worker', 'admin'), addService);
router.put('/services/:serviceId', protectWorker, requireRole('provider', 'worker', 'admin'), updateService);
router.delete('/services/:serviceId', protectWorker, requireRole('provider', 'worker', 'admin'), removeService);
router.put('/hourly-rate', protectWorker, requireRole('provider', 'worker', 'admin'), updateHourlyRate);

// Public routes
router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.get('/:id/availability', getWorkerAvailability);
router.get('/:id/reviews', getWorkerReviews);
router.get('/:id/services', getWorkerServices);

export default router;
