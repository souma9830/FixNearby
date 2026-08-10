const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/emergencyPriorityDispatchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, dispatchController.createEmergencyDispatch);
router.post('/accept/:ticketId', protect, dispatchController.acceptEmergencyDispatch);

module.exports = router;
