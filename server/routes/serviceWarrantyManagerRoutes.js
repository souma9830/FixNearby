const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/serviceWarrantyManagerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/issue', protect, warrantyController.issueWarranty);
router.get('/my-warranties', protect, warrantyController.getUserWarranties);

module.exports = router;
