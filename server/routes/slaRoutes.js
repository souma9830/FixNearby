const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');
const { protect } = require('../middleware/authMiddleware');

router.get('/worker/:workerId', protect, slaController.getWorkerSlaStats);

module.exports = router;
