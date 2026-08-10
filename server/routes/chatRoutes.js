import express from 'express';
import { getChatHistory, getConversations, getUnreadCount, markMessagesAsRead } from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Get active conversation summaries with partner verification badges
router.get('/conversations', protect, getConversations);

// Get paginated chat history between current user and partnerId
router.get('/history/:partnerId', protect, getChatHistory);

// Get total and per-sender unread message counts
router.get('/unread-count', protect, getUnreadCount);

// Mark all unread messages from a specific partner as read
router.patch('/read', protect, markMessagesAsRead);

export default router;
