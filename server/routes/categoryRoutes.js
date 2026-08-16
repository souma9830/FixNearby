import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { responseCache, invalidateCache } from '../middleware/responseCacheMiddleware.js';

const router = express.Router();

router.get('/', responseCache(300), getAllCategories);
router.post('/', protect, invalidateCache('GET:/api/categories:*'), createCategory);
router.put('/:id', protect, invalidateCache('GET:/api/categories:*'), updateCategory);
router.delete('/:id', protect, invalidateCache('GET:/api/categories:*'), deleteCategory);

export default router;
