import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js'; // adjust to match this repo's actual export names

const router = express.Router();

router.post('/', createReport); // add protect middleware once confirmed
router.get('/', getReports); // add protect + adminOnly
router.patch('/:reportId', updateReportStatus); // add protect + adminOnly

export default router;