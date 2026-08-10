import express from 'express';
import { saveSearchPreset, getUserSearchPresets, deleteSearchPreset } from '../controllers/searchPresetController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', saveSearchPreset);
router.get('/', getUserSearchPresets);
router.delete('/:id', deleteSearchPreset);

export default router;
