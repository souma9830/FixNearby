import express from 'express';
import {
  createWebhook,
  listWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookLogs
} from '../controllers/webhookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createWebhook)
  .get(protect, listWebhooks);

router.route('/:id')
  .put(protect, updateWebhook)
  .delete(protect, deleteWebhook);

router.post('/:id/test', protect, testWebhook);
router.get('/:id/logs', protect, getWebhookLogs);

export default router;
