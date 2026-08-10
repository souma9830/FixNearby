import express from 'express';
import { estimateBookingPrice } from '../controllers/pricingController.js';
import PriceMatrix from '../models/PriceMatrix.js';

const router = express.Router();

router.post('/estimate', estimateBookingPrice);
router.get('/matrix', async (req, res, next) => {
  try {
    const matrices = await PriceMatrix.find();
    res.status(200).json({ success: true, matrices });
  } catch (err) {
    next(err);
  }
});

export default router;
