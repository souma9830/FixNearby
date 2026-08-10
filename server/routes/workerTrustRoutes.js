import express from 'express';
import Review from '../models/Review.js';
import Worker from '../models/Worker.js';

const router = express.Router();

// Calculate aggregated trust metrics and karma score for a worker
router.get('/metrics/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const reviews = await Review.find({ workerId });
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
      ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(2)) 
      : 5.0;

    res.json({
      success: true,
      workerId,
      karmaScore: worker.karmaScore || 100,
      averageRating: avgRating,
      reviewCount,
      reliabilityTier: avgRating >= 4.5 ? 'EXCELLENT' : avgRating >= 3.5 ? 'GOOD' : 'AVERAGE'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
