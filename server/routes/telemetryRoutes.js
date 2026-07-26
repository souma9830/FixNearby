const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

router.post('/check-in', telemetryController.checkIn);
router.post('/check-out', telemetryController.checkOut);

module.exports = router;