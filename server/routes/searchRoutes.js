import express from 'express';
import {
  searchWorkers,
  getSearchSuggestions,
  getPopularSearches,
} from '../controllers/searchController.js';
import {
  createPreset,
  getPresets,
  deletePreset,
} from '../controllers/searchPresetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search workers with advanced filters
 * @access  Public
 */
router.get('/', searchWorkers);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions
 * @access  Public
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular searches
 * @access  Public
 */
router.get('/popular', getPopularSearches);

// Search Presets/Templates routes
router.post('/presets', protect, createPreset);
router.get('/presets', protect, getPresets);
router.delete('/presets/:id', protect, deletePreset);

export default router;
