import express from 'express';
import { getUserAppliances, registerAppliance, dispatchPreventiveService } from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/appliances', getUserAppliances);
router.post('/appliances', registerAppliance);
router.post('/appliances/:id/preventive-booking', dispatchPreventiveService);

export default router;
