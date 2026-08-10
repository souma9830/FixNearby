/**
 * @fileoverview Routes for notification preferences.
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPreferences, updatePreferences } from '../controllers/notificationPreferencesController.js';

const router = express.Router();

router.route('/')
  .get(protect, getPreferences)
  .put(protect, updatePreferences);

export default router;
