const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/equipmentInventoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, inventoryController.addInventoryItem);
router.get('/my-inventory', protect, inventoryController.getWorkerInventory);

module.exports = router;
