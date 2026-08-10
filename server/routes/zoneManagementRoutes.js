import express from 'express';
import * as zoneController from '../controllers/zoneManagementController.js';
import { validateServiceZonePayload } from '../middleware/zoneValidationMiddleware.js';

const router = express.Router();

router.post('/', validateServiceZonePayload, zoneController.addZone);
router.get('/worker/:workerId', zoneController.getZones);
router.get('/check-coverage', zoneController.checkCoverage);
router.get('/audit/:workerId?', zoneController.auditWorkerZoneCoverage);

export default router;
