import express from 'express';
import { dispatchTeamTasks, getTeamTaskBreakdown, updateSubTaskStatus } from '../controllers/teamBookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/dispatch', dispatchTeamTasks);
router.get('/:bookingId', getTeamTaskBreakdown);
router.patch('/:bookingId/tasks/:taskId', updateSubTaskStatus);

export default router;
