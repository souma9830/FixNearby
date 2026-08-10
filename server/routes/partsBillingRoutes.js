import express from 'express';
import * as partsController from '../controllers/partsBillingController.js';
import { validatePartsInventoryPayload } from '../middleware/partsBillingValidation.js';

const router = express.Router();

router.post('/', validatePartsInventoryPayload, partsController.addPartsInvoice);
router.patch('/approval', partsController.updateApproval);
router.get('/booking/:bookingId', partsController.getParts);
router.delete('/booking/:bookingId', partsController.deletePartsInvoice);

export default router;
