const express = require('express');
const router = express.Router();
const tipController = require('../controllers/customerTipBonusController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, tipController.sendTipAndBonus);
router.get('/my-tips', protect, tipController.getWorkerTipHistory);

module.exports = router;
