import express from 'express';
import { registerAppliance, getUserAppliances } from '../controllers/applianceController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', registerAppliance);
router.get('/', getUserAppliances);

export default router;
