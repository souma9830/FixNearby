import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTaxonomyCategories,
  createTaxonomyCategory,
  addSubcategoryToTaxonomy,
} from '../controllers/serviceCategoryTaxonomyController.js';

const router = express.Router();

router.get('/', getTaxonomyCategories);
router.post('/', protect, createTaxonomyCategory);
router.post('/:categoryId/subcategories', protect, addSubcategoryToTaxonomy);

export default router;
