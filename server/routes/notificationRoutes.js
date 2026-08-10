import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  getQueueStatus
} from '../controllers/notificationController.js';
import { sendNotification } from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// List notifications (paginated, filterable)
router.get('/', getNotifications);

// Unread count
router.get('/unread-count', getUnreadCount);

// Queue metrics
router.get('/queue/status', getQueueStatus);

// Mark all as read — must come before /:id routes
router.patch('/read-all', markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// POST /api/notifications/send
router.post('/send', sendNotification);

export default router;
