import express from 'express';
import { addInventoryItem, getWorkerInventory } from '../controllers/equipmentInventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, addInventoryItem);
router.get('/my-inventory', protect, getWorkerInventory);

export default router;