import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPartsBillingInvoice, getPartsInvoiceByBooking } from '../controllers/workerEquipmentPartsBillingController.js';

const router = express.Router();

router.post('/invoice', protect, createPartsBillingInvoice);
router.get('/booking/:bookingId', protect, getPartsInvoiceByBooking);

export default router;
