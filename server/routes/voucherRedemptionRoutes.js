const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherRedemptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/redeem-points', protect, voucherController.generateVoucher);
router.get('/my-vouchers', protect, voucherController.getUserVouchers);

module.exports = router;
